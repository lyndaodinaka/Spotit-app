ALTER TABLE "Patient" ADD COLUMN "maritalStatus" TEXT;
ALTER TABLE "Patient" ADD COLUMN "ethnicity" TEXT;
ALTER TABLE "Patient" ADD COLUMN "clinicalConsentStatus" TEXT;
ALTER TABLE "Patient" ADD COLUMN "consentScope" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Patient" ADD COLUMN "consentRecordedAt" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN "privacyPolicyAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);

ALTER TABLE "WoundPhoto" ADD COLUMN "encryptionStatus" TEXT NOT NULL DEFAULT 'private encrypted storage required';

ALTER TABLE "Report" ADD COLUMN "mdtShareStatus" TEXT;
ALTER TABLE "Report" ADD COLUMN "pdfGeneratedAt" TIMESTAMP(3);

ALTER TABLE "AuditLog" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "metadata" JSONB;
