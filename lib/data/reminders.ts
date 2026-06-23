/**
 * Reminders foundation (server-only, RLS-scoped). Records only — there is NO
 * automatic scheduler this phase (see docs/reminder-scheduling.md). Created
 * best-effort from organizer/volunteer flows and shown as "upcoming" in-app.
 */
import "server-only";
import { getServerDb } from "@/lib/supabase/db";

export type ReminderType =
  | "mission_24h_before" | "mission_2h_before" | "saved_mission_before_deadline"
  | "attendance_followup" | "certificate_available";

export interface CreateReminderInput {
  type: ReminderType;
  scheduledFor: string; // ISO
  missionId?: string | null;
  userId?: string | null;
  organizationId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpcomingReminder {
  id: string;
  type: ReminderType;
  missionId: string | null;
  scheduledFor: string;
  status: string;
}

/** Best-effort insert; never throws (a reminder hiccup must not break the action). */
export async function createReminder(input: CreateReminderInput): Promise<void> {
  try {
    await getServerDb().from("scheduled_reminders").insert({
      reminder_type: input.type,
      scheduled_for: input.scheduledFor,
      mission_id: input.missionId ?? null,
      user_id: input.userId ?? null,
      organization_id: input.organizationId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    console.error(`[reminders] failed to create ${input.type}`, err);
  }
}

export async function getUpcomingRemindersForUser(userId: string): Promise<UpcomingReminder[]> {
  const nowIso = new Date().toISOString();
  const { data } = await getServerDb()
    .from("scheduled_reminders")
    .select("id, reminder_type, mission_id, scheduled_for, status")
    .eq("user_id", userId)
    .eq("status", "pending")
    .gte("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: true })
    .limit(20);
  return ((data ?? []) as { id: string; reminder_type: ReminderType; mission_id: string | null; scheduled_for: string; status: string }[]).map((r) => ({
    id: r.id,
    type: r.reminder_type,
    missionId: r.mission_id,
    scheduledFor: r.scheduled_for,
    status: r.status,
  }));
}

/** Due, pending reminders (admin/dev manual processing only). */
export async function getDueReminders(limit = 100): Promise<{ id: string; type: ReminderType; userId: string | null; missionId: string | null }[]> {
  const { data } = await getServerDb()
    .from("scheduled_reminders")
    .select("id, reminder_type, user_id, mission_id")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(limit);
  return ((data ?? []) as { id: string; reminder_type: ReminderType; user_id: string | null; mission_id: string | null }[]).map((r) => ({
    id: r.id, type: r.reminder_type, userId: r.user_id, missionId: r.mission_id,
  }));
}
