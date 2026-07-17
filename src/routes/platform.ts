import argon2 from "argon2";
import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requirePlatformAdmin, type AuthenticatedRequest } from "../middleware/auth";
import { auditContext, auditLog } from "../services/audit";
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

export const platformRouter = Router();

platformRouter.use(requirePlatformAdmin);

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "organisation";
}

function invitationToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

const organisationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(80).optional(),
  ownerEmail: z.string().trim().email().optional(),
  billingEmail: z.string().trim().email().optional(),
  plan: z.string().trim().max(80).default("trial"),
  subscriptionStatus: z.enum(["trial", "active", "past_due", "suspended", "cancelled"]).default("trial"),
  seatsAllowed: z.number().int().positive().optional(),
  features: z.array(z.string()).default([])
});

const organisationUpdateSchema = organisationSchema.partial();

const invitationSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().max(120).optional(),
  role: z.enum(["admin", "clinician"]).default("admin"),
  permissions: z.array(z.string()).default([])
});

const resetPasswordSchema = z.object({
  clinicianId: z.string().uuid(),
  password: z.string().min(12)
});

const announcementSchema = z.object({
  organisationId: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(2).max(2000),
  audience: z.enum(["all", "admins", "clinicians"]).default("all"),
  status: z.enum(["draft", "published"]).default("draft")
});

const billingSchema = z.object({
  organisationId: z.string().uuid(),
  planTier: z.enum(["small_clinic", "medium_organisation", "large_professional", "enterprise"]).default("small_clinic"),
  billingInterval: z.enum(["monthly", "yearly"]).default("monthly"),
  subscriptionMode: z.enum(["manual", "automatic"]).default("manual"),
  paymentMethod: z.enum(["bank_transfer", "card", "apple_pay", "google_pay", "invoice"]).default("bank_transfer"),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().default("GBP"),
  status: z.enum(["draft", "sent", "pending_confirmation", "pending_online_payment", "paid", "overdue", "cancelled"]).default("draft"),
  externalRef: z.string().optional(),
  notes: z.string().optional()
});

const paymentConfirmationSchema = z.object({
  confirmationSource: z.enum(["bank_transfer", "payment_provider", "manual_admin_confirmation"]),
  externalRef: z.string().optional(),
  notes: z.string().optional()
});

platformRouter.get("/organisations", async (_request, response) => {
  const organisations = await db.organisation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          clinicians: true,
          patients: true,
          wounds: true,
          reports: true
        }
      }
    }
  });

  response.json({ organisations });
});

platformRouter.get("/billing/plans", async (_request, response) => {
  response.json({
    plans: subscriptionPlans,
    paymentInstructions: getPaymentInstructions("reference-created-when-invoice-is-raised")
  });
});

platformRouter.post("/organisations", async (request: AuthenticatedRequest, response) => {
  const result = organisationSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Valid organisation details are required" });
    return;
  }

  const organisation = await db.organisation.create({
    data: {
      name: result.data.name,
      slug: result.data.slug || slugify(result.data.name),
      ownerEmail: result.data.ownerEmail?.toLowerCase(),
      billingEmail: result.data.billingEmail?.toLowerCase() || result.data.ownerEmail?.toLowerCase(),
      plan: result.data.plan,
      subscriptionStatus: result.data.subscriptionStatus,
      status: result.data.subscriptionStatus === "suspended" ? "suspended" : "active",
      seatsAllowed: result.data.seatsAllowed,
      features: result.data.features
    }
  });

  await auditLog({
    ...auditContext(request),
    organisationId: organisation.id,
    action: "platform.organisation.created",
    details: organisation.name
  });

  response.status(201).json({ organisation });
});

platformRouter.patch("/organisations/:organisationId", async (request: AuthenticatedRequest, response) => {
  const organisationId = z.string().uuid().safeParse(request.params.organisationId);
  const result = organisationUpdateSchema.safeParse(request.body);
  if (!organisationId.success || !result.success) {
    response.status(400).json({ error: "Valid organisation update is required" });
    return;
  }

  const organisation = await db.organisation.update({
    where: { id: organisationId.data },
    data: {
      ...result.data,
      ownerEmail: result.data.ownerEmail?.toLowerCase(),
      billingEmail: result.data.billingEmail?.toLowerCase(),
      status: result.data.subscriptionStatus
        ? result.data.subscriptionStatus === "suspended" || result.data.subscriptionStatus === "cancelled"
          ? "suspended"
          : "active"
        : undefined
    }
  });

  await auditLog({
    ...auditContext(request),
    organisationId: organisation.id,
    action: "platform.organisation.updated",
    details: organisation.name,
    metadata: result.data
  });

  response.json({ organisation });
});

platformRouter.get("/organisations/:organisationId/usage", async (request, response) => {
  const organisationId = z.string().uuid().safeParse(request.params.organisationId);
  if (!organisationId.success) {
    response.status(400).json({ error: "Valid organisation is required" });
    return;
  }

  const [clinicians, patients, wounds, photos, reports, auditLogs] = await Promise.all([
    db.clinician.count({ where: { organisationId: organisationId.data } }),
    db.patient.count({ where: { organisationId: organisationId.data } }),
    db.wound.count({ where: { organisationId: organisationId.data } }),
    db.woundPhoto.count({ where: { organisationId: organisationId.data } }),
    db.report.count({ where: { organisationId: organisationId.data } }),
    db.auditLog.count({ where: { organisationId: organisationId.data } })
  ]);

  response.json({ usage: { clinicians, patients, wounds, photos, reports, auditLogs } });
});

platformRouter.post("/organisations/:organisationId/invitations", async (request: AuthenticatedRequest, response) => {
  const organisationId = z.string().uuid().safeParse(request.params.organisationId);
  const result = invitationSchema.safeParse(request.body);
  if (!organisationId.success || !result.success) {
    response.status(400).json({ error: "Valid invitation details are required" });
    return;
  }

  const organisation = await db.organisation.findUnique({ where: { id: organisationId.data } });
  if (!organisation) {
    response.status(404).json({ error: "Organisation was not found" });
    return;
  }

  const { token, tokenHash } = invitationToken();
  const invitation = await db.invitation.create({
    data: {
      organisationId: organisation.id,
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
    ...auditContext(request),
    organisationId: organisation.id,
    action: "platform.invitation.created",
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

platformRouter.post("/organisations/:organisationId/reset-password", async (request: AuthenticatedRequest, response) => {
  const organisationId = z.string().uuid().safeParse(request.params.organisationId);
  const result = resetPasswordSchema.safeParse(request.body);
  if (!organisationId.success || !result.success) {
    response.status(400).json({ error: "Valid clinician and 12 character password are required" });
    return;
  }

  const clinician = await db.clinician.findFirst({
    where: { id: result.data.clinicianId, organisationId: organisationId.data }
  });
  if (!clinician) {
    response.status(404).json({ error: "Clinician was not found in that organisation" });
    return;
  }

  const updated = await db.clinician.update({
    where: { id: clinician.id },
    data: {
      passwordHash: await argon2.hash(result.data.password),
      mustResetPassword: true,
      passwordUpdatedAt: new Date()
    },
    select: { id: true, email: true, fullName: true }
  });

  await auditLog({
    ...auditContext(request),
    organisationId: organisationId.data,
    action: "platform.clinician.password_reset",
    details: updated.email
  });

  response.json({ clinician: updated });
});

platformRouter.post("/announcements", async (request: AuthenticatedRequest, response) => {
  const result = announcementSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Valid announcement is required" });
    return;
  }

  const announcement = await db.announcement.create({
    data: {
      ...result.data,
      publishedAt: result.data.status === "published" ? new Date() : undefined
    }
  });

  await auditLog({
    ...auditContext(request),
    organisationId: result.data.organisationId,
    action: "platform.announcement.created",
    details: announcement.title
  });

  response.status(201).json({ announcement });
});

platformRouter.post("/billing-records", async (request: AuthenticatedRequest, response) => {
  const result = billingSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Valid billing record is required" });
    return;
  }

  const organisation = await db.organisation.findUnique({
    where: { id: result.data.organisationId }
  });
  if (!organisation) {
    response.status(404).json({ error: "Organisation was not found" });
    return;
  }

  const billingInterval = result.data.billingInterval as BillingInterval;
  const planTier = result.data.planTier as PlanTier;
  const subscriptionMode = result.data.subscriptionMode as SubscriptionMode;
  const paymentMethod = result.data.paymentMethod as PaymentMethod;
  const plan = getBillingPlan(planTier, billingInterval);
  const paymentReference = makePaymentReference(organisation.slug);
  const defaultPeriod = periodFor(billingInterval);

  const billingRecord = await db.billingRecord.create({
    data: {
      ...result.data,
      amount: result.data.amount || plan.amount,
      currency: result.data.currency || plan.currency,
      planTier,
      billingInterval,
      subscriptionMode,
      paymentMethod,
      paymentReference,
      periodStart: result.data.periodStart ? new Date(result.data.periodStart) : defaultPeriod.periodStart,
      periodEnd: result.data.periodEnd ? new Date(result.data.periodEnd) : defaultPeriod.periodEnd
    }
  });

  await db.organisation.update({
    where: { id: organisation.id },
    data: {
      plan: billingInterval,
      planTier,
      subscriptionInterval: billingInterval,
      subscriptionMode,
      paymentMethod,
      subscriptionStatus: billingRecord.status === "paid" ? "active" : "pending_payment"
    }
  });

  await auditLog({
    ...auditContext(request),
    organisationId: result.data.organisationId,
    action: "platform.billing_record.created",
    details: billingRecord.amount || undefined
  });

  response.status(201).json({
    billingRecord,
    paymentInstructions: getPaymentInstructions(paymentReference)
  });
});

platformRouter.post("/billing-records/:billingRecordId/confirm", async (request: AuthenticatedRequest, response) => {
  const billingRecordId = z.string().uuid().safeParse(request.params.billingRecordId);
  const result = paymentConfirmationSchema.safeParse(request.body);
  if (!billingRecordId.success || !result.success) {
    response.status(400).json({ error: "Valid billing record and confirmation details are required" });
    return;
  }

  const billingRecord = await db.billingRecord.findUnique({
    where: { id: billingRecordId.data },
    include: { tenant: true }
  });
  if (!billingRecord) {
    response.status(404).json({ error: "Billing record was not found" });
    return;
  }

  const confirmed = await db.billingRecord.update({
    where: { id: billingRecord.id },
    data: {
      status: "paid",
      confirmationSource: result.data.confirmationSource,
      externalRef: result.data.externalRef || billingRecord.externalRef,
      notes: result.data.notes || billingRecord.notes,
      confirmedAt: new Date()
    }
  });

  await db.organisation.update({
    where: { id: billingRecord.organisationId },
    data: {
      subscriptionStatus: "active",
      status: "active",
      currentPeriodStart: billingRecord.periodStart,
      currentPeriodEnd: billingRecord.periodEnd,
      planTier: billingRecord.planTier,
      subscriptionInterval: billingRecord.billingInterval,
      subscriptionMode: billingRecord.subscriptionMode,
      paymentMethod: billingRecord.paymentMethod
    }
  });

  await auditLog({
    ...auditContext(request),
    organisationId: billingRecord.organisationId,
    action: "platform.billing_record.confirmed",
    details: billingRecord.paymentReference || billingRecord.externalRef || billingRecord.id,
    metadata: {
      confirmationSource: result.data.confirmationSource,
      externalRef: result.data.externalRef
    }
  });

  response.json({ billingRecord: confirmed });
});
