/**
 * Admin audit log reads (server-only, ADMIN-ONLY by RLS). Global, newest-first,
 * with the actor's display name resolved. Never exposed to non-admins.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/admin-audit] ${context}: ${message}`);
}

export type AuditCategory =
  | "all"
  | "verification"
  | "reports"
  | "missions"
  | "organizations";

export interface AuditItem {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string | null;
  actorName: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

type RawAudit = {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  actor_id: string | null;
  metadata: Json;
  created_at: string;
};

// Map a UI category to the event_type prefixes / entity types it covers.
function applyCategory<T>(query: T, category: AuditCategory): T {
  const q = query as any;
  switch (category) {
    case "verification":
      return q.like("event_type", "organization_verification_%");
    case "reports":
      return q.like("event_type", "report_%");
    case "missions":
      return q.eq("event_type", "mission_moderated");
    case "organizations":
      return q.eq("entity_type", "organization");
    default:
      return query;
  }
}

export async function getAuditEvents(
  filters: { category?: AuditCategory; limit?: number } = {}
): Promise<AuditItem[]> {
  const supabase = getServerSupabase();
  let query = supabase
    .from("audit_events")
    .select("id, event_type, entity_type, entity_id, actor_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100);
  query = applyCategory(query, filters.category ?? "all");

  const { data, error } = await query;
  if (error) fail("getAuditEvents", error.message);
  const rows = (data ?? []) as unknown as RawAudit[];
  if (rows.length === 0) return [];

  const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean) as string[]));
  const { data: profs } = actorIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", actorIds)
    : { data: [] as { id: string; display_name: string }[] };
  const names = new Map(((profs ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]));

  return rows.map((r) => ({
    id: r.id,
    eventType: r.event_type,
    entityType: r.entity_type,
    entityId: r.entity_id,
    actorName: r.actor_id ? names.get(r.actor_id) ?? null : null,
    createdAt: r.created_at,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
  }));
}
