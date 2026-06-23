import Link from "next/link";
import { getAdminReports, type ReportStatus, type ReportTargetType } from "@/lib/data/admin-reports";
import { fmtDate, ReportStatusBadge, FilterChips } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

const STATUS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];
const TARGETS: { value: string; label: string }[] = [
  { value: "all", label: "All targets" },
  { value: "mission", label: "Missions" },
  { value: "organization", label: "Organizations" },
  { value: "user", label: "Users" },
];

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { status?: string | string[]; target?: string | string[] };
}) {
  const statusRaw = one(searchParams.status) ?? "all";
  const targetRaw = one(searchParams.target) ?? "all";
  const status = ["open", "reviewing", "resolved", "dismissed"].includes(statusRaw) ? (statusRaw as ReportStatus) : undefined;
  const targetType = ["mission", "organization", "user"].includes(targetRaw) ? (targetRaw as ReportTargetType) : undefined;

  const reports = await getAdminReports({ status, targetType });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Reports & moderation</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Triage reports filed against missions, organizations, and users.</p>
      </div>

      <FilterChips options={STATUS} active={statusRaw} hrefFor={(v) => `/admin/reports?status=${v}&target=${targetRaw}`} />
      <FilterChips options={TARGETS} active={targetRaw} hrefFor={(v) => `/admin/reports?status=${statusRaw}&target=${v}`} />

      {reports.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🚩</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No reports match this filter</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/admin/reports/${r.id}`}
              style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "15px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{r.reason}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f1f3f8", color: "#5a6685" }}>{r.targetType}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 3 }}>
                  {r.targetTitle} · reported by {r.reporterName ?? "unknown"} · {fmtDate(r.createdAt)}
                </div>
              </div>
              <ReportStatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
