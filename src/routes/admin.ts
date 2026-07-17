import argon2 from "argon2";
import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAdmin, tenantId, type AuthenticatedRequest } from "../middleware/auth";
import { auditLog } from "../services/audit";
import {
  getBillingPlan,
  getPaymentInstructions,
  makePaymentReference,
  periodFor,
  subscriptionPlans,
  type BillingInterval,
  type PaymentMethod,
  type PlanTier,
  type SubscriptionMode
} from "../services/billing";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

function tenantScope(request: AuthenticatedRequest) {
  return request.user?.role === "platform_admin" ? {} : { organisationId: tenantId(request) };
}

function invitationToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

const clinicianSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
  role: z.enum(["admin", "clinician"]).default("clinician"),
  permissions: z.array(z.string()).default([]),
  status: z.enum(["active", "suspended"]).default("active")
});

const invitationSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  email: z.string().trim().email(),
  role: z.enum(["admin", "clinician"]).default("clinician"),
  permissions: z.array(z.string()).default([])
});

const resetPasswordSchema = z.object({
  password: z.string().min(12)
});

const subscriptionSchema = z.object({
  planTier: z.enum(["small_clinic", "medium_organisation", "large_professional", "enterprise"]).default("small_clinic"),
  billingInterval: z.enum(["monthly", "yearly"]),
  subscriptionMode: z.enum(["manual"]).default("manual"),
  paymentMethod: z.enum(["bank_transfer", "invoice"]),
  billingEmail: z.string().trim().email().optional()
});

const accessApprovalSchema = z.object({
  role: z.enum(["admin", "clinician"]).default("clinician"),
  password: z.string().min(12),
  reviewNote: z.string().max(1000).optional()
});

const accessRejectionSchema = z.object({
  reviewNote: z.string().max(1000).optional()
});

adminRouter.get("/overview", async (request: AuthenticatedRequest, response) => {
  const scope = tenantScope(request);
  const [clinicians, accessRequests, activePatients, wounds, escalations, auditLogs] = await Promise.all([
    db.clinician.count({ where: scope }),
    db.accessRequest.count({ where: { status: "pending", ...scope } }),
    db.patient.count({ where: scope }),
    db.wound.count({ where: scope }),
    db.woundAssessment.count({ where: { escalationRequired: true, ...scope } }),
    db.auditLog.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: request.user?.role === "platform_admin"
        ? { tenant: true, clinician: true }
        : { tenant: true, clinician: true, patient: true, wound: true }
    })
  ]);

  response.json({
    metrics: { organisations: request.user?.role === "platform_admin" ? await db.organisation.count() : 1, clinicians, accessRequests, activePatients, wounds, escalations },
    auditLogs
  });
});

adminRouter.get("/subscription", async (request: AuthenticatedRequest, response) => {
  const organisation = await db.organisation.findUnique({
    where: { id: tenantId(request) },
    select: {
      id: true,
      name: true,
      plan: true,
      subscriptionStatus: true,
      subscriptionInterval: true,
      subscriptionMode: true,
      paymentMethod: true,
      billingEmail: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      seatsAllowed: true,
      features: true
    }
  });
  const billingRecords = await db.billingRecord.findMany({
    where: { organisationId: tenantId(request) },
    orderBy: { createdAt: "desc" },
    take: 12
  });

  response.json({
    organisation,
    plans: subscriptionPlans,
    paymentInstructions: getPaymentInstructions("reference-created-after-subscription-choice"),
    billingRecords
  });
});

adminRouter.post("/subscription", async (request: AuthenticatedRequest, response) => {
  const result = subscriptionSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Choose monthly or yearly, manual or automatic, and a payment method" });
    return;
  }

  const organisation = await db.organisation.findUnique({ where: { id: tenantId(request) } });
  if (!organisation) {
    response.status(404).json({ error: "Organisation workspace was not found" });
    return;
  }

  const billingInterval = result.data.billingInterval as BillingInterval;
  const planTier = result.data.planTier as PlanTier;
  const subscriptionMode = result.data.subscriptionMode as SubscriptionMode;
  const paymentMethod = result.data.paymentMethod as PaymentMethod;
  const plan = getBillingPlan(planTier, billingInterval);
  const paymentReference = makePaymentReference(organisation.slug);
  const { periodStart, periodEnd } = periodFor(billingInterval);

  const billingRecord = await db.billingRecord.create({
    data: {
      organisationId: organisation.id,
      periodStart,
      periodEnd,
      amount: plan.amount,
      currency: plan.currency,
      planTier,
      billingInterval,
      subscriptionMode,
      paymentMethod,
      paymentReference,
      status: "pending_confirmation",
      notes: "Manual subscription selected. Platform admin confirms payment after bank, SWIFT, international transfer, or invoice funds are received."
    }
  });

  const updatedOrganisation = await db.organisation.update({
    where: { id: organisation.id },
    data: {
      plan: billingInterval,
      planTier,
      subscriptionInterval: billingInterval,
      subscriptionMode,
      paymentMethod,
      billingEmail: result.data.billingEmail?.toLowerCase() || organisation.billingEmail,
      subscriptionStatus: "pending_payment"
    }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId: organisation.id,
    action: "admin.subscription.requested",
    details: `${plan.label} ${plan.currency} ${plan.amount}`,
    metadata: {
      billingInterval,
      planTier,
      subscriptionMode,
      paymentMethod,
      paymentReference
    }
  });

  response.status(201).json({
    organisation: updatedOrganisation,
    billingRecord,
    paymentInstructions: getPaymentInstructions(paymentReference)
  });
});

adminRouter.get("/access-requests", async (request: AuthenticatedRequest, response) => {
  const accessRequests = await db.accessRequest.findMany({
    where: tenantScope(request),
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      email: true,
      roleRequested: true,
      organisation: true,
      tenant: { select: { name: true, plan: true, status: true } },
      message: true,
      status: true,
      reviewedAt: true,
      reviewNote: true,
      createdAt: true
    }
  });

  response.json({ accessRequests });
});

adminRouter.post("/access-requests/:requestId/approve", async (request: AuthenticatedRequest, response) => {
  const requestId = z.string().uuid().safeParse(request.params.requestId);
  const result = accessApprovalSchema.safeParse(request.body);
  if (!requestId.success || !result.success) {
    response.status(400).json({ error: "Valid access request approval and 12 character password are required" });
    return;
  }

  const accessRequest = await db.accessRequest.findUnique({ where: { id: requestId.data } });
  if (!accessRequest || accessRequest.status !== "pending") {
    response.status(404).json({ error: "Pending access request was not found" });
    return;
  }
  if (request.user?.role !== "platform_admin" && accessRequest.organisationId !== request.user?.organisationId) {
    response.status(403).json({ error: "This request belongs to another organisation" });
    return;
  }

  const organisationId = accessRequest.organisationId || tenantId(request);
  await db.organisation.update({
    where: { id: organisationId },
    data: { status: "active", plan: "tenant" }
  });

  const passwordHash = await argon2.hash(result.data.password);
  const clinician = await db.clinician.upsert({
    where: { email: accessRequest.email },
    create: {
      organisationId,
      fullName: accessRequest.fullName,
      email: accessRequest.email,
      passwordHash,
      role: result.data.role,
      status: "active"
    },
    update: {
      fullName: accessRequest.fullName,
      organisationId,
      passwordHash,
      role: result.data.role,
      status: "active"
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true
    }
  });

  await db.accessRequest.update({
    where: { id: accessRequest.id },
    data: {
      status: "approved",
      reviewedAt: new Date(),
      reviewedById: request.user?.clinicianId,
      reviewNote: result.data.reviewNote
    }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId,
    action: "admin.access_request.approved",
    details: clinician.email
  });

  response.json({ clinician });
});

adminRouter.post("/access-requests/:requestId/reject", async (request: AuthenticatedRequest, response) => {
  const requestId = z.string().uuid().safeParse(request.params.requestId);
  const result = accessRejectionSchema.safeParse(request.body);
  if (!requestId.success || !result.success) {
    response.status(400).json({ error: "Valid access request rejection is required" });
    return;
  }

  const pendingRequest = await db.accessRequest.findUnique({ where: { id: requestId.data } });
  if (!pendingRequest || pendingRequest.status !== "pending") {
    response.status(404).json({ error: "Pending access request was not found" });
    return;
  }
  if (request.user?.role !== "platform_admin" && pendingRequest.organisationId !== request.user?.organisationId) {
    response.status(403).json({ error: "This request belongs to another organisation" });
    return;
  }

  const accessRequest = await db.accessRequest.update({
    where: { id: pendingRequest.id },
    data: {
      status: "rejected",
      reviewedAt: new Date(),
      reviewedById: request.user?.clinicianId,
      reviewNote: result.data.reviewNote
    },
    select: { email: true }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId: pendingRequest.organisationId || request.user?.organisationId,
    action: "admin.access_request.rejected",
    details: accessRequest.email
  });

  response.json({ ok: true });
});

adminRouter.delete("/access-requests/:requestId", async (request: AuthenticatedRequest, response) => {
  const requestId = z.string().uuid().safeParse(request.params.requestId);
  if (!requestId.success) {
    response.status(400).json({ error: "Valid access request is required" });
    return;
  }

  const accessRequest = await db.accessRequest.findUnique({
    where: { id: requestId.data },
    select: { id: true, email: true, organisationId: true }
  });
  if (!accessRequest) {
    response.status(404).json({ error: "Access request was not found" });
    return;
  }
  if (request.user?.role !== "platform_admin" && accessRequest.organisationId !== request.user?.organisationId) {
    response.status(403).json({ error: "This request belongs to another organisation" });
    return;
  }

  await db.accessRequest.delete({ where: { id: accessRequest.id } });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId: accessRequest.organisationId || request.user?.organisationId,
    action: "admin.access_request.deleted",
    details: accessRequest.email
  });

  response.json({ ok: true });
});

adminRouter.get("/clinicians", async (request: AuthenticatedRequest, response) => {
  const clinicians = await db.clinician.findMany({
    where: tenantScope(request),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      permissions: true,
      status: true,
      organisation: { select: { name: true, plan: true, status: true } },
      lastLoginAt: true,
      createdAt: true
    }
  });

  response.json({ clinicians });
});

adminRouter.post("/clinicians", async (request: AuthenticatedRequest, response) => {
  const result = clinicianSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Valid clinician details and a 12 character password are required" });
    return;
  }

  const { password, ...clinicianInput } = result.data;
  const clinician = await db.clinician.create({
    data: {
      ...clinicianInput,
      organisationId: tenantId(request),
      email: clinicianInput.email.toLowerCase(),
      passwordHash: await argon2.hash(password)
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      permissions: true,
      status: true,
      createdAt: true
    }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId: request.user?.organisationId,
    action: "admin.clinician.created",
    details: clinician.email
  });

  response.status(201).json({ clinician });
});

adminRouter.patch("/clinicians/:clinicianId", async (request: AuthenticatedRequest, response) => {
  const clinicianId = z.string().uuid().safeParse(request.params.clinicianId);
  const updateSchema = z.object({
    role: z.enum(["admin", "clinician"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
    permissions: z.array(z.string()).optional()
  });
  const result = updateSchema.safeParse(request.body);

  if (!clinicianId.success || !result.success) {
    response.status(400).json({ error: "Valid clinician update is required" });
    return;
  }

  const existing = await db.clinician.findFirst({
    where: { id: clinicianId.data, ...tenantScope(request) }
  });
  if (!existing) {
    response.status(404).json({ error: "Clinician was not found in this organisation" });
    return;
  }

  const clinician = await db.clinician.update({
    where: { id: existing.id },
    data: result.data,
    select: { id: true, fullName: true, email: true, role: true, status: true }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId: request.user?.organisationId,
    action: "admin.clinician.updated",
    details: clinician.email
  });

  response.json({ clinician });
});

adminRouter.post("/invitations", async (request: AuthenticatedRequest, response) => {
  const result = invitationSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Valid invitation details are required" });
    return;
  }

  const { token, tokenHash } = invitationToken();
  const invitation = await db.invitation.create({
    data: {
      organisationId: tenantId(request),
      email: result.data.email.toLowerCase(),
      fullName: result.data.fullName,
      role: result.data.role,
      permissions: result.data.permissions,
      tokenHash,
      invitedById: request.user?.clinicianId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId: request.user?.organisationId,
    action: "admin.invitation.created",
    details: invitation.email,
    metadata: { role: invitation.role }
  });

  response.status(201).json({
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt
    },
    invitationLink: `${process.env.PUBLIC_APP_URL || process.env.APP_BASE_URL || ""}/?invite=${token}`
  });
});

adminRouter.post("/clinicians/:clinicianId/reset-password", async (request: AuthenticatedRequest, response) => {
  const clinicianId = z.string().uuid().safeParse(request.params.clinicianId);
  const result = resetPasswordSchema.safeParse(request.body);
  if (!clinicianId.success || !result.success) {
    response.status(400).json({ error: "Valid clinician and 12 character password are required" });
    return;
  }

  const existing = await db.clinician.findFirst({
    where: { id: clinicianId.data, organisationId: tenantId(request) }
  });
  if (!existing) {
    response.status(404).json({ error: "Clinician was not found in this organisation" });
    return;
  }

  const clinician = await db.clinician.update({
    where: { id: existing.id },
    data: {
      passwordHash: await argon2.hash(result.data.password),
      mustResetPassword: true,
      passwordUpdatedAt: new Date()
    },
    select: { id: true, fullName: true, email: true, role: true, status: true }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    organisationId: request.user?.organisationId,
    action: "admin.clinician.password_reset",
    details: clinician.email
  });

  response.json({ clinician });
});
