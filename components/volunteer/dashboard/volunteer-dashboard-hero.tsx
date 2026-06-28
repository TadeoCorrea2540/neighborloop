import Link from "next/link";
import Icon from "@/components/icons";

const MONTHLY_GOAL_HOURS = 30;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function VolunteerDashboardHero({
  greetingText,
  totalHours,
  nextTitle,
  nextStartsAt,
}: {
  greetingText: string;
  totalHours: number;
  nextTitle: string | null;
  nextStartsAt: string | null;
}) {
  const hoursToGoal = Math.max(0, MONTHLY_GOAL_HOURS - totalHours);
  const milestone =
    totalHours >= MONTHLY_GOAL_HOURS
      ? "You've reached your 30-hour impact milestone — keep the momentum going."
      : hoursToGoal === 1
        ? "You're 1 hour away from your next impact milestone."
        : `You're ${hoursToGoal} hours away from your next impact milestone.`;

  return (
    <section className="vol-dash-hero" aria-label="Dashboard overview">
      <span className="vol-dash-hero-glow" aria-hidden />
      <div className="vol-dash-hero-inner">
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-.03em", lineHeight: 1.15 }}>
            {greetingText}
          </h2>
          <p style={{ margin: "8px 0 0", color: "var(--muted-2)", fontSize: 15, lineHeight: 1.55, maxWidth: 520 }}>
            {milestone}
          </p>
          {nextTitle && nextStartsAt && (
            <span className="vol-dash-hero-chip" style={{ marginTop: 14 }}>
              <Icon name="calendar" size={14} style={{ color: "var(--coral-deep)" }} />
              Next: {nextTitle} · {fmtDate(nextStartsAt)}
            </span>
          )}
        </div>
        <div className="vol-dash-hero-cta">
          <div className="vol-dash-hero-actions">
            <Link href="/explore" className="btn-coral vol-dash-hero-btn">
              Find a mission
            </Link>
            <Link href="/impact" className="vol-btn-ghost vol-dash-hero-btn">
              View my impact
            </Link>
          </div>
          <Link href="/my-missions" className="vol-dash-upcoming-pill">
            <span className="vol-dash-upcoming-pill-shine" aria-hidden="true" />
            <span className="vol-dash-upcoming-pill-flare vol-dash-upcoming-pill-flare--l" aria-hidden="true" />
            <span className="vol-dash-upcoming-pill-flare vol-dash-upcoming-pill-flare--r" aria-hidden="true" />
            <Icon name="sparkles" size={14} strokeWidth={2.2} />
            <span>Upcoming Missions</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
