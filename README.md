# Spotit Wound Care MVP

Spotit is a responsive wound-care MVP for clinicians. It includes a browser frontend, Node/Express backend, Prisma database model, JWT login system, admin dashboard, audit logging, guided wound assessment workflow, care plan capture, and report generation.

## MVP Features
- Secure clinician login with JWT sessions
- Admin login creation and admin dashboard
- Clinician account management
- Caseload dashboard with risk and review metrics
- Patient profile and demographics
- Multiple wound records per patient
- Body-map photo workflow and consent capture
- Manual or point-estimate measurement workflow
- Structured wound assessment
- Clinical prompt flags, not diagnosis
- Care plan, dressing frequency, nutrition, hydration, mobility, repositioning, and escalation instructions
- Handover/progress report generation
- Audit trail for clinical and admin actions
- Responsive desktop/tablet/mobile frontend
- File-mode demo for quick review without a server

## Quick Demo
Open `public/index.html` directly in a browser. The app will load demo mode automatically.

Demo login:
- Email: `lyn@spotit.app`
- Password: `1st,Daughter`

## Local Development
1. Install Node.js 20+ and PostgreSQL 15+.
2. Create a database named `spotit`.
3. Copy `.env.example` to `.env`.
4. Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
5. Run:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
npm run admin:create
npm run dev
```

Open `http://localhost:4000`.

## Documentation
- [Deployment instructions](docs/deployment.md)
- [Live deployment guide](docs/live-deployment.md)
- [Folder structure](docs/folder-structure.md)
- [Clinical safety template](docs/clinical-safety-case-template.md)
- [DPIA starter](docs/dpia-starter.md)
- [API contract](docs/api-contract.md)

## Clinical Safety
This MVP uses prompts and flags only. It does not diagnose, prescribe, or replace clinical judgement. Do not use with real patient data until clinical safety, data protection, hosting, backups, access controls, and image storage are formally approved.
