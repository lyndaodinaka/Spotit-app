import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (_request, response) => {
  const today = new Date();

  const [patients, wounds, reviewWounds, pendingWounds, reports] = await Promise.all([
    db.patient.count(),
    db.wound.count(),
    db.wound.count({
      where: {
        OR: [
          { status: { contains: "Deteriorating", mode: "insensitive" } },
          { nextReviewDate: { lt: today } }
        ]
      }
    }),
    db.wound.count({ where: { status: { contains: "pending", mode: "insensitive" } } }),
    db.report.count()
  ]);

  const latestPatients = await db.patient.findMany({
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
    metrics: { patients, wounds, reviewWounds, pendingWounds, reports },
    latestPatients
  });
});
