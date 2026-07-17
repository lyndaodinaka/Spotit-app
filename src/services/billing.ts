export type BillingInterval = "monthly" | "yearly";
export type SubscriptionMode = "manual" | "automatic";
export type PaymentMethod = "bank_transfer" | "card" | "apple_pay" | "google_pay" | "invoice";

export const subscriptionPlans = {
  monthly: {
    interval: "monthly" as BillingInterval,
    label: "Monthly",
    amount: process.env.SPOTIT_MONTHLY_PRICE_GBP || "500.99",
    currency: "GBP"
  },
  yearly: {
    interval: "yearly" as BillingInterval,
    label: "Yearly",
    amount: process.env.SPOTIT_YEARLY_PRICE_GBP || "6000.00",
    currency: "GBP"
  }
};

export function getBillingPlan(interval: BillingInterval) {
  return subscriptionPlans[interval];
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
