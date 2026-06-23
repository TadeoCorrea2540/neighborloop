/**
 * Organizer-facing application reads. RLS lets org members read applications for
 * their org's missions. Volunteer profile is fetched separately (applications
 * has two FKs to profiles, which makes a direct embed ambiguous) and is null for
 * volunteers whose profile is private (RLS) — the UI falls back gracefully.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { OrganizerApplication } from "@/types/domain";
import type { ApplicationStatus } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/organization-applications] ${context}: ${message}`);
}

type RawApp = {
  id: string;
  mission_id: string;
  volunteer_id: string;
  status: ApplicationStatus;
  message: string | null;
  organizer_note: string | null;
  applied_at: string;
  reviewed_at: string | null;
  missions: { title: string; slug: string; organization_id: string; volunteer_capacity: number | null } | null;
};

async function mapApplications(rows: RawApp[]): Promise<OrganizerApplication[]> {
  if (rows.length === 0) return [];
  const supabase = getServerSupabase();
  const volunteerIds = Array.from(new Set(rows.map((r) => r.volunteer_id)));
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, city")
    .in("id", volunteerIds);
  const byId = new Map(
    ((profs ?? []) as { id: string; display_name: string; avatar_url: string | null; city: string | null }[]).map(
      (p) => [p.id, p]
    )
  );

  return rows.map((r) => {
    const p = byId.get(r.volunteer_id);
    return {
      id: r.id,
      missionId: r.mission_id,
      missionTitle: r.missions?.title ?? "Mission",
      missionSlug: r.missions?.slug ?? "",
      missionCapacity: r.missions?.volunteer_capacity ?? null,
      status: r.status,
      message: r.message,
      organizerNote: r.organizer_note,
      appliedAt: r.applied_at,
      reviewedAt: r.reviewed_at,
      volunteer: p ? { displayName: p.display_name, avatarUrl: p.avatar_url, city: p.city } : null,
    };
  });
}

const APP_SELECT =
  "id, mission_id, volunteer_id, status, message, organizer_note, applied_at, reviewed_at, " +
  "missions!inner(title, slug, organization_id, volunteer_capacity)";

export async function getApplicationsForOrganization(
  organizationId: string
): Promise<OrganizerApplication[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select(APP_SELECT)
    .eq("missions.organization_id", organizationId)
    .order("applied_at", { ascending: false });

  if (error) fail("getApplicationsForOrganization", error.message);
  return mapApplications((data ?? []) as unknown as RawApp[]);
}

/** Lightweight count of applications awaiting review (pending + waitlisted). */
export async function getPendingApplicationCount(organizationId: string): Promise<number> {
  const supabase = getServerSupabase();
  const { count } = await supabase
    .from("applications")
    .select("id, missions!inner(organization_id)", { count: "exact", head: true })
    .eq("missions.organization_id", organizationId)
    .in("status", ["pending", "waitlisted"]);
  return count ?? 0;
}

export async function getApplicationsForMission(
  organizationId: string,
  missionId: string
): Promise<OrganizerApplication[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select(APP_SELECT)
    .eq("mission_id", missionId)
    .eq("missions.organization_id", organizationId)
    .order("applied_at", { ascending: false });

  if (error) fail("getApplicationsForMission", error.message);
  return mapApplications((data ?? []) as unknown as RawApp[]);
}
