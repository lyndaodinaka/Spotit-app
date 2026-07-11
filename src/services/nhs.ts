export type NhsIntegrationStatus = {
  configured: boolean;
  mode: "sandbox" | "integration_test" | "live";
  baseUrl: string;
  availableApis: string[];
  missingVariables: string[];
  accessMode: "sandbox-open-access" | "application-restricted" | "healthcare-worker" | "patient";
  message: string;
};

const pdsSandboxBaseUrl = "https://sandbox.api.service.nhs.uk/personal-demographics/FHIR/R4";
const pdsIntegrationBaseUrl = "https://int.api.service.nhs.uk/personal-demographics/FHIR/R4";
const pdsProductionBaseUrl = "https://api.service.nhs.uk/personal-demographics/FHIR/R4";

export function getNhsIntegrationStatus(): NhsIntegrationStatus {
  const baseUrl = (process.env.NHS_API_BASE_URL || pdsSandboxBaseUrl).replace(/\/$/, "");
  const mode = /int\.api\.service\.nhs\.uk/i.test(baseUrl)
    ? "integration_test"
    : /api\.service\.nhs\.uk/i.test(baseUrl) && !/sandbox/i.test(baseUrl)
      ? "live"
      : "sandbox";
  const accessMode = (process.env.NHS_PDS_ACCESS_MODE || (mode === "sandbox" ? "sandbox-open-access" : "application-restricted")) as NhsIntegrationStatus["accessMode"];
  const requiredVariables = mode === "sandbox"
    ? []
    : ["NHS_API_BASE_URL", "NHS_API_KEY", "NHS_CLIENT_ID"];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);
  const configured = mode === "sandbox" || missingVariables.length === 0;

  return {
    configured,
    mode,
    baseUrl,
    availableApis: [
      "Personal Demographics Service FHIR sandbox readiness",
      "PDS restricted access readiness",
      "PDS healthcare worker access readiness with CIS2",
      "PDS patient access readiness with NHS login",
      "GP Connect / GP system export readiness",
      "FHIR Patient and Observation export readiness"
    ],
    missingVariables,
    accessMode,
    message: configured
      ? mode === "sandbox"
        ? "PDS FHIR sandbox readiness is enabled. Sandbox is for early testing only, uses limited scenarios, and does not prove live NHS approval."
        : `NHS API settings are present for ${mode} use. Live patient lookup still requires approved onboarding, valid legal basis, and the correct PDS access mode.`
      : "NHS API credentials are not configured for integration or production. Spotit can prepare NHS/FHIR exports, but cannot call restricted/live PDS APIs until official onboarding credentials are supplied."
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
    checkedAt: new Date().toISOString(),
    pdsEnvironments: {
      sandbox: pdsSandboxBaseUrl,
      integrationTest: pdsIntegrationBaseUrl,
      production: pdsProductionBaseUrl
    }
  };
}
