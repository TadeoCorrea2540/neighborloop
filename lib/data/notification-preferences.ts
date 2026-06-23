/** Notification preferences (server-only, owner-only by RLS). Returns defaults when no row exists. */
import "server-only";
import { getServerDb } from "@/lib/supabase/db";

export interface NotificationPreferences {
  messagesEnabled: boolean;
  applicationUpdatesEnabled: boolean;
  missionUpdatesEnabled: boolean;
  missionRemindersEnabled: boolean;
  attendanceUpdatesEnabled: boolean;
  certificateUpdatesEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  messagesEnabled: true,
  applicationUpdatesEnabled: true,
  missionUpdatesEnabled: true,
  missionRemindersEnabled: true,
  attendanceUpdatesEnabled: true,
  certificateUpdatesEnabled: true,
  emailNotificationsEnabled: false,
  pushNotificationsEnabled: false,
};

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const { data } = await getServerDb()
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return DEFAULT_PREFERENCES;
  const r = data as Record<string, boolean>;
  return {
    messagesEnabled: r.messages_enabled,
    applicationUpdatesEnabled: r.application_updates_enabled,
    missionUpdatesEnabled: r.mission_updates_enabled,
    missionRemindersEnabled: r.mission_reminders_enabled,
    attendanceUpdatesEnabled: r.attendance_updates_enabled,
    certificateUpdatesEnabled: r.certificate_updates_enabled,
    emailNotificationsEnabled: r.email_notifications_enabled,
    pushNotificationsEnabled: r.push_notifications_enabled,
  };
}
