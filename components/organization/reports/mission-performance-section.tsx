import type { OrgMissionPerformance } from "@/lib/data/analytics/organization";
import { fmtDateUTC, fmtPct } from "@/lib/reports/helpers";
import { ReportPanelEmpty } from "@/components/organization/reports/report-empty-state";

const MISSION_STATUS_LABEL: Record<string, string> = {
  published: "Published",
  paused: "Paused",
  closed: "Closed",
  archived: "Archived",
  cancelled: "Cancelled",
  draft: "Draft",
  pending_review: "Pending",
};

function statusClass(status: string) {
  if (status === "published") return "rpt-status-badge rpt-status-badge--published";
  if (status === "paused") return "rpt-status-badge rpt-status-badge--paused";
  return "rpt-status-badge";
}

function MissionCard({ m }: { m: OrgMissionPerformance }) {
  const completion = m.noShowRate == null ? "—" : fmtPct(1 - m.noShowRate);
  return (
    <article className="rpt-mission-card">
      <div className="rpt-mission-card-head">
        <div style={{ minWidth: 0 }}>
          <div className="rpt-mission-title" style={{ whiteSpace: "normal" }}>
            {m.title}
          </div>
          <div className="rpt-mission-meta">
            {fmtDateUTC(m.startsAt)} · <span className={statusClass(m.status)}>{MISSION_STATUS_LABEL[m.status] ?? m.status}</span>
          </div>
        </div>
        <span className="rpt-mission-stat rpt-mission-stat--hours">{m.hours}h</span>
      </div>
      <div className="rpt-mission-card-grid">
        {[
          { l: "Approved", v: m.approved },
          { l: "Checked in", v: m.checkedIn },
          { l: "Completed", v: m.completed },
          { l: "No-shows", v: m.noShow },
          { l: "Certs", v: m.certificates },
          { l: "Completion", v: completion },
        ].map((s) => (
          <div key={s.l} className="rpt-mission-mini">
            <div className="rpt-mission-mini-val">{s.v}</div>
            <div className="rpt-mission-mini-lbl">{s.l}</div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function MissionPerformanceSection({ rows }: { rows: OrgMissionPerformance[] }) {
  return (
    <section className="rpt-panel" aria-label="Mission performance">
      <div className="rpt-panel-head">
        <h2 className="rpt-panel-title">Mission performance</h2>
        {rows.length > 0 ? (
          <span className="rpt-panel-sub">{rows.length} mission{rows.length === 1 ? "" : "s"}</span>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <ReportPanelEmpty title="No missions in this period" copy="Hosted missions will appear here with attendance and hours." />
      ) : (
        <>
          <div className="rpt-mission-table-wrap">
            <table className="rpt-mission-table">
              <thead>
                <tr>
                  <th scope="col">Mission</th>
                  <th scope="col">Approved</th>
                  <th scope="col">Checked in</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Hours</th>
                  <th scope="col">Certs</th>
                  <th scope="col">Completion</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.missionId}>
                    <td className="rpt-mission-title-cell">
                      <div className="rpt-mission-title" title={m.title}>
                        {m.title}
                      </div>
                      <div className="rpt-mission-meta">
                        {fmtDateUTC(m.startsAt)} ·{" "}
                        <span className={statusClass(m.status)}>{MISSION_STATUS_LABEL[m.status] ?? m.status}</span>
                      </div>
                    </td>
                    <td><span className="rpt-mission-stat">{m.approved}</span></td>
                    <td><span className="rpt-mission-stat">{m.checkedIn}</span></td>
                    <td><span className="rpt-mission-stat">{m.completed}</span></td>
                    <td><span className="rpt-mission-stat rpt-mission-stat--hours">{m.hours}h</span></td>
                    <td><span className="rpt-mission-stat">{m.certificates}</span></td>
                    <td>
                      <span className="rpt-mission-stat">
                        {m.noShowRate == null ? "—" : fmtPct(1 - m.noShowRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rpt-mission-cards" aria-label="Mission performance cards">
            {rows.map((m) => (
              <MissionCard key={m.missionId} m={m} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
