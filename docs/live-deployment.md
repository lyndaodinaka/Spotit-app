# Live Deployment Guide

## Recommended Path: Railway Full-Stack
Railway is the best fit for this MVP because Spotit has a long-running Express API and PostgreSQL database in one deployable project.

### 1. Prepare The Repository
Push `SpotitApp` to GitHub. If it sits inside a larger repository, set the Railway service root directory to `SpotitApp`.

### 2. Create Railway Project
1. Go to Railway.
2. Create a new project.
3. Choose deploy from GitHub repository.
4. Select the Spotit repository.
5. Add a PostgreSQL database service.

### 3. Environment Variables
Set these on the Railway app service:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=replace_with_a_long_random_secret
FIELD_ENCRYPTION_KEY=replace_with_32_byte_base64_key
APP_BASE_URL=https://your-generated-railway-domain.up.railway.app
PUBLIC_APP_URL=https://your-generated-railway-domain.up.railway.app
PHOTO_STORAGE_BUCKET=spotit-wound-photos-private
PHOTO_STORAGE_REGION=uk-or-eu-region
PHOTO_STORAGE_ENCRYPTION=private-server-side-encryption
ADMIN_NAME=Spotit Admin
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=minimum_12_character_password
ACCESS_REQUEST_OWNER_EMAIL=lyn@spotit.app
```

If you later host the frontend on Netlify or Vercel, set `APP_BASE_URL` to both domains, comma-separated:

```bash
APP_BASE_URL=https://your-railway-api.up.railway.app,https://your-site.netlify.app,https://your-site.vercel.app
```

### 4. Railway Build Settings
This repo includes `railway.json` and a `Dockerfile`.

The Docker build installs dependencies and builds the TypeScript app. Railway then runs:

```bash
npm run deploy:migrate
npm start
```

The health check path is `/health`.

### 5. Create First Admin
After the first successful deployment, open a Railway shell or run command on the app service:

```bash
npm run admin:create
```

Then sign in at the Railway public URL with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### 6. Approve Access Requests
People can view the public sign-in page and submit an access request, but they cannot enter the dashboard until an admin approves them.

Use the secured admin API after signing in as admin:

```bash
GET /admin/access-requests
POST /admin/access-requests/:requestId/approve
POST /admin/access-requests/:requestId/reject
```

The approve endpoint creates or activates the clinician account with a server-side password hash. The public frontend no longer contains an approval code or saved password.

## Alternative: Railway API + Netlify Frontend
Use this when you want the frontend on Netlify but keep the backend/database on Railway.

### 1. Deploy Backend On Railway
Follow the Railway steps above first.

### 2. Configure Frontend API URL
Edit `public/config.js`:

```js
window.SPOTIT_API_BASE_URL = "https://your-railway-api.up.railway.app";
```

### 3. Deploy To Netlify
1. Push the updated repo to GitHub.
2. In Netlify, create a new site from Git.
3. Select the repo.
4. Set base directory to `SpotitApp` if needed.
5. Set publish directory to `public`.
6. Leave build command blank.
7. Deploy.

The included `netlify.toml` publishes `public` and rewrites routes to `index.html`.

## Alternative: Railway API + Vercel Frontend
Use this when you want the frontend on Vercel but keep the backend/database on Railway.

### 1. Deploy Backend On Railway
Follow the Railway steps first.

### 2. Configure Frontend API URL
Edit `public/config.js`:

```js
window.SPOTIT_API_BASE_URL = "https://your-railway-api.up.railway.app";
```

### 3. Deploy To Vercel
1. Push the updated repo to GitHub.
2. In Vercel, import the repo.
3. Set root directory to `SpotitApp`.
4. Use framework preset `Other`.
5. Leave build command blank.
6. Set output directory to `public`.
7. Deploy.

The included `vercel.json` rewrites app routes to `index.html`.

## Production Safety Before Real Patient Data
- Replace demo credentials.
- Keep all access approval and password creation on the server.
- Use a strong `JWT_SECRET`.
- Generate and protect a strong `FIELD_ENCRYPTION_KEY`; never commit it.
- Confirm PostgreSQL backups and restore testing.
- Use private encrypted object storage for wound images.
- Confirm all traffic is HTTPS and that photo storage is private by default.
- Confirm audit logs are retained and reviewed.
- Confirm role permissions match your organisation's policy.
- Complete DPIA and clinical safety case.
- Review role-based access and audit retention.
- Confirm hosting region and data processing contracts.
- Do not use real patient data until governance approval is complete.

## What Is Cloud-Ready In This Build
- Express API with JWT login.
- PostgreSQL schema through Prisma.
- Consent, privacy, terms and governance fields on patients.
- Audit logs with clinician, IP address, user-agent and metadata.
- Report records with PDF/MDT sharing status.
- Wound photo records with private encrypted storage status.
- Frontend cloud connector using `public/config.js`.

## What Still Requires A Real Hosting Account
- Railway project creation.
- PostgreSQL service creation.
- Production environment variables.
- Private object storage credentials for wound photos.
- Domain name and HTTPS certificate.
- Final clinical governance approval.
