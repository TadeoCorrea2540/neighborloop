import Link from "next/link";
import Icon from "@/components/icons";
import { VerificationBadge } from "@/components/admin/badges";
import type { VerificationStatus } from "@/types/database";

function timeGreeting(): string {
  const h = new Date().getUTCHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function OrganizationDashboardHero({
  orgName,
  verificationStatus,
  activeMissions,
  pendingApplications,
  draftMissions,
  nextUpcomingTitle,
  nextUpcomingDate,
}: {
  orgName: string;
  verificationStatus: VerificationStatus;
  activeMissions: number;
  pendingApplications: number;
  draftMissions: number;
  nextUpcomingTitle: string | null;
  nextUpcomingDate: string | null;
}) {
  const parts: string[] = [];
  parts.push(`${activeMissions} active mission${activeMissions === 1 ? "" : "s"}`);
  if (pendingApplications > 0) {
    parts.push(`${pendingApplications} pending applicant${pendingApplications === 1 ? "" : "s"}`);
  }
  if (nextUpcomingTitle) {
    parts.push(`next event: ${nextUpcomingTitle}`);
  } else if (draftMissions > 0) {
    parts.push(`${draftMissions} draft${draftMissions === 1 ? "" : "s"} to finish`);
  }

  const summary = parts.join(" · ");

  return (
    <section className="org-dash-hero" aria-label="Organizer command center">
      <span className="org-dash-hero-glow" aria-hidden />
      <div className="org-dash-hero-inner">
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.03em", lineHeight: 1.15 }}>
              {timeGreeting()}, {orgName}
            </h2>
            <VerificationBadge status={verificationStatus} />
          </div>
          <p style={{ margin: 0, color: "var(--muted-2)", fontSize: 14.5, lineHeight: 1.55, maxWidth: 560 }}>
            {summary || "Your organizer workspace — create missions and bring volunteers together."}
          </p>
          {nextUpcomingTitle && nextUpcomingDate && (
            <span className="org-dash-hero-chip" style={{ marginTop: 12 }}>
              <Icon name="calendar" size={14} style={{ color: "var(--ink)" }} />
              Upcoming: {nextUpcomingTitle} · {nextUpcomingDate}
            </span>
          )}
        </div>
        <div className="org-dash-hero-actions">
          <Link
            href="/manage/missions/new"
            className="btn-coral"
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 20px",
              borderRadius: 12,
              boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
              textDecoration: "none",
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Create mission
          </Link>
          <Link href="/manage/applicants" className="org-btn-ghost">
            View applicants
          </Link>
        </div>
      </div>
    </section>
  );
}
