import { spawnSync } from "node:child_process";

const requiredVariables = ["DATABASE_URL", "JWT_SECRET", "FIELD_ENCRYPTION_KEY"];
const missing = requiredVariables.filter((name) => !process.env[name] || String(process.env[name]).startsWith("replace_with"));

if (missing.length) {
  console.error(`Railway pre-deploy blocked: missing ${missing.join(", ")}.`);
  console.error("Add these variables to the Spotit-app service before deploying again.");
  process.exit(1);
}

if (!String(process.env.DATABASE_URL).startsWith("postgresql://")) {
  console.error("Railway pre-deploy blocked: DATABASE_URL must be the PostgreSQL connection string.");
  process.exit(1);
}

if (String(process.env.JWT_SECRET).length < 32) {
  console.error("Railway pre-deploy blocked: JWT_SECRET must be at least 32 characters.");
  process.exit(1);
}

if (String(process.env.FIELD_ENCRYPTION_KEY).length < 32) {
  console.error("Railway pre-deploy blocked: FIELD_ENCRYPTION_KEY must be at least 32 characters.");
  process.exit(1);
}

const migration = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

process.exit(migration.status ?? 1);
