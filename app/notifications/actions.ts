"use server";

/** Notification read-state actions. Users can only touch their own (RLS + explicit filter). */
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { getServerDb } from "@/lib/supabase/db";
import { UUID_RE, type ActionResult } from "@/lib/auth/require-organizer";

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in." };
  if (!UUID_RE.test(id)) return { ok: false, code: "validation", error: "Invalid notification." };

  const { error } = await getServerDb()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update the notification." };
  revalidatePath("/notifications");
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in." };

  const { error } = await getServerDb()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update notifications." };
  revalidatePath("/notifications");
  return { ok: true };
}
