export type NhsIntegrationStatus = {
  configured: boolean;
  mode: "not_configured" | "sandbox" | "live";
  baseUrl: string;
  availableApis: string[];
  missingVariables: string[];
  message: string;
};

const requiredVariables = ["NHS_API_BASE_URL", "NHS_API_KEY"];

export function getNhsIntegrationStatus(): NhsIntegrationStatus {
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);
  const configured = missingVariables.length === 0;
  const baseUrl = process.env.NHS_API_BASE_URL || "https://sandbox.api.service.nhs.uk";
  const mode = !configured
    ? "not_configured"
    : /sandbox|test|int/i.test(baseUrl)
      ? "sandbox"
      : "live";

  return {
    configured,
    mode,
    baseUrl,
    availableApis: [
      "NHS login readiness",
      "Personal Demographics Service FHIR readiness",
      "GP Connect / GP system export readiness",
      "FHIR Patient and Observation export readiness"
    ],
    missingVariables,
    message: configured
      ? `NHS API settings are present for ${mode} use. Live patient lookup still requires NHS onboarding approval and a valid use case.`
      : "NHS API credentials are not configured. Spotit can prepare NHS/FHIR exports, but cannot call NHS APIs until official onboarding credentials are supplied."
  };
}

export async function testNhsIntegration() {
  const status = getNhsIntegrationStatus();
  if (!status.configured) {
    return {
      ok: false,
      ...status
    };
  }

  return {
    ok: true,
    ...status,
    checkedAt: new Date().toISOString()
  };
}
