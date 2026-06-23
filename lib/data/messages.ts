/** Message reads (server-only, RLS: participants only). */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";

export interface MessageItem {
  id: string;
  senderId: string | null;
  senderName: string;
  body: string;
  isSystem: boolean;
  isMine: boolean;
  createdAt: string;
}

export async function getConversationMessages(conversationId: string, userId: string): Promise<MessageItem[]> {
  const db = getServerDb();
  const { data } = await db
    .from("messages")
    .select("id, sender_id, body, is_system_message, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(500);
  const rows = (data ?? []) as { id: string; sender_id: string | null; body: string; is_system_message: boolean; created_at: string }[];
  if (rows.length === 0) return [];

  const supabase = getServerSupabase();

  // Org-side senders are labeled with the organization name (not the person).
  const [{ data: conv }, { data: partRows }] = await Promise.all([
    db.from("conversations").select("organization_id").eq("id", conversationId).maybeSingle(),
    db.from("conversation_participants").select("user_id, participant_role").eq("conversation_id", conversationId),
  ]);
  const orgId = (conv as { organization_id: string | null } | null)?.organization_id ?? null;
  const orgSide = new Set(
    ((partRows ?? []) as { user_id: string; participant_role: string }[])
      .filter((p) => p.participant_role === "organizer")
      .map((p) => p.user_id)
  );
  let orgName = "Organization";
  if (orgId) {
    const { data: org } = await supabase.from("organizations").select("name").eq("id", orgId).maybeSingle();
    orgName = (org as { name: string } | null)?.name ?? "Organization";
  }

  const senderIds = Array.from(new Set(rows.map((r) => r.sender_id).filter(Boolean) as string[]));
  const { data: profs } = senderIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", senderIds)
    : { data: [] as { id: string; display_name: string }[] };
  const nameById = new Map(((profs ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]));

  return rows.map((r) => ({
    id: r.id,
    senderId: r.sender_id,
    senderName: r.sender_id
      ? orgSide.has(r.sender_id)
        ? orgName
        : nameById.get(r.sender_id) ?? "Member"
      : "System",
    body: r.body,
    isSystem: r.is_system_message,
    isMine: r.sender_id === userId,
    createdAt: r.created_at,
  }));
}
