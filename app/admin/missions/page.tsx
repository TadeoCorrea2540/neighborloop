import { getAdminMissions } from "@/lib/data/admin-missions";
import { fmtDate, MissionStatusBadge, FilterChips } from "@/components/admin/badges";
import MissionModeration from "@/components/admin/mission-moderation";
import type { MissionStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "pending_review", label: "Pending review" },
  { value: "paused", label: "Paused" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "reported", label: "Reported" },
];

const STATUSES: MissionStatus[] = ["draft", "pending_review", "published", "paused", "closed", "cancelled", "archived"];

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "all";
}

export default async function AdminMissionsPage({
  searchParams,
}: {
  searchParams: { filter?: string | string[] };
}) {
  const filter = one(searchParams.filter);
  const reportedOnly = filter === "reported";
  const status = STATUSES.includes(filter as MissionStatus) ? (filter as MissionStatus) : undefined;
  const missions = await getAdminMissions({ status, reportedOnly });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Mission moderation</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>Review and moderate missions across every organization.</p>
      </div>

      <FilterChips options={FILTERS} active={filter} hrefFor={(v) => `/admin/missions?filter=${v}`} />

      {missions.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 16, padding: "40px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-1)" }}>No missions match this filter</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map((m) => (
            <div key={m.id} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "15px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</span>
                    <MissionStatusBadge status={m.status} />
                    {m.reportCount > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#ffeae6", color: "#c0392b" }}>🚩 {m.reportCount}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 3 }}>
                    {m.orgName} · {m.categoryName ?? "—"} · {fmtDate(m.startsAt)} · {m.approvedCount}{m.volunteerCapacity != null ? `/${m.volunteerCapacity}` : ""} approved
                  </div>
                </div>
                <MissionModeration missionId={m.id} status={m.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
