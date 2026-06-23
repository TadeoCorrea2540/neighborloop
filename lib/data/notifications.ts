/**
 * Notifications data + creation helper (server-only). New tables aren't in
 * generated types yet → getServerDb(). Creation goes through the SECURITY
 * DEFINER create_notification() RPC and respects the recipient's preferences
 * for toggleable categories (core types always send). Best-effort: a failed
 * notification never breaks the action that triggered it.
 */
import "server-only";
import { getServerDb } from "@/lib/supabase/db";

export type NotificationType =
  | "application_submitted" | "application_approved" | "application_declined" | "application_waitlisted"
  | "mission_update" | "mission_reminder" | "mission_cancelled"
  | "attendance_checked_in" | "attendance_completed" | "certificate_issued"
  | "message_received" | "organization_verified" | "organization_rejected" | "report_resolved" | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  linkUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body?: string | null;
  linkUrl?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

type PrefColumn =
  | "messages_enabled" | "application_updates_enabled" | "mission_updates_enabled"
  | "mission_reminders_enabled" | "attendance_updates_enabled" | "certificate_updates_enabled";

// null → core/transactional type that always sends.
const PREF_BY_TYPE: Record<NotificationType, PrefColumn | null> = {
  application_submitted: "application_updates_enabled",
  application_approved: "application_updates_enabled",
  application_declined: "application_updates_enabled",
  application_waitlisted: "application_updates_enabled",
  mission_update: "mission_updates_enabled",
  mission_cancelled: "mission_updates_enabled",
  mission_reminder: "mission_reminders_enabled",
  attendance_checked_in: "attendance_updates_enabled",
  attendance_completed: "attendance_updates_enabled",
  certificate_issued: "certificate_updates_enabled",
  message_received: "messages_enabled",
  organization_verified: null,
  organization_rejected: null,
  report_resolved: null,
  system: null,
};

/** Create a notification for several users, honoring their preferences. Never throws. */
export async function createNotificationsForUsers(
  userIds: string[],
  input: CreateNotificationInput
): Promise<void> {
  const recipients = Array.from(new Set(userIds.filter(Boolean)));
  if (recipients.length === 0) return;
  const db = getServerDb();
  const prefCol = PREF_BY_TYPE[input.type];

  let allowed = recipients;
  if (prefCol) {
    try {
      const { data } = await db
        .from("notification_preferences")
        .select(`user_id, ${prefCol}`)
        .in("user_id", recipients);
      const disabled = new Set(
        ((data ?? []) as Record<string, unknown>[])
          .filter((r) => r[prefCol] === false)
          .map((r) => r.user_id as string)
      );
      allowed = recipients.filter((id) => !disabled.has(id)); // default (no row) = enabled
    } catch {
      // preferences unreadable → fall back to sending (defaults are on)
    }
  }

  for (const uid of allowed) {
    try {
      await db.rpc("create_notification", {
        p_user_id: uid,
        p_type: input.type,
        p_title: input.title,
        p_body: input.body ?? null,
        p_link_url: input.linkUrl ?? null,
        p_entity_type: input.entityType ?? null,
        p_entity_id: input.entityId ?? null,
        p_metadata: input.metadata ?? {},
      });
    } catch (err) {
      console.error(`[notifications] failed for ${uid}: ${input.type}`, err);
    }
  }
}

export async function createNotification(userId: string, input: CreateNotificationInput): Promise<void> {
  return createNotificationsForUsers([userId], input);
}

type RawNotif = {
  id: string;
  notification_type: NotificationType;
  title: string;
  body: string | null;
  link_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

function toItem(r: RawNotif): NotificationItem {
  return {
    id: r.id,
    type: r.notification_type,
    title: r.title,
    body: r.body,
    linkUrl: r.link_url,
    entityType: r.entity_type,
    entityId: r.entity_id,
    metadata: r.metadata ?? {},
    readAt: r.read_at,
    createdAt: r.created_at,
  };
}

export async function getUserNotifications(
  userId: string,
  opts: { filter?: "all" | "unread"; limit?: number } = {}
): Promise<NotificationItem[]> {
  let query = getServerDb()
    .from("notifications")
    .select("id, notification_type, title, body, link_url, entity_type, entity_id, metadata, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.filter === "unread") query = query.is("read_at", null);
  const { data } = await query;
  return ((data ?? []) as RawNotif[]).map(toItem);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count } = await getServerDb()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}
