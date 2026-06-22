/**
 * Server-side auth helpers. Single source of "who is logged in / what role".
 * Always uses getUser() (validates the JWT) — never getSession() (decodes only).
 * Per-request memoized with React cache() so layouts + pages share one round-trip.
 */
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import type { AppRole, ProfileRow } from "@/types/database";
import { dashboardPathForRole } from "./redirect-by-role";

// Highest-privilege role wins when a user somehow holds more than one.
const ROLE_PRECEDENCE: AppRole[] = ["admin", "organizer", "volunteer"];

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
});

export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = getServerSupabase();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as unknown as ProfileRow) ?? null;
});

export const getCurrentUserRole = cache(async (): Promise<AppRole | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = getServerSupabase();
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = ((data ?? []) as { role: AppRole }[]).map((r) => r.role);
  return ROLE_PRECEDENCE.find((r) => roles.includes(r)) ?? null;
});

/** Require a session; redirect anonymous callers to /auth. Returns the user. */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  return user;
}

/**
 * Require one of the allowed roles. Anonymous → /auth; wrong role → that user's
 * own dashboard (never a loop, since each dashboard's layout admits its role).
 */
export async function requireRole(
  allowed: AppRole | AppRole[]
): Promise<{ user: User; role: AppRole }> {
  const user = await requireAuth();
  const role = await getCurrentUserRole();
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!role || !allowedList.includes(role)) {
    redirect(dashboardPathForRole(role));
  }
  return { user, role };
}
