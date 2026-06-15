# Spotit API Contract Draft

## Authentication

### POST `/auth/login`
Purpose: sign in a clinician.

Request:
```json
{
  "email": "nurse@example.com",
  "password": "StrongPassword123!"
}
```

Response:
```json
{
  "token": "jwt-token",
  "clinician": {
    "id": "uuid",
    "fullName": "J. Patel",
    "email": "nurse@example.com",
    "role": "nurse"
  }
}
```

## Patients

### GET `/patients`
Purpose: fetch caseload with latest wounds.

### POST `/patients`
Purpose: register a fresh patient.

Request:
```json
{
  "fullName": "Margaret Ellis",
  "nhsNumber": "448 221 9077",
  "dateOfBirth": "1947-03-22",
  "allergyStatus": "No known allergies",
  "diabetesStatus": "Type 2 diabetes",
  "pastMedicalHistory": "Type 2 diabetes, peripheral vascular disease",
  "photoConsentStatus": "Consent recorded",
  "governanceChecks": ["Identity confirmed", "Allergy checked", "Photo consent recorded"]
}
```

### GET `/patients/:patientId`
Purpose: fetch a full patient timeline with wounds, photos, assessments, care plans, reports, and recent audit activity.

### PATCH `/patients/:patientId`
Purpose: edit patient registration details, including past medical history, allergy status, diabetes/medical notes, and consent.

## Wounds

### POST `/wounds`
Purpose: create a new wound for a patient.

Request:
```json
{
  "patientId": "uuid",
  "woundSite": "left heel",
  "woundType": "Pressure injury",
  "presentMedicalHistory": "Pressure damage noted after reduced mobility",
  "onsetDate": "2026-06-01",
  "careCommencedDate": "2026-06-06"
}
```

### GET `/wounds/:woundId`
Purpose: fetch one wound with patient details, wound photos, assessments, care plans, and reports.

### POST `/wounds/:woundId/photos`
Purpose: record a captured wound photo after consent and body-map site selection.

Request:
```json
{
  "storageKey": "private-photo-storage-key",
  "bodyMapView": "front",
  "bodyMapX": 0.42,
  "bodyMapY": 0.71,
  "consentStatus": "Consent recorded"
}
```

### POST `/wounds/:woundId/assessments`
Purpose: create a wound assessment.

Request:
```json
{
  "measurementMethod": "manual measurement for extensive wound",
  "lengthCm": 4.1,
  "widthCm": 2.9,
  "depthCm": 0.4,
  "tunnelling": false,
  "rolledEdge": true,
  "undermining": false,
  "granulationPercent": 55,
  "sloughPercent": 35,
  "necrosisPercent": 10,
  "epithelialisationPercent": 0,
  "exudateType": "Serous",
  "exudateAmount": "Moderate",
  "periwoundFindings": ["Macerated edge", "Erythema"],
  "painScore": 6,
  "pressureInjuryCategory": "Category 2 - partial thickness skin loss",
  "clinicalNote": "Wound reviewed and dressing plan updated."
}
```

Response includes whether escalation is required.

### POST `/wounds/:woundId/care-plans`
Purpose: create the dressing, care, mobility, continence, nutrition, hydration, and time-spent record after assessment.

Request:
```json
{
  "assessmentId": "uuid",
  "primaryDressing": "Hydrofiber",
  "secondaryDressing": "Foam dressing",
  "solutionUsed": "Normal saline",
  "actionsRequired": ["Treatment plan amended", "Notified duty clinician"],
  "dressingChangeFrequency": "Every 2 days",
  "timeSpent": "35 minutes",
  "pressureInjuryCategory": "Category 2",
  "mobilityAssessment": "Impaired mobility",
  "repositioningPrompt": "Every 2 hours",
  "assistiveAids": ["Wheelchair", "Hoist transfer"],
  "garments": ["Compression garments for lower limb"],
  "continenceAssessment": "Incontinent",
  "padChangeFrequency": "4 hourly",
  "lastBowelMovement": "2026-06-14",
  "stoolAssessment": "Constipation risk",
  "hygiene": "Assisted hygiene required",
  "nutrition": "Reduced appetite",
  "hydration": "Encourage fluids",
  "weight": "72kg",
  "height": "165cm",
  "bmi": "26.4"
}
```

## Reports

### POST `/reports`
Purpose: create or send a wound report.

Request:
```json
{
  "woundId": "uuid",
  "assessmentId": "uuid",
  "reportText": "Wound progress note...",
  "sentVia": "Secure NHS mail",
  "sentTo": "duty.clinician@example.nhs.uk"
}
```

### POST `/reports/draft-from-wound/:woundId`
Purpose: automatically create a report draft from the latest wound photo, assessment, care plan, and escalation status.

## Future Endpoints
- `GET /audit-logs`
- `POST /users`
- `PATCH /users/:userId/role`
