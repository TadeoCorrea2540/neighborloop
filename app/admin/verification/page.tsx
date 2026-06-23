import Link from "next/link";
import { getOrganizationVerifications, type VerificationFilter } from "@/lib/data/admin-verification";
import { fmtDate, VerificationBadge, FilterChips } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

const FILTERS: { value: VerificationFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

function parseFilter(v: string | string[] | undefined): VerificationFilter {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "verified" || s === "rejected" || s === "all" || s === "pending" ? s : "pending";
}

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: { status?: string | string[] };
}) {
  const filter = parseFilter(searchParams.status);
  const items = await getOrganizationVerifications(filter);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Organization verification</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Review requests and approve or reject organizations.</p>
      </div>

      <FilterChips options={FILTERS} active={filter} hrefFor={(v) => `/admin/verification?status=${v}`} />

      {items.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🏛️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No {filter === "all" ? "" : filter + " "}verification records</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((v) => (
            <Link
              key={v.id}
              href={`/admin/verification/${v.id}`}
              style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "15px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
            >
              <span style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#8fe3bd,#1fae82)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{v.orgName}</div>
                <div style={{ fontSize: 13, color: "var(--muted-3)" }}>
                  {v.orgType ?? "—"} · {v.city ?? "—"} · submitted {fmtDate(v.submittedAt)}
                </div>
              </div>
              <VerificationBadge status={v.status} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#18203b", padding: "8px 14px", borderRadius: 10 }}>Review</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
