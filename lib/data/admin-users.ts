/**
 * Admin users overview (server-only, ADMIN-ONLY by RLS). READ-ONLY for Phase 6.
 * Only safe profile data — NO email, tokens, phone, or private addresses. Email
 * / account admin needs service-role work and is deferred to a later phase.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/admin-users] ${context}: ${message}`);
}

const ROLE_PRECEDENCE: AppRole[] = ["admin", "organizer", "volunteer"];

export interface AdminUserItem {
  id: string;
  displayName: string;
  role: AppRole | null;
  city: string | null; // only when profile is public
  isPublic: boolean;
  createdAt: string;
  membershipCount: number;
  applicationCount: number;
}

type RawProfile = {
  id: string;
  display_name: string;
  city: string | null;
  is_profile_public: boolean;
  created_at: string;
};

export interface UserFilters {
  role?: AppRole;
}

export async function getAdminUsers(filters: UserFilters = {}): Promise<AdminUserItem[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, city, is_profile_public, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) fail("getAdminUsers", error.message);
  const rows = (data ?? []) as unknown as RawProfile[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [{ data: roleRows }, { data: memberRows }, { data: appRows }] = await Promise.all([
    supabase.from("user_roles").select("user_id, role").in("user_id", ids),
    supabase.from("organization_members").select("user_id").in("user_id", ids),
    supabase.from("applications").select("volunteer_id").in("volunteer_id", ids),
  ]);

  // Highest-precedence role per user.
  const rolesByUser = new Map<string, AppRole[]>();
  for (const r of (roleRows ?? []) as { user_id: string; role: AppRole }[]) {
    const list = rolesByUser.get(r.user_id) ?? [];
    list.push(r.role);
    rolesByUser.set(r.user_id, list);
  }
  const memberships = new Map<string, number>();
  for (const m of (memberRows ?? []) as { user_id: string }[])
    memberships.set(m.user_id, (memberships.get(m.user_id) ?? 0) + 1);
  const applications = new Map<string, number>();
  for (const a of (appRows ?? []) as { volunteer_id: string }[])
    applications.set(a.volunteer_id, (applications.get(a.volunteer_id) ?? 0) + 1);

  const items = rows.map((r) => {
    const roles = rolesByUser.get(r.id) ?? [];
    const role = ROLE_PRECEDENCE.find((x) => roles.includes(x)) ?? null;
    return {
      id: r.id,
      displayName: r.display_name,
      role,
      city: r.is_profile_public ? r.city : null,
      isPublic: r.is_profile_public,
      createdAt: r.created_at,
      membershipCount: memberships.get(r.id) ?? 0,
      applicationCount: applications.get(r.id) ?? 0,
    };
  });

  return filters.role ? items.filter((u) => u.role === filters.role) : items;
}
