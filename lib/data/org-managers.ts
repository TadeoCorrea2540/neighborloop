/** Resolve an organization's manager user-ids (owner/admin members) — recipients for organizer-facing notifications. */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";

export async function getOrganizationManagerIds(organizationId: string): Promise<string[]> {
  const { data } = await getServerSupabase()
    .from("organization_members")
    .select("user_id, member_role")
    .eq("organization_id", organizationId)
    .in("member_role", ["owner", "admin"]);
  return ((data ?? []) as { user_id: string }[]).map((m) => m.user_id);
}
