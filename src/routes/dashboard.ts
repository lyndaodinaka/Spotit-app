import { Router } from "express";
import { db } from "../db";
import { requireAuth, tenantId, type AuthenticatedRequest } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (request: AuthenticatedRequest, response) => {
  const today = new Date();
  const organisationId = tenantId(request);

  const [patients, wounds, reviewWounds, pendingWounds, incompleteFreshAssessments, reports] = await Promise.all([
    db.patient.count({ where: { organisationId } }),
    db.wound.count({ where: { organisationId } }),
    db.wound.count({
      where: {
        organisationId,
        OR: [
          { status: { contains: "Deteriorating", mode: "insensitive" } },
          { nextReviewDate: { lt: today } }
        ]
      }
    }),
    db.wound.count({ where: { organisationId, status: { contains: "pending", mode: "insensitive" } } }),
    db.incompleteFreshAssessment.count({ where: { organisationId, status: "open" } }),
    db.report.count({ where: { organisationId } })
  ]);

  const latestPatients = await db.patient.findMany({
    where: { organisationId },
    orderBy: { updatedAt: "desc" },
    take: 8,
    include: {
      wounds: {
        orderBy: { updatedAt: "desc" },
        take: 2,
        include: {
          assessments: { orderBy: { assessedAt: "desc" }, take: 1 },
          photos: { orderBy: { capturedAt: "desc" }, take: 1 }
        }
      }
    }
  });

  response.json({
    metrics: { patients, wounds, reviewWounds, pendingWounds, incompleteFreshAssessments, reports },
    latestPatients
  });
});
