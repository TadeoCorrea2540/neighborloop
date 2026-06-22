/**
 * Safe access to the PUBLIC Supabase environment variables.
 *
 * Only the publishable (anon-equivalent) key is read here — it is safe for the
 * browser. The service-role key must NEVER be referenced in this file or any
 * other file that can reach client code. See docs/supabase-setup.md.
 */

export interface PublicSupabaseEnv {
  url: string;
  publishableKey: string;
}

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

/** Returns the public env, or throws a readable error in development. */
export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  // IMPORTANT: reference each var as a STATIC `process.env.NEXT_PUBLIC_*` so
  // Next.js inlines the value into the client bundle. Dynamic access
  // (process.env[someVar]) is NOT inlined and is undefined in the browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missing: string[] = [];
  if (!url) missing.push(URL_VAR);
  if (!publishableKey) missing.push(KEY_VAR);

  if (missing.length > 0) {
    throw new Error(
      `[NeighborLoop] Missing Supabase env var(s): ${missing.join(", ")}.\n` +
        `Add them to .env.local (copy from .env.example). ` +
        `See docs/supabase-setup.md for where to find these values.`
    );
  }

  return { url: url as string, publishableKey: publishableKey as string };
}

/** Non-throwing check, handy for guards / feature flags. */
export function hasPublicSupabaseEnv(): boolean {
  // Static references (see note above) so this works client-side too.
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
