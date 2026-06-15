-- Spotit production database starter schema
-- This is a planning schema for the real hosted product.

create table clinicians (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table patients (
  id uuid primary key,
  nhs_number text,
  full_name text not null,
  date_of_birth date,
  allergy_status text,
  past_medical_history text,
  photo_consent_status text,
  created_by uuid references clinicians(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wounds (
  id uuid primary key,
  patient_id uuid not null references patients(id),
  wound_site text not null,
  wound_type text,
  present_medical_history text,
  onset_date date,
  care_commenced_date date,
  status text not null default 'pending assessment',
  created_by uuid references clinicians(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wound_photos (
  id uuid primary key,
  wound_id uuid not null references wounds(id),
  assessment_id uuid,
  storage_key text not null,
  body_map_view text,
  body_map_x numeric,
  body_map_y numeric,
  captured_at timestamptz not null default now(),
  captured_by uuid references clinicians(id),
  consent_status text not null
);

create table wound_assessments (
  id uuid primary key,
  wound_id uuid not null references wounds(id),
  clinician_id uuid references clinicians(id),
  assessed_at timestamptz not null default now(),
  measurement_method text,
  length_cm numeric,
  width_cm numeric,
  depth_cm numeric,
  tunnelling boolean default false,
  rolled_edge boolean default false,
  undermining boolean default false,
  sinus_tract boolean default false,
  cavity boolean default false,
  pocketing boolean default false,
  granulation_percent numeric,
  slough_percent numeric,
  necrosis_percent numeric,
  epithelialisation_percent numeric,
  exudate_type text,
  exudate_amount text,
  periwound_findings text[],
  pain_score numeric,
  pressure_injury_category text,
  healing_status text,
  escalation_required boolean default false,
  clinical_note text
);

create table care_plans (
  id uuid primary key,
  wound_id uuid not null references wounds(id),
  assessment_id uuid references wound_assessments(id),
  primary_dressing text,
  secondary_dressing text,
  solution_used text,
  actions_required text[],
  dressing_change_frequency text,
  time_spent text,
  mobility_assessment text,
  repositioning_prompt text,
  continence_assessment text,
  pad_change_frequency text,
  last_bowel_movement text,
  stool_assessment text,
  nutrition text,
  hydration text,
  weight text,
  height text,
  bmi text,
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key,
  wound_id uuid not null references wounds(id),
  assessment_id uuid references wound_assessments(id),
  report_text text not null,
  sent_via text,
  sent_to text,
  sent_by uuid references clinicians(id),
  sent_at timestamptz
);

create table audit_logs (
  id uuid primary key,
  clinician_id uuid references clinicians(id),
  patient_id uuid references patients(id),
  wound_id uuid references wounds(id),
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

