import "dotenv/config";
import argon2 from "argon2";
import { db } from "../db";

async function main() {
  const fullName = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const organisationName = process.env.ADMIN_ORGANISATION_NAME || "Medholic Digital Health";
  const organisationSlug = process.env.ADMIN_ORGANISATION_SLUG || "medholic-digital-health";
  const adminRole = process.env.ADMIN_ROLE || "platform_admin";

  if (!fullName || !email || !password) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running admin:create.");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await argon2.hash(password);
  const organisation = await db.organisation.upsert({
    where: { slug: organisationSlug },
    update: {
      name: organisationName,
      ownerEmail: email.toLowerCase(),
      status: "active"
    },
    create: {
      name: organisationName,
      slug: organisationSlug,
      ownerEmail: email.toLowerCase(),
      status: "active",
      plan: "platform"
    }
  });

  const clinician = await db.clinician.upsert({
    where: { email: email.toLowerCase() },
    update: {
      organisationId: organisation.id,
      fullName,
      passwordHash,
      role: adminRole,
      status: "active"
    },
    create: {
      organisationId: organisation.id,
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: adminRole,
      status: "active"
    }
  });

  console.log(`Admin ready: ${clinician.email} (${organisation.name})`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
