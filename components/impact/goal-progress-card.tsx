import ImpactProgressRing from "@/components/volunteer/dashboard/impact-progress-ring";

const MONTHLY_GOAL_HOURS = 30;

export default function GoalProgressCard({ totalHours }: { totalHours: number }) {
  const pct = Math.min(100, Math.round((totalHours / MONTHLY_GOAL_HOURS) * 100));
  const remaining = Math.max(0, MONTHLY_GOAL_HOURS - totalHours);
  const milestone =
    totalHours >= MONTHLY_GOAL_HOURS
      ? "You've reached your 30-hour monthly milestone — incredible work."
      : remaining === 1
        ? "1 hour to your next monthly milestone."
        : `${remaining} hours to your next monthly milestone.`;

  return (
    <section className="impact-goal-band" aria-label="Monthly goal progress">
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Monthly goal</div>
        <div style={{ fontSize: 13, color: "var(--muted-2)", marginBottom: 10 }}>
          {totalHours}h / {MONTHLY_GOAL_HOURS}h completed · {milestone}
        </div>
        <div className="impact-goal-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ImpactProgressRing percent={pct} label={`${pct}%`} sub={`of ${MONTHLY_GOAL_HOURS}h`} />
    </section>
  );
}
