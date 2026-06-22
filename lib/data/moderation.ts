/**
 * Moderation data access (server-safe, ADMIN-ONLY by RLS).
 *
 * These read reports / audit events. RLS returns nothing unless the caller is
 * an admin, so there is no extra client-side gate here — but never rely on
 * hiding these calls for security; the database enforces it.
 *
 * The moderation/admin UI itself is Phase 6 — these are foundation helpers.
 */

import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { ReportRow, AuditEventRow } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/moderation] ${context}: ${message}`);
}

/** All reports (admin-only via RLS). */
export async function getReports(status?: ReportRow["status"]): Promise<ReportRow[]> {
  const supabase = getServerSupabase();
  let query = supabase.from("reports").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) fail("getReports", error.message);
  return (data ?? []) as ReportRow[];
}

/** Recent audit events for a given entity (admin-only via RLS). */
export async function getAuditEvents(
  entityType: string,
  entityId: string,
  limit = 50
): Promise<AuditEventRow[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) fail("getAuditEvents", error.message);
  return (data ?? []) as AuditEventRow[];
}
