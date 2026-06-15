export function validateProductionSecurity() {
  if (process.env.NODE_ENV !== "production") return;

  const required = ["DATABASE_URL", "JWT_SECRET", "FIELD_ENCRYPTION_KEY"];
  const missing = required.filter((name) => !process.env[name] || String(process.env[name]).startsWith("replace_with"));

  if (missing.length) {
    throw new Error(`Production security configuration missing: ${missing.join(", ")}`);
  }

  if (String(process.env.JWT_SECRET || "").length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  if (String(process.env.FIELD_ENCRYPTION_KEY || "").length < 32) {
    throw new Error("FIELD_ENCRYPTION_KEY must be at least 32 characters in production");
  }
}
