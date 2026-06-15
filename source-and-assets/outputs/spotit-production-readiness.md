# Spotit Production Readiness Plan

## Current Position
Spotit is currently a working local web app concept. It demonstrates the clinician workflow, caseload, wound capture journey, structured assessment, care plan, report generation, and escalation prompts.

It is not yet ready for live clinical use or sale because it stores data locally in the browser and does not yet have secure authentication, encrypted server storage, role permissions, audit logging, clinical safety documentation, or deployment controls.

## What Must Be Built Next

### 1. Secure Real App
- Move from a single local HTML file to a hosted web app.
- Add secure login with named users.
- Add roles: nurse, support worker, nurse assistant, tissue viability nurse, duty clinician, admin.
- Add password reset and account lockout.
- Add session timeout.
- Add role-based permissions.

### 2. Real Clinical Records
- Store patients, wounds, assessments, wound photos, care plans, dressing plans, and reports in a secure database.
- Keep every wound assessment as a dated record.
- Allow one patient to have multiple active wounds on different body sites.
- Keep previous wound photos visible in active wound summary.
- Keep new-patient PMH editable but avoid re-asking full registration history for existing patients.

### 3. Photo Capture And Measurement
- Use device camera on mobile/tablet.
- Store original wound photo securely.
- Store body-map site, manual measurement, wound-point measurement, and measurement method.
- Keep photo consent tied to each patient and each wound image.

### 4. Audit And Governance
- Record who created, edited, viewed, exported, or sent each record.
- Track timestamps, patient ID, clinician ID, device/browser, and action taken.
- Keep report sending/export events in the audit log.
- Add clinical safety statement: Spotit prompts review but does not diagnose or replace clinician judgement.

### 5. Reports And Sending
- Generate wound progress notes.
- Export PDF.
- Send report by secure email/NHS mail or configured clinical messaging route.
- Keep a copy of the sent report and destination in the audit trail.

## Compliance Route Before Selling
Because Spotit handles wound images and clinical assessment data, it must be treated as a clinical digital health product.

For the UK market, the main readiness areas are:
- MHRA medical device software assessment if the app is intended to influence diagnosis, monitoring, treatment, or clinical decision-making.
- NHS DTAC readiness if selling into NHS or adult social care settings.
- UK GDPR and Data Protection Act readiness because wound photos and health records are special category data.
- Clinical safety documentation including hazard log, clinical safety case, and nominated clinical safety officer.
- Cyber security review, penetration testing, backups, disaster recovery, and incident response.

## Suggested Product Build Phases

### Phase 1 - Sellable Pilot
- Hosted web app.
- Secure login.
- Patient/wound/assessment database.
- Wound photo upload/capture.
- Audit log.
- PDF report export.
- Admin dashboard.
- Pilot with sample or consented test data only.

### Phase 2 - Clinical Deployment
- Full clinical safety file.
- Data protection impact assessment.
- Role-based permissions.
- Organisation/team setup.
- Secure messaging/export.
- Backup and recovery.
- DTAC evidence pack.

### Phase 3 - Commercial Scale
- Multi-tenant organisations.
- Subscription billing.
- Customer onboarding.
- Support desk.
- Training materials.
- Usage analytics without exposing patient data.
- Contract templates, privacy policy, terms, and data processing agreement.

## Immediate Build Recommendation
The next practical step is to build Spotit as a secure hosted web app with:
- Frontend: responsive web app / PWA
- Backend: API server
- Database: PostgreSQL
- File storage: encrypted private object storage for wound images
- Authentication: secure email/password with MFA option
- Deployment: UK/EU hosted environment suitable for health data

The current HTML app should become the design reference, not the final production system.

