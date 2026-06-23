import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getOrganizationAttendanceMissions } from "@/lib/data/attendance";
import { fmtDate, MissionStatusBadge } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

const card: React.CSSProperties = { background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "16px 18px" };

export default async function AttendancePage() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/attendance");
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const missions = await getOrganizationAttendanceMissions(guard.orgId);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Attendance</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
          Track check-ins, confirm hours, and issue certificates for your missions.
        </p>
      </div>

      {missions.length === 0 ? (
        <div style={{ ...card, padding: "44px 24px", textAlign: "center", color: "var(--muted-3)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>No missions to track yet</div>
          <p style={{ fontSize: 14, margin: "6px 0 0" }}>Publish a mission and approve volunteers — attendance shows up here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map((m) => (
            <div key={m.id} style={{ ...card, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15.5 }}>{m.title}</span>
                  <MissionStatusBadge status={m.status} />
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-3)", marginTop: 4 }}>📅 {fmtDate(m.startsAt)}</div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: "var(--muted-1)", textAlign: "center" }}>
                <span><strong style={{ display: "block", fontSize: 16 }}>{m.approvedCount}</strong>approved</span>
                <span><strong style={{ display: "block", fontSize: 16, color: "#147a57" }}>{m.checkedInCount}</strong>checked in</span>
                <span><strong style={{ display: "block", fontSize: 16, color: "var(--mint)" }}>{m.completedCount}</strong>completed</span>
                <span><strong style={{ display: "block", fontSize: 16, color: "#c0392b" }}>{m.noShowCount}</strong>no-show</span>
              </div>
              <Link href={`/manage/missions/${m.id}/attendance`} style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", background: "#18203b", padding: "10px 16px", borderRadius: 11 }}>Manage attendance</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
