/**
 * Check-in token reads (server-only, RLS-scoped: org managers/admins only).
 * Only metadata is returned — the raw token is never stored (hash only), so it
 * is shown exactly once at generation time by the action.
 */
import "server-only";
import { getServerDb } from "@/lib/supabase/db";

export interface ActiveCheckInToken {
  id: string;
  expiresAt: string | null;
  createdAt: string;
}

export async function getActiveCheckInToken(
  organizationId: string,
  missionId: string
): Promise<ActiveCheckInToken | null> {
  const { data } = await getServerDb()
    .from("check_in_tokens")
    .select("id, expires_at, created_at")
    .eq("organization_id", organizationId)
    .eq("mission_id", missionId)
    .eq("is_active", true)
    .maybeSingle();
  const t = data as { id: string; expires_at: string | null; created_at: string } | null;
  return t ? { id: t.id, expiresAt: t.expires_at, createdAt: t.created_at } : null;
}
