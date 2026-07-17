import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, tenantId, type AuthenticatedRequest } from "../middleware/auth";
import { auditContext, auditLog } from "../services/audit";

export const patientRouter = Router();

patientRouter.use(requireAuth);

const createPatientSchema = z.object({
  fullName: z.string().min(1),
  nhsNumber: z.string().optional(),
  hospitalNumber: z.string().optional(),
  title: z.string().optional(),
  dateOfBirth: z.string().optional(),
  age: z.string().optional(),
  sex: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  ethnicity: z.string().optional(),
  allergyStatus: z.string().optional(),
  diabetesStatus: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  currentWoundHistory: z.string().optional(),
  mobilityStatus: z.string().optional(),
  vascularRisk: z.string().optional(),
  nutritionRisk: z.string().optional(),
  pressureInjuryRisk: z.string().optional(),
  careSetting: z.string().optional(),
  photoConsentStatus: z.string().optional(),
  clinicalConsentStatus: z.string().optional(),
  consentScope: z.array(z.string()).default([]),
  consentRecordedAt: z.string().optional(),
  privacyPolicyAcceptedAt: z.string().optional(),
  termsAcceptedAt: z.string().optional(),
  governanceChecks: z.array(z.string()).default([])
});

const updatePatientSchema = createPatientSchema.partial();

const incompleteFreshSchema = z.object({
  patientLocalId: z.string().min(1),
  patientName: z.string().trim().min(1),
  nhsNumber: z.string().optional(),
  pendingStep: z.string().optional(),
  woundSite: z.string().optional(),
  source: z.string().optional(),
  payload: z.record(z.unknown())
});

patientRouter.get("/", async (request: AuthenticatedRequest, response) => {
  const patients = await db.patient.findMany({
    where: { organisationId: tenantId(request) },
    include: {
      wounds: {
        orderBy: { updatedAt: "desc" },
        take: 3
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  response.json({ patients });
});

patientRouter.get("/incomplete-fresh", async (request: AuthenticatedRequest, response) => {
  const isAdmin = request.user?.role === "admin" || request.user?.role === "platform_admin";
  const items = await db.incompleteFreshAssessment.findMany({
    where: {
      organisationId: tenantId(request),
      status: "open",
      ...(isAdmin ? {} : { clinicianId: request.user?.clinicianId })
    },
    orderBy: { updatedAt: "desc" },
    include: {
      clinician: {
        select: {
          fullName: true,
          role: true,
          email: true
        }
      }
    }
  });

  response.json({ items });
});

patientRouter.post("/incomplete-fresh", async (request: AuthenticatedRequest, response) => {
  const result = incompleteFreshSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Incomplete assessment details are required" });
    return;
  }

  const existing = await db.incompleteFreshAssessment.findFirst({
    where: {
      organisationId: tenantId(request),
      patientLocalId: result.data.patientLocalId,
      clinicianId: request.user?.clinicianId,
      status: "open"
    }
  });

  const clinician = request.user?.clinicianId
    ? await db.clinician.findUnique({ where: { id: request.user.clinicianId } })
    : null;

  const data: Prisma.IncompleteFreshAssessmentUncheckedCreateInput = {
    organisationId: tenantId(request),
    patientLocalId: result.data.patientLocalId,
    patientName: result.data.patientName,
    nhsNumber: result.data.nhsNumber,
    pendingStep: result.data.pendingStep || "Wound capture and assessment",
    woundSite: result.data.woundSite,
    source: result.data.source || "Incomplete fresh assessment",
    payload: result.data.payload as Prisma.InputJsonValue,
    clinicianId: request.user?.clinicianId,
    clinicianName: clinician?.fullName,
    clinicianRole: clinician?.role
  };

  const item = existing
    ? await db.incompleteFreshAssessment.update({ where: { id: existing.id }, data })
    : await db.incompleteFreshAssessment.create({ data });

  await auditLog({
    ...auditContext(request),
    action: "patient.incomplete_fresh.saved",
    details: result.data.patientName,
    metadata: {
      pendingStep: data.pendingStep,
      woundSite: data.woundSite,
      clinicianName: data.clinicianName,
      clinicianRole: data.clinicianRole
    }
  });

  response.status(existing ? 200 : 201).json({ item });
});

patientRouter.delete("/incomplete-fresh/:itemId", async (request: AuthenticatedRequest, response) => {
  const itemId = z.string().uuid().safeParse(request.params.itemId);
  if (!itemId.success) {
    response.status(400).json({ error: "Valid incomplete assessment is required" });
    return;
  }

  const item = await db.incompleteFreshAssessment.findFirst({
    where: { id: itemId.data, organisationId: tenantId(request) }
  });
  if (!item) {
    response.status(404).json({ error: "Incomplete assessment not found" });
    return;
  }

  const isOwner = item.clinicianId === request.user?.clinicianId;
  const isAdmin = request.user?.role === "admin" || request.user?.role === "platform_admin";
  if (!isOwner && !isAdmin) {
    response.status(403).json({ error: "Only the owner clinician or admin can clear this incomplete assessment" });
    return;
  }

  await db.incompleteFreshAssessment.update({
    where: { id: item.id },
    data: { status: "closed" }
  });

  await auditLog({
    ...auditContext(request),
    action: "patient.incomplete_fresh.closed",
    details: item.patientName,
    metadata: {
      startedBy: item.clinicianName,
      startedByRole: item.clinicianRole,
      pendingStep: item.pendingStep
    }
  });

  response.json({ ok: true });
});

patientRouter.get("/:patientId", async (request: AuthenticatedRequest, response) => {
  const patientId = z.string().uuid().safeParse(request.params.patientId);
  if (!patientId.success) {
    response.status(400).json({ error: "Valid patient is required" });
    return;
  }

  const patient = await db.patient.findFirst({
    where: { id: patientId.data, organisationId: tenantId(request) },
    include: {
      wounds: {
        include: {
          photos: { orderBy: { capturedAt: "desc" } },
          assessments: { orderBy: { assessedAt: "desc" }, take: 5 },
          carePlans: { orderBy: { createdAt: "desc" }, take: 5 },
          reports: { orderBy: { createdAt: "desc" }, take: 5 }
        },
        orderBy: { updatedAt: "desc" }
      },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 }
    }
  });

  if (!patient) {
    response.status(404).json({ error: "Patient not found" });
    return;
  }

  response.json({ patient });
});

patientRouter.post("/", async (request: AuthenticatedRequest, response) => {
  const result = createPatientSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Patient name is required" });
    return;
  }

  const patient = await db.patient.create({
    data: {
      ...result.data,
      organisationId: tenantId(request),
      dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : undefined,
      consentRecordedAt: result.data.consentRecordedAt ? new Date(result.data.consentRecordedAt) : undefined,
      privacyPolicyAcceptedAt: result.data.privacyPolicyAcceptedAt ? new Date(result.data.privacyPolicyAcceptedAt) : undefined,
      termsAcceptedAt: result.data.termsAcceptedAt ? new Date(result.data.termsAcceptedAt) : undefined,
      createdById: request.user?.clinicianId
    }
  });

  await auditLog({
    ...auditContext(request),
    patientId: patient.id,
    action: "patient.created",
    metadata: { consentStatus: patient.clinicalConsentStatus, consentScope: patient.consentScope }
  });

  response.status(201).json({ patient });
});

patientRouter.patch("/:patientId", async (request: AuthenticatedRequest, response) => {
  const patientId = z.string().uuid().safeParse(request.params.patientId);
  const result = updatePatientSchema.safeParse(request.body);
  if (!patientId.success || !result.success) {
    response.status(400).json({ error: "Valid patient updates are required" });
    return;
  }

  const existing = await db.patient.findFirst({
    where: { id: patientId.data, organisationId: tenantId(request) }
  });
  if (!existing) {
    response.status(404).json({ error: "Patient not found in this organisation" });
    return;
  }

  const patient = await db.patient.update({
    where: { id: existing.id },
    data: {
      ...result.data,
      dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : undefined,
      consentRecordedAt: result.data.consentRecordedAt ? new Date(result.data.consentRecordedAt) : undefined,
      privacyPolicyAcceptedAt: result.data.privacyPolicyAcceptedAt ? new Date(result.data.privacyPolicyAcceptedAt) : undefined,
      termsAcceptedAt: result.data.termsAcceptedAt ? new Date(result.data.termsAcceptedAt) : undefined
    }
  });

  await auditLog({
    ...auditContext(request),
    patientId: patient.id,
    action: "patient.updated",
    metadata: { consentStatus: patient.clinicalConsentStatus, consentScope: patient.consentScope }
  });

  response.json({ patient });
});
