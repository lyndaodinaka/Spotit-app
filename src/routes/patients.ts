import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { auditContext, auditLog } from "../services/audit";

export const patientRouter = Router();

patientRouter.use(requireAuth);

const createPatientSchema = z.object({
  fullName: z.string().min(1),
  nhsNumber: z.string().optional(),
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

patientRouter.get("/", async (_request, response) => {
  const patients = await db.patient.findMany({
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

patientRouter.get("/:patientId", async (request, response) => {
  const patientId = z.string().uuid().safeParse(request.params.patientId);
  if (!patientId.success) {
    response.status(400).json({ error: "Valid patient is required" });
    return;
  }

  const patient = await db.patient.findUnique({
    where: { id: patientId.data },
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

  const patient = await db.patient.update({
    where: { id: patientId.data },
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
