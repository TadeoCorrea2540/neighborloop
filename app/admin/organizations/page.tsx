import Link from "next/link";
import { getAdminOrganizations, type OrgFilter } from "@/lib/data/admin-organizations";
import { fmtDate, VerificationBadge, FilterChips } from "@/components/admin/badges";
import DefaultAvatar from "@/components/default-avatar";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "not_required", label: "Not required" },
];

function parseFilter(v: string | string[] | undefined): OrgFilter {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "pending" || s === "verified" || s === "rejected" || s === "not_required" ? s : "all";
}

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: { status?: string | string[] };
}) {
  const filter = parseFilter(searchParams.status);
  const orgs = await getAdminOrganizations(filter);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Organizations</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Every organization on the platform. Read-only overview.</p>
      </div>

      <FilterChips options={FILTERS} active={filter} hrefFor={(v) => `/admin/organizations?status=${v}`} />

      {orgs.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🏢</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No organizations match this filter</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orgs.map((o) => (
            <div key={o.id} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "15px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <DefaultAvatar size={40} radius={12} kind="org" />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  {o.isPublic ? (
                    <Link href={`/org/${o.slug}`} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{o.name}</Link>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{o.name}</span>
                  )}
                  <VerificationBadge status={o.verificationStatus} />
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 3 }}>
                  {o.type ?? "—"} · {[o.city, o.countryCode].filter(Boolean).join(", ") || "—"} · {o.memberCount} member{o.memberCount === 1 ? "" : "s"} · {o.missionCount} mission{o.missionCount === 1 ? "" : "s"} · joined {fmtDate(o.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
