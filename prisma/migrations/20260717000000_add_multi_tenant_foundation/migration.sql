-- Add SaaS tenant foundation while preserving existing Spotit data in a default organisation.
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "plan" TEXT NOT NULL DEFAULT 'demo',
    "ownerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");
CREATE INDEX "Organisation_status_createdAt_idx" ON "Organisation"("status", "createdAt");

INSERT INTO "Organisation" ("id", "name", "slug", "status", "plan", "ownerEmail")
VALUES ('org_medholic_default', 'Medholic Digital Health', 'medholic-digital-health', 'active', 'demo', 'lynda.chidi@medholic.net')
ON CONFLICT ("slug") DO NOTHING;

ALTER TABLE "Clinician" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "AccessRequest" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "IncompleteFreshAssessment" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "Patient" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "Wound" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "WoundPhoto" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "WoundAssessment" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "CarePlan" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "Report" ADD COLUMN "organisationId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "organisationId" TEXT;

UPDATE "Clinician" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "AccessRequest" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "IncompleteFreshAssessment" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "Patient" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "Wound" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "WoundPhoto" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "WoundAssessment" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "CarePlan" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "Report" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;
UPDATE "AuditLog" SET "organisationId" = 'org_medholic_default' WHERE "organisationId" IS NULL;

CREATE INDEX "Clinician_organisationId_status_idx" ON "Clinician"("organisationId", "status");
CREATE INDEX "AccessRequest_organisationId_status_createdAt_idx" ON "AccessRequest"("organisationId", "status", "createdAt");
CREATE INDEX "IncompleteFreshAssessment_organisationId_status_updatedAt_idx" ON "IncompleteFreshAssessment"("organisationId", "status", "updatedAt");
CREATE INDEX "Patient_organisationId_updatedAt_idx" ON "Patient"("organisationId", "updatedAt");
CREATE INDEX "Wound_organisationId_status_nextReviewDate_idx" ON "Wound"("organisationId", "status", "nextReviewDate");
CREATE INDEX "Wound_organisationId_updatedAt_idx" ON "Wound"("organisationId", "updatedAt");
CREATE INDEX "WoundPhoto_organisationId_capturedAt_idx" ON "WoundPhoto"("organisationId", "capturedAt");
CREATE INDEX "WoundAssessment_organisationId_assessedAt_idx" ON "WoundAssessment"("organisationId", "assessedAt");
CREATE INDEX "WoundAssessment_organisationId_escalationRequired_idx" ON "WoundAssessment"("organisationId", "escalationRequired");
CREATE INDEX "CarePlan_organisationId_createdAt_idx" ON "CarePlan"("organisationId", "createdAt");
CREATE INDEX "Report_organisationId_createdAt_idx" ON "Report"("organisationId", "createdAt");
CREATE INDEX "AuditLog_organisationId_createdAt_idx" ON "AuditLog"("organisationId", "createdAt");

ALTER TABLE "Clinician" ADD CONSTRAINT "Clinician_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IncompleteFreshAssessment" ADD CONSTRAINT "IncompleteFreshAssessment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Wound" ADD CONSTRAINT "Wound_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WoundPhoto" ADD CONSTRAINT "WoundPhoto_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WoundAssessment" ADD CONSTRAINT "WoundAssessment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CarePlan" ADD CONSTRAINT "CarePlan_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
