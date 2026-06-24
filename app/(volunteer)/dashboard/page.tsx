import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server";
import { getVolunteerDashboardSummary } from "@/lib/data/applications";
import { getExploreMissionCards } from "@/lib/data/mission-cards";
import { getVolunteerImpactSummary } from "@/lib/data/volunteer-impact";
import DashboardStagger from "@/components/volunteer/dashboard/dashboard-stagger";
import DashboardSectionHeader from "@/components/volunteer/dashboard/dashboard-section-header";
import DashboardStatGrid from "@/components/volunteer/dashboard/dashboard-stat-grid";
import DashboardEmptyState from "@/components/volunteer/dashboard/dashboard-empty-state";
import VolunteerDashboardHero from "@/components/volunteer/dashboard/volunteer-dashboard-hero";
import ImpactStoryCard from "@/components/volunteer/dashboard/impact-story-card";
import NextMissionPanel from "@/components/volunteer/dashboard/next-mission-panel";
import RecommendedMissionCard from "@/components/volunteer/dashboard/recommended-mission-card";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const name = profile?.display_name?.trim();
  const greetingText = name ? `Welcome back, ${name} 👋` : "Welcome back 👋";

  const [summary, impact] = user
    ? await Promise.all([getVolunteerDashboardSummary(user.id), getVolunteerImpactSummary(user.id)])
    : [
        { savedCount: 0, pendingCount: 0, approvedCount: 0, totalApplied: 0, nextUpcoming: null },
        { completedCount: 0, totalHours: 0, certificatesCount: 0, causes: [], recentCompleted: [] },
      ];
  const recs = await getExploreMissionCards({ sort: "soonest", limit: 3 }, { userId: user?.id });

  const stats = [
    {
      icon: "bookmark" as const,
      value: summary.savedCount,
      label: "Saved missions",
      hint: summary.savedCount ? "Ready when you are" : "Bookmark missions to revisit",
      accent: true,
    },
    {
      icon: "clock" as const,
      value: summary.pendingCount,
      label: "Pending applications",
      hint: summary.pendingCount ? "Awaiting organizer review" : "No applications in review",
    },
    {
      icon: "check-circle" as const,
      value: summary.approvedCount,
      label: "Approved missions",
      hint: summary.approvedCount ? "You're cleared to volunteer" : "Get approved to serve",
      accent: true,
    },
    {
      icon: "send" as const,
      value: summary.totalApplied,
      label: "Total applied",
      hint: summary.totalApplied ? "Across all your applications" : "Your journey starts with one apply",
    },
  ];

  return (
    <DashboardStagger>
      <VolunteerDashboardHero
        greetingText={greetingText}
        totalHours={impact.totalHours}
        nextTitle={summary.nextUpcoming?.title ?? null}
        nextStartsAt={summary.nextUpcoming?.startsAt ?? null}
      />

      <DashboardStatGrid stats={stats} />

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }} className="dash-split vol-dash-split">
        <div className="vol-impact-col">
          <ImpactStoryCard impact={impact} />
        </div>
        <div className="vol-next-col">
          <NextMissionPanel next={summary.nextUpcoming} />
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <DashboardSectionHeader
          title="Recommended for you"
          subtitle="Soonest missions you can explore next"
          href="/explore"
        />
        {recs.length === 0 ? (
          <DashboardEmptyState
            icon="compass"
            title="No missions published yet"
            body="New opportunities will appear here as organizations post them. Check back soon or browse when missions go live."
            ctaLabel="Explore missions"
            ctaHref="/explore"
          />
        ) : (
          <div className="vol-rec-grid card-grid-3" role="list" aria-label="Recommended missions">
            {recs.map((card) => (
              <div key={card.mission.id} role="listitem">
                <RecommendedMissionCard card={card} />
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardStagger>
  );
}
