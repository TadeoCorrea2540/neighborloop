import type { OrgCategorySlice } from "@/lib/data/analytics/organization";
import Icon from "@/components/icons";
import { ReportPanelEmpty } from "@/components/organization/reports/report-empty-state";

export default function CauseImpactBreakdown({ rows }: { rows: OrgCategorySlice[] }) {
  const totalHours = rows.reduce((s, r) => s + r.hours, 0);
  const top = rows[0];
  const insight =
    top && top.hours > 0
      ? `${top.name} generated most of your verified impact this period — ${top.hours}h across ${top.missions} mission${top.missions === 1 ? "" : "s"}.`
      : totalHours > 0
        ? `${totalHours} verified hours across ${rows.length} cause${rows.length === 1 ? "" : "s"}.`
        : null;

  return (
    <section className="impact-chart-panel" aria-labelledby="org-causes-heading">
      <div className="ioc-glow" aria-hidden />

      <div className="ioc-header">
        <div>
          <h3 id="org-causes-heading" className="impact-section-title">
            Impact by cause
          </h3>
          <p className="impact-section-sub" style={{ margin: 0 }}>
            Where your volunteer hours made a difference
          </p>
        </div>
        {rows.length > 0 ? (
          <div className="ioc-chips">
            <span className="ioc-chip ioc-chip--total">
              <Icon name="globe" size={13} strokeWidth={2.2} /> {rows.length} cause{rows.length === 1 ? "" : "s"}
            </span>
            {totalHours > 0 ? (
              <span className="ioc-chip ioc-chip--peak">
                <Icon name="clock" size={13} strokeWidth={2.2} /> {totalHours}h total
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <ReportPanelEmpty
          title="No cause breakdown yet"
          copy="Cause analytics will appear after your first completed mission."
        />
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((c) => (
              <div key={c.categoryId} className="impact-cause-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {c.hours}h · {c.missions} mission{c.missions === 1 ? "" : "s"}
                  </span>
                </div>
                <div
                  className="impact-cause-bar"
                  role="progressbar"
                  aria-valuenow={c.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${c.name}: ${c.pct}% of organization hours`}
                >
                  <span style={{ width: `${Math.max(4, c.pct)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {insight ? (
            <div className="ioc-insight">
              <span className="ioc-insight-icon" aria-hidden>
                <Icon name="sparkles" size={14} />
              </span>
              <span>{insight}</span>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
