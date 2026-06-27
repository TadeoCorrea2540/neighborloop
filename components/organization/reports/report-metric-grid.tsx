"use client";

import type { CSSProperties } from "react";
import Icon, { type IconName } from "@/components/icons";
import AnimatedCount from "@/components/volunteer/dashboard/animated-count";
import type { OrgImpactSummary } from "@/lib/data/analytics/organization";
import { fmtPct } from "@/lib/reports/helpers";

type MetricDef = {
  icon: IconName;
  label: string;
  hint: string;
  warm?: boolean;
  mint?: boolean;
  value: number | string;
  animate?: boolean;
  mobileClass?: string;
};

export default function ReportMetricGrid({ summary }: { summary: OrgImpactSummary }) {
  const cards: MetricDef[] = [
    {
      icon: "target",
      label: "Missions hosted",
      hint: "In selected date range",
      value: summary.missionsHosted,
      animate: true,
      mobileClass: "rpt-metric-card--m-order-3",
    },
    {
      icon: "clock",
      label: "Volunteer hours",
      hint: "Confirmed & credited",
      value: summary.totalHours,
      warm: true,
      animate: true,
      mobileClass: "rpt-metric-card--featured rpt-metric-card--m-order-1",
    },
    {
      icon: "check-circle",
      label: "Completed attendances",
      hint: "Verified completions",
      value: summary.completedAttendances,
      mint: true,
      animate: true,
      mobileClass: "rpt-metric-card--m-order-2",
    },
    {
      icon: "globe",
      label: "Unique volunteers",
      hint: "Distinct contributors",
      value: summary.uniqueVolunteers,
      animate: true,
      mobileClass: "rpt-metric-card--m-order-4",
    },
    {
      icon: "award",
      label: "Certificates issued",
      hint: "Earned by volunteers",
      value: summary.certificatesIssued,
      animate: true,
      mobileClass: "rpt-metric-card--m-order-5",
    },
    {
      icon: "trending-up",
      label: "Avg completion rate",
      hint: "Across missions with data",
      value: fmtPct(summary.avgCompletionRate),
      mint: true,
      mobileClass: "rpt-metric-card--m-order-6",
    },
  ];

  return (
    <div className="rpt-metric-rail">
      <div className="rpt-metric-grid card-grid-3" role="list" aria-label="Impact summary metrics">
        {cards.map((c) => (
        <article
          key={c.label}
          className={`rpt-metric-card${c.warm ? " rpt-metric-card--warm" : ""}${c.mobileClass ? ` ${c.mobileClass}` : ""}`}
          role="listitem"
          style={{ "--rpt-accent": c.warm ? "rgba(232, 84, 63, 0.65)" : c.mint ? "rgba(31, 174, 130, 0.55)" : "rgba(24, 32, 59, 0.2)" } as CSSProperties}
        >
          <div className="rpt-metric-head">
            {c.animate && typeof c.value === "number" ? (
              <AnimatedCount
                value={c.value}
                className={`rpt-metric-value${c.warm ? " rpt-metric-value--warm" : ""}${c.mint ? " rpt-metric-value--mint" : ""}`}
              />
            ) : (
              <div className={`rpt-metric-value${c.warm ? " rpt-metric-value--warm" : ""}${c.mint ? " rpt-metric-value--mint" : ""}`}>
                {c.value}
              </div>
            )}
            <div className={`rpt-metric-icon${c.warm ? " rpt-metric-icon--warm" : ""}${c.mint ? " rpt-metric-icon--mint" : ""}`}>
              <Icon name={c.icon} size={18} />
            </div>
          </div>
          <div className="rpt-metric-label">{c.label}</div>
          <div className="rpt-metric-hint">{c.hint}</div>
        </article>
      ))}
      </div>
    </div>
  );
}
