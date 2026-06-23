"use server";

/**
 * Messaging actions. Conversations are mission-scoped and created via the
 * create_application_conversation() RPC (which authorizes + sets up participant
 * rows). Sending validates participation (RLS) + body length and bumps
 * last_message_at. Messages are surfaced via the envelope/messages badge — they
 * do NOT create bell notifications.
 */
import { revalidatePath } from "next/cache";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";
import { getServerDb } from "@/lib/supabase/db";
import { UUID_RE, type ActionResult } from "@/lib/auth/require-organizer";

export async function createConversationForApplicationAction(
  applicationId: string
): Promise<ActionResult<{ conversationId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in." };
  if (!UUID_RE.test(applicationId)) return { ok: false, code: "validation", error: "Invalid application." };

  const { data, error } = await getServerDb().rpc("create_application_conversation", { p_application_id: applicationId });
  if (error || !data) return { ok: false, code: "forbidden", error: "Couldn’t open this conversation." };
  return { ok: true, conversationId: data as string };
}

export async function sendMessageAction(conversationId: string, body: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in." };
  if (!UUID_RE.test(conversationId)) return { ok: false, code: "validation", error: "Invalid conversation." };
  const text = (body ?? "").trim();
  if (!text) return { ok: false, code: "validation", error: "Message can’t be empty." };
  if (text.length > 2000) return { ok: false, code: "validation", error: "Message is too long (2000 characters max)." };

  const role = (await getCurrentUserRole()) ?? "volunteer";
  const db = getServerDb();

  // Confirm conversation is open + caller participates (also enforced by RLS on insert).
  const { data: conv } = await db.from("conversations").select("id, status, mission_id").eq("id", conversationId).maybeSingle();
  const c = conv as { id: string; status: string; mission_id: string | null } | null;
  if (!c) return { ok: false, code: "forbidden", error: "You don’t have access to this conversation." };
  if (c.status !== "active") return { ok: false, code: "transition", error: "This conversation is closed." };

  const { error } = await db.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: role,
    body: text,
    message_type: "text",
  });
  if (error) return { ok: false, code: "forbidden", error: "You don’t have access to this conversation." };

  const now = new Date().toISOString();
  // Bump the conversation + advance the sender's read marker (so their own
  // message isn't flagged unread to them). No bell notification — the recipient
  // sees the message via the envelope/messages badge.
  await Promise.all([
    db.from("conversations").update({ last_message_at: now }).eq("id", conversationId),
    db.from("conversation_participants").update({ last_read_at: now }).eq("conversation_id", conversationId).eq("user_id", user.id),
  ]);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath(`/manage/messages/${conversationId}`);
  revalidatePath("/messages");
  revalidatePath("/manage/messages");
  return { ok: true };
}

export async function markConversationReadAction(conversationId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in." };
  if (!UUID_RE.test(conversationId)) return { ok: false, code: "validation", error: "Invalid conversation." };
  // Just advance the read marker — messages don't create bell notifications.
  const { error } = await getServerDb()
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update read state." };
  return { ok: true };
}

export async function archiveConversationAction(conversationId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in." };
  if (!UUID_RE.test(conversationId)) return { ok: false, code: "validation", error: "Invalid conversation." };
  const { error } = await getServerDb()
    .from("conversation_participants")
    .update({ is_archived: true })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t archive this conversation." };
  revalidatePath("/messages");
  revalidatePath("/manage/messages");
  return { ok: true };
}
