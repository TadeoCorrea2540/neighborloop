/**
 * Audit log writer (server-only, admin-only by RLS).
 *
 * Every significant admin decision is logged here. Writes are BEST-EFFORT: if
 * the insert fails we log to the server console and swallow the error so an
 * audit hiccup never rolls back the primary action (which already succeeded).
 * Reads live in lib/data/admin-audit.ts.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export type AuditEventType =
  | "organization_verification_approved"
  | "organization_verification_rejected"
  | "organization_verification_returned_to_pending"
  | "report_resolved"
  | "report_dismissed"
  | "mission_moderated";

export type AuditEntityType = "organization" | "report" | "mission";

export interface AuditEventInput {
  actorId: string;
  eventType: AuditEventType;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/** Insert an audit row. Never throws — failures are logged, not propagated. */
export async function writeAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    const supabase = getServerSupabase();
    const { error } = await supabase.from("audit_events").insert({
      actor_id: input.actorId,
      event_type: input.eventType,
      entity_type: input.entityType,
      entity_id: input.entityId,
      metadata: (input.metadata ?? {}) as Json,
    });
    if (error) {
      console.error(`[audit] failed to write ${input.eventType}: ${error.message}`);
    }
  } catch (err) {
    console.error(`[audit] unexpected error writing ${input.eventType}:`, err);
  }
}
