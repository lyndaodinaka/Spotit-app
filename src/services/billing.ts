export type BillingInterval = "monthly" | "yearly";
export type SubscriptionMode = "manual" | "automatic";
export type PaymentMethod = "bank_transfer" | "card" | "apple_pay" | "google_pay" | "invoice";
export type PlanTier = "small_clinic" | "medium_organisation" | "large_professional" | "enterprise";

export const subscriptionFeatureList = [
  "Regular wound photos",
  "Progress tracking",
  "Secure storage",
  "Team collaboration",
  "Reports and analytics",
  "Technical support",
  "Regular software updates"
];

export const subscriptionPlans = {
  small_clinic: {
    tier: "small_clinic" as PlanTier,
    label: "Small clinic",
    description: "Single clinic or small care provider",
    monthly: process.env.SPOTIT_SMALL_MONTHLY_GBP || "800.00",
    yearly: process.env.SPOTIT_SMALL_YEARLY_GBP || "8800.00",
    currency: "GBP",
    included: subscriptionFeatureList
  },
  medium_organisation: {
    tier: "medium_organisation" as PlanTier,
    label: "Medium organisation",
    description: "Care group, clinic group, or growing provider",
    monthly: process.env.SPOTIT_MEDIUM_MONTHLY_GBP || "1500.00",
    yearly: process.env.SPOTIT_MEDIUM_YEARLY_GBP || "16500.00",
    currency: "GBP",
    included: subscriptionFeatureList
  },
  large_professional: {
    tier: "large_professional" as PlanTier,
    label: "Large / professional",
    description: "Multiple teams or multi-site service",
    monthly: process.env.SPOTIT_LARGE_MONTHLY_GBP || "3000.00",
    yearly: process.env.SPOTIT_LARGE_YEARLY_GBP || "33000.00",
    currency: "GBP",
    included: subscriptionFeatureList
  },
  enterprise: {
    tier: "enterprise" as PlanTier,
    label: "Enterprise",
    description: "Large providers, NHS, or regional deployment",
    monthly: process.env.SPOTIT_ENTERPRISE_MONTHLY_GBP || "Custom quotation",
    yearly: process.env.SPOTIT_ENTERPRISE_YEARLY_GBP || "Custom quotation",
    currency: "GBP",
    included: subscriptionFeatureList
  }
};

export function getBillingPlan(tier: PlanTier, interval: BillingInterval) {
  const plan = subscriptionPlans[tier] || subscriptionPlans.small_clinic;
  return {
    tier: plan.tier,
    interval,
    label: `${plan.label} ${interval}`,
    description: plan.description,
    amount: interval === "yearly" ? plan.yearly : plan.monthly,
    currency: plan.currency,
    included: plan.included
  };
}

export function getPaymentInstructions(paymentReference: string) {
  return {
    bankTransfer: {
      accountName: process.env.SPOTIT_BANK_ACCOUNT_NAME || "Medholic Digital Health",
      sortCode: process.env.SPOTIT_BANK_SORT_CODE || "Add in Railway variables",
      accountNumber: process.env.SPOTIT_BANK_ACCOUNT_NUMBER || "Add in Railway variables",
      iban: process.env.SPOTIT_BANK_IBAN || "",
      bic: process.env.SPOTIT_BANK_BIC || "",
      reference: paymentReference
    },
    onlinePayment: {
      provider: process.env.SPOTIT_PAYMENT_PROVIDER || "payment_provider_required",
      checkoutUrl: process.env.SPOTIT_PAYMENT_CHECKOUT_URL || "",
      note: "Card, Apple Pay, and Google Pay require a payment provider such as Stripe before automatic confirmation can work."
    }
  };
}

export function makePaymentReference(organisationSlug: string) {
  const prefix = process.env.SPOTIT_BANK_REFERENCE_PREFIX || "SPOTIT";
  const compactSlug = organisationSlug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase() || "ORG";
  const suffix = Date.now().toString(36).toUpperCase();
  return `${prefix}-${compactSlug}-${suffix}`;
}

export function periodFor(interval: BillingInterval, from = new Date()) {
  const periodEnd = new Date(from);
  if (interval === "yearly") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }
  return { periodStart: from, periodEnd };
}
