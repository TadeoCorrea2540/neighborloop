/**
 * Conversation reads (server-only, RLS-scoped: participants only). New tables →
 * getServerDb() for messaging tables; getServerSupabase() for typed lookups
 * (missions/orgs/profiles/applications).
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";

export interface ConversationListItem {
  id: string;
  missionId: string | null;
  missionTitle: string;
  missionSlug: string | null;
  organizationId: string | null;
  organizationName: string;
  counterpartName: string;
  lastPreview: string | null;
  lastMessageAt: string | null;
  unread: boolean;
  status: string;
  applicationStatus: string | null;
}

export interface ConversationDetail {
  id: string;
  status: string;
  missionId: string | null;
  missionTitle: string;
  missionSlug: string | null;
  organizationName: string;
  counterpartName: string;
  applicationStatus: string | null;
  unreadCount: number; // unread incoming messages for the viewer (instant badge decrement on open)
}

type ConvRow = {
  id: string;
  mission_id: string | null;
  organization_id: string | null;
  application_id: string | null;
  last_message_at: string | null;
  status: string;
};

async function decorate(convs: ConvRow[], parts: Map<string, string | null>, userId: string): Promise<ConversationListItem[]> {
  if (convs.length === 0) return [];
  const db = getServerDb();
  const supabase = getServerSupabase();

  const missionIds = Array.from(new Set(convs.map((c) => c.mission_id).filter(Boolean) as string[]));
  const orgIds = Array.from(new Set(convs.map((c) => c.organization_id).filter(Boolean) as string[]));
  const appIds = Array.from(new Set(convs.map((c) => c.application_id).filter(Boolean) as string[]));
  const convIds = convs.map((c) => c.id);

  const [missionsRes, orgsRes, appsRes, otherPartsRes, lastMsgsRes] = await Promise.all([
    missionIds.length ? supabase.from("missions").select("id, title, slug").in("id", missionIds) : Promise.resolve({ data: [] }),
    orgIds.length ? supabase.from("organizations").select("id, name").in("id", orgIds) : Promise.resolve({ data: [] }),
    appIds.length ? supabase.from("applications").select("id, status").in("id", appIds) : Promise.resolve({ data: [] }),
    db.from("conversation_participants").select("conversation_id, user_id, participant_role").in("conversation_id", convIds),
    db.from("messages").select("conversation_id, body, created_at, is_system_message").in("conversation_id", convIds).order("created_at", { ascending: false }),
  ]);

  const mById = new Map(((missionsRes.data ?? []) as { id: string; title: string; slug: string }[]).map((m) => [m.id, m]));
  const oName = new Map(((orgsRes.data ?? []) as { id: string; name: string }[]).map((o) => [o.id, o.name]));
  const appStatus = new Map(((appsRes.data ?? []) as { id: string; status: string }[]).map((a) => [a.id, a.status]));

  // counterpart (the other participant) per conversation
  const otherByConv = new Map<string, { userId: string; role: string }>();
  for (const p of (otherPartsRes.data ?? []) as { conversation_id: string; user_id: string; participant_role: string }[]) {
    if (p.user_id !== userId && !otherByConv.has(p.conversation_id)) otherByConv.set(p.conversation_id, { userId: p.user_id, role: p.participant_role });
  }
  const otherIds = Array.from(new Set(Array.from(otherByConv.values()).map((o) => o.userId)));
  const { data: profs } = otherIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", otherIds)
    : { data: [] as { id: string; display_name: string }[] };
  const nameById = new Map(((profs ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]));

  // last message preview per conversation (messages came back newest-first)
  const lastByConv = new Map<string, { body: string; created_at: string; is_system_message: boolean }>();
  for (const m of (lastMsgsRes.data ?? []) as { conversation_id: string; body: string; created_at: string; is_system_message: boolean }[]) {
    if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m);
  }

  return convs.map((c) => {
    const mission = c.mission_id ? mById.get(c.mission_id) : undefined;
    const lastReadAt = parts.get(c.id) ?? null;
    const other = otherByConv.get(c.id);
    const orgName = c.organization_id ? oName.get(c.organization_id) ?? "Organization" : "Organization";
    // The org-side participant is shown as the organization, not the person.
    const counterpartName = other
      ? other.role === "organizer"
        ? orgName
        : nameById.get(other.userId) ?? "Volunteer"
      : "—";
    return {
      id: c.id,
      missionId: c.mission_id,
      missionTitle: mission?.title ?? "Conversation",
      missionSlug: mission?.slug ?? null,
      organizationId: c.organization_id,
      organizationName: orgName,
      counterpartName,
      lastPreview: lastByConv.get(c.id)?.body ?? null,
      lastMessageAt: c.last_message_at,
      unread: !!c.last_message_at && (!lastReadAt || c.last_message_at > lastReadAt),
      status: c.status,
      applicationStatus: c.application_id ? appStatus.get(c.application_id) ?? null : null,
    };
  });
}

export async function getUserConversations(userId: string): Promise<ConversationListItem[]> {
  const db = getServerDb();
  const { data: partRows } = await db
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);
  const parts = (partRows ?? []) as { conversation_id: string; last_read_at: string | null }[];
  if (parts.length === 0) return [];
  const lastRead = new Map(parts.map((p) => [p.conversation_id, p.last_read_at]));

  const { data: convRows } = await db
    .from("conversations")
    .select("id, mission_id, organization_id, application_id, last_message_at, status")
    .in("id", parts.map((p) => p.conversation_id))
    .order("last_message_at", { ascending: false, nullsFirst: false });
  const items = await decorate((convRows ?? []) as ConvRow[], lastRead, userId);
  return items;
}

/**
 * Number of unread *messages* (not conversations) for the badge: incoming
 * messages newer than the user's last_read_at in that conversation. Excludes
 * the user's own messages and system messages.
 */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  const db = getServerDb();
  const { data: partRows } = await db
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);
  const parts = (partRows ?? []) as { conversation_id: string; last_read_at: string | null }[];
  if (parts.length === 0) return 0;
  const lastRead = new Map(parts.map((p) => [p.conversation_id, p.last_read_at]));

  const { data: msgs } = await db
    .from("messages")
    .select("conversation_id, sender_id, created_at, is_system_message")
    .in("conversation_id", parts.map((p) => p.conversation_id))
    .neq("sender_id", userId);

  let count = 0;
  for (const m of (msgs ?? []) as { conversation_id: string; sender_id: string | null; created_at: string; is_system_message: boolean }[]) {
    if (m.is_system_message) continue;
    const lr = lastRead.get(m.conversation_id) ?? null;
    if (!lr || m.created_at > lr) count++;
  }
  return count;
}

export async function getConversationByIdForUser(conversationId: string, userId: string): Promise<ConversationDetail | null> {
  const db = getServerDb();
  const { data } = await db
    .from("conversations")
    .select("id, mission_id, organization_id, application_id, last_message_at, status")
    .eq("id", conversationId)
    .maybeSingle(); // RLS: participant-only
  if (!data) return null;
  const lastRead = new Map<string, string | null>();
  const [item] = await decorate([data as ConvRow], lastRead, userId);
  if (!item) return null;

  // Unread incoming messages in this conversation (head count — no rows transferred).
  const { data: partRow } = await db
    .from("conversation_participants")
    .select("last_read_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  const lastReadAt = (partRow as { last_read_at: string | null } | null)?.last_read_at ?? null;
  let unreadQuery = db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_system_message", false);
  if (lastReadAt) unreadQuery = unreadQuery.gt("created_at", lastReadAt);
  const { count } = await unreadQuery;

  return {
    id: item.id,
    status: item.status,
    missionId: item.missionId,
    missionTitle: item.missionTitle,
    missionSlug: item.missionSlug,
    organizationName: item.organizationName,
    counterpartName: item.counterpartName,
    applicationStatus: item.applicationStatus,
    unreadCount: count ?? 0,
  };
}
