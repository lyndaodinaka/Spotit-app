ALTER TABLE "Organisation" ADD COLUMN "planTier" TEXT;
ALTER TABLE "BillingRecord" ADD COLUMN "planTier" TEXT;

UPDATE "Organisation"
SET "planTier" = CASE
  WHEN "plan" IN ('monthly', 'yearly') THEN 'small_clinic'
  WHEN "plan" IS NULL OR "plan" = 'demo' OR "plan" = 'trial' OR "plan" = 'platform' THEN "planTier"
  ELSE "plan"
END
WHERE "planTier" IS NULL;

CREATE INDEX "Organisation_planTier_subscriptionStatus_idx" ON "Organisation"("planTier", "subscriptionStatus");
CREATE INDEX "BillingRecord_planTier_status_createdAt_idx" ON "BillingRecord"("planTier", "status", "createdAt");
