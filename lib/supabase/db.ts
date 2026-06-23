import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "./server";

/**
 * Loosely-typed server client for tables/functions added in Phase 7
 * (attendance_records, check_in_tokens, certificates, qr_check_in) that are not
 * yet in types/database.generated.ts. Same cookie-authenticated instance as
 * getServerSupabase() — RLS still applies — just without the generated Database
 * generic so `.from("attendance_records")` / `.rpc("qr_check_in")` type-check.
 *
 * Regenerate types (`npm run db:types`) after applying migrations 014/015 and
 * this can be swapped back to getServerSupabase() for full typing.
 */
export function getServerDb(): SupabaseClient {
  return getServerSupabase() as unknown as SupabaseClient;
}
