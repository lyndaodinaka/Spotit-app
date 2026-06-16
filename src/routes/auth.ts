import argon2 from "argon2";
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

const accessRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  roleRequested: z.string().trim().max(80).optional(),
  organisation: z.string().trim().max(160).optional(),
  message: z.string().trim().max(1000).optional()
});

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
      ? "Access request received. Lynda has been notified."
      : "Access request received. Lynda can review it in the admin records.",
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

  const clinician = await db.clinician.findUnique({ where: { email } });
  if (!clinician || clinician.status !== "active") {
    response.status(401).json({ error: "Invalid login" });
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

  const token = jwt.sign(
    { clinicianId: clinician.id, role: clinician.role },
    jwtSecret,
    { expiresIn: "8h" }
  );

  await db.clinician.update({
    where: { id: clinician.id },
    data: { lastLoginAt: new Date() }
  });

  response.json({
    token,
    clinician: {
      id: clinician.id,
      fullName: clinician.fullName,
      email: clinician.email,
      role: clinician.role
    }
  });
});
