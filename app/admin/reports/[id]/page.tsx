import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportDetailById } from "@/lib/data/admin-reports";
import { UUID_RE } from "@/lib/auth/require-admin";
import { fmtDate, ReportStatusBadge } from "@/components/admin/badges";
import ReportActions from "@/components/admin/report-actions";

export const dynamic = "force-dynamic";

const card: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(24,32,59,.06)", padding: 20 };
const dt: React.CSSProperties = { fontSize: 12, color: "var(--muted-3)", fontWeight: 600 };

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) notFound();
  const r = await getReportDetailById(params.id);
  if (!r) notFound();

  const targetHref =
    r.targetType === "mission" && r.targetSlug ? `/missions/${r.targetSlug}` :
    r.targetType === "organization" && r.targetSlug ? `/org/${r.targetSlug}` : null;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/admin/reports" style={{ color: "var(--muted-3)" }}>Reports</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>{r.reason}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 style={{ fontSize: 23, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{r.reason}</h2>
        <ReportStatusBadge status={r.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }} className="detail-split">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px" }}>Report</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-2col">
              <div><div style={dt}>TARGET TYPE</div><div style={{ fontSize: 14, marginTop: 2 }}>{r.targetType}</div></div>
              <div><div style={dt}>FILED</div><div style={{ fontSize: 14, marginTop: 2 }}>{fmtDate(r.createdAt)}</div></div>
              <div>
                <div style={dt}>TARGET</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>
                  {targetHref ? <a href={targetHref} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", fontWeight: 600 }}>{r.targetTitle} ↗</a> : r.targetTitle}
                </div>
              </div>
              <div><div style={dt}>REPORTER</div><div style={{ fontSize: 14, marginTop: 2 }}>{r.reporterName ?? "unknown"}</div></div>
            </div>
            {r.details && (
              <div style={{ marginTop: 14 }}>
                <div style={dt}>DETAILS</div>
                <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.5, background: "#fbfcfe", border: "1px solid rgba(24,32,59,.06)", borderRadius: 11, padding: "10px 12px" }}>{r.details}</div>
              </div>
            )}
            {r.internalNote && (
              <div style={{ marginTop: 14 }}>
                <div style={dt}>🔒 INTERNAL NOTE</div>
                <div style={{ fontSize: 13.5, marginTop: 4, color: "var(--muted-1)" }}>{r.internalNote}</div>
              </div>
            )}
          </div>

          {r.targetType === "mission" && (
            <div style={{ ...card, background: "#fbfcfe" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 4px" }}>Moderate this mission</h3>
              <p style={{ fontSize: 13, color: "var(--muted-2)", margin: "0 0 8px" }}>
                Mission moderation lives on the missions page so transitions stay in one place.
              </p>
              <Link href="/admin/missions" style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>Open mission moderation →</Link>
            </div>
          )}
        </div>

        <div>
          <ReportActions reportId={r.id} status={r.status} />
        </div>
      </div>
    </div>
  );
}
