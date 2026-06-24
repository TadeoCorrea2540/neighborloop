import Link from "next/link";
import Icon from "@/components/icons";
import { MissionStatusBadge } from "@/components/admin/badges";
import type { OrganizerMission } from "@/types/domain";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

function location(m: OrganizerMission): string {
  if (m.isVirtual) return "Virtual";
  return m.city || m.locationLabel || "Location TBA";
}

function healthTags(m: OrganizerMission): string[] {
  const tags: string[] = [];
  const now = Date.now();
  const start = new Date(m.startsAt).getTime();
  const hoursUntil = (start - now) / (1000 * 60 * 60);

  if (m.pendingCount > 0) tags.push("Applications waiting");
  if (m.status === "published" && hoursUntil > 0 && hoursUntil <= 48) tags.push("Starts soon");
  if (m.spotsLeft === 0 && m.volunteerCapacity != null) tags.push("Capacity full");
  if (m.status === "published" && m.approvedCount === 0) tags.push("Needs volunteers");
  if (m.status === "draft") tags.push("Draft — finish details");

  return tags.slice(0, 2);
}

export default function UpcomingMissionControlCard({ mission }: { mission: OrganizerMission }) {
  const spots =
    mission.volunteerCapacity == null
      ? "Open capacity"
      : mission.spotsLeft === 0
        ? "Full"
        : `${mission.spotsLeft} spots left`;
  const tags = healthTags(mission);

  return (
    <article className="org-mission-control">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, flex: 1, minWidth: 0 }}>{mission.title}</div>
        <MissionStatusBadge status={mission.status} />
      </div>

      <div className="org-mission-meta">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="calendar" size={12} />
          {fmtDate(mission.startsAt)}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="pin" size={12} />
          {location(mission)}
        </span>
        <span>
          {mission.approvedCount}
          {mission.volunteerCapacity != null ? `/${mission.volunteerCapacity}` : ""} approved · {mission.pendingCount} pending
        </span>
        <span>{spots}</span>
      </div>

      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 999,
                background: "#fff0ec",
                color: "var(--coral-deep)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="org-mission-actions">
        <Link href={`/manage/missions/${mission.id}/edit`} className="org-mission-action org-mission-action--primary">
          Manage
        </Link>
        <Link href={`/manage/missions/${mission.id}/applications`} className="org-mission-action">
          Applicants
        </Link>
        <Link href={`/manage/missions/${mission.id}/attendance`} className="org-mission-action">
          Attendance
        </Link>
        <Link href={`/manage/missions/${mission.id}/edit`} className="org-mission-action">
          Edit
        </Link>
      </div>
    </article>
  );
}
