import Link from "next/link";
import Icon from "@/components/icons";
import type { VolunteerMilestone } from "@/lib/data/analytics/volunteer";

export default function BadgesHero({
  unlocked,
  total,
  nextLabel,
}: {
  unlocked: number;
  total: number;
  nextLabel: string | null;
}) {
  return (
    <section className="badges-hero" aria-label="Milestones and rewards">
      <span className="badges-hero-glow" aria-hidden />
      <div className="badges-hero-inner">
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.03em", lineHeight: 1.15 }}>
            Milestones &amp; Rewards
          </h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted-2)", fontSize: 14.5, lineHeight: 1.55, maxWidth: 520 }}>
            Keep showing up — every mission builds your impact story. Badges unlock from real completed missions and
            confirmed hours.
          </p>
          <span className="badges-unlock-chip">
            <Icon name="award" size={15} />
            {unlocked} of {total} unlocked
            {nextLabel ? ` · Next: ${nextLabel}` : ""}
          </span>
        </div>
        <div className="badges-hero-actions">
          <Link
            href="/explore"
            className="btn-coral"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 20px",
              borderRadius: 12,
              boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)",
              textDecoration: "none",
              minHeight: 44,
            }}
          >
            <Icon name="sparkles" size={15} />
            Find a mission
          </Link>
          <Link href="/impact" className="badges-btn-ghost">
            View impact
          </Link>
        </div>
      </div>
    </section>
  );
}
