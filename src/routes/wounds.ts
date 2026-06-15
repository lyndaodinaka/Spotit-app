import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { auditContext, auditLog } from "../services/audit";
import { calculateEscalation } from "../services/escalation";

export const woundRouter = Router();

woundRouter.use(requireAuth);

const createWoundSchema = z.object({
  patientId: z.string().uuid(),
  woundSite: z.string().min(1),
  woundType: z.string().optional(),
  cause: z.string().optional(),
  currentDressing: z.string().optional(),
  reviewFrequency: z.string().optional(),
  responsibleClinician: z.string().optional(),
  presentMedicalHistory: z.string().optional(),
  onsetDate: z.string().optional(),
  careCommencedDate: z.string().optional(),
  nextReviewDate: z.string().optional()
});

const assessmentSchema = z.object({
  woundId: z.string().uuid(),
  measurementMethod: z.string().optional(),
  lengthCm: z.number().optional(),
  widthCm: z.number().optional(),
  depthCm: z.number().optional(),
  areaCm2: z.number().optional(),
  tunnelling: z.boolean().optional(),
  rolledEdge: z.boolean().optional(),
  undermining: z.boolean().optional(),
  sinusTract: z.boolean().optional(),
  cavity: z.boolean().optional(),
  pocketing: z.boolean().optional(),
  granulationPercent: z.number().optional(),
  sloughPercent: z.number().optional(),
  necrosisPercent: z.number().optional(),
  epithelialisationPercent: z.number().optional(),
  exudateType: z.string().optional(),
  exudateAmount: z.string().optional(),
  odor: z.string().optional(),
  periwoundFindings: z.array(z.string()).default([]),
  infectionSigns: z.array(z.string()).default([]),
  edgeCondition: z.string().optional(),
  painScore: z.number().optional(),
  pressureInjuryCategory: z.string().optional(),
  healingStatus: z.string().optional(),
  clinicalNote: z.string().optional()
});

const photoSchema = z.object({
  storageKey: z.string().min(1),
  assessmentId: z.string().uuid().optional(),
  bodyMapView: z.enum(["front", "back"]).optional(),
  bodyMapX: z.number().min(0).max(1).optional(),
  bodyMapY: z.number().min(0).max(1).optional(),
  woundPointData: z.unknown().optional(),
  flashlightUsed: z.boolean().optional(),
  consentStatus: z.string().min(1),
  encryptionStatus: z.string().optional()
});

const carePlanSchema = z.object({
  assessmentId: z.string().uuid().optional(),
  primaryDressing: z.string().optional(),
  secondaryDressing: z.string().optional(),
  compressionMeasurements: z.string().optional(),
  solutionUsed: z.string().optional(),
  actionsRequired: z.array(z.string()).default([]),
  escalationInstructions: z.string().optional(),
  dressingChangeFrequency: z.string().optional(),
  nextReviewDate: z.string().optional(),
  timeSpent: z.string().optional(),
  pressureInjuryCategory: z.string().optional(),
  mobilityAssessment: z.string().optional(),
  repositioningPrompt: z.string().optional(),
  assistiveAids: z.array(z.string()).default([]),
  garments: z.array(z.string()).default([]),
  continenceAssessment: z.string().optional(),
  padChangeFrequency: z.string().optional(),
  lastBowelMovement: z.string().optional(),
  stoolAssessment: z.string().optional(),
  hygiene: z.string().optional(),
  nutrition: z.string().optional(),
  hydration: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  bmi: z.string().optional()
});

woundRouter.post("/", async (request: AuthenticatedRequest, response) => {
  const result = createWoundSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Patient and wound site are required" });
    return;
  }

  const wound = await db.wound.create({
    data: {
      ...result.data,
      onsetDate: result.data.onsetDate ? new Date(result.data.onsetDate) : undefined,
      careCommencedDate: result.data.careCommencedDate ? new Date(result.data.careCommencedDate) : undefined,
      nextReviewDate: result.data.nextReviewDate ? new Date(result.data.nextReviewDate) : undefined
    }
  });

  await auditLog({
    clinicianId: request.user?.clinicianId,
    patientId: wound.patientId,
    woundId: wound.id,
    action: "wound.created"
  });

  response.status(201).json({ wound });
});

woundRouter.get("/:woundId", async (request, response) => {
  const woundId = z.string().uuid().safeParse(request.params.woundId);
  if (!woundId.success) {
    response.status(400).json({ error: "Valid wound is required" });
    return;
  }

  const wound = await db.wound.findUnique({
    where: { id: woundId.data },
    include: {
      patient: true,
      photos: { orderBy: { capturedAt: "desc" } },
      assessments: { orderBy: { assessedAt: "desc" } },
      carePlans: { orderBy: { createdAt: "desc" } },
      reports: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!wound) {
    response.status(404).json({ error: "Wound not found" });
    return;
  }

  response.json({ wound });
});

woundRouter.post("/:woundId/photos", async (request: AuthenticatedRequest, response) => {
  const woundId = z.string().uuid().safeParse(request.params.woundId);
  const result = photoSchema.safeParse(request.body);
  if (!woundId.success || !result.success) {
    response.status(400).json({ error: "Photo record, consent, and wound are required" });
    return;
  }

  const photo = await db.woundPhoto.create({
    data: {
      storageKey: result.data.storageKey,
      assessmentId: result.data.assessmentId,
      bodyMapView: result.data.bodyMapView,
      bodyMapX: result.data.bodyMapX,
      bodyMapY: result.data.bodyMapY,
      woundPointData: result.data.woundPointData as Prisma.InputJsonValue | undefined,
      flashlightUsed: result.data.flashlightUsed,
      consentStatus: result.data.consentStatus,
      encryptionStatus: result.data.encryptionStatus || "private encrypted storage required",
      woundId: woundId.data,
      capturedById: request.user?.clinicianId
    }
  });

  await db.wound.update({
    where: { id: woundId.data },
    data: { updatedAt: new Date() }
  });

  await auditLog({
    ...auditContext(request),
    woundId: woundId.data,
    action: "wound.photo.captured",
    details: result.data.bodyMapView ? `Body map ${result.data.bodyMapView}` : undefined,
    metadata: {
      consentStatus: result.data.consentStatus,
      encryptionStatus: result.data.encryptionStatus || "private encrypted storage required"
    }
  });

  response.status(201).json({ photo });
});

woundRouter.post("/:woundId/assessments", async (request: AuthenticatedRequest, response) => {
  const result = assessmentSchema.safeParse({ ...request.body, woundId: request.params.woundId });
  if (!result.success) {
    response.status(400).json({ error: "Valid assessment data is required" });
    return;
  }

  const currentArea = result.data.lengthCm && result.data.widthCm ? result.data.lengthCm * result.data.widthCm : undefined;
  const latestAssessment = await db.woundAssessment.findFirst({
    where: { woundId: result.data.woundId },
    orderBy: { assessedAt: "desc" }
  });
  const escalation = calculateEscalation({
    previousAreaCm2: latestAssessment?.areaCm2 || undefined,
    currentAreaCm2: currentArea,
    previousPainScore: latestAssessment?.painScore || undefined,
    currentPainScore: result.data.painScore,
    exudateAmount: result.data.exudateAmount,
    exudateType: result.data.exudateType,
    infectionSigns: result.data.infectionSigns.join(", ")
  });

  const assessment = await db.woundAssessment.create({
    data: {
      ...result.data,
      areaCm2: result.data.areaCm2 || currentArea,
      clinicianId: request.user?.clinicianId,
      escalationRequired: escalation.required,
      flags: escalation.flags,
      healingStatus: escalation.required ? "Deteriorating" : result.data.healingStatus
    }
  });

  await db.wound.update({
    where: { id: result.data.woundId },
    data: {
      status: escalation.required ? "Deteriorating" : result.data.healingStatus || "Review"
    }
  });

  await auditLog({
    ...auditContext(request),
    woundId: result.data.woundId,
    action: "wound.assessment.created",
    details: escalation.required ? escalation.flags.join("; ") : "No escalation",
    metadata: { measurementMethod: result.data.measurementMethod, areaCm2: assessment.areaCm2 }
  });

  response.status(201).json({ assessment });
});

woundRouter.post("/:woundId/care-plans", async (request: AuthenticatedRequest, response) => {
  const woundId = z.string().uuid().safeParse(request.params.woundId);
  const result = carePlanSchema.safeParse(request.body);
  if (!woundId.success || !result.success) {
    response.status(400).json({ error: "Valid care plan is required" });
    return;
  }

  const carePlan = await db.carePlan.create({
    data: {
      ...result.data,
      woundId: woundId.data,
      nextReviewDate: result.data.nextReviewDate ? new Date(result.data.nextReviewDate) : undefined
    }
  });

  await db.wound.update({
    where: { id: woundId.data },
    data: { updatedAt: new Date() }
  });

  await auditLog({
    ...auditContext(request),
    woundId: woundId.data,
    action: "wound.care_plan.created",
    metadata: { actionsRequired: result.data.actionsRequired }
  });

  response.status(201).json({ carePlan });
});
