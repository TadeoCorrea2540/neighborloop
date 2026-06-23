/** Real organizer dashboard counts, aggregated from the org's missions. */
import "server-only";
import { getOrganizationMissionsWithCounts } from "@/lib/data/organization-missions";

export interface OrganizerDashboardSummary {
  totalMissions: number;
  activeMissions: number; // published
  draftMissions: number;
  pendingApplications: number;
  approvedVolunteers: number;
  nextUpcoming: { slug: string; title: string; startsAt: string } | null;
}

export async function getOrganizerDashboardSummary(
  organizationId: string
): Promise<OrganizerDashboardSummary> {
  const missions = await getOrganizationMissionsWithCounts(organizationId);
  const nowIso = new Date().toISOString();

  const upcoming = missions
    .filter((m) => m.status === "published" && m.startsAt >= nowIso)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  return {
    totalMissions: missions.length,
    activeMissions: missions.filter((m) => m.status === "published").length,
    draftMissions: missions.filter((m) => m.status === "draft").length,
    pendingApplications: missions.reduce((n, m) => n + m.pendingCount, 0),
    approvedVolunteers: missions.reduce((n, m) => n + m.approvedCount, 0),
    nextUpcoming: upcoming
      ? { slug: upcoming.slug, title: upcoming.title, startsAt: upcoming.startsAt }
      : null,
  };
}
