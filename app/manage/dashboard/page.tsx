import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getOrganizerDashboardSummary } from "@/lib/data/organizer-dashboard";
import { getOrganizationMissionsWithCounts } from "@/lib/data/organization-missions";
import { getApplicationsForOrganization } from "@/lib/data/organization-applications";
import { getPrimaryOrganizationForUser } from "@/lib/data/organization-membership";
import { getOrganizationImpactSummary } from "@/lib/data/analytics/organization";
import OrganizationDashboardStagger from "@/components/organization/dashboard/organization-dashboard-stagger";
import OrganizationDashboardHero from "@/components/organization/dashboard/organization-dashboard-hero";
import OrganizerQuickActions from "@/components/organization/dashboard/organizer-quick-actions";
import OrganizationStatGrid from "@/components/organization/dashboard/organization-stat-grid";
import NeedsAttentionPanel, { type AttentionItem } from "@/components/organization/dashboard/needs-attention-panel";
import VerificationStatusPanel from "@/components/organization/dashboard/verification-status-panel";
import UpcomingMissionControlCard from "@/components/organization/dashboard/upcoming-mission-control-card";
import ApplicantPreviewPanel from "@/components/organization/dashboard/applicant-preview-panel";
import OrganizationImpactSnapshot from "@/components/organization/dashboard/organization-impact-snapshot";
import RecentActivityFeed, { type ActivityFeedItem } from "@/components/organization/dashboard/recent-activity-feed";
import OrganizationDashboardEmptyState from "@/components/organization/dashboard/organization-dashboard-empty-state";
import DashboardScrollTop from "@/components/manage/dashboard-scroll-top";
import type { OrganizerMission, OrganizerApplication } from "@/types/domain";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

function buildAttentionItems(
  summary: Awaited<ReturnType<typeof getOrganizerDashboardSummary>>,
  missions: OrganizerMission[],
  verificationStatus: string
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const now = Date.now();

  if (summary.pendingApplications > 0) {
    items.push({
      id: "pending-apps",
      priority: "high",
      label: `${summary.pendingApplications} applicant${summary.pendingApplications === 1 ? "" : "s"} waiting for review`,
      href: "/manage/applicants",
      cta: "Review",
    });
  }

  if (summary.draftMissions > 0) {
    items.push({
      id: "drafts",
      priority: "medium",
      label: `${summary.draftMissions} draft mission${summary.draftMissions === 1 ? "" : "s"} need details before publishing`,
      href: "/manage/missions",
      cta: "Finish",
    });
  }

  if (verificationStatus === "pending") {
    items.push({
      id: "verify-pending",
      priority: "medium",
      label: "Organization verification is pending admin review",
      href: "/manage/settings",
      cta: "Status",
    });
  }

  for (const m of missions) {
    if (m.status !== "published") continue;
    const hoursUntil = (new Date(m.startsAt).getTime() - now) / (1000 * 60 * 60);
    if (hoursUntil > 0 && hoursUntil <= 48) {
      items.push({
        id: `soon-${m.id}`,
        priority: "high",
        label: `"${m.title}" starts within 48 hours`,
        href: `/manage/missions/${m.id}/edit`,
        cta: "Prepare",
      });
    }
  }

  for (const m of missions.filter((x) => x.pendingCount > 0)) {
    if (items.some((i) => i.id === `mission-apps-${m.id}`)) continue;
    items.push({
      id: `mission-apps-${m.id}`,
      priority: "high",
      label: `${m.pendingCount} pending for "${m.title}"`,
      href: `/manage/missions/${m.id}/applications`,
      cta: "Review",
    });
  }

  return items.slice(0, 6);
}

function buildActivityFeed(
  applications: OrganizerApplication[],
  missions: OrganizerMission[]
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  for (const app of applications.slice(0, 20)) {
    const name = app.volunteer?.displayName ?? "A volunteer";
    if (app.status === "pending" || app.status === "waitlisted") {
      items.push({
        id: `apply-${app.id}`,
        at: app.appliedAt,
        text: `${name} applied to ${app.missionTitle}`,
        href: `/manage/missions/${app.missionId}/applications`,
      });
    }
    if (app.status === "approved" && app.reviewedAt) {
      items.push({
        id: `approved-${app.id}`,
        at: app.reviewedAt,
        text: `${name} was approved for ${app.missionTitle}`,
        href: `/manage/missions/${app.missionId}/applications`,
      });
    }
  }

  for (const m of missions.filter((x) => x.status === "published")) {
    items.push({
      id: `mission-${m.id}`,
      at: m.updatedAt,
      text: `${m.title} is live`,
      href: `/manage/missions/${m.id}/edit`,
    });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
}

export default async function OrgDashboard() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/dashboard");
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const [org, summary, missions, applications, impact] = await Promise.all([
    getPrimaryOrganizationForUser(guard.userId),
    getOrganizerDashboardSummary(guard.orgId),
    getOrganizationMissionsWithCounts(guard.orgId),
    getApplicationsForOrganization(guard.orgId),
    getOrganizationImpactSummary(guard.orgId),
  ]);

  if (!org) redirect("/manage/onboarding");

  const nowIso = new Date().toISOString();
  const upcomingMissions = missions
    .filter((m) => m.status === "published" && m.startsAt >= nowIso)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 4);

  const pendingApplicants = applications
    .filter((a) => a.status === "pending" || a.status === "waitlisted")
    .slice(0, 4);

  const attentionItems = buildAttentionItems(summary, missions, org.verificationStatus);
  const activityItems = buildActivityFeed(applications, missions);

  const stats = [
    {
      icon: "target" as const,
      value: summary.activeMissions,
      label: "Active missions",
      hint: summary.activeMissions ? "Published and accepting volunteers" : "Publish your first mission",
      warm: true,
    },
    {
      icon: "clock" as const,
      value: summary.pendingApplications,
      label: "Pending applications",
      hint: summary.pendingApplications ? "Awaiting your review" : "No applications in queue",
    },
    {
      icon: "check-circle" as const,
      value: summary.approvedVolunteers,
      label: "Approved volunteers",
      hint: "Across all active missions",
      warm: true,
    },
    {
      icon: "bar-chart" as const,
      value: summary.draftMissions,
      label: "Draft missions",
      hint: summary.draftMissions ? "Ready to finish and publish" : "All missions published or archived",
    },
  ];

  return (
    <OrganizationDashboardStagger>
      <Suspense fallback={null}>
        <DashboardScrollTop />
      </Suspense>
      <OrganizationDashboardHero
        orgName={org.name}
        verificationStatus={org.verificationStatus}
        activeMissions={summary.activeMissions}
        pendingApplications={summary.pendingApplications}
        draftMissions={summary.draftMissions}
        nextUpcomingTitle={summary.nextUpcoming?.title ?? null}
        nextUpcomingDate={summary.nextUpcoming ? fmtDate(summary.nextUpcoming.startsAt) : null}
      />

      <OrganizerQuickActions />

      <div className="org-momentum" aria-label="Community momentum">
        <span className="org-momentum-chip">
          <strong>{summary.approvedVolunteers}</strong> volunteers approved
        </span>
        <span className="org-momentum-chip">
          <strong>{summary.activeMissions}</strong> missions active
        </span>
        <span className="org-momentum-chip">
          <strong>{impact.totalHours}</strong> hours tracked
        </span>
        <span className="org-momentum-chip">
          <strong>{impact.certificatesIssued}</strong> certificates issued
        </span>
      </div>

      <OrganizationStatGrid stats={stats} />

      <div className="org-dash-split">
        <NeedsAttentionPanel items={attentionItems} />
        <VerificationStatusPanel status={org.verificationStatus} />
      </div>

      <section style={{ marginBottom: 20 }}>
        <div className="org-section-header">
          <div>
            <h3 className="org-section-title">Upcoming missions</h3>
            <p className="org-section-sub">Operational control panel for what&apos;s next</p>
          </div>
          <Link href="/manage/missions" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>
            Manage all →
          </Link>
        </div>
        {upcomingMissions.length === 0 ? (
          <OrganizationDashboardEmptyState
            icon="target"
            title="No upcoming missions"
            body="Publish a mission with a future date — it will appear here with applicant counts, capacity, and quick actions."
            ctaLabel="Create mission"
            ctaHref="/manage/missions/new"
          />
        ) : (
          <div className="org-upcoming-grid">
            {upcomingMissions.map((m) => (
              <UpcomingMissionControlCard key={m.id} mission={m} />
            ))}
          </div>
        )}
      </section>

      <div className="org-dash-split">
        <ApplicantPreviewPanel applicants={pendingApplicants} totalPending={summary.pendingApplications} />
        <OrganizationImpactSnapshot
          impact={impact}
          approvedVolunteers={summary.approvedVolunteers}
          totalApplications={applications.length}
        />
      </div>

      <RecentActivityFeed items={activityItems} />
    </OrganizationDashboardStagger>
  );
}
