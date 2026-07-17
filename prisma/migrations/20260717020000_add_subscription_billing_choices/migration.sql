ALTER TABLE "Organisation" ADD COLUMN "subscriptionInterval" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "subscriptionMode" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "currentPeriodStart" TIMESTAMP(3);
ALTER TABLE "Organisation" ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);

ALTER TABLE "BillingRecord" ADD COLUMN "billingInterval" TEXT;
ALTER TABLE "BillingRecord" ADD COLUMN "subscriptionMode" TEXT;
ALTER TABLE "BillingRecord" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "BillingRecord" ADD COLUMN "paymentReference" TEXT;
ALTER TABLE "BillingRecord" ADD COLUMN "confirmationSource" TEXT;
ALTER TABLE "BillingRecord" ADD COLUMN "confirmedAt" TIMESTAMP(3);

CREATE INDEX "BillingRecord_paymentReference_idx" ON "BillingRecord"("paymentReference");
