# Spotit MVP Deployment Instructions

## 1. Production Prerequisites
- Node.js 20 LTS or newer
- PostgreSQL 15 or newer
- Private object storage for wound images
- HTTPS domain
- Long random `JWT_SECRET`
- UK/EU hosting region suitable for clinical data
- Backup, restore, monitoring, and audit retention policy

## 2. Environment
Create `.env` from `.env.example`.

Required values:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/spotit
JWT_SECRET=use_a_long_random_secret
APP_BASE_URL=https://your-spotit-domain.example
PUBLIC_APP_URL=https://your-spotit-domain.example
PHOTO_STORAGE_BUCKET=private-bucket-name
PHOTO_STORAGE_REGION=uk-or-eu-region
ADMIN_NAME=Spotit Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=minimum_12_characters
ACCESS_REQUEST_OWNER_EMAIL=lyn@spotit.app
```

## 3. Build And Migrate

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
npm run admin:create
npm start
```

For local PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

## 4. Reverse Proxy
Put the Node app behind HTTPS. Example Nginx shape:

```nginx
server {
  listen 443 ssl;
  server_name your-spotit-domain.example;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 5. Data Protection Checklist
- Enable database backups and tested restores.
- Store wound photos in private encrypted storage.
- Restrict admin access to named staff.
- Rotate secrets before pilot use.
- Review audit logs regularly.
- Complete DPIA, clinical safety case, and role-based access policy before real patient use.

## 6. First Admin Login
After `npm run admin:create`, open the app URL and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Use the Admin dashboard/API to create clinician accounts.

## 7. Production Access Control
The public sign-in page does not open the app by itself. Visitors can submit an access request, which is stored in PostgreSQL as `pending`.

Admin-only review endpoints:

```bash
GET /admin/access-requests
POST /admin/access-requests/:requestId/approve
POST /admin/access-requests/:requestId/reject
```

Approving a request creates or activates a clinician account and sets a server-side password hash. Only active clinician accounts can receive a JWT session from `/auth/login`.

Do not put approval codes, demo passwords, or real credentials inside `public/index.html` or `public/config.js`.
