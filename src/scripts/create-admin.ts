import "dotenv/config";
import argon2 from "argon2";
import { db } from "../db";

async function main() {
  const fullName = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!fullName || !email || !password) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running admin:create.");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await argon2.hash(password);

  const clinician = await db.clinician.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      role: "admin",
      status: "active"
    },
    create: {
      fullName,
      email,
      passwordHash,
      role: "admin",
      status: "active"
    }
  });

  console.log(`Admin ready: ${clinician.email}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
