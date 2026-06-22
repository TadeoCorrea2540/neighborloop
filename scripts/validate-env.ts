/**
 * Standalone env validator.
 *
 *   npx tsx scripts/validate-env.ts
 *
 * Reads .env.local (falling back to process.env) WITHOUT any dependency and
 * reports, in plain language, whether the required PUBLIC Supabase variables
 * are present. It also flags the dangerous mistake of putting a service-role
 * key into a NEXT_PUBLIC_* variable. It never prints secret values.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

function loadDotEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  const file = resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return out;
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

function main() {
  const fromFile = loadDotEnvLocal();
  const get = (k: string) => process.env[k] || fromFile[k] || "";

  const missing = REQUIRED.filter((k) => !get(k));
  const problems: string[] = [];

  // Security guard: a publishable key must never be a service-role key.
  const pub = get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (pub && (pub.includes("service_role") || pub.startsWith("sb_secret_"))) {
    problems.push(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks like a SECRET/service-role key. " +
        "Public env vars are exposed to the browser — use the publishable key only."
    );
  }

  if (missing.length === 0 && problems.length === 0) {
    console.log("✓ Supabase public env looks good (" + REQUIRED.join(", ") + ").");
    process.exit(0);
  }

  console.error("✗ Supabase env validation failed:\n");
  if (missing.length) console.error("  Missing: " + missing.join(", "));
  for (const p of problems) console.error("  " + p);
  console.error("\n  Fix: copy .env.example → .env.local and fill the values.");
  console.error("  See docs/supabase-setup.md.\n");
  process.exit(1);
}

main();
