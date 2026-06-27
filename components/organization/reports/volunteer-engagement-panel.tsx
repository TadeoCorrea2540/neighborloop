import type { OrgMissionPerformance, OrgVolunteerEngagement } from "@/lib/data/analytics/organization";
import { aggregateMissionFunnel, fmtPct } from "@/lib/reports/helpers";

export default function VolunteerEngagementPanel({
  engagement,
  performance,
  completedAttendances,
  certificatesIssued,
  avgCompletionRate,
}: {
  engagement: OrgVolunteerEngagement;
  performance: OrgMissionPerformance[];
  completedAttendances: number;
  certificatesIssued: number;
  avgCompletionRate: number | null;
}) {
  const funnel = aggregateMissionFunnel(performance);
  const hasFunnel = funnel.approved > 0 || funnel.completed > 0;
  const totalHours = performance.reduce((n, p) => n + p.hours, 0);

  const mobileSummary =
    engagement.uniqueVolunteers > 0 && totalHours > 0
      ? `${engagement.uniqueVolunteers} unique volunteer${engagement.uniqueVolunteers === 1 ? "" : "s"} contributed ${totalHours} verified hour${totalHours === 1 ? "" : "s"} across ${completedAttendances} completed attendance${completedAttendances === 1 ? "" : "s"}.`
      : null;

  const stats = [
    { label: "Unique volunteers", value: engagement.uniqueVolunteers },
    { label: "Returning volunteers", value: engagement.returningVolunteers },
    { label: "Completed attendances", value: completedAttendances },
    { label: "No-shows", value: engagement.noShowCount },
    {
      label: "Avg hours / volunteer",
      value: engagement.avgHoursPerVolunteer == null ? "—" : `${engagement.avgHoursPerVolunteer}h`,
    },
    { label: "Certificates issued", value: certificatesIssued },
    { label: "Returning rate", value: fmtPct(engagement.returningRate) },
    { label: "Completion rate", value: fmtPct(avgCompletionRate) },
  ];

  return (
    <section className="rpt-panel" aria-label="Volunteer engagement">
      <div className="rpt-panel-head">
        <h2 className="rpt-panel-title">Volunteer engagement</h2>
      </div>
      {mobileSummary ? (
        <p className="rpt-engage-mobile-summary">{mobileSummary}</p>
      ) : null}
      <div className="rpt-engage-grid">
        {stats.map((s) => (
          <div key={s.label} className="rpt-engage-stat">
            <div className="rpt-engage-stat-val">
              {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </div>
            <div className="rpt-engage-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      {hasFunnel ? (
        <div className="rpt-funnel">
          <div className="rpt-funnel-title">Mission funnel (aggregate)</div>
          <div className="rpt-funnel-steps" role="list" aria-label="Volunteer progression funnel">
            {[
              { label: "Approved", value: funnel.approved },
              { label: "Checked in", value: funnel.checkedIn },
              { label: "Completed", value: funnel.completed },
              { label: "Certified", value: funnel.certified },
            ].map((step, i, arr) => (
              <div key={step.label} style={{ display: "contents" }} role="listitem">
                <div className="rpt-funnel-step">
                  <div className="rpt-funnel-step-val">{step.value}</div>
                  <div className="rpt-funnel-step-lbl">{step.label}</div>
                </div>
                {i < arr.length - 1 ? (
                  <span className="rpt-funnel-arrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
