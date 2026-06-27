import { getCurrentUser } from "@/lib/auth/server";
import { getVolunteerImpactSummary } from "@/lib/data/volunteer-impact";
import { milestonesFromSummary } from "@/lib/data/analytics/volunteer";
import BadgesStagger from "@/components/badges/badges-stagger";
import BadgesHero from "@/components/badges/badges-hero";
import AchievementSummary from "@/components/badges/achievement-summary";
import NextMilestoneCard from "@/components/badges/next-milestone-card";
import MilestonePath from "@/components/badges/milestone-path";
import BadgeGrid from "@/components/badges/badge-grid";
import BadgeEmptyState from "@/components/badges/badge-empty-state";

export const dynamic = "force-dynamic";

export default async function Badges() {
  const user = await getCurrentUser();
  const impact = user
    ? await getVolunteerImpactSummary(user.id)
    : { completedCount: 0, totalHours: 0, certificatesCount: 0, causes: [], recentCompleted: [] };
  const milestones = milestonesFromSummary(impact);

  const unlocked = milestones.filter((m) => m.achieved).length;
  const next = milestones.find((m) => !m.achieved) ?? null;

  return (
    <BadgesStagger>
      <BadgesHero unlocked={unlocked} total={milestones.length} nextLabel={next?.label ?? null} />

      <AchievementSummary
        unlocked={unlocked}
        total={milestones.length}
        totalHours={impact.totalHours}
        completedCount={impact.completedCount}
        certificatesCount={impact.certificatesCount}
        causesCount={impact.causes.length}
      />

      <NextMilestoneCard next={next} />

      <MilestonePath milestones={milestones} nextKey={next?.key ?? null} />

      {unlocked === 0 && (
        <div style={{ marginBottom: 20 }}>
          <BadgeEmptyState
            title="Your first badge is waiting"
            body="Complete your first mission with confirmed attendance to start building your volunteer achievement path."
            ctaLabel="Find a mission"
            ctaHref="/explore"
          />
        </div>
      )}

      <BadgeGrid milestones={milestones} />
    </BadgesStagger>
  );
}
