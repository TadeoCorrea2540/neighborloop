import { getAdminUsers } from "@/lib/data/admin-users";
import { fmtDate, FilterChips } from "@/components/admin/badges";
import type { AppRole } from "@/types/database";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "volunteer", label: "Volunteers" },
  { value: "organizer", label: "Organizers" },
  { value: "admin", label: "Admins" },
];

const ROLE_PILL: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#ffeae6", color: "#c0392b" },
  organizer: { bg: "#e2effd", color: "#2b6cb0" },
  volunteer: { bg: "#dff6ea", color: "#147a57" },
};

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string | string[] };
}) {
  const roleRaw = (Array.isArray(searchParams.role) ? searchParams.role[0] : searchParams.role) ?? "all";
  const role = ["volunteer", "organizer", "admin"].includes(roleRaw) ? (roleRaw as AppRole) : undefined;
  const users = await getAdminUsers({ role });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Users</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Read-only overview. Only safe profile data — no emails or private contact info.</p>
      </div>

      <FilterChips options={FILTERS} active={roleRaw} hrefFor={(v) => `/admin/users?role=${v}`} />

      {users.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No users match this filter</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => {
            const pill = u.role ? ROLE_PILL[u.role] : { bg: "#f1f3f8", color: "#5a6685" };
            return (
              <div key={u.id} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#bca6ff,#7a6bf5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                  {initials(u.displayName)}
                </span>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{u.displayName}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted-3)" }}>
                    {u.isPublic ? (u.city ?? "Public profile") : "Private profile"} · joined {fmtDate(u.createdAt)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "var(--muted-3)" }}>
                  <span>{u.membershipCount} org{u.membershipCount === 1 ? "" : "s"}</span>
                  <span>{u.applicationCount} app{u.applicationCount === 1 ? "" : "s"}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: pill.bg, color: pill.color }}>{u.role ?? "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
