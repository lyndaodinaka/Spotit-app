# Spotit Folder Structure

```text
SpotitApp/
  package.json                  App scripts and dependencies
  docker-compose.yml            Local PostgreSQL database helper
  .dockerignore                 Docker build ignore rules
  tsconfig.json                 TypeScript compiler configuration
  .env.example                  Environment variable template
  README.md                     Project overview and local setup
  prisma/
    schema.prisma               Database schema for clinicians, patients, wounds, photos, assessments, care plans, reports, and audit logs
  src/
    server.ts                   Express app entry point
    db.ts                       Prisma client
    middleware/
      auth.ts                   JWT auth and admin guard
    routes/
      auth.ts                   Login route
      dashboard.ts              Caseload metrics route
      patients.ts               Patient CRUD routes
      wounds.ts                 Wound, photo, assessment, and care-plan routes
      reports.ts                Report creation and draft routes
      admin.ts                  Admin dashboard and clinician-management routes
    scripts/
      create-admin.ts           First admin account setup
    services/
      audit.ts                  Audit log writer
      escalation.ts             Clinical prompt flag rules
  public/
    index.html                  Responsive frontend shell
    styles.css                  App styling
    app.js                      Frontend app logic and file-mode demo
    assets/
      clinical-body-map.png     Body-map asset for wound location capture
  docs/
    deployment.md               Deployment instructions
    live-deployment.md          Railway, Netlify, and Vercel hosting steps
    folder-structure.md         This file
    api-contract.md             API examples
    clinical-safety-case-template.md
    dpia-starter.md
  source-and-assets/
    outputs/                    Recovered prototype, marketing kit, launch docs, and original source assets
```
