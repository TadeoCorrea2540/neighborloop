/**
 * Organizer-scoped mission reads. Unlike the public missions.ts, these return
 * ALL statuses (incl. drafts) — RLS lets org members read their own missions.
 * Organizers can also read their own missions' applications, so spot counts are
 * computed directly (no definer needed).
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { toMissionFull, type MissionFull, type OrganizerMission } from "@/types/domain";
import type { MissionRow, ApplicationStatus } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/organization-missions] ${context}: ${message}`);
}

export async function getOrganizationMissionsWithCounts(
  organizationId: string
): Promise<OrganizerMission[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) fail("getOrganizationMissionsWithCounts", error.message);
  const rows = (data ?? []) as unknown as MissionRow[];
  if (rows.length === 0) return [];

  // Count applications per mission (org members can read their own apps).
  const missionIds = rows.map((r) => r.id);
  const { data: appData } = await supabase
    .from("applications")
    .select("mission_id, status")
    .in("mission_id", missionIds);
  const apps = (appData ?? []) as { mission_id: string; status: ApplicationStatus }[];

  const pending = new Map<string, number>();
  const approved = new Map<string, number>();
  for (const a of apps) {
    if (a.status === "pending" || a.status === "waitlisted") {
      pending.set(a.mission_id, (pending.get(a.mission_id) ?? 0) + 1);
    } else if (a.status === "approved") {
      approved.set(a.mission_id, (approved.get(a.mission_id) ?? 0) + 1);
    }
  }

  return rows.map((r) => {
    const approvedCount = approved.get(r.id) ?? 0;
    const capacity = r.volunteer_capacity;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      categoryId: r.category_id,
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      isVirtual: r.is_virtual,
      locationLabel: r.location_label,
      city: r.city,
      volunteerCapacity: capacity,
      applicationMode: r.application_mode,
      pendingCount: pending.get(r.id) ?? 0,
      approvedCount,
      spotsLeft: capacity == null ? null : Math.max(0, capacity - approvedCount),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });
}

/** Full mission row for the edit form. Double-filtered by id + org (defense in depth). */
export async function getOrganizationMissionById(
  organizationId: string,
  missionId: string
): Promise<MissionFull | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("id", missionId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) fail("getOrganizationMissionById", error.message);
  return data ? toMissionFull(data as unknown as MissionRow) : null;
}
