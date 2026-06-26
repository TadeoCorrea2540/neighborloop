import Link from "next/link";
import Icon, { type IconName } from "@/components/icons";
import type { VolunteerMilestone } from "@/lib/data/analytics/volunteer";

const MILESTONE_ICON: Record<string, IconName> = {
  first_mission: "sparkles",
  five_missions: "target",
  ten_hours: "clock",
  fifty_hours: "bar-chart",
  hundred_hours: "award",
  three_causes: "compass",
  certified: "check-circle",
};

export default function MilestonesPanel({ milestones }: { milestones: VolunteerMilestone[] }) {
  const achieved = milestones.filter((m) => m.achieved).length;

  return (
    <section aria-labelledby="milestones-heading">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h2 id="milestones-heading" className="impact-section-title">
            Milestones
          </h2>
          <p className="impact-section-sub" style={{ margin: 0 }}>
            {achieved} of {milestones.length} unlocked
          </p>
        </div>
        <Link href="/badges" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--coral-deep)" }}>
          All badges →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }} className="card-grid-3">
        {milestones.map((m) => {
          const icon = MILESTONE_ICON[m.key] ?? "sparkles";
          return (
            <article
              key={m.key}
              className={`impact-milestone${m.achieved ? " impact-milestone--achieved" : ""}`}
            >
              <span className="impact-milestone-icon">
                <Icon name={icon} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: m.achieved ? "var(--ink)" : "var(--muted-2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: m.achieved ? "var(--mint)" : "var(--muted-3)",
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  {m.achieved ? "Unlocked" : `${Math.min(m.current, m.target)} / ${m.target}`}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
