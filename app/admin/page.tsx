import Link from "next/link";
import { getAdminDashboardSummary } from "@/lib/data/admin-dashboard";
import { fmtDate, VerificationBadge, ReportStatusBadge } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 18, border: "1px solid rgba(24,32,59,.05)" };

function readableEvent(eventType: string): string {
  return eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminDashboard() {
  const s = await getAdminDashboardSummary();

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
