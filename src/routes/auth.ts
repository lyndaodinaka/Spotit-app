import argon2 from "argon2";
import crypto from "crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db";
import { notifyAccessRequest } from "../services/notifications";

export const authRouter = Router();

const authAttempts = new Map<string, { count: number; resetAt: number }>();
const authWindowMs = 15 * 60 * 1000;
const maxAuthAttempts = 8;

function rateLimitKey(requestIp: string | undefined, email: string) {
  return `${requestIp || "unknown"}:${email.toLowerCase()}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const attempt = authAttempts.get(key);
  if (!attempt || attempt.resetAt < now) {
    authAttempts.set(key, { count: 1, resetAt: now + authWindowMs });
    return false;
  }
  attempt.count += 1;
  return attempt.count > maxAuthAttempts;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10)
});

const invitationAcceptSchema = z.object({
  token: z.string().min(20),
  fullName: z.string().trim().min(2).max(120).optional(),
  password: z.string().min(12)
});

const accessRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  roleRequested: z.string().trim().max(80).optional(),
  organisation: z.string().trim().max(160).optional(),
  message: z.string().trim().max(1000).optional()
});

function slugifyOrganisation(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "organisation";
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

authRouter.post("/access-requests", async (request, response) => {
  const result = accessRequestSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Name and valid email are required to request access" });
    return;
  }

  const email = result.data.email.toLowerCase();
  if (isRateLimited(rateLimitKey(request.ip, email))) {
    response.status(429).json({ error: "Too many access attempts. Please try again later." });
    return;
  }

  const existingClinician = await db.clinician.findUnique({ where: { email } });
  if (existingClinician?.status === "active") {
    response.status(409).json({ error: "This email already has access. Please sign in." });
    return;
  }

  const accessRequest = await db.accessRequest.upsert({
    where: { email_status: { email, status: "pending" } },
    create: {
      ...result.data,
      email,
      organisationId: result.data.organisation
        ? (await db.organisation.upsert({
            where: { slug: slugifyOrganisation(result.data.organisation) },
            create: {
              name: result.data.organisation,
              slug: slugifyOrganisation(result.data.organisation),
              ownerEmail: email,
              plan: "lead",
              status: "pending"
            },
            update: {
              ownerEmail: email,
              status: "pending"
            },
            select: { id: true }
          })).id
        : undefined,
      status: "pending"
    },
    update: {
      fullName: result.data.fullName,
      roleRequested: result.data.roleRequested,
      organisation: result.data.organisation,
      message: result.data.message
    },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true
    }
  });

  await db.auditLog.create({
    data: {
      action: "auth.access_request.created",
      details: email,
      ipAddress: request.ip,
      userAgent: request.get("user-agent") || undefined
    }
  });

  let notificationSent = false;
  try {
    const notification = await notifyAccessRequest({
      fullName: result.data.fullName,
      email,
      roleRequested: result.data.roleRequested,
      organisation: result.data.organisation,
      message: result.data.message
    });
    notificationSent = notification.sent;
  } catch (error) {
    await db.auditLog.create({
      data: {
        action: "auth.access_request.notification_failed",
        details: email,
        ipAddress: request.ip,
        userAgent: request.get("user-agent") || undefined,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown notification error"
        }
      }
    });
  }

  response.status(202).json({
    message: notificationSent
      ? "Access request received. The Spotit team has been notified."
      : "Access request received. Spotit admin can review it in the admin records.",
    notificationSent,
    accessRequest
  });
});

authRouter.post("/login", async (request, response) => {
  const result = loginSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Valid email and strong password required" });
    return;
  }

  const email = result.data.email.toLowerCase();
  if (isRateLimited(rateLimitKey(request.ip, email))) {
    response.status(429).json({ error: "Too many access attempts. Please try again later." });
    return;
  }

  const clinician = await db.clinician.findUnique({
    where: { email },
    include: { organisation: true }
  });
  if (!clinician || clinician.status !== "active") {
    response.status(401).json({ error: "Invalid login" });
    return;
  }
  if (!clinician.organisationId || !clinician.organisation || clinician.organisation.status === "suspended") {
    response.status(403).json({ error: "This organisation workspace is not active. Please contact Spotit admin." });
    return;
  }

  const valid = await argon2.verify(clinician.passwordHash, result.data.password);
  if (!valid) {
    response.status(401).json({ error: "Invalid login" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    response.status(500).json({ error: "Server authentication secret is not configured" });
    return;
  }

  const sessionHours = Number(process.env.SESSION_TIMEOUT_HOURS || 8);
  const token = jwt.sign(
    {
      clinicianId: clinician.id,
      role: clinician.role,
      organisationId: clinician.organisationId,
      organisationName: clinician.organisation.name,
      permissions: clinician.permissions
    },
    jwtSecret,
    { expiresIn: `${sessionHours}h` }
  );

  await db.clinician.update({
    where: { id: clinician.id },
    data: { lastLoginAt: new Date() }
  });

  await db.auditLog.create({
    data: {
      organisationId: clinician.organisationId,
      clinicianId: clinician.id,
      action: "auth.login",
      details: `${clinician.fullName} signed in`,
      ipAddress: request.ip,
      userAgent: request.get("user-agent") || undefined,
      metadata: {
        role: clinician.role,
        organisationName: clinician.organisation.name
      }
    }
  });

  response.json({
    token,
    clinician: {
      id: clinician.id,
      fullName: clinician.fullName,
      email: clinician.email,
      role: clinician.role,
      permissions: clinician.permissions,
      mustResetPassword: clinician.mustResetPassword,
      twoFactorEnabled: clinician.twoFactorEnabled,
      organisation: {
        id: clinician.organisation.id,
        name: clinician.organisation.name,
        plan: clinician.organisation.plan,
        status: clinician.organisation.status
      }
    }
  });
});

authRouter.post("/invitations/accept", async (request, response) => {
  const result = invitationAcceptSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Valid invitation token and 12 character password are required" });
    return;
  }

  const invitation = await db.invitation.findUnique({
    where: { tokenHash: hashToken(result.data.token) },
    include: { tenant: true }
  });
  if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    response.status(404).json({ error: "Invitation is invalid or expired" });
    return;
  }
  if (invitation.tenant.status !== "active") {
    response.status(403).json({ error: "This organisation workspace is not active" });
    return;
  }

  const clinician = await db.clinician.upsert({
    where: { email: invitation.email.toLowerCase() },
    create: {
      organisationId: invitation.organisationId,
      fullName: result.data.fullName || invitation.fullName || invitation.email,
      email: invitation.email.toLowerCase(),
      passwordHash: await argon2.hash(result.data.password),
      role: invitation.role,
      permissions: invitation.permissions,
      passwordUpdatedAt: new Date(),
      status: "active"
    },
    update: {
      organisationId: invitation.organisationId,
      fullName: result.data.fullName || invitation.fullName || invitation.email,
      passwordHash: await argon2.hash(result.data.password),
      role: invitation.role,
      permissions: invitation.permissions,
      passwordUpdatedAt: new Date(),
      mustResetPassword: false,
      status: "active"
    }
  });

  await db.invitation.update({
    where: { id: invitation.id },
    data: { status: "accepted", acceptedAt: new Date() }
  });

  await db.auditLog.create({
    data: {
      organisationId: invitation.organisationId,
      clinicianId: clinician.id,
      action: "auth.invitation.accepted",
      details: invitation.email,
      ipAddress: request.ip,
      userAgent: request.get("user-agent") || undefined
    }
  });

  response.status(201).json({
    message: "Invitation accepted. Please sign in with your new password.",
    organisation: { name: invitation.tenant.name }
  });
});
