# Spotit NHS API Readiness

Spotit is prepared for NHS-facing integration work, but live NHS API use requires formal NHS onboarding, an approved use case, information governance review, and issued credentials.

## Current Build

- NHS number is restored as the primary national identifier in the user interface.
- Hospital number is retained as a local provider identifier.
- Report destinations include NHS-style options such as EMIS Web, SystmOne, Vision GP record, NHSmail attachment, local shared care record, and other GP systems.
- The backend includes `/integrations/nhs/status` and `/integrations/nhs/test` readiness endpoints.
- The app reports clearly when NHS API credentials are not configured.

## Environment Variables

```text
NHS_API_BASE_URL=https://sandbox.api.service.nhs.uk
NHS_API_KEY=replace_after_nhs_onboarding
NHS_CLIENT_ID=replace_after_nhs_onboarding_if_required
```

## Important Boundary

The readiness test checks Spotit's configuration state. It does not access live NHS patient data unless a buying NHS organisation completes onboarding and supplies approved credentials.

## Candidate NHS Integrations

- NHS login for patient/public identity where appropriate.
- Personal Demographics Service FHIR for approved demographics workflows.
- GP Connect or supplier-approved GP/EHR integration for governed report transfer.
- FHIR Patient, Observation, DiagnosticReport, DocumentReference, and CarePlan export patterns for interoperability.
