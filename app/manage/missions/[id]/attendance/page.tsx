import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOrganizer, UUID_RE } from "@/lib/auth/require-organizer";
import { getMissionAttendanceList } from "@/lib/data/attendance";
import { fmtDate, MissionStatusBadge } from "@/components/admin/badges";
import AttendanceRoster from "@/components/manage/attendance-roster";

export const dynamic = "force-dynamic";

export default async function MissionAttendancePage({ params }: { params: { id: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect(`/auth?next=/manage/missions/${params.id}/attendance`);
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }
  if (!UUID_RE.test(params.id)) notFound();

  const view = await getMissionAttendanceList(guard.orgId, params.id);
  if (!view) notFound();
  const { mission, roster } = view;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/manage/attendance" style={{ color: "var(--muted-3)" }}>Attendance</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>{mission.title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 23, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{mission.title}</h2>
            <MissionStatusBadge status={mission.status} />
          </div>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
            📅 {fmtDate(mission.startsAt)}{mission.estimatedHours != null ? ` · ~${mission.estimatedHours}h` : ""} · {roster.length} approved
          </p>
        </div>
        <Link href={`/manage/missions/${mission.id}/check-in`} style={{ fontSize: 13.5, fontWeight: 700, color: "var(--muted-1)", background: "#fff", border: "1px solid rgba(24,32,59,.12)", padding: "10px 16px", borderRadius: 12 }}>🔳 Check-in QR</Link>
      </div>

      <AttendanceRoster missionId={mission.id} estimatedHours={mission.estimatedHours} roster={roster} />
    </div>
  );
}
