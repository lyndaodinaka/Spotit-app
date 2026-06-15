const $ = (id) => document.getElementById(id);
const API_BASE_URL = window.SPOTIT_API_BASE_URL || "";

const state = {
  token: "",
  user: null,
  demo: false,
  view: "dashboard",
  patients: [],
  selectedPatientId: "",
  selectedWoundId: "",
  step: "patient",
  capture: { siteMarked: false, edgeA: false, edgeB: false, depth: false, samplePhoto: false, x: 50, y: 68 },
  draft: {},
  reports: [],
  clinicians: [],
  auditLogs: []
};

const demoLogin = { email: "lyn@spotit.app", password: "1st,Daughter" };

const demoDb = {
  clinicians: [
    { id: "admin-1", fullName: "Spotit Owner", email: demoLogin.email, role: "admin", status: "active", createdAt: new Date().toISOString() },
    { id: "clinician-1", fullName: "Nurse Demo", email: "nurse@spotit.app", role: "clinician", status: "active", createdAt: new Date().toISOString() }
  ],
  patients: [
    {
      id: "patient-anne",
      title: "Mrs",
      fullName: "Anne Roberts",
      nhsNumber: "448 221 9077",
      dateOfBirth: "1948-02-12",
      age: "78",
      sex: "Female",
      gender: "Female",
      allergyStatus: "No known allergies",
      diabetesStatus: "Type 2 diabetes",
      pastMedicalHistory: "Type 2 diabetes, reduced mobility, fragile skin",
      currentWoundHistory: "Left lower leg skin tear after fall. Community nursing review ongoing.",
      mobilityStatus: "Impaired mobility",
      vascularRisk: "Peripheral vascular disease risk",
      nutritionRisk: "Reduced appetite",
      pressureInjuryRisk: "Moderate",
      careSetting: "Home care",
      photoConsentStatus: "Consent recorded",
      governanceChecks: ["Identity confirmed", "Allergy checked", "Consent recorded"],
      updatedAt: new Date().toISOString(),
      wounds: [
        {
          id: "wound-anne-leg",
          patientId: "patient-anne",
          woundSite: "Left lower leg",
          woundType: "Skin tear",
          cause: "Fall",
          currentDressing: "Foam dressing",
          reviewFrequency: "Every 2 days",
          responsibleClinician: "Nurse Demo",
          presentMedicalHistory: "Skin tear to left lower leg with moderate exudate.",
          onsetDate: "2026-06-05",
          careCommencedDate: "2026-06-06",
          nextReviewDate: "2026-06-18",
          status: "Improving",
          photos: [{ id: "photo-1", storageKey: "demo/anne-leg.jpg", bodyMapView: "front", bodyMapX: 0.46, bodyMapY: 0.73, consentStatus: "Consent recorded", capturedAt: new Date().toISOString() }],
          assessments: [
            {
              id: "assessment-1",
              assessedAt: new Date().toISOString(),
              measurementMethod: "Manual measurement",
              lengthCm: 4.2,
              widthCm: 2.1,
              depthCm: 0.2,
              areaCm2: 8.82,
              granulationPercent: 60,
              sloughPercent: 30,
              necrosisPercent: 0,
              epithelialisationPercent: 10,
              exudateType: "Serous",
              exudateAmount: "Low",
              odor: "None",
              periwoundFindings: ["Fragile", "Dry"],
              infectionSigns: [],
              edgeCondition: "Intact",
              painScore: 3,
              healingStatus: "Improving",
              escalationRequired: false,
              flags: [],
              clinicalNote: "Observed improving wound bed. Continue current plan."
            }
          ],
          carePlans: [
            {
              id: "care-1",
              primaryDressing: "Low-adherent dressing",
              secondaryDressing: "Foam dressing",
              solutionUsed: "Normal saline",
              dressingChangeFrequency: "Every 2 days",
              repositioningPrompt: "Every 4 hours",
              mobilityAssessment: "Impaired mobility",
              nutrition: "Reduced oral intake",
              hydration: "Adequate",
              actionsRequired: ["Current treatment plan continued"],
              timeSpent: "30 minutes",
              nextReviewDate: "2026-06-18",
              createdAt: new Date().toISOString()
            }
          ],
          reports: []
        }
      ],
      auditLogs: []
    },
    {
      id: "patient-george",
      title: "Mr",
      fullName: "George Williams",
      nhsNumber: "721 604 3391",
      dateOfBirth: "1939-09-18",
      age: "86",
      sex: "Male",
      gender: "Male",
      allergyStatus: "Dressing adhesive sensitivity",
      diabetesStatus: "No diabetes recorded",
      pastMedicalHistory: "Parkinson's disease, reduced mobility, recurrent falls",
      currentWoundHistory: "Sacral pressure injury identified during care home review. Repositioning support in place.",
      mobilityStatus: "Chairbound",
      vascularRisk: "Low vascular risk recorded",
      nutritionRisk: "Poor oral intake",
      pressureInjuryRisk: "High",
      careSetting: "Care home",
      photoConsentStatus: "Best interest decision recorded",
      governanceChecks: ["Identity confirmed", "Allergy checked", "Best interest decision recorded"],
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      wounds: [
        {
          id: "wound-george-sacrum",
          patientId: "patient-george",
          woundSite: "Sacrum",
          woundType: "Pressure injury",
          cause: "Pressure injury",
          currentDressing: "Silicone foam border",
          reviewFrequency: "Daily",
          responsibleClinician: "Nurse Demo",
          presentMedicalHistory: "Category 2 sacral pressure injury with fragile periwound and moderate exudate.",
          onsetDate: "2026-06-02",
          careCommencedDate: "2026-06-03",
          nextReviewDate: "2026-06-15",
          status: "Deteriorating",
          photos: [{ id: "photo-george-1", storageKey: "demo/george-sacrum.jpg", bodyMapView: "back", bodyMapX: 0.5, bodyMapY: 0.58, consentStatus: "Best interest decision recorded", capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() }],
          assessments: [
            {
              id: "assessment-george-1",
              assessedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
              measurementMethod: "Manual measurement",
              lengthCm: 5.4,
              widthCm: 4.3,
              depthCm: 0.4,
              areaCm2: 23.22,
              granulationPercent: 35,
              sloughPercent: 55,
              necrosisPercent: 0,
              epithelialisationPercent: 10,
              exudateType: "Haemoserous",
              exudateAmount: "Moderate",
              odor: "Mild",
              periwoundFindings: ["Erythema", "Fragile"],
              infectionSigns: ["Spreading redness or heat"],
              edgeCondition: "Macerated edge",
              painScore: 6,
              healingStatus: "Deteriorating",
              escalationRequired: true,
              flags: ["Infection or inflammation signs recorded", "Missed planned review"],
              clinicalNote: "Pressure area requires duty clinician review and repositioning plan check."
            }
          ],
          carePlans: [
            {
              id: "care-george-1",
              primaryDressing: "Non-adherent contact layer",
              secondaryDressing: "Silicone foam border",
              solutionUsed: "Normal saline",
              dressingChangeFrequency: "Daily",
              repositioningPrompt: "Every 2 hours",
              mobilityAssessment: "Chairbound",
              nutrition: "Dietitian referral required",
              hydration: "Requires fluid balance monitoring",
              actionsRequired: ["Notified duty clinician", "Treatment plan amended"],
              escalationInstructions: "Escalate to tissue viability nurse if heat or redness spreads.",
              timeSpent: "45 minutes",
              nextReviewDate: "2026-06-16",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
            }
          ],
          reports: [
            {
              id: "report-george-1",
              woundId: "wound-george-sacrum",
              reportText: "Spotit wound progress report\nPatient: George Williams (Mr, Male, 86yrs)\nWound site: Sacrum\nWound type: Pressure injury\nClinical judgement: Deteriorating\nReview prompts: Infection or inflammation signs recorded; Missed planned review\nActions: Notified duty clinician, Treatment plan amended",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
            }
          ]
        }
      ],
      auditLogs: []
    },
    {
      id: "patient-fatima",
      title: "Ms",
      fullName: "Fatima Khan",
      nhsNumber: "602 115 8842",
      dateOfBirth: "1964-03-24",
      age: "62",
      sex: "Female",
      gender: "Female",
      allergyStatus: "No known allergies",
      diabetesStatus: "Type 2 diabetes, neuropathy",
      pastMedicalHistory: "Type 2 diabetes, peripheral neuropathy, hypertension",
      currentWoundHistory: "Right plantar diabetic foot ulcer under podiatry and tissue viability review.",
      mobilityStatus: "Walking stick",
      vascularRisk: "Peripheral vascular disease risk",
      nutritionRisk: "Good oral intake",
      pressureInjuryRisk: "Moderate",
      careSetting: "Community clinic",
      photoConsentStatus: "Consent recorded",
      governanceChecks: ["Identity confirmed", "Allergy checked", "Consent recorded"],
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
      wounds: [
        {
          id: "wound-fatima-foot",
          patientId: "patient-fatima",
          woundSite: "Right plantar foot",
          woundType: "Diabetic foot ulcer",
          cause: "Neuropathy and pressure",
          currentDressing: "Hydrofiber with antimicrobial layer",
          reviewFrequency: "Every 3 days",
          responsibleClinician: "Tissue Viability Nurse",
          presentMedicalHistory: "Neuropathic ulcer to plantar surface with low exudate and callused edge.",
          onsetDate: "2026-05-21",
          careCommencedDate: "2026-05-23",
          nextReviewDate: "2026-06-17",
          status: "Needs review",
          photos: [{ id: "photo-fatima-1", storageKey: "demo/fatima-foot.jpg", bodyMapView: "front", bodyMapX: 0.54, bodyMapY: 0.93, consentStatus: "Consent recorded", capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() }],
          assessments: [
            {
              id: "assessment-fatima-1",
              assessedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
              measurementMethod: "Point estimate",
              lengthCm: 2.8,
              widthCm: 2.5,
              depthCm: 0.5,
              areaCm2: 7,
              granulationPercent: 45,
              sloughPercent: 45,
              necrosisPercent: 5,
              epithelialisationPercent: 5,
              exudateType: "Serous",
              exudateAmount: "Low",
              odor: "None",
              periwoundFindings: ["Dry", "Callus"],
              infectionSigns: [],
              edgeCondition: "Rolled edge",
              painScore: 1,
              healingStatus: "Static",
              escalationRequired: true,
              flags: ["No improvement after expected review period", "Review compression/offloading levels"],
              clinicalNote: "Static diabetic foot ulcer. Offloading and neuropathy assessment to be reviewed."
            }
          ],
          carePlans: [
            {
              id: "care-fatima-1",
              primaryDressing: "Hydrofiber",
              secondaryDressing: "Foam dressing",
              solutionUsed: "Prontosan",
              dressingChangeFrequency: "Every 3 days",
              repositioningPrompt: "As clinically indicated",
              mobilityAssessment: "Impaired mobility",
              nutrition: "Good oral intake",
              hydration: "Adequate",
              actionsRequired: ["Neuropathy assessment", "Review medication"],
              timeSpent: "30 minutes",
              nextReviewDate: "2026-06-17",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString()
            }
          ],
          reports: []
        }
      ],
      auditLogs: []
    },
    {
      id: "patient-michael",
      title: "Mr",
      fullName: "Michael O'Connor",
      nhsNumber: "913 442 7065",
      dateOfBirth: "1955-11-07",
      age: "70",
      sex: "Male",
      gender: "Male",
      allergyStatus: "Latex allergy",
      diabetesStatus: "No diabetes recorded",
      pastMedicalHistory: "Venous insufficiency, recurrent lower limb edema",
      currentWoundHistory: "Venous leg ulcer to left gaiter area with compression plan in progress.",
      mobilityStatus: "Zimmer frame",
      vascularRisk: "Venous disease",
      nutritionRisk: "Good oral intake",
      pressureInjuryRisk: "Low",
      careSetting: "Home care",
      photoConsentStatus: "Consent recorded",
      governanceChecks: ["Identity confirmed", "Allergy checked", "Consent recorded"],
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      wounds: [
        {
          id: "wound-michael-leg",
          patientId: "patient-michael",
          woundSite: "Left medial gaiter area",
          woundType: "Venous leg ulcer",
          cause: "Venous insufficiency",
          currentDressing: "UrgoStart with compression bandaging",
          reviewFrequency: "Weekly",
          responsibleClinician: "District Nurse",
          presentMedicalHistory: "Chronic venous ulcer with moderate exudate and edema.",
          onsetDate: "2026-04-12",
          careCommencedDate: "2026-04-14",
          nextReviewDate: "2026-06-20",
          status: "Improving",
          photos: [{ id: "photo-michael-1", storageKey: "demo/michael-leg.jpg", bodyMapView: "front", bodyMapX: 0.43, bodyMapY: 0.78, consentStatus: "Consent recorded", capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() }],
          assessments: [
            {
              id: "assessment-michael-1",
              assessedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
              measurementMethod: "Manual measurement",
              lengthCm: 6.1,
              widthCm: 3.2,
              depthCm: 0.3,
              areaCm2: 19.52,
              granulationPercent: 70,
              sloughPercent: 20,
              necrosisPercent: 0,
              epithelialisationPercent: 10,
              exudateType: "Serous",
              exudateAmount: "Moderate",
              odor: "None",
              periwoundFindings: ["Edematous", "Dry"],
              infectionSigns: [],
              edgeCondition: "Intact",
              painScore: 4,
              healingStatus: "Improving",
              escalationRequired: false,
              flags: [],
              clinicalNote: "Granulation improving. Continue compression and monitor edema."
            }
          ],
          carePlans: [
            {
              id: "care-michael-1",
              primaryDressing: "UrgoStart",
              secondaryDressing: "Zetuvit",
              compressionMeasurements: "Left pre calf: 39cm; Left pre ankle: 25cm",
              solutionUsed: "Normal saline",
              dressingChangeFrequency: "Weekly",
              repositioningPrompt: "Not applicable",
              mobilityAssessment: "Impaired mobility",
              nutrition: "Good oral intake",
              hydration: "Adequate",
              actionsRequired: ["Current treatment plan continued", "Review compression levels"],
              timeSpent: "60 minutes",
              nextReviewDate: "2026-06-20",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString()
            }
          ],
          reports: []
        }
      ],
      auditLogs: []
    },
    {
      id: "patient-lily",
      title: "Miss",
      fullName: "Lily Thompson",
      nhsNumber: "384 772 1096",
      dateOfBirth: "1996-07-30",
      age: "29",
      sex: "Female",
      gender: "Female",
      allergyStatus: "No known allergies",
      diabetesStatus: "No diabetes recorded",
      pastMedicalHistory: "Normally fit and well",
      currentWoundHistory: "Forearm laceration after cycling accident. Sutures removed, wound review requested.",
      mobilityStatus: "Fully mobile",
      vascularRisk: "Low",
      nutritionRisk: "Good oral intake",
      pressureInjuryRisk: "Low",
      careSetting: "Urgent care follow-up",
      photoConsentStatus: "Consent recorded",
      governanceChecks: ["Identity confirmed", "Allergy checked", "Consent recorded"],
      updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      wounds: [
        {
          id: "wound-lily-arm",
          patientId: "patient-lily",
          woundSite: "Right forearm",
          woundType: "Lacerated",
          cause: "Cycling accident",
          currentDressing: "Low-adherent dressing",
          reviewFrequency: "As clinically indicated",
          responsibleClinician: "Nurse Demo",
          presentMedicalHistory: "Linear laceration, edges approximated, low exudate.",
          onsetDate: "2026-06-09",
          careCommencedDate: "2026-06-09",
          nextReviewDate: "2026-06-22",
          status: "Progressively healing",
          photos: [{ id: "photo-lily-1", storageKey: "demo/lily-arm.jpg", bodyMapView: "front", bodyMapX: 0.28, bodyMapY: 0.42, consentStatus: "Consent recorded", capturedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString() }],
          assessments: [
            {
              id: "assessment-lily-1",
              assessedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
              measurementMethod: "Manual measurement",
              lengthCm: 3.6,
              widthCm: 0.8,
              depthCm: 0.1,
              areaCm2: 2.88,
              granulationPercent: 65,
              sloughPercent: 0,
              necrosisPercent: 0,
              epithelialisationPercent: 35,
              exudateType: "Nil",
              exudateAmount: "Minimal",
              odor: "None",
              periwoundFindings: ["Intact"],
              infectionSigns: [],
              edgeCondition: "Intact",
              painScore: 2,
              healingStatus: "Improving",
              escalationRequired: false,
              flags: [],
              clinicalNote: "Good epithelialisation. Provide dressing advice and safety netting."
            }
          ],
          carePlans: [
            {
              id: "care-lily-1",
              primaryDressing: "Low-adherent dressing",
              secondaryDressing: "Film dressing",
              solutionUsed: "Sterile water",
              dressingChangeFrequency: "As clinically indicated",
              repositioningPrompt: "Not applicable",
              mobilityAssessment: "Fully mobile",
              nutrition: "Good oral intake",
              hydration: "Adequate",
              actionsRequired: ["Current treatment plan continued"],
              timeSpent: "15 minutes",
              nextReviewDate: "2026-06-22",
              createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
            }
          ],
          reports: []
        }
      ],
      auditLogs: []
    },
    {
      id: "patient-patricia",
      title: "Mrs",
      fullName: "Patricia Green",
      nhsNumber: "155 903 6208",
      dateOfBirth: "1942-01-16",
      age: "84",
      sex: "Female",
      gender: "Female",
      allergyStatus: "Requires confirmation",
      diabetesStatus: "Immunosuppressed",
      pastMedicalHistory: "Rheumatoid arthritis, long-term steroid therapy, fragile skin",
      currentWoundHistory: "Moisture associated skin damage and skin tear to buttock area.",
      mobilityStatus: "Requires hoist",
      vascularRisk: "Low",
      nutritionRisk: "Reduced oral intake",
      pressureInjuryRisk: "High",
      careSetting: "Ward",
      photoConsentStatus: "Consent to be confirmed",
      governanceChecks: ["Identity confirmed", "Allergy requires confirmation"],
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      wounds: [
        {
          id: "wound-patricia-buttock",
          patientId: "patient-patricia",
          woundSite: "Right buttock",
          woundType: "Moisture associated damage",
          cause: "Moisture lesion",
          currentDressing: "Barrier cream and absorbent pad",
          reviewFrequency: "Daily",
          responsibleClinician: "Ward Nurse",
          presentMedicalHistory: "Excoriated periwound and moisture damage. Continence plan under review.",
          onsetDate: "2026-06-11",
          careCommencedDate: "2026-06-11",
          nextReviewDate: "2026-06-16",
          status: "Pending assessment",
          photos: [],
          assessments: [],
          carePlans: [
            {
              id: "care-patricia-1",
              primaryDressing: "Barrier cream",
              secondaryDressing: "Absorbent pad",
              solutionUsed: "Wound cleanser",
              dressingChangeFrequency: "Daily",
              repositioningPrompt: "Every 2 hours",
              mobilityAssessment: "Bedbound",
              continenceAssessment: "Incontinent",
              padChangeFrequency: "Every 4 hours",
              nutrition: "Reduced oral intake",
              hydration: "Dehydration risk",
              actionsRequired: ["Treatment plan amended", "Review comorbidity"],
              escalationInstructions: "Confirm allergies and photo consent before capture.",
              timeSpent: "45 minutes",
              nextReviewDate: "2026-06-16",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            }
          ],
          reports: []
        }
      ],
      auditLogs: []
    },
    {
      id: "patient-david",
      title: "Dr",
      fullName: "David Chen",
      nhsNumber: "509 271 8844",
      dateOfBirth: "1971-12-05",
      age: "54",
      sex: "Male",
      gender: "Male",
      allergyStatus: "No known allergies",
      diabetesStatus: "No diabetes recorded",
      pastMedicalHistory: "Post-operative wound following abdominal surgery",
      currentWoundHistory: "Abdominal surgical wound with small dehisced area requiring community review.",
      mobilityStatus: "Fully mobile",
      vascularRisk: "Low",
      nutritionRisk: "Good oral intake",
      pressureInjuryRisk: "Low",
      careSetting: "Post-op community follow-up",
      photoConsentStatus: "Consent recorded",
      governanceChecks: ["Identity confirmed", "Allergy checked", "Consent recorded"],
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      wounds: [
        {
          id: "wound-david-abdomen",
          patientId: "patient-david",
          woundSite: "Lower abdomen",
          woundType: "Dehisced wound",
          cause: "Surgical wound",
          currentDressing: "Non-adherent contact layer",
          reviewFrequency: "Every 2 days",
          responsibleClinician: "District Nurse",
          presentMedicalHistory: "Small dehisced area to surgical incision, low exudate.",
          onsetDate: "2026-06-04",
          careCommencedDate: "2026-06-05",
          nextReviewDate: "2026-06-19",
          status: "Static",
          photos: [{ id: "photo-david-1", storageKey: "demo/david-abdomen.jpg", bodyMapView: "front", bodyMapX: 0.5, bodyMapY: 0.49, consentStatus: "Consent recorded", capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString() }],
          assessments: [
            {
              id: "assessment-david-1",
              assessedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
              measurementMethod: "Manual measurement",
              lengthCm: 1.9,
              widthCm: 0.9,
              depthCm: 0.3,
              areaCm2: 1.71,
              granulationPercent: 50,
              sloughPercent: 20,
              necrosisPercent: 0,
              epithelialisationPercent: 30,
              exudateType: "Serous",
              exudateAmount: "Low",
              odor: "None",
              periwoundFindings: ["Intact"],
              infectionSigns: [],
              edgeCondition: "Intact",
              painScore: 3,
              healingStatus: "Static",
              escalationRequired: false,
              flags: [],
              clinicalNote: "No infection signs. Continue plan and monitor approximation."
            }
          ],
          carePlans: [
            {
              id: "care-david-1",
              primaryDressing: "Non-adherent contact layer",
              secondaryDressing: "Foam dressing",
              solutionUsed: "Normal saline",
              dressingChangeFrequency: "Every 2 days",
              repositioningPrompt: "Not applicable",
              mobilityAssessment: "Fully mobile",
              nutrition: "Good oral intake",
              hydration: "Adequate",
              actionsRequired: ["Current treatment plan continued"],
              timeSpent: "20 minutes",
              nextReviewDate: "2026-06-19",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString()
            }
          ],
          reports: []
        }
      ],
      auditLogs: []
    }
  ],
  auditLogs: [
    { id: "audit-demo-1", action: "patient.created", details: "Anne Roberts added to demo caseload", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), clinician: { fullName: "Nurse Demo" } },
    { id: "audit-demo-2", action: "wound.assessment.created", details: "George Williams flagged for review", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), clinician: { fullName: "Nurse Demo" } },
    { id: "audit-demo-3", action: "report.drafted", details: "Sacral pressure injury handover generated", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 17).toISOString(), clinician: { fullName: "Spotit Owner" } }
  ]
};

const steps = [
  { id: "patient", label: "Patient profile" },
  { id: "wound", label: "Wound site" },
  { id: "photo", label: "Photo and points" },
  { id: "assessment", label: "Assessment" },
  { id: "care", label: "Care plan" },
  { id: "report", label: "Report" }
];

function selectedPatient() {
  return state.patients.find((patient) => patient.id === state.selectedPatientId);
}

function selectedWound() {
  return selectedPatient()?.wounds?.find((wound) => wound.id === state.selectedWoundId);
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function formValues(form) {
  const values = {};
  new FormData(form).forEach((value, key) => {
    if (values[key]) values[key] = asArray(values[key]).concat(value);
    else values[key] = value;
  });
  return values;
}

function showLogin(show) {
  $("loginView").classList.toggle("hidden", !show);
  $("appView").classList.toggle("hidden", show);
  document.querySelector(".sidebar").classList.toggle("hidden", show);
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll("[id$='View']").forEach((section) => section.classList.add("hidden"));
  $(`${view}View`)?.classList.remove("hidden");
  const titles = {
    dashboard: ["Dashboard", "Caseload, risk, overdue reviews, and escalation prompts."],
    patients: ["Patients", "Open patient profiles, wounds, photo timeline, and care plans."],
    workflow: ["Guided assessment", "Click-next wound capture, measurement, assessment, care plan, and report."],
    reports: ["Reports", "Handover and progress notes generated from structured assessments."],
    admin: ["Admin dashboard", "Clinician logins, service metrics, and audit activity."]
  };
  $("viewTitle").textContent = titles[view][0];
  $("viewSubtitle").textContent = titles[view][1];
  render();
}

async function api(path, options = {}) {
  if (state.demo) return demoApi(path, options);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function demoApi(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === "/auth/login" && method === "POST") {
    const clinician = demoDb.clinicians.find((item) => item.email === body.email);
    if (!clinician || body.password !== demoLogin.password) throw new Error("Invalid login");
    return { token: "demo-token", clinician };
  }
  if (path === "/dashboard") return dashboardPayload();
  if (path === "/patients" && method === "GET") return { patients: demoDb.patients };
  if (path === "/patients" && method === "POST") {
    const patient = { id: uid("patient"), ...body, wounds: [], auditLogs: [], updatedAt: new Date().toISOString() };
    demoDb.patients.unshift(patient);
    logDemo("patient.created", patient.fullName);
    return { patient };
  }
  const patientMatch = path.match(/^\/patients\/(.+)$/);
  if (patientMatch && method === "GET") return { patient: demoDb.patients.find((patient) => patient.id === patientMatch[1]) };
  if (patientMatch && method === "PATCH") {
    const patient = demoDb.patients.find((item) => item.id === patientMatch[1]);
    Object.assign(patient, body, { updatedAt: new Date().toISOString() });
    logDemo("patient.updated", patient.fullName);
    return { patient };
  }
  if (path === "/wounds" && method === "POST") {
    const patient = demoDb.patients.find((item) => item.id === body.patientId);
    const wound = { id: uid("wound"), ...body, status: "Pending assessment", photos: [], assessments: [], carePlans: [], reports: [], updatedAt: new Date().toISOString() };
    patient.wounds.unshift(wound);
    logDemo("wound.created", wound.woundSite);
    return { wound };
  }
  const woundMatch = path.match(/^\/wounds\/([^/]+)$/);
  if (woundMatch && method === "GET") return { wound: findWound(woundMatch[1]) };
  const photoMatch = path.match(/^\/wounds\/([^/]+)\/photos$/);
  if (photoMatch && method === "POST") {
    const wound = findWound(photoMatch[1]);
    const photo = { id: uid("photo"), ...body, capturedAt: new Date().toISOString() };
    wound.photos.unshift(photo);
    logDemo("wound.photo.captured", wound.woundSite);
    return { photo };
  }
  const assessmentMatch = path.match(/^\/wounds\/([^/]+)\/assessments$/);
  if (assessmentMatch && method === "POST") {
    const wound = findWound(assessmentMatch[1]);
    const previous = wound.assessments[0];
    const area = Number(body.areaCm2 || (Number(body.lengthCm || 0) * Number(body.widthCm || 0)) || 0);
    const flags = demoFlags(previous, { ...body, areaCm2: area });
    const assessment = { id: uid("assessment"), ...body, areaCm2: area, assessedAt: new Date().toISOString(), escalationRequired: flags.length > 0, flags };
    wound.assessments.unshift(assessment);
    wound.status = assessment.escalationRequired ? "Deteriorating" : body.healingStatus || "Review";
    logDemo("wound.assessment.created", flags.join("; ") || "No escalation");
    return { assessment };
  }
  const careMatch = path.match(/^\/wounds\/([^/]+)\/care-plans$/);
  if (careMatch && method === "POST") {
    const wound = findWound(careMatch[1]);
    const carePlan = { id: uid("care"), ...body, createdAt: new Date().toISOString() };
    wound.carePlans.unshift(carePlan);
    wound.nextReviewDate = body.nextReviewDate || wound.nextReviewDate;
    logDemo("wound.care_plan.created", wound.woundSite);
    return { carePlan };
  }
  const reportMatch = path.match(/^\/reports\/draft-from-wound\/(.+)$/);
  if (reportMatch && method === "POST") {
    const wound = findWound(reportMatch[1]);
    const patient = demoDb.patients.find((item) => item.wounds.some((w) => w.id === wound.id));
    const report = { id: uid("report"), woundId: wound.id, reportText: reportText(patient, wound), createdAt: new Date().toISOString() };
    wound.reports.unshift(report);
    state.reports.unshift(report);
    logDemo("report.drafted", patient.fullName);
    return { report };
  }
  if (path === "/admin/overview") return adminOverview();
  if (path === "/admin/clinicians" && method === "GET") return { clinicians: demoDb.clinicians };
  if (path === "/admin/clinicians" && method === "POST") {
    const clinician = { id: uid("clinician"), ...body, status: "active", createdAt: new Date().toISOString() };
    delete clinician.password;
    demoDb.clinicians.unshift(clinician);
    logDemo("admin.clinician.created", clinician.email);
    return { clinician };
  }
  throw new Error("Demo action unavailable");
}

function findWound(id) {
  return demoDb.patients.flatMap((patient) => patient.wounds).find((wound) => wound.id === id);
}

function logDemo(action, details) {
  demoDb.auditLogs.unshift({ id: uid("audit"), action, details, createdAt: new Date().toISOString(), clinician: state.user });
}

function demoFlags(previous, current) {
  const flags = [];
  if (previous?.areaCm2 && current.areaCm2 > previous.areaCm2 * 1.2) flags.push("Wound area increased by more than 20%");
  if (previous?.painScore && Number(current.painScore || 0) - Number(previous.painScore) >= 2) flags.push("New or worsening pain");
  if (current.exudateAmount === "High") flags.push("Increased exudate");
  if (["Purulent", "Pseudomonas"].includes(current.exudateType)) flags.push("Concerning exudate type");
  if (asArray(current.infectionSigns).length) flags.push("Infection or inflammation signs recorded");
  return flags;
}

function dashboardPayload() {
  const wounds = demoDb.patients.flatMap((patient) => patient.wounds);
  const reports = wounds.flatMap((wound) => wound.reports);
  return {
    metrics: {
      patients: demoDb.patients.length,
      wounds: wounds.length,
      reviewWounds: wounds.filter((wound) => wound.status.includes("Deteriorating")).length,
      pendingWounds: wounds.filter((wound) => wound.status.includes("Pending")).length,
      reports: reports.length
    },
    latestPatients: demoDb.patients
  };
}

function adminOverview() {
  const wounds = demoDb.patients.flatMap((patient) => patient.wounds);
  return {
    metrics: {
      clinicians: demoDb.clinicians.length,
      activePatients: demoDb.patients.length,
      wounds: wounds.length,
      escalations: wounds.flatMap((wound) => wound.assessments).filter((assessment) => assessment.escalationRequired).length
    },
    auditLogs: demoDb.auditLogs
  };
}

async function login(email, password) {
  const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  state.token = data.token;
  state.user = data.clinician;
  $("sessionName").textContent = `${data.clinician.fullName} - ${data.clinician.role}`;
  showLogin(false);
  await loadData();
}

async function loadData() {
  const data = await api("/patients");
  state.patients = data.patients;
  if (!state.selectedPatientId && state.patients[0]) state.selectedPatientId = state.patients[0].id;
  const patient = selectedPatient();
  if (!state.selectedWoundId && patient?.wounds?.[0]) state.selectedWoundId = patient.wounds[0].id;
  render();
}

function render() {
  if (state.view === "dashboard") renderDashboard();
  if (state.view === "patients") renderPatients();
  if (state.view === "workflow") renderWorkflow();
  if (state.view === "reports") renderReports();
  if (state.view === "admin") renderAdmin();
}

function renderDashboard() {
  api("/dashboard").then((data) => {
    $("dashboardView").innerHTML = metricsHtml(data.metrics) + `
      <section class="panel wide">
        <h2>Priority overview</h2>
        <div class="priority-grid">
          <article class="priority-card"><strong>Review first</strong><p>Deteriorating wounds, missed reviews, and high-risk pressure injury cases appear clearly in the caseload.</p></article>
          <article class="priority-card"><strong>Continue planned care</strong><p>Improving and progressively healing wounds remain visible with dressing frequency and next review context.</p></article>
          <article class="priority-card"><strong>Document once</strong><p>Structured assessment data feeds the care plan, clinical prompts, and handover report.</p></article>
        </div>
      </section>
      <section class="panel wide">
        <h2>Active caseload</h2>
        <div class="list">${data.latestPatients.map(patientCard).join("")}</div>
      </section>`;
    bindPatientCards($("dashboardView"));
  });
}

function metricsHtml(metrics) {
  return Object.entries(metrics).map(([key, value]) => `
    <article class="metric"><strong>${value}</strong><span>${label(key)}</span></article>
  `).join("");
}

function renderPatients() {
  const query = $("patientSearch").value.toLowerCase();
  $("patientList").innerHTML = state.patients.filter((patient) => patient.fullName.toLowerCase().includes(query)).map(patientCard).join("");
  bindPatientCards($("patientList"));
  renderPatientDetail();
}

function patientCard(patient) {
  const wound = patient.wounds?.[0];
  const selected = patient.id === state.selectedPatientId ? " selected" : "";
  return `
    <article class="card${selected}" data-patient="${patient.id}" tabindex="0">
      <div class="card-head"><strong>${patient.title || ""} ${patient.fullName}</strong><span class="tag ${statusClass(wound?.status)}">${wound?.status || "No wound"}</span></div>
      <div class="muted">${patient.sex || "Sex not recorded"} | ${patient.age ? `${patient.age}yrs` : "Age not recorded"} | NHS ${patient.nhsNumber || "Not recorded"}</div>
      <div>${wound ? `${wound.woundSite} - ${wound.woundType || "Type not recorded"}` : "No active wound"}</div>
    </article>`;
}

function bindPatientCards(root) {
  root.querySelectorAll("[data-patient]").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedPatientId = card.dataset.patient;
      state.selectedWoundId = selectedPatient()?.wounds?.[0]?.id || "";
      setView("patients");
    });
  });
}

function renderPatientDetail() {
  const patient = selectedPatient();
  if (!patient) {
    $("patientDetail").innerHTML = "<h2>No patient selected</h2>";
    return;
  }
  const wounds = patient.wounds || [];
  $("patientDetail").innerHTML = `
    <h2>${patient.title || ""} ${patient.fullName}</h2>
    <p class="muted"><strong>Clinical context:</strong> ${patientContext(patient)}</p>
    <p>${patient.currentWoundHistory || "Current wound history not recorded."}</p>
    <div class="detail-actions">
      <button data-action="startAssessment">Start assessment</button>
      <button class="secondary" data-action="editPatient">Edit profile</button>
    </div>
    <div>
      ${["Allergy: " + (patient.allergyStatus || "Not recorded"), "Diabetes: " + (patient.diabetesStatus || "Not recorded"), "Mobility: " + (patient.mobilityStatus || "Not recorded"), "Care setting: " + (patient.careSetting || "Not recorded")].map((item) => `<span class="tag">${item}</span>`).join("")}
    </div>
    <h3>Wounds</h3>
    <div class="timeline">${wounds.map(woundSummary).join("") || "<p>No wounds recorded.</p>"}</div>
    ${selectedWound() ? woundTimeline(selectedWound()) : ""}
  `;
  $("patientDetail").querySelector("[data-action='startAssessment']").addEventListener("click", () => {
    state.step = "photo";
    state.draft = {};
    setView("workflow");
  });
  $("patientDetail").querySelector("[data-action='editPatient']").addEventListener("click", () => {
    state.step = "patient";
    setView("workflow");
  });
  $("patientDetail").querySelectorAll("[data-wound]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedWoundId = button.dataset.wound;
      renderPatientDetail();
    });
  });
}

function woundTimeline(wound) {
  const latest = wound.assessments?.[0];
  const care = wound.carePlans?.[0];
  return `
    <h3>Wound timeline</h3>
    <div class="mini-timeline">
      <article class="mini-event">
        <span class="mini-photo"></span>
        <div><strong>Photo capture</strong><p class="muted">${wound.photos?.[0] ? new Date(wound.photos[0].capturedAt).toLocaleString() : "No photo captured yet"} - ${wound.woundSite}</p></div>
      </article>
      <article class="mini-event">
        <span class="mini-photo"></span>
        <div><strong>Assessment</strong><p class="muted">${latest ? `${latest.lengthCm || "-"} x ${latest.widthCm || "-"} x ${latest.depthCm || "-"} cm, pain ${latest.painScore ?? "-"}/10, ${latest.healingStatus || wound.status}` : "Assessment pending"}</p></div>
      </article>
      <article class="mini-event">
        <span class="mini-photo"></span>
        <div><strong>Care plan</strong><p class="muted">${care ? `${care.primaryDressing || "Dressing not recorded"}; ${care.dressingChangeFrequency || "frequency not set"}` : "Care plan pending"}</p></div>
      </article>
    </div>
  `;
}

function patientContext(patient) {
  const contexts = {
    "patient-george": "Care home pressure injury with escalation and repositioning needs.",
    "patient-fatima": "Diabetic foot ulcer requiring offloading and neuropathy review.",
    "patient-michael": "Venous leg ulcer with compression therapy and edema monitoring.",
    "patient-lily": "Urgent-care laceration follow-up, progressively healing.",
    "patient-patricia": "Ward-based moisture damage case with consent and continence considerations.",
    "patient-david": "Post-operative abdominal wound requiring dehiscence monitoring."
  };
  return contexts[patient.id] || "Structured wound-care record with assessment and care-plan history.";
}

function woundSummary(wound) {
  const latest = wound.assessments?.[0];
  const selected = wound.id === state.selectedWoundId ? " selected" : "";
  return `
    <article class="card${selected}">
      <div class="card-head"><strong>${wound.woundSite}</strong><button class="secondary" data-wound="${wound.id}" type="button">Open</button></div>
      <p>${wound.woundType || "Type not recorded"} | ${wound.reviewFrequency || "Frequency not set"}</p>
      <span class="tag ${statusClass(wound.status)}">${wound.status}</span>
      <span class="tag">Pain ${latest?.painScore ?? "-"}</span>
      <span class="tag">Area ${latest?.areaCm2 ?? "-"} cm2</span>
      ${latest?.flags?.map((flag) => `<span class="tag review">${flag}</span>`).join("") || ""}
    </article>`;
}

function renderWorkflow() {
  $("stepper").innerHTML = steps.map((step) => `<button type="button" class="${state.step === step.id ? "active" : ""}" data-step="${step.id}">${step.label}</button>`).join("");
  $("stepper").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    state.step = button.dataset.step;
    renderWorkflow();
  }));
  const renderers = { patient: patientStep, wound: woundStep, photo: photoStep, assessment: assessmentStep, care: careStep, report: reportStep };
  $("workflowForm").innerHTML = workflowContext() + renderers[state.step]();
  bindWorkflowInteractions();
}

function workflowContext() {
  const patient = selectedPatient();
  const wound = selectedWound();
  return `
    <section class="workflow-context">
      <div>
        <h2>${patient ? `${patient.title || ""} ${patient.fullName}` : "New patient"}</h2>
        <p class="muted">${patient?.currentWoundHistory || "Start by capturing patient context, history, and consent."}</p>
        <div class="context-row">
          <span class="tag">${patient?.careSetting || "Care setting pending"}</span>
          <span class="tag">${patient?.mobilityStatus || "Mobility pending"}</span>
          <span class="tag">${patient?.photoConsentStatus || "Consent pending"}</span>
        </div>
      </div>
      <div>
        <strong>${wound?.woundSite || "No wound selected"}</strong>
        <p class="muted">${wound ? `${wound.woundType || "Type pending"} - ${wound.status || "Status pending"}` : "Create or select a wound before capture."}</p>
        <div class="context-row">
          <span class="tag ${statusClass(wound?.status)}">${wound?.status || "Pending"}</span>
          <span class="tag">Next review: ${wound?.nextReviewDate ? wound.nextReviewDate.slice(0, 10) : "Not set"}</span>
        </div>
      </div>
    </section>
  `;
}

function bindWorkflowInteractions() {
  if (state.step !== "photo") return;
  const board = document.querySelector("[data-capture-board]");
  const marker = document.querySelector("[data-capture-marker]");
  const updateMarker = () => {
    if (!marker) return;
    marker.style.left = `${state.capture.x}%`;
    marker.style.top = `${state.capture.y}%`;
  };
  updateMarker();
  board?.addEventListener("click", (event) => {
    const rect = board.getBoundingClientRect();
    state.capture.x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    state.capture.y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    state.capture.siteMarked = true;
    updateCaptureField();
    renderWorkflow();
  });
  document.querySelectorAll("[data-capture-action]").forEach((button) => {
    button.addEventListener("click", () => {
      state.capture[button.dataset.captureAction] = true;
      updateCaptureField();
      renderWorkflow();
    });
  });
}

function captureComplete() {
  return state.capture.siteMarked && state.capture.edgeA && state.capture.edgeB && state.capture.depth;
}

function updateCaptureField() {
  const field = document.querySelector("[name='woundPointData']");
  if (!field) return;
  const completed = [
    state.capture.siteMarked ? `site ${state.capture.x}%, ${state.capture.y}%` : "",
    state.capture.edgeA ? "edge point A" : "",
    state.capture.edgeB ? "edge point B" : "",
    state.capture.depth ? "deepest point" : "",
    state.capture.samplePhoto ? "sample photo selected" : ""
  ].filter(Boolean).join("; ");
  field.value = completed || field.value;
}

function patientStep() {
  const patient = selectedPatient() || {};
  return `
    <h2>Patient profile</h2>
    <div class="form-grid">
      ${input("title", "Title", patient.title || "Mrs")}
      ${input("fullName", "Full name", patient.fullName || "")}
      ${input("nhsNumber", "NHS number", patient.nhsNumber || "")}
      ${input("age", "Age", patient.age || "")}
      ${select("sex", "Sex", ["Female", "Male", "Intersex", "Prefer not to say"], patient.sex || "Female")}
      ${input("careSetting", "Care setting", patient.careSetting || "")}
      ${textarea("pastMedicalHistory", "Past medical history", patient.pastMedicalHistory || "")}
      ${textarea("currentWoundHistory", "Current wound history", patient.currentWoundHistory || "")}
      ${input("allergyStatus", "Allergy status", patient.allergyStatus || "")}
      ${input("diabetesStatus", "Diabetes / comorbidity", patient.diabetesStatus || "")}
      ${input("mobilityStatus", "Mobility", patient.mobilityStatus || "")}
      ${input("nutritionRisk", "Nutrition risk", patient.nutritionRisk || "")}
      ${input("pressureInjuryRisk", "Pressure injury risk", patient.pressureInjuryRisk || "")}
      ${input("photoConsentStatus", "Photo consent", patient.photoConsentStatus || "Consent recorded")}
    </div>
    <button type="submit">Save and continue</button>`;
}

function woundStep() {
  const wound = selectedWound() || {};
  return `
    <h2>Wound site and profile</h2>
    <div class="form-grid">
      ${input("woundSite", "Wound site", wound.woundSite || "")}
      ${select("woundType", "Wound type", ["Skin tear", "Pressure injury", "Open wound", "Moisture lesion", "Surgical wound", "Diabetic foot ulcer", "Venous leg ulcer", "Arterial leg ulcer", "Incised", "Contused", "Abraded", "Lacerated", "Indeterminate"], wound.woundType || "")}
      ${input("cause", "Cause", wound.cause || "")}
      ${input("currentDressing", "Current dressing", wound.currentDressing || "")}
      ${input("reviewFrequency", "Review frequency", wound.reviewFrequency || "")}
      ${input("responsibleClinician", "Responsible clinician", wound.responsibleClinician || state.user?.fullName || "")}
      ${input("onsetDate", "Onset date", wound.onsetDate?.slice?.(0, 10) || "", "date")}
      ${input("careCommencedDate", "Care commenced / referral date", wound.careCommencedDate?.slice?.(0, 10) || "", "date")}
      ${input("nextReviewDate", "Next review date", wound.nextReviewDate?.slice?.(0, 10) || "", "date")}
      ${textarea("presentMedicalHistory", "Present wound history", wound.presentMedicalHistory || "")}
    </div>
    <button type="submit">Save and continue</button>`;
}

function photoStep() {
  const wound = selectedWound();
  const complete = captureComplete();
  return `
    <h2>Photo, consent, body map, and wound points</h2>
    <p class="muted">Confirm consent, wound location, and photo reference before progressing to assessment.</p>
    <div class="capture-layout">
      <section class="section-card">
        <h3>Locate and capture</h3>
        <div class="capture-board" data-capture-board>
          <img src="./assets/clinical-body-map.png" alt="Clinical body map">
          <span class="capture-marker" data-capture-marker aria-hidden="true"></span>
        </div>
        <p class="muted">Click the body map to move the wound marker. This simulates choosing the anatomical site before taking a wound photo.</p>
      </section>
      <section class="section-card">
        <h3>Capture checklist</h3>
        <div class="capture-status ${complete ? "complete" : ""}">
          <strong>${complete ? "Measurement ready" : "Measurement required"}</strong>
          <p>${complete ? "Wound assessment can now commence with the captured site and point data." : "Mark the site and record wound edge/depth points before continuing."}</p>
        </div>
        <div class="capture-actions">
          <button type="button" class="${state.capture.siteMarked ? "done" : ""}" data-capture-action="siteMarked">Mark site</button>
          <button type="button" class="${state.capture.samplePhoto ? "done" : ""}" data-capture-action="samplePhoto">Use sample photo</button>
          <button type="button" class="${state.capture.edgeA ? "done" : ""}" data-capture-action="edgeA">Edge point A</button>
          <button type="button" class="${state.capture.edgeB ? "done" : ""}" data-capture-action="edgeB">Edge point B</button>
          <button type="button" class="${state.capture.depth ? "done" : ""}" data-capture-action="depth">Deepest point</button>
          <button type="button" class="secondary" data-capture-action="samplePhoto">Manual measurement</button>
        </div>
        <div class="mini-timeline">
          <article class="mini-event">
            <span class="mini-photo"></span>
            <div><strong>Previous capture</strong><p class="muted">${wound?.woundSite || "Wound site"} reviewed at last visit.</p></div>
          </article>
          <article class="mini-event">
            <span class="mini-photo"></span>
            <div><strong>Current capture</strong><p class="muted">${complete ? "Site and wound points recorded." : "Awaiting site and point completion."}</p></div>
          </article>
        </div>
      </section>
    </div>
    <div class="form-grid">
      ${input("storageKey", "Photo reference", state.draft.storageKey || `local-demo/${Date.now()}.jpg`)}
      ${select("consentStatus", "Photo consent", ["Consent recorded", "Consent declined", "Best interest decision recorded", "Consent to be confirmed"], state.draft.consentStatus || selectedPatient()?.photoConsentStatus || "Consent recorded")}
      ${select("bodyMapView", "Body map view", ["front", "back"], "front")}
      ${select("flashlightUsed", "Flashlight", ["false", "true"], state.capture.samplePhoto ? "true" : "false")}
      ${textarea("woundPointData", "Point-based estimate notes", wound?.woundSite ? `Marked ${wound.woundSite}; edge points recorded for comparison at next visit.` : "Tap wound edge/depth points or choose manual measurement for extensive wounds.")}
      </div>
    <button type="submit">Save and continue</button>`;
}

function assessmentStep() {
  const wound = selectedWound();
  const latest = wound?.assessments?.[0] || {};
  return `
    <h2>Structured wound assessment</h2>
    <p class="muted">Record objective wound findings and clinical judgement. Review prompts are supportive and do not replace clinical decision-making.</p>
    <section class="section-card">
      <h3>Measurement and wound bed</h3>
    <div class="form-grid">
      ${select("measurementMethod", "Measurement method", ["Manual measurement", "Point estimate", "Unable to measure"], "Manual measurement")}
      ${input("lengthCm", "Length cm", latest.lengthCm || "", "number")}
      ${input("widthCm", "Width cm", latest.widthCm || "", "number")}
      ${input("depthCm", "Depth cm", latest.depthCm || "", "number")}
      ${input("granulationPercent", "Granulation %", latest.granulationPercent || "", "number")}
      ${input("sloughPercent", "Slough %", latest.sloughPercent || "", "number")}
      ${input("necrosisPercent", "Necrosis %", latest.necrosisPercent || "", "number")}
      ${input("epithelialisationPercent", "Epithelialisation %", latest.epithelialisationPercent || "", "number")}
      ${select("exudateType", "Exudate type", ["Serous", "Haemoserous", "Purulent", "Pseudomonas", "Nil"], latest.exudateType || "")}
      ${select("exudateAmount", "Exudate amount", ["Minimal", "Low", "Moderate", "High"], latest.exudateAmount || "")}
      ${select("odor", "Odor", ["None", "Mild", "Foul"], latest.odor || "None")}
      ${input("painScore", "Pain score", latest.painScore || "", "number")}
    </div>
    </section>
    <section class="section-card">
      <h3>Edges, periwound, and judgement</h3>
      <div class="form-grid">
      ${select("edgeCondition", "Edge condition", ["Intact", "Macerated edge", "Rolled edge", "Undermining", "Fragile"], latest.edgeCondition || "")}
      ${select("healingStatus", "Clinical judgement", ["Improving", "Stable", "Static", "Deteriorating"], latest.healingStatus || "Stable")}
      ${textarea("periwoundFindings", "Periwound findings", asArray(latest.periwoundFindings).join(", ") || "Intact, dry, erythema, edematous, fragile")}
      ${textarea("infectionSigns", "Infection / inflammation signs", asArray(latest.infectionSigns).join(", ") || "None recorded")}
      ${textarea("clinicalNote", "Clinical note", latest.clinicalNote || "")}
    </div>
    </section>
    <button type="submit">Save and continue</button>`;
}

function careStep() {
  const care = selectedWound()?.carePlans?.[0] || {};
  return `
    <h2>Care plan</h2>
    <p class="muted">Update the dressing plan, review timing, repositioning, nutrition, hydration, and required actions.</p>
    <section class="section-card">
      <h3>Dressing and review</h3>
    <div class="form-grid">
      ${input("primaryDressing", "Primary dressing", care.primaryDressing || "")}
      ${input("secondaryDressing", "Secondary dressing", care.secondaryDressing || "")}
      ${input("solutionUsed", "Cleansing solution", care.solutionUsed || "Normal saline")}
      ${select("dressingChangeFrequency", "Dressing frequency", ["Daily", "Every 2 days", "Every 3 days", "Weekly", "As clinically indicated"], care.dressingChangeFrequency || "")}
      ${input("timeSpent", "Time spent", care.timeSpent || "30 minutes")}
      ${input("nextReviewDate", "Next review date", care.nextReviewDate?.slice?.(0, 10) || "", "date")}
    </div>
    </section>
    <section class="section-card">
      <h3>Pressure, mobility, nutrition, and actions</h3>
      <div class="form-grid">
      ${select("repositioningPrompt", "Repositioning", ["Frequently", "Every 2 hours", "Every 4 hours", "Every 6 hours", "Every 8 hours", "As clinically indicated", "Not applicable"], care.repositioningPrompt || "")}
      ${select("mobilityAssessment", "Mobility", ["Bedbound", "Chairbound", "Impaired mobility", "Fidgety", "Fully mobile"], care.mobilityAssessment || "")}
      ${textarea("assistiveAids", "Transfer aids", asArray(care.assistiveAids).join(", ") || "Can reposition independently, hoist, Zimmer frame, wheelchair, walking stick, scooter")}
      ${textarea("garments", "Garments / devices", asArray(care.garments).join(", ") || "Pressure boots, compression garments, bandaging, cast, traction, none")}
      ${select("continenceAssessment", "Continence", ["Continent", "Incontinent", "Urinary catheter", "Stoma"], care.continenceAssessment || "")}
      ${input("lastBowelMovement", "Last bowel movement", care.lastBowelMovement || "", "date")}
      ${select("nutrition", "Nutrition", ["Good oral intake", "Reduced oral intake", "Poor oral intake", "Nil by mouth", "Enteral feeding", "Parenteral nutrition", "Dietitian referral required"], care.nutrition || "")}
      ${select("hydration", "Hydration", ["Adequate", "Reduced fluid intake", "Dehydration risk", "Fluid restriction", "Requires fluid balance monitoring"], care.hydration || "")}
      ${input("weight", "Weight kg", care.weight || "")}
      ${input("height", "Height cm", care.height || "")}
      ${input("bmi", "BMI", care.bmi || "")}
      ${textarea("actionsRequired", "Actions required", asArray(care.actionsRequired).join(", ") || "Current treatment plan continued")}
      ${textarea("escalationInstructions", "Escalation instructions", care.escalationInstructions || "")}
    </div>
    </section>
    <button type="submit">Save and continue</button>`;
}

function reportStep() {
  const wound = selectedWound();
  const patient = selectedPatient();
  return `
    <h2>Report</h2>
    <p>Generate a concise handover, referral, MDT, or record-upload note.</p>
    <div class="photo-box">
      <div>
        <strong>${patient?.fullName || "No patient"}</strong><br>
        <span>${wound?.woundSite || "No wound selected"}</span>
      </div>
    </div>
    <button type="submit">Generate report</button>`;
}

function input(name, labelText, value = "", type = "text") {
  return `<label>${labelText}<input name="${name}" type="${type}" value="${escapeHtml(value)}"></label>`;
}

function textarea(name, labelText, value = "") {
  return `<label class="wide">${labelText}<textarea name="${name}">${escapeHtml(value)}</textarea></label>`;
}

function select(name, labelText, options, selected) {
  return `<label>${labelText}<select name="${name}">${options.map((option) => `<option ${option === selected ? "selected" : ""}>${option}</option>`).join("")}</select></label>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function statusClass(status = "") {
  const lower = status.toLowerCase();
  if (lower.includes("deteriorating") || lower.includes("review")) return "review";
  if (lower.includes("pending")) return "pending";
  return "ok";
}

function label(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function reportText(patient, wound) {
  const assessment = wound.assessments?.[0];
  const care = wound.carePlans?.[0];
  return [
    `Spotit wound progress report`,
    `Patient: ${patient.fullName} (${patient.title || ""}, ${patient.sex || "sex not recorded"}, ${patient.age || "age not recorded"}yrs)`,
    `NHS/local ID: ${patient.nhsNumber || "Not recorded"}`,
    `Wound site: ${wound.woundSite}`,
    `Wound type: ${wound.woundType || "Not recorded"}`,
    `Measurement: ${assessment ? `${assessment.lengthCm || "-"}cm x ${assessment.widthCm || "-"}cm x ${assessment.depthCm || "-"}cm` : "Not recorded"}`,
    `Tissue: granulation ${assessment?.granulationPercent ?? "-"}%, slough ${assessment?.sloughPercent ?? "-"}%, necrosis ${assessment?.necrosisPercent ?? "-"}%`,
    `Exudate: ${assessment?.exudateType || "Not recorded"} / ${assessment?.exudateAmount || "Not recorded"}`,
    `Pain score: ${assessment?.painScore ?? "Not recorded"}`,
    `Clinical judgement: ${assessment?.healingStatus || wound.status || "Not recorded"}`,
    `Care plan: ${care?.primaryDressing || "Primary dressing not recorded"} with ${care?.secondaryDressing || "secondary dressing not recorded"}`,
    `Frequency: ${care?.dressingChangeFrequency || "Not recorded"}`,
    `Actions: ${asArray(care?.actionsRequired).join(", ") || "Not recorded"}`,
    assessment?.flags?.length ? `Review prompts: ${assessment.flags.join("; ")}` : "Review prompts: none generated",
    `Clinical note: ${assessment?.clinicalNote || "Not recorded"}`
  ].join("\n");
}

async function renderReports() {
  const reports = state.patients.flatMap((patient) => patient.wounds || []).flatMap((wound) => wound.reports || []);
  $("reportList").innerHTML = reports.map((report) => `<article class="card" data-report="${report.id}"><strong>${new Date(report.createdAt).toLocaleString()}</strong><p>${report.reportText.split("\n")[1] || "Report"}</p></article>`).join("") || "<p>No reports yet.</p>";
  $("reportList").querySelectorAll("[data-report]").forEach((card) => card.addEventListener("click", () => {
    const report = reports.find((item) => item.id === card.dataset.report);
    $("reportPreview").textContent = report.reportText;
  }));
}

async function renderAdmin() {
  if (state.user?.role !== "admin") {
    $("adminView").innerHTML = `<section class="panel"><h2>Admin access required</h2><p>Sign in as an administrator to manage logins and audit activity.</p></section>`;
    return;
  }
  const overview = await api("/admin/overview");
  const clinicians = await api("/admin/clinicians");
  state.clinicians = clinicians.clinicians;
  state.auditLogs = overview.auditLogs || [];
  $("adminMetrics").innerHTML = metricsHtml(overview.metrics);
  $("clinicianList").innerHTML = state.clinicians.map((item) => `<div class="table-row"><strong>${item.fullName}</strong><span>${item.email}</span><span>${item.role}</span><span>${item.status}</span></div>`).join("");
  $("auditList").innerHTML = state.auditLogs.map((item) => `<div class="table-row"><strong>${item.action}</strong><span>${item.details || ""}</span><span>${item.clinician?.fullName || "System"}</span><span>${new Date(item.createdAt).toLocaleString()}</span></div>`).join("") || "<p>No audit entries yet.</p>";
}

async function handleWorkflowSubmit(event) {
  event.preventDefault();
  const values = formValues(event.currentTarget);
  if (state.step === "patient") {
    values.governanceChecks = ["Identity confirmed", "Allergy checked", values.photoConsentStatus].filter(Boolean);
    const route = state.selectedPatientId ? `/patients/${state.selectedPatientId}` : "/patients";
    const method = state.selectedPatientId ? "PATCH" : "POST";
    const data = await api(route, { method, body: JSON.stringify(values) });
    state.selectedPatientId = data.patient.id;
    state.step = "wound";
  } else if (state.step === "wound") {
    values.patientId = state.selectedPatientId;
    const data = await api("/wounds", { method: "POST", body: JSON.stringify(values) });
    state.selectedWoundId = data.wound.id;
    state.step = "photo";
  } else if (state.step === "photo") {
    values.flashlightUsed = values.flashlightUsed === "true";
    values.woundPointData = { note: values.woundPointData };
    await api(`/wounds/${state.selectedWoundId}/photos`, { method: "POST", body: JSON.stringify(values) });
    state.step = "assessment";
  } else if (state.step === "assessment") {
    ["lengthCm", "widthCm", "depthCm", "granulationPercent", "sloughPercent", "necrosisPercent", "epithelialisationPercent", "painScore"].forEach((key) => {
      values[key] = values[key] ? Number(values[key]) : undefined;
    });
    values.periwoundFindings = String(values.periwoundFindings || "").split(",").map((item) => item.trim()).filter(Boolean);
    values.infectionSigns = String(values.infectionSigns || "").split(",").map((item) => item.trim()).filter((item) => item && item !== "None recorded");
    await api(`/wounds/${state.selectedWoundId}/assessments`, { method: "POST", body: JSON.stringify(values) });
    state.step = "care";
  } else if (state.step === "care") {
    values.actionsRequired = String(values.actionsRequired || "").split(",").map((item) => item.trim()).filter(Boolean);
    values.assistiveAids = String(values.assistiveAids || "").split(",").map((item) => item.trim()).filter(Boolean);
    values.garments = String(values.garments || "").split(",").map((item) => item.trim()).filter(Boolean);
    await api(`/wounds/${state.selectedWoundId}/care-plans`, { method: "POST", body: JSON.stringify(values) });
    state.step = "report";
  } else if (state.step === "report") {
    const data = await api(`/reports/draft-from-wound/${state.selectedWoundId}`, { method: "POST" });
    $("reportPreview").textContent = data.report.reportText;
    await loadData();
    setView("reports");
    return;
  }
  await loadData();
  setView("workflow");
}

document.querySelectorAll(".nav button").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("loginMessage").textContent = "";
  const values = formValues(event.currentTarget);
  try {
    await login(values.email, values.password);
  } catch (error) {
    $("loginMessage").textContent = error.message;
  }
});
$("demoBtn").addEventListener("click", async () => {
  sessionStorage.removeItem("injurealSignedOut");
  state.demo = true;
  await login(demoLogin.email, demoLogin.password);
});
$("logoutBtn").addEventListener("click", () => {
  sessionStorage.setItem("injurealSignedOut", "true");
  state.token = "";
  state.user = null;
  state.demo = false;
  state.patients = [];
  state.selectedPatientId = "";
  state.selectedWoundId = "";
  $("sessionName").textContent = "Signed out";
  showLogin(true);
});
$("newPatientBtn").addEventListener("click", () => {
  state.selectedPatientId = "";
  state.selectedWoundId = "";
  state.step = "patient";
  setView("workflow");
});
$("patientSearch").addEventListener("input", renderPatients);
$("refreshBtn").addEventListener("click", loadData);
$("workflowForm").addEventListener("submit", handleWorkflowSubmit);
$("clinicianForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await api("/admin/clinicians", { method: "POST", body: JSON.stringify(formValues(event.currentTarget)) });
  event.currentTarget.reset();
  renderAdmin();
});

showLogin(true);
