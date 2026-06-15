import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { auditContext, auditLog } from "../services/audit";

export const reportRouter = Router();

reportRouter.use(requireAuth);

const createReportSchema = z.object({
  woundId: z.string().uuid(),
  assessmentId: z.string().uuid().optional(),
  reportText: z.string().min(1),
  sentVia: z.string().optional(),
  sentTo: z.string().optional(),
  mdtShareStatus: z.string().optional(),
  pdfGeneratedAt: z.string().optional()
});

reportRouter.post("/", async (request: AuthenticatedRequest, response) => {
  const result = createReportSchema.safeParse(request.body);
  if (!result.success) {
    response.status(400).json({ error: "Report text and wound are required" });
    return;
  }

  const report = await db.report.create({
    data: {
      ...result.data,
      pdfGeneratedAt: result.data.pdfGeneratedAt ? new Date(result.data.pdfGeneratedAt) : undefined,
      sentAt: result.data.sentVia ? new Date() : undefined
    }
  });

  await auditLog({
    ...auditContext(request),
    woundId: report.woundId,
    action: result.data.sentVia ? "report.sent" : "report.created",
    details: result.data.sentVia ? `Sent via ${result.data.sentVia}` : undefined,
    metadata: { sentTo: result.data.sentTo, mdtShareStatus: result.data.mdtShareStatus }
  });

  response.status(201).json({ report });
});

reportRouter.post("/draft-from-wound/:woundId", async (request: AuthenticatedRequest, response) => {
  const woundId = z.string().uuid().safeParse(request.params.woundId);
  if (!woundId.success) {
    response.status(400).json({ error: "Valid wound is required" });
    return;
  }

  const wound = await db.wound.findUnique({
    where: { id: woundId.data },
    include: {
      patient: true,
      photos: { orderBy: { capturedAt: "desc" }, take: 1 },
      assessments: { orderBy: { assessedAt: "desc" }, take: 1 },
      carePlans: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!wound) {
    response.status(404).json({ error: "Wound not found" });
    return;
  }

  const assessment = wound.assessments[0];
  const carePlan = wound.carePlans[0];
  const latestPhoto = wound.photos[0];
  const reportText = [
    `Patient: ${wound.patient.fullName}`,
    `Wound site: ${wound.woundSite}`,
    `Wound type: ${wound.woundType || "Not recorded"}`,
    `Latest photo: ${latestPhoto ? latestPhoto.capturedAt.toISOString() : "No photo recorded"}`,
    assessment
      ? `Measurement: ${assessment.lengthCm || "-"}cm x ${assessment.widthCm || "-"}cm x ${assessment.depthCm || "-"}cm`
      : "Measurement: Not recorded",
    assessment ? `Healing status: ${assessment.healingStatus || "Not recorded"}` : "Healing status: Not recorded",
    assessment ? `Pain score: ${assessment.painScore ?? "Not recorded"}` : "Pain score: Not recorded",
    carePlan ? `Primary dressing: ${carePlan.primaryDressing || "Not recorded"}` : "Primary dressing: Not recorded",
    carePlan ? `Secondary dressing: ${carePlan.secondaryDressing || "Not recorded"}` : "Secondary dressing: Not recorded",
    carePlan ? `Dressing frequency: ${carePlan.dressingChangeFrequency || "Not recorded"}` : "Dressing frequency: Not recorded",
    assessment?.escalationRequired ? "Escalation: Deteriorating and needs review" : "Escalation: No automatic escalation"
  ].join("\n");

  const report = await db.report.create({
    data: {
      woundId: wound.id,
      assessmentId: assessment?.id,
      reportText
    }
  });

  await auditLog({
    ...auditContext(request),
    patientId: wound.patientId,
    woundId: wound.id,
    action: "report.drafted"
  });

  response.status(201).json({ report });
});
