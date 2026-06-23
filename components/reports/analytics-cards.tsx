/**
 * Presentational analytics building blocks (server-renderable, no client JS).
 * Reused by /manage/reports and the print report. Pure inline styles to match
 * the existing NeighborLoop card/bar/progress design.
 */
import { iconKeyToEmoji } from "@/lib/categories";
import type { OrgImpactSummary, OrgMissionPerformance, OrgCategorySlice, OrgVolunteerEngagement } from "@/lib/data/analytics/organization";

const MISSION_STATUS_LABEL: Record<string, string> = {
  published: "Published", paused: "Paused", closed: "Closed", archived: "Archived",
  cancelled: "Cancelled", draft: "Draft", pending_review: "Pending",
};

export function fmtPct(x: number | null | undefined): string {
  return x == null ? "—" : `${Math.round(x * 100)}%`;
}

export function fmtDateUTC(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function StatCard({ label, value, accent, sub }: { label: string; value: string | number; accent: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid rgba(24,32,59,.06)" }}>
      <div style={{ fontSize: 13, color: "var(--muted-3)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: accent }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted-3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function ImpactStatGrid({ summary }: { summary: OrgImpactSummary }) {
  const cards = [
    { label: "Missions hosted", value: summary.missionsHosted, accent: "var(--ink)" },
    { label: "Volunteer hours", value: summary.totalHours, accent: "#e8543f" },
    { label: "Completed attendances", value: summary.completedAttendances, accent: "var(--mint)" },
    { label: "Unique volunteers", value: summary.uniqueVolunteers, accent: "var(--blue)" },
    { label: "Certificates issued", value: summary.certificatesIssued, accent: "var(--lav)" },
    { label: "Avg completion rate", value: fmtPct(summary.avgCompletionRate), accent: "#1a8c66" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }} className="card-grid-3">
      {cards.map((c) => (
        <StatCard key={c.label} label={c.label} value={c.value} accent={c.accent} />
      ))}
    </div>
  );
}

export function MonthlyHoursChart({ data }: { data: { label: string; hours: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.hours));
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Monthly hours contributed</div>
      {data.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--muted-3)" }}>No confirmed hours in this period yet.</p>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 170 }}>
          {data.map((b) => (
            <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end", minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#1a8c66" }}>{b.hours}h</span>
              <div style={{ width: "100%", maxWidth: 40, borderRadius: "9px 9px 4px 4px", background: "linear-gradient(180deg,#8fe3bd,#1fae82)", height: `${Math.max(4, (b.hours / max) * 100)}%`, transition: "height .5s" }} />
              <span style={{ fontSize: 10.5, color: "var(--muted-3)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{b.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryBreakdown({ rows }: { rows: OrgCategorySlice[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Impact by cause</div>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--muted-3)" }}>Cause data appears once missions have confirmed hours.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {rows.map((c) => (
            <div key={c.categoryId}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{iconKeyToEmoji(c.iconKey)} {c.name}</span>
                <span style={{ color: "var(--muted-3)" }}>{c.hours}h · {c.missions} mission{c.missions === 1 ? "" : "s"}</span>
              </div>
              <div style={{ height: 9, borderRadius: 99, background: "#eef0f5", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${Math.max(3, c.pct)}%`, borderRadius: 99, background: c.accentColor ?? "#1fae82" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EngagementCard({ engagement }: { engagement: OrgVolunteerEngagement }) {
  const rows = [
    { label: "Unique volunteers", value: engagement.uniqueVolunteers },
    { label: "Returning volunteers", value: engagement.returningVolunteers, hint: "completed 2+ of your missions" },
    { label: "Returning rate", value: fmtPct(engagement.returningRate) },
    { label: "Avg hours / volunteer", value: engagement.avgHoursPerVolunteer == null ? "—" : `${engagement.avgHoursPerVolunteer}h` },
    { label: "No-shows", value: engagement.noShowCount },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Volunteer engagement</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "10px 0", borderBottom: i < rows.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
            <div>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.label}</span>
              {"hint" in r && r.hint && <div style={{ fontSize: 11.5, color: "var(--muted-3)" }}>{r.hint}</div>}
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{typeof r.value === "number" ? r.value.toLocaleString() : r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MissionPerformanceTable({ rows }: { rows: OrgMissionPerformance[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.05)", overflow: "hidden" }}>
      <div style={{ fontWeight: 700, fontSize: 16, padding: "18px 20px 0" }}>Mission performance</div>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--muted-3)", padding: "12px 20px 20px" }}>No missions in this period.</p>
      ) : (
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((m) => (
            <div key={m.missionId} style={{ border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "13px 15px", background: "#fbfcfe" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{fmtDateUTC(m.startsAt)} · {MISSION_STATUS_LABEL[m.status] ?? m.status}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#e8543f", whiteSpace: "nowrap" }}>{m.hours}h</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }} className="mp-stats">
                {[
                  { l: "Approved", v: m.approved },
                  { l: "Completed", v: m.completed },
                  { l: "No-shows", v: m.noShow },
                  { l: "Certs", v: m.certificates },
                  { l: "Completion", v: m.noShowRate == null ? "—" : fmtPct(1 - m.noShowRate) },
                ].map((s) => (
                  <div key={s.l} style={{ textAlign: "center", background: "#fff", borderRadius: 10, padding: "8px 4px", border: "1px solid rgba(24,32,59,.05)" }}>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>{typeof s.v === "number" ? s.v : s.v}</div>
                    <div style={{ fontSize: 10.5, color: "var(--muted-3)", fontWeight: 600 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              {m.capacity != null && (
                <div style={{ fontSize: 11.5, color: "var(--muted-3)", marginTop: 8 }}>
                  Capacity: {m.completed}/{m.capacity} filled{m.fillRate != null ? ` · ${fmtPct(m.fillRate)}` : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
