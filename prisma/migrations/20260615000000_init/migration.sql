CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Clinician" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Clinician_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Patient" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "nhsNumber" TEXT,
  "title" TEXT,
  "fullName" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3),
  "age" TEXT,
  "sex" TEXT,
  "gender" TEXT,
  "allergyStatus" TEXT,
  "diabetesStatus" TEXT,
  "pastMedicalHistory" TEXT,
  "currentWoundHistory" TEXT,
  "mobilityStatus" TEXT,
  "vascularRisk" TEXT,
  "nutritionRisk" TEXT,
  "pressureInjuryRisk" TEXT,
  "careSetting" TEXT,
  "photoConsentStatus" TEXT,
  "governanceChecks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Wound" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "patientId" TEXT NOT NULL,
  "woundSite" TEXT NOT NULL,
  "woundType" TEXT,
  "cause" TEXT,
  "currentDressing" TEXT,
  "reviewFrequency" TEXT,
  "responsibleClinician" TEXT,
  "presentMedicalHistory" TEXT,
  "onsetDate" TIMESTAMP(3),
  "careCommencedDate" TIMESTAMP(3),
  "nextReviewDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'pending assessment',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wound_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WoundPhoto" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "woundId" TEXT NOT NULL,
  "assessmentId" TEXT,
  "storageKey" TEXT NOT NULL,
  "bodyMapView" TEXT,
  "bodyMapX" DOUBLE PRECISION,
  "bodyMapY" DOUBLE PRECISION,
  "woundPointData" JSONB,
  "flashlightUsed" BOOLEAN NOT NULL DEFAULT false,
  "consentStatus" TEXT NOT NULL,
  "capturedById" TEXT,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WoundPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WoundAssessment" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "woundId" TEXT NOT NULL,
  "clinicianId" TEXT,
  "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "measurementMethod" TEXT,
  "lengthCm" DOUBLE PRECISION,
  "widthCm" DOUBLE PRECISION,
  "depthCm" DOUBLE PRECISION,
  "areaCm2" DOUBLE PRECISION,
  "tunnelling" BOOLEAN NOT NULL DEFAULT false,
  "rolledEdge" BOOLEAN NOT NULL DEFAULT false,
  "undermining" BOOLEAN NOT NULL DEFAULT false,
  "sinusTract" BOOLEAN NOT NULL DEFAULT false,
  "cavity" BOOLEAN NOT NULL DEFAULT false,
  "pocketing" BOOLEAN NOT NULL DEFAULT false,
  "granulationPercent" DOUBLE PRECISION,
  "sloughPercent" DOUBLE PRECISION,
  "necrosisPercent" DOUBLE PRECISION,
  "epithelialisationPercent" DOUBLE PRECISION,
  "exudateType" TEXT,
  "exudateAmount" TEXT,
  "odor" TEXT,
  "periwoundFindings" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "infectionSigns" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "edgeCondition" TEXT,
  "painScore" DOUBLE PRECISION,
  "pressureInjuryCategory" TEXT,
  "healingStatus" TEXT,
  "escalationRequired" BOOLEAN NOT NULL DEFAULT false,
  "flags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "clinicalNote" TEXT,
  CONSTRAINT "WoundAssessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CarePlan" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "woundId" TEXT NOT NULL,
  "assessmentId" TEXT,
  "primaryDressing" TEXT,
  "secondaryDressing" TEXT,
  "compressionMeasurements" TEXT,
  "solutionUsed" TEXT,
  "actionsRequired" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "escalationInstructions" TEXT,
  "dressingChangeFrequency" TEXT,
  "nextReviewDate" TIMESTAMP(3),
  "timeSpent" TEXT,
  "pressureInjuryCategory" TEXT,
  "mobilityAssessment" TEXT,
  "repositioningPrompt" TEXT,
  "assistiveAids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "garments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "continenceAssessment" TEXT,
  "padChangeFrequency" TEXT,
  "lastBowelMovement" TEXT,
  "stoolAssessment" TEXT,
  "hygiene" TEXT,
  "nutrition" TEXT,
  "hydration" TEXT,
  "weight" TEXT,
  "height" TEXT,
  "bmi" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CarePlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "woundId" TEXT NOT NULL,
  "assessmentId" TEXT,
  "reportText" TEXT NOT NULL,
  "sentVia" TEXT,
  "sentTo" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "clinicianId" TEXT,
  "patientId" TEXT,
  "woundId" TEXT,
  "action" TEXT NOT NULL,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Clinician_email_key" ON "Clinician"("email");

ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Clinician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Wound" ADD CONSTRAINT "Wound_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WoundPhoto" ADD CONSTRAINT "WoundPhoto_woundId_fkey" FOREIGN KEY ("woundId") REFERENCES "Wound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WoundPhoto" ADD CONSTRAINT "WoundPhoto_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "WoundAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WoundAssessment" ADD CONSTRAINT "WoundAssessment_woundId_fkey" FOREIGN KEY ("woundId") REFERENCES "Wound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WoundAssessment" ADD CONSTRAINT "WoundAssessment_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "Clinician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CarePlan" ADD CONSTRAINT "CarePlan_woundId_fkey" FOREIGN KEY ("woundId") REFERENCES "Wound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CarePlan" ADD CONSTRAINT "CarePlan_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "WoundAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_woundId_fkey" FOREIGN KEY ("woundId") REFERENCES "Wound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "WoundAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "Clinician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_woundId_fkey" FOREIGN KEY ("woundId") REFERENCES "Wound"("id") ON DELETE SET NULL ON UPDATE CASCADE;
