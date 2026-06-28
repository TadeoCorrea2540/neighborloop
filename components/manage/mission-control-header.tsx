import Link from "next/link";
import Icon from "@/components/icons";
import type { MissionStatus } from "@/types/database";
import "./edit-mission.css";

const STATUS_BADGE: Record<MissionStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "me-badge me-badge--draft" },
  pending_review: { label: "Pending review", className: "me-badge me-badge--pending" },
  published: { label: "Published", className: "me-badge me-badge--published" },
  paused: { label: "Paused", className: "me-badge me-badge--pending" },
  closed: { label: "Closed", className: "me-badge me-badge--closed" },
  cancelled: { label: "Cancelled", className: "me-badge me-badge--cancelled" },
  archived: { label: "Archived", className: "me-badge me-badge--draft" },
};

function metaLine(status: MissionStatus, pending: number): string {
  const parts: string[] = [];
  if (status === "published") parts.push("Public page available");
  else if (status === "draft" || status === "pending_review") parts.push("Not visible on Explore yet");
  else if (status === "paused") parts.push("Hidden from new applicants");
  else if (status === "closed") parts.push("No longer accepting volunteers");
  else if (status === "cancelled") parts.push("Mission cancelled");
  else if (status === "archived") parts.push("Archived in your dashboard");

  if (pending > 0) {
    parts.push(`${pending} applicant${pending === 1 ? "" : "s"} to review`);
  }
  return parts.join(" · ");
}

export default function MissionControlHeader({
  missionId,
  missionTitle,
  status,
  publicSlug,
  pendingApplicants,
}: {
  missionId: string;
  missionTitle: string;
  status: MissionStatus;
  publicSlug: string;
  pendingApplicants: number;
}) {
  const badge = STATUS_BADGE[status];
  const meta = metaLine(status, pendingApplicants);

  return (
    <header className="me-header">
      <div className="me-header-glow" aria-hidden />

      <nav className="me-breadcrumb" aria-label="Breadcrumb">
        <Link href="/manage/missions">Missions</Link>
        <span className="me-breadcrumb-sep" aria-hidden>/</span>
        <span className="me-breadcrumb-current">{missionTitle}</span>
      </nav>

      <div className="me-header-main">
        <div className="me-header-copy">
          <p className="me-eyebrow">Mission control</p>
          <h1 className="me-title">{missionTitle}</h1>
          <p className="me-meta">{meta}</p>
        </div>
        <span className={badge.className}>{badge.label}</span>
      </div>

      <div className="me-quick-actions" role="toolbar" aria-label="Mission quick actions">
        {status === "published" && (
          <a
            href={`/missions/${publicSlug}`}
            target="_blank"
            rel="noreferrer"
            className="me-action-link"
          >
            <Icon name="globe" size={16} />
            View public page
          </a>
        )}
        <Link href={`/manage/missions/${missionId}/reports`} className="me-action-link">
          <Icon name="bar-chart" size={16} />
          Report
        </Link>
        <Link href={`/manage/missions/${missionId}/updates`} className="me-action-link">
          <Icon name="megaphone" size={16} />
          Updates
        </Link>
        <Link href={`/manage/missions/${missionId}/applications`} className="me-action-link">
          <Icon name="clipboard" size={16} />
          Review applicants
          {pendingApplicants > 0 ? (
            <span className="me-action-badge">{pendingApplicants}</span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
