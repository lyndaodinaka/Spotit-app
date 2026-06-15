import argon2 from "argon2";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAdmin, type AuthenticatedRequest } from "../middleware/auth";
import { auditLog } from "../services/audit";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

const clinicianSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
  role: z.enum(["admin", "clinician"]).default("clinician"),
  status: z.enum(["active", "suspended"]).default("active")
});

const accessApprovalSchema = z.object({
  role: z.enum(["admin", "clinician"]).default("clinician"),
  password: z.string().min(12),
  reviewNote: z.string().max(1000).optional()
});

const accessRejectionSchema = z.object({
  reviewNote: z.string().max(1000).optional()
});

adminRouter.get("/overview", async (_request, response) => {
  const [clinicians, accessRequests, activePatients, wounds, escalations, auditLogs] = await Promise.all([
    db.clinician.count(),
    db.accessRequest.count({ where: { status: "pending" } }),
    db.patient.count(),
    db.wound.count(),
    db.woundAssessment.count({ where: { escalationRequired: true } }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { clinician: true, patient: true, wound: true }
    })
  ]);

  response.json({
    metrics: { clinicians, accessRequests, activePatients, wounds, escalations },
    auditLogs
  });
});

adminRouter.get("/access-requests", async (_request, response) => {
  const accessRequests = await db.accessRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      email: true,
      roleRequested: true,
      organisation: true,
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

  const passwordHash = await argon2.hash(result.data.password);
  const clinician = await db.clinician.upsert({
    where: { email: accessRequest.email },
    create: {
      fullName: accessRequest.fullName,
      email: accessRequest.email,
      passwordHash,
      role: result.data.role,
      status: "active"
    },
    update: {
      fullName: accessRequest.fullName,
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
    action: "admin.access_request.rejected",
    details: accessRequest.email
  });

  response.json({ ok: true });
});

adminRouter.get("/clinicians", async (_request, response) => {
  const clinicians = await db.clinician.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
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
      email: clinicianInput.email.toLowerCase(),
      passwordHash: await argon2.hash(password)
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    action: "admin.clinician.created",
    details: clinician.email
  });

  response.status(201).json({ clinician });
});

adminRouter.patch("/clinicians/:clinicianId", async (request: AuthenticatedRequest, response) => {
  const clinicianId = z.string().uuid().safeParse(request.params.clinicianId);
  const updateSchema = z.object({
    role: z.enum(["admin", "clinician"]).optional(),
    status: z.enum(["active", "suspended"]).optional()
  });
  const result = updateSchema.safeParse(request.body);

  if (!clinicianId.success || !result.success) {
    response.status(400).json({ error: "Valid clinician update is required" });
    return;
  }

  const clinician = await db.clinician.update({
    where: { id: clinicianId.data },
    data: result.data,
    select: { id: true, fullName: true, email: true, role: true, status: true }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    action: "admin.clinician.updated",
    details: clinician.email
  });

  response.json({ clinician });
});
