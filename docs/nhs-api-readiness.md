# Spotit NHS API Readiness

Spotit is prepared for NHS-facing integration work, but live NHS API use requires formal NHS onboarding, an approved use case, information governance review, and issued credentials.

## Current Build

- NHS number is restored as the primary national identifier in the user interface.
- NHS number is the visible patient identifier in the demo patient-facing workflow.
- Report destinations include NHS-style options such as EMIS Web, SystmOne, Vision GP record, NHSmail attachment, local shared care record, and other GP systems.
- The backend includes `/integrations/nhs/status` and `/integrations/nhs/test` readiness endpoints.
- The app reports clearly when PDS sandbox is enabled and when integration/production credentials are not configured.

## Environment Variables

```text
NHS_API_BASE_URL=https://sandbox.api.service.nhs.uk/personal-demographics/FHIR/R4
NHS_PDS_ACCESS_MODE=sandbox-open-access
NHS_API_KEY=replace_after_nhs_onboarding_for_integration_or_production
NHS_CLIENT_ID=replace_after_nhs_onboarding_if_required
NHS_CLIENT_SECRET=replace_after_nhs_onboarding_if_required
```

## Important Boundary

The readiness test checks Spotit's configuration state. PDS FHIR sandbox is for early developer testing, has limited scenarios, is stateless, and does not prove live NHS approval. Integration test and production access require digital onboarding, a valid use case, risk management evidence, and the correct access mode.

## PDS FHIR Environments

- Sandbox: `https://sandbox.api.service.nhs.uk/personal-demographics/FHIR/R4/`
- Integration test: `https://int.api.service.nhs.uk/personal-demographics/FHIR/R4/`
- Production: `https://api.service.nhs.uk/personal-demographics/FHIR/R4/`

## PDS Access Modes

- Healthcare worker access: requires CIS2 authentication and national RBAC.
- Patient access: requires NHS login at the required proofing level.
- Restricted access: application-restricted backend use cases such as verifying an NHS number or retrieving registered GP details.

## Candidate NHS Integrations

- NHS login for patient/public identity where appropriate.
- Personal Demographics Service FHIR for approved demographics workflows.
- GP Connect or supplier-approved GP/EHR integration for governed report transfer.
- FHIR Patient, Observation, DiagnosticReport, DocumentReference, and CarePlan export patterns for interoperability.
