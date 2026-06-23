import type { CSSProperties } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { UUID_RE } from "@/lib/auth/require-organizer";
import { getMissionAnalytics } from "@/lib/data/analytics/mission";
import { fmtPct, fmtDateUTC } from "@/components/reports/analytics-cards";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", pending_review: "Pending review", published: "Published", paused: "Paused",
  closed: "Closed", cancelled: "Cancelled", archived: "Archived",
};

export default async function MissionReport({ params }: { params: { id: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect(guard.code === "auth" ? `/auth?next=/manage/missions/${params.id}/reports` : "/dashboard");
  }
  if (!UUID_RE.test(params.id)) notFound();

  const a = await getMissionAnalytics(guard.orgId, params.id);
  if (!a) notFound(); // not this org's mission (also enforced by RLS)

  const fmax = Math.max(1, a.funnel.applied);
  const stages = [
    { label: "Applied", value: a.funnel.applied, color: "#7a6bf5" },
    { label: "Approved", value: a.funnel.approved, color: "#3a8bf0" },
    { label: "Checked in", value: a.funnel.checkedIn, color: "#ff8a3c" },
    { label: "Completed", value: a.funnel.completed, color: "#1fae82" },
    { label: "Certificates issued", value: a.funnel.certificates, color: "#e8543f" },
  ];

  const attendance = [
    { l: "Registered", v: a.attendance.registered },
    { l: "Checked in", v: a.attendance.checkedIn },
    { l: "Checked out", v: a.attendance.checkedOut },
    { l: "Completed", v: a.attendance.completed },
    { l: "No-show", v: a.attendance.noShow },
    { l: "Excused", v: a.attendance.excused },
    { l: "Cancelled", v: a.attendance.cancelled },
  ];

  const rates = [
    { l: "Total hours", v: `${a.totalHours}h`, c: "#e8543f" },
    { l: "Capacity filled", v: a.mission.capacity == null ? "Open" : `${a.funnel.completed}/${a.mission.capacity}`, c: "var(--blue)" },
    { l: "Approval rate", v: fmtPct(a.approvalRate), c: "var(--lav)" },
    { l: "No-show rate", v: fmtPct(a.noShowRate), c: "var(--coral-deep)" },
  ];

  const card: CSSProperties = { background: "#fff", borderRadius: 18, padding: 22, border: "1px solid rgba(24,32,59,.05)" };

  return (
    <div>
      {/* header */}
      <div style={{ marginBottom: 18 }}>
        <Link href={`/manage/missions/${params.id}/edit`} style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>← Back to mission</Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>{a.mission.title}</h2>
            <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
              Mission report · {STATUS_LABEL[a.mission.status] ?? a.mission.status} · {fmtDateUTC(a.mission.startsAt)}
            </p>
          </div>
          <Link href={`/manage/missions/${params.id}/attendance`} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#18203b", padding: "9px 14px", borderRadius: 11 }}>Manage attendance</Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* application funnel */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Application funnel</div>
          <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "0 0 18px" }}>From application through to certificate</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stages.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 130, fontSize: 13.5, fontWeight: 600, color: "var(--muted-1)", flexShrink: 0 }}>{s.label}</div>
                <div style={{ flex: 1, height: 26, borderRadius: 8, background: "#f1f3f8", overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "100%", width: `${Math.max(2, (s.value / fmax) * 100)}%`, background: s.color, borderRadius: 8, transition: "width .5s" }} />
                </div>
                <div style={{ width: 40, textAlign: "right", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* attendance + rates */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="dash-split">
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Attendance summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }} className="card-grid-4">
              {attendance.map((s) => (
                <div key={s.l} style={{ textAlign: "center", background: "#fbfcfe", borderRadius: 12, padding: "12px 6px", border: "1px solid rgba(24,32,59,.05)" }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-3)", fontWeight: 600 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Key metrics</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {rates.map((r, i) => (
                <div key={r.l} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "11px 0", borderBottom: i < rates.length - 1 ? "1px solid rgba(24,32,59,.05)" : "none" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.l}</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: r.c }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
