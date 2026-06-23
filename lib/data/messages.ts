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

  const senderIds = Array.from(new Set(rows.map((r) => r.sender_id).filter(Boolean) as string[]));
  const { data: profs } = senderIds.length
    ? await getServerSupabase().from("profiles").select("id, display_name").in("id", senderIds)
    : { data: [] as { id: string; display_name: string }[] };
  const nameById = new Map(((profs ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]));

  return rows.map((r) => ({
    id: r.id,
    senderId: r.sender_id,
    senderName: r.sender_id ? nameById.get(r.sender_id) ?? "Member" : "System",
    body: r.body,
    isSystem: r.is_system_message,
    isMine: r.sender_id === userId,
    createdAt: r.created_at,
  }));
}
