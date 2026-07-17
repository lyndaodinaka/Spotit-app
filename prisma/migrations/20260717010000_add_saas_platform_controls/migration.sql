ALTER TABLE "Clinician" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Clinician" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Clinician" ADD COLUMN "twoFactorSecretEncrypted" TEXT;
ALTER TABLE "Clinician" ADD COLUMN "mustResetPassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Clinician" ADD COLUMN "passwordUpdatedAt" TIMESTAMP(3);

ALTER TABLE "Organisation" ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE "Organisation" ADD COLUMN "billingEmail" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "billingCustomerRef" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "seatsAllowed" INTEGER;
ALTER TABLE "Organisation" ADD COLUMN "features" TEXT[] DEFAULT ARRAY[]::TEXT[];
CREATE INDEX "Organisation_subscriptionStatus_updatedAt_idx" ON "Organisation"("subscriptionStatus", "updatedAt");

CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'clinician',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tokenHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'all',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportAccessGrant" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "approvedById" TEXT,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAccessGrant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingRecord" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "amount" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "externalRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");
CREATE INDEX "Invitation_organisationId_status_createdAt_idx" ON "Invitation"("organisationId", "status", "createdAt");
CREATE INDEX "Invitation_email_status_idx" ON "Invitation"("email", "status");
CREATE INDEX "Announcement_organisationId_status_createdAt_idx" ON "Announcement"("organisationId", "status", "createdAt");
CREATE INDEX "SupportAccessGrant_organisationId_status_expiresAt_idx" ON "SupportAccessGrant"("organisationId", "status", "expiresAt");
CREATE INDEX "BillingRecord_organisationId_status_createdAt_idx" ON "BillingRecord"("organisationId", "status", "createdAt");

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "Clinician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportAccessGrant" ADD CONSTRAINT "SupportAccessGrant_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportAccessGrant" ADD CONSTRAINT "SupportAccessGrant_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Clinician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingRecord" ADD CONSTRAINT "BillingRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
