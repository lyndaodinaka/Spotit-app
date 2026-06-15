# Spotit Clinician Wound Care App MVP

## Product Goal
Help clinicians and nurses record consistent wound assessments, monitor healing over time, and identify wounds that need review or escalation.

## Primary Users
- Tissue viability nurses
- District nurses
- Ward nurses
- Care home nurses
- Wound care clinicians

## Core Workflow
1. Select a patient from the active caseload.
2. Add a new patient or open an existing patient record.
3. Capture past medical history, wound onset, care commenced/referral date, and current wound history.
4. Open an existing wound or create a new wound record.
5. Tap the affected body part on the diagram before photo capture.
6. Capture a wound image with flashlight support and either automatic point-based estimation or manual measurement for extensive wounds.
7. Complete a structured wound assessment.
8. Add measurements, tissue percentages, exudate, pain score, periwound condition, and infection signs.
9. Compare the latest assessment with previous assessments.
10. Update the dressing, cleansing, repositioning prompt, nutrition, hydration, care plan, actions required, frequency of dressing change, and time spent during care.
11. Flag deterioration, missed reviews, or escalation needs.
12. Generate a progress note or handover report.

The assessment should use a guided click-next format, showing one titled section at a time. Clicking Add patient should start at past medical history, current wound history, wound onset, and care commenced/referral date. The next step should capture the wound site/photo workflow. Wound assessment, including type of wound, should only commence after the wound site has been captured and automatic wound points are recorded, or manual measurement is selected for extensive wounds. For subsequent dressing changes, the workflow should start with wound capture and measurement for that dressing change, then require confirmation of the wound assessment before continuing. Other prompts should remain optional. Frequency of dressing change and time spent during care should appear after the clinical notes/recommendation step.

## MVP Screens

### 1. Patient Wound Dashboard
Shows caseload, risk flags, overdue reviews, active wounds, healing trend, and quick access to assessment.

### 2. Patient Profile
Includes demographics, allergies, mobility, diabetes status, vascular risk, nutrition risk, pressure injury risk, and current care setting.

New-patient prompts should include past medical history, onset of wound, care commenced/referral date, and current wound history options such as RTA, fall, pressure injury, trauma, moisture lesion, skin tear, burns, fracture, lesion, open wound, indeterminate, surgical wound, diabetic foot ulcer, venous leg ulcer, and arterial leg ulcer.

Type of wound options should include incised, contused, abraded, lacerated, and indeterminate.

### 3. Wound Profile
Includes wound type, anatomical location, onset date, cause, current dressing, review frequency, and named responsible clinician.

### 4. Structured Assessment
Captures:
- Length, width, depth
- Undermining and tunnelling
- Tissue type
- Tissue percentage estimates for granulation, slough, necrosis, and epithelialisation
- Exudate type: serous, hemoserous, purulent, or pseudomonas
- Exudate amount: minimal, low, moderate, or high
- Odor
- Pain score
- Periwound condition, allowing multiple selections such as macerated edge, intact, dry, erythema, edematous, and fragile
- Infection or inflammation signs
- Edge condition
- Dressing used
- Clinician notes
- Clinical judgement: improving, stable, static, deteriorating

The latest assessment should display the selected wound site and wound photo preview alongside the key metrics.

### 5. Photo Timeline
Shows dated wound photos, measurements, and progress markers. Photos should be consented, access-controlled, and audit logged.

Photo capture should allow the clinician to tap the affected body part on the diagram, focus the capture around that site, switch flashlight on or off, tap wound edge/depth points for automatic estimation, and choose manual measurement when the wound is extensive or irregular.

### 6. Care Plan
Tracks cleansing, primary dressing, secondary dressing, dressing frequency, repositioning prompt, garments/devices, mobility, continence, nutrition, hydration, compression or pressure relief, escalation instructions, and next review date.

Repositioning options should include frequently, every 2 hours, every 4 hours, every 6 hours, every 8 hours, as clinically indicated, and not applicable.

Garments and devices should include pressure boots, compression garments for lower limb, bandaging, cast, traction, and none.

Mobility assessment should include bedbound, chairbound, impaired mobility, fidgety, and fully mobile. Repositioning and transfer prompts should include can reposition independently, requires assistance to reposition, can be hoisted, can transfer, Zimmer frame, wheelchair, walking stick, and scooter.

Continence assessment should include continent with last bowel movement, and incontinent with frequency of pad change.

Nutrition and hydration assessment should include nutritional intake, weight, height, BMI, and hydration status. Nutritional intake options should include good oral intake, reduced oral intake, poor oral intake, nil by mouth, enteral feeding, parenteral nutrition, and dietitian referral required. Hydration options should include adequate, reduced fluid intake, dehydration risk, fluid restriction, and requires fluid balance monitoring.

Actions required should include current treatment plan continued, treatment plan amended, commenced antimicrobial dressing, wound swab taken, antibiotics to be commenced, topical steroid cream to be commenced, review compression levels, neuropathy assessment, review medication, review comorbidity, and notified duty clinician.

### 7. Reports
Generates a concise wound progress report for handover, referral, MDT review, or record upload.

## Clinical Support Rules For MVP
The MVP should use prompts and flags, not diagnosis.

Suggested flags:
- Wound area increased by more than 20% since last assessment
- New or worsening pain
- Increased exudate
- Foul odor
- Spreading redness or heat
- Slough or necrosis increase
- Missed planned review
- No improvement after expected review period
- Dressing plan expired or missing

## Safety And Compliance Notes
- The app should not diagnose or replace clinical judgement.
- Escalation prompts should be configurable to local policy.
- Wound images are sensitive clinical data and need secure storage, consent, role-based access, and audit trails.
- Reporting language should clearly separate observed findings from recommendations.
- Any future decision support should be validated with qualified clinical governance.

## Prototype Scope
The included prototype demonstrates the first dashboard and assessment workflow using sample data. It is intended for product discussion and usability testing, not clinical deployment.
