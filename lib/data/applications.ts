/**
 * Application data access (server-safe).
 *
 * Volunteer-facing reads NEVER select organizer_note (organizer/admin-only).
 * Organizer-facing reads include the full row; RLS restricts visibility to the
 * mission's organization members.
 */

import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  toVolunteerApplication,
  type VolunteerApplication,
  type VolunteerApplicationWithMission,
} from "@/types/domain";
import type { ApplicationRow, ApplicationStatus } from "@/types/database";
import { getMissionsByIds } from "@/lib/data/missions";

// Volunteer-safe columns — organizer_note deliberately omitted.
const VOLUNTEER_APP_COLUMNS =
  "id, mission_id, volunteer_id, status, message, applied_at, reviewed_at, created_at, updated_at";

function fail(context: string, message: string): never {
  throw new Error(`[data/applications] ${context}: ${message}`);
}

/** A volunteer's own applications (no organizer notes). */
export async function getVolunteerApplications(userId: string): Promise<VolunteerApplication[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select(VOLUNTEER_APP_COLUMNS)
    .eq("volunteer_id", userId)
    .order("applied_at", { ascending: false });

  if (error) fail("getVolunteerApplications", error.message);
  return ((data ?? []) as ApplicationRow[]).map(toVolunteerApplication);
}

/** A volunteer's applications joined with their public missions (My Missions). */
export async function getVolunteerApplicationsWithMissions(
  userId: string
): Promise<VolunteerApplicationWithMission[]> {
  const apps = await getVolunteerApplications(userId);
  const missions = await getMissionsByIds(apps.map((a) => a.missionId));
  const byId = new Map(missions.map((m) => [m.id, m]));
  return apps.map((application) => ({
    application,
    mission: byId.get(application.missionId) ?? null,
  }));
}

/** The current volunteer's application for one mission (or null). */
export async function getVolunteerApplicationForMission(
  userId: string,
  missionId: string
): Promise<VolunteerApplication | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select(VOLUNTEER_APP_COLUMNS)
    .eq("volunteer_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (error) fail("getVolunteerApplicationForMission", error.message);
  return data ? toVolunteerApplication(data as unknown as ApplicationRow) : null;
}

export interface VolunteerDashboardSummary {
  savedCount: number;
  pendingCount: number;
  approvedCount: number;
  totalApplied: number;
  nextUpcoming: { slug: string; title: string; startsAt: string } | null;
}

/** Lightweight real counts for the volunteer dashboard. */
export async function getVolunteerDashboardSummary(
  userId: string
): Promise<VolunteerDashboardSummary> {
  const supabase = getServerSupabase();

  const [savedRes, appsRes] = await Promise.all([
    supabase.from("saved_missions").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("applications").select("status, mission_id").eq("volunteer_id", userId),
  ]);

  const appRows = ((appsRes.data ?? []) as { status: ApplicationStatus; mission_id: string }[]);
  const pendingCount = appRows.filter((a) => a.status === "pending" || a.status === "waitlisted").length;
  const approvedRows = appRows.filter((a) => a.status === "approved");

  // Soonest upcoming approved mission.
  let nextUpcoming: VolunteerDashboardSummary["nextUpcoming"] = null;
  if (approvedRows.length > 0) {
    const missions = await getMissionsByIds(approvedRows.map((a) => a.mission_id));
    const nowIso = new Date().toISOString();
    const upcoming = missions
      .filter((m) => m.startsAt >= nowIso)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    if (upcoming[0]) {
      nextUpcoming = { slug: upcoming[0].slug, title: upcoming[0].title, startsAt: upcoming[0].startsAt };
    }
  }

  return {
    savedCount: savedRes.count ?? 0,
    pendingCount,
    approvedCount: approvedRows.length,
    totalApplied: appRows.length,
    nextUpcoming,
  };
}

/**
 * Applications for every mission belonging to an organization (organizer view,
 * includes organizer_note). RLS restricts this to that org's members/admins.
 */
export async function getOrganizationApplications(organizationId: string): Promise<ApplicationRow[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select("*, missions!inner(organization_id)")
    .eq("missions.organization_id", organizationId)
    .order("applied_at", { ascending: false });

  if (error) fail("getOrganizationApplications", error.message);
  return (data ?? []) as unknown as ApplicationRow[];
}
