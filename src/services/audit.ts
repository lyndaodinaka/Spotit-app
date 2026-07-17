import { db } from "../db";
import type { Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth";

export async function auditLog(input: {
  organisationId?: string;
  clinicianId?: string;
  patientId?: string;
  woundId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await db.auditLog.create({
    data: {
      organisationId: input.organisationId,
      clinicianId: input.clinicianId,
      patientId: input.patientId,
      woundId: input.woundId,
      action: input.action,
      details: input.details,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata
    }
  });
}

export function auditContext(request: AuthenticatedRequest) {
  return {
    organisationId: request.user?.organisationId,
    clinicianId: request.user?.clinicianId,
    ipAddress: request.ip,
    userAgent: request.get("user-agent") || undefined
  };
}
