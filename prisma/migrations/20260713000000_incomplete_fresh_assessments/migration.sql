CREATE TABLE "IncompleteFreshAssessment" (
  "id" TEXT NOT NULL,
  "patientLocalId" TEXT NOT NULL,
  "clinicianId" TEXT,
  "clinicianName" TEXT,
  "clinicianRole" TEXT,
  "patientName" TEXT NOT NULL,
  "nhsNumber" TEXT,
  "pendingStep" TEXT NOT NULL DEFAULT 'Wound capture and assessment',
  "woundSite" TEXT,
  "source" TEXT NOT NULL DEFAULT 'Incomplete fresh assessment',
  "status" TEXT NOT NULL DEFAULT 'open',
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "IncompleteFreshAssessment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IncompleteFreshAssessment_clinicianId_status_updatedAt_idx"
  ON "IncompleteFreshAssessment"("clinicianId", "status", "updatedAt");

CREATE INDEX "IncompleteFreshAssessment_status_updatedAt_idx"
  ON "IncompleteFreshAssessment"("status", "updatedAt");

ALTER TABLE "IncompleteFreshAssessment"
  ADD CONSTRAINT "IncompleteFreshAssessment_clinicianId_fkey"
  FOREIGN KEY ("clinicianId") REFERENCES "Clinician"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
