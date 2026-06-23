import type { CSSProperties } from "react";
import Link from "next/link";
import { getAdminDashboardSummary } from "@/lib/data/admin-dashboard";
import {
  getAdminImpactAdditions,
  getTopOrganizationsByHours,
  getTopMissionsByHours,
  getCategoryParticipation,
  getAdminModerationSummary,
} from "@/lib/data/analytics/admin";
import { iconKeyToEmoji } from "@/lib/categories";
import { fmtDate, VerificationBadge, ReportStatusBadge } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

const card: CSSProperties = { background: "#fff", borderRadius: 16, padding: 18, border: "1px solid rgba(24,32,59,.05)" };

function readableEvent(eventType: string): string {
  return eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminDashboard() {
  const [s, impact, topOrgs, topMissions, categories, moderation] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminImpactAdditions(),
    getTopOrganizationsByHours("all_time", 6),
    getTopMissionsByHours("all_time", 6),
    getCategoryParticipation(),
    getAdminModerationSummary(),
  ]);

  const impactCards = [
    { label: "Volunteer hours", value: impact.totalHours, color: "#e8543f" },
    { label: "Completed attendances", value: impact.completedAttendances, color: "var(--mint)" },
    { label: "Certificates issued", value: impact.certificatesIssued, color: "var(--lav)" },
    { label: "Active volunteers", value: impact.uniqueActiveVolunteers, color: "var(--blue)" },
  ];

  const metrics = [
    { label: "Total users", value: s.totalUsers, sub: `${s.volunteers} volunteers · ${s.organizers} organizers`, color: "var(--ink)" },
    { label: "Organizations", value: s.totalOrganizations, sub: `${s.pendingVerifications} pending review`, color: "var(--blue)" },
    { label: "Published missions", value: s.publishedMissions, sub: `${s.draftMissions} draft / pending`, color: "var(--mint)" },
    { label: "Open reports", value: s.openReports, sub: `${s.resolvedReports} resolved`, color: s.openReports > 0 ? "#c0392b" : "var(--muted-1)" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Platform overview</h2>
        <p style={{ margin: "3px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
          {s.applicationsSubmitted.toLocaleString()} applications submitted · {s.admins} admin{s.admins === 1 ? "" : "s"}
        </p>
      </div>

      {/* metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }} className="card-grid-4">
        {metrics.map((m) => (
          <div key={m.label} style={card}>
            <div style={{ fontSize: 13, color: "var(--muted-3)", fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: m.color }}>{m.value.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "var(--muted-3)", fontWeight: 600, marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* platform impact (real) */}
      <div style={{ fontWeight: 700, fontSize: 16, margin: "2px 0 12px" }}>Platform impact</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }} className="card-grid-4">
        {impactCards.map((m) => (
          <div key={m.label} style={card}>
            <div style={{ fontSize: 13, color: "var(--muted-3)", fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: m.color }}>{m.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* leaderboards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="dash-split">
        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Organizations with most impact</div>
          {topOrgs.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>No confirmed hours yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {topOrgs.map((o, i) => (
                <div key={o.orgId} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: i < topOrgs.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                  <span style={{ width: 22, fontSize: 13, fontWeight: 800, color: "var(--muted-3)" }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{o.completedAttendances} completed</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#e8543f" }}>{o.hours}h</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Missions with most hours</div>
          {topMissions.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>No confirmed hours yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {topMissions.map((m, i) => (
                <div key={m.missionId} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: i < topMissions.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                  <span style={{ width: 22, fontSize: 13, fontWeight: 800, color: "var(--muted-3)" }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.orgName}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#e8543f" }}>{m.hours}h</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* category participation + moderation summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }} className="dash-split">
        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Participation by cause</div>
          {categories.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>No category data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {categories.slice(0, 6).map((c) => {
                const max = Math.max(1, ...categories.map((x) => x.hours));
                return (
                  <div key={c.categoryId}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600 }}>{iconKeyToEmoji(c.iconKey)} {c.name}</span>
                      <span style={{ color: "var(--muted-3)", fontWeight: 700 }}>{c.hours}h · {c.missions} mission{c.missions === 1 ? "" : "s"}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "#eef0f5", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${Math.max(3, (c.hours / max) * 100)}%`, borderRadius: 99, background: c.accentColor ?? "#1fae82" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Moderation summary</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { l: "Open reports", v: moderation.openReports, c: moderation.openReports > 0 ? "#c0392b" : "var(--ink)" },
              { l: "Reviewing", v: moderation.reviewingReports, c: "var(--ink)" },
              { l: "Resolved", v: moderation.resolvedReports, c: "var(--mint)" },
              { l: "Dismissed", v: moderation.dismissedReports, c: "var(--muted-1)" },
              { l: "Audit events", v: moderation.auditEvents, c: "var(--ink)" },
            ].map((r, i, arr) => (
              <div key={r.l} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.l}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: r.c }}>{r.v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-split">
        {/* verification queue */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Verification queue</div>
            <Link href="/admin/verification" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted-1)" }}>View all →</Link>
          </div>
          {s.verificationQueue.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>No organizations awaiting review. 🎉</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {s.verificationQueue.map((v) => (
                <Link key={v.id} href={`/admin/verification/${v.id}`} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#8fe3bd,#1fae82)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{v.orgName}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{v.city ?? "—"} · submitted {fmtDate(v.submittedAt)}</div>
                  </div>
                  <VerificationBadge status={v.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* recent reports */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Recent reports</div>
            <Link href="/admin/reports" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted-1)" }}>View all →</Link>
          </div>
          {s.recentReports.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>No reports filed.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {s.recentReports.map((r) => (
                <Link key={r.id} href={`/admin/reports/${r.id}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{r.targetType} · {r.targetTitle}</div>
                  </div>
                  <ReportStatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* recent admin actions */}
      <div style={{ ...card, padding: 20, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Recent admin actions</div>
          <Link href="/admin/audit" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted-1)" }}>Audit log →</Link>
        </div>
        {s.recentAudit.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>No admin actions recorded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {s.recentAudit.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < s.recentAudit.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{readableEvent(a.eventType)}</span>
                <span style={{ fontSize: 12.5, color: "var(--muted-3)" }}>{a.actorName ?? "—"}</span>
                <span style={{ fontSize: 12.5, color: "var(--muted-3)", minWidth: 90, textAlign: "right" }}>{fmtDate(a.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
