"use server";

/** Update the current user's notification preferences (upsert own row; RLS owner-only). */
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { getServerDb } from "@/lib/supabase/db";
import type { ActionResult } from "@/lib/auth/require-organizer";

const TOGGLES = [
  "messages_enabled",
  "application_updates_enabled",
  "mission_updates_enabled",
  "mission_reminders_enabled",
  "attendance_updates_enabled",
  "certificate_updates_enabled",
] as const;

export async function updateNotificationPreferencesAction(fd: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in." };

  const row: Record<string, unknown> = { user_id: user.id };
  for (const key of TOGGLES) row[key] = fd.get(key) != null;
  // email/push stay false this phase (UI shows them disabled "Coming soon").

  const { error } = await getServerDb()
    .from("notification_preferences")
    .upsert(row, { onConflict: "user_id" });
  if (error) return { ok: false, code: "unknown", error: "Couldn’t save your preferences." };

  revalidatePath("/settings/notifications");
  return { ok: true };
}
