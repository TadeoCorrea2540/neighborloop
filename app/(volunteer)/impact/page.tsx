import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server";
import { getVolunteerDashboardSummary } from "@/lib/data/applications";
import { getVolunteerImpactSummary, getVolunteerAttendanceHistory } from "@/lib/data/volunteer-impact";
import { getVolunteerCertificates } from "@/lib/data/certificates";
import { getVolunteerTimeline, getVolunteerCauseBreakdown, milestonesFromSummary } from "@/lib/data/analytics/volunteer";
import ImpactStagger from "@/components/impact/impact-stagger";
import VolunteerImpactHero from "@/components/impact/volunteer-impact-hero";
import ImpactStatGrid from "@/components/impact/impact-stat-grid";
import GoalProgressCard from "@/components/impact/goal-progress-card";
import ImpactOverTimeChart from "@/components/impact/impact-over-time-chart";
import ImpactTimeline from "@/components/impact/impact-timeline";
import MissionHistorySection from "@/components/impact/mission-history-section";
import CauseImpactGrid from "@/components/impact/cause-impact-grid";
import CertificatesSection from "@/components/impact/certificates-section";
import MilestonesPanel from "@/components/impact/milestones-panel";

export const dynamic = "force-dynamic";

export default async function Impact() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getCurrentUser()]);
  const [summary, impact, certificates, timelineAll, causeBreakdown, history] = user
    ? await Promise.all([
        getVolunteerDashboardSummary(user.id),
        getVolunteerImpactSummary(user.id),
        getVolunteerCertificates(user.id),
        getVolunteerTimeline(user.id),
        getVolunteerCauseBreakdown(user.id),
        getVolunteerAttendanceHistory(user.id),
      ])
    : [
        { savedCount: 0, pendingCount: 0, approvedCount: 0, totalApplied: 0, nextUpcoming: null },
        { completedCount: 0, totalHours: 0, certificatesCount: 0, causes: [], recentCompleted: [] },
        [],
        [],
        [],
        [],
      ];

  const milestones = milestonesFromSummary(impact);
  const timeline = timelineAll.slice(-12);

  const name = profile?.display_name?.trim() || "Neighbor";
  const city = profile?.city?.trim() ?? null;
  const bio = profile?.bio?.trim() ?? null;
  const interests = profile?.interests ?? [];

  const stats = [
    {
      icon: "clock" as const,
      value: impact.totalHours,
      label: "Volunteer hours",
      hint: "Confirmed by organizers",
      warm: true,
    },
    {
      icon: "check-circle" as const,
      value: impact.completedCount,
      label: "Completed missions",
      hint: "Attendance confirmed",
      warm: true,
    },
    {
      icon: "target" as const,
      value: summary.approvedCount,
      label: "Approved missions",
      hint: "Cleared to volunteer",
    },
    {
      icon: "send" as const,
      value: summary.totalApplied,
      label: "Applied missions",
      hint: "Total applications",
    },
    {
      icon: "award" as const,
      value: impact.certificatesCount,
      label: "Certificates",
      hint: "Official mission records",
      warm: true,
    },
  ];

  return (
    <ImpactStagger>
      <div className="impact-page">
        <VolunteerImpactHero
          name={name}
          city={city}
          bio={bio}
          interests={interests}
          totalHours={impact.totalHours}
          completedCount={impact.completedCount}
          causes={impact.causes}
          recentCompleted={impact.recentCompleted}
        />

        <div className="impact-page-content">
          <ImpactStatGrid stats={stats} />
          <GoalProgressCard totalHours={impact.totalHours} />
          <ImpactOverTimeChart timeline={timeline} />

          <div className="impact-split detail-split">
            <div>
              <ImpactTimeline missions={history} />
              <MissionHistorySection missions={history} />
            </div>
            <div>
              <CauseImpactGrid causes={causeBreakdown} interests={interests} />
              <CertificatesSection certificates={certificates} />
              <MilestonesPanel milestones={milestones} />
            </div>
          </div>
        </div>
      </div>
    </ImpactStagger>
  );
}
