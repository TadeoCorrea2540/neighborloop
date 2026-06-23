import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getOrganizerDashboardSummary } from "@/lib/data/organizer-dashboard";
import { getOrganizationMissionsWithCounts } from "@/lib/data/organization-missions";
import { getApplicationsForOrganization } from "@/lib/data/organization-applications";
import { getPrimaryOrganizationForUser } from "@/lib/data/organization-membership";
import type { MissionStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<MissionStatus, { label: string; bg: string; color: string }> = {
  draft: { label: "Draft", bg: "#f1f3f8", color: "#5a6685" },
  pending_review: { label: "Pending", bg: "#fff0dd", color: "#b9651b" },
  published: { label: "Published", bg: "#dff6ea", color: "#147a57" },
  paused: { label: "Paused", bg: "#fff0dd", color: "#b9651b" },
  closed: { label: "Closed", bg: "#e2effd", color: "#2b6cb0" },
  cancelled: { label: "Cancelled", bg: "#ffeae6", color: "#c0392b" },
  archived: { label: "Archived", bg: "#f1f3f8", color: "#5a6685" },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  // Fixed locale + timeZone so server and client render identically (no hydration mismatch).
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function initials(name: string | null): string {
  if (!name) return "V";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "V";
}

export default async function OrgDashboard() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/dashboard");
    // organizer with no org yet → onboarding
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const [org, summary, missions, applications] = await Promise.all([
    getPrimaryOrganizationForUser(guard.userId),
    getOrganizerDashboardSummary(guard.orgId),
    getOrganizationMissionsWithCounts(guard.orgId),
    getApplicationsForOrganization(guard.orgId),
  ]);

  const greeting = org?.name ? `Welcome back, ${org.name} 🌱` : "Welcome back 🌱";
  const pending = applications.filter((a) => a.status === "pending" || a.status === "waitlisted").slice(0, 4);
  const recentMissions = missions.slice(0, 4);

  const metrics = [
    { label: "Active missions", value: summary.activeMissions, color: "var(--ink)" },
    { label: "Drafts", value: summary.draftMissions, color: "var(--blue)" },
    { label: "Pending applications", value: summary.pendingApplications, color: "var(--coral-deep)" },
    { label: "Approved volunteers", value: summary.approvedVolunteers, color: "var(--mint)" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 25, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{greeting}</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
            {summary.activeMissions} active · {summary.pendingApplications} application{summary.pendingApplications === 1 ? "" : "s"} to review
            {summary.nextUpcoming ? ` · next: ${summary.nextUpcoming.title} (${fmtDate(summary.nextUpcoming.startsAt)})` : ""}
          </p>
        </div>
        <Link href="/manage/missions/new" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}>+ Create mission</Link>
      </div>

      {/* metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 18 }} className="card-grid-4">
        {metrics.map((m) => (
          <div key={m.label} style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid rgba(24,32,59,.05)" }}>
            <div style={{ fontSize: 13, color: "var(--muted-3)", fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-split">
        {/* pending applicants */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Pending applicants</div>
            <span style={{ fontSize: 12, color: "var(--coral-deep)", fontWeight: 700 }}>{summary.pendingApplications} to review</span>
          </div>
          {pending.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>No applications waiting. 🎉</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pending.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#bca6ff,#7a6bf5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                    {initials(p.volunteer?.displayName ?? null)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.volunteer?.displayName ?? "Volunteer"}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.missionTitle}</div>
                  </div>
                </div>
              ))}
              <Link href="/manage/applicants" style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--muted-1)", paddingTop: 4 }}>Review all applicants →</Link>
            </div>
          )}
        </div>

        {/* your missions */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, border: "1px solid rgba(24,32,59,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Your missions</div>
            <Link href="/manage/missions" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>Manage all →</Link>
          </div>
          {recentMissions.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "6px 0" }}>
              No missions yet. <Link href="/manage/missions/new" style={{ color: "var(--coral-deep)", fontWeight: 600 }}>Create your first →</Link>
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentMissions.map((m, i) => {
                const pill = STATUS_PILL[m.status];
                return (
                  <Link key={m.id} href={`/manage/missions/${m.id}/edit`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: i < recentMissions.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-3)" }}>{fmtDate(m.startsAt)} · {m.approvedCount}{m.volunteerCapacity != null ? `/${m.volunteerCapacity}` : ""} approved</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, ...pill }}>{pill.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
