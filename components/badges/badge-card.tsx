import Icon from "@/components/icons";
import { MILESTONE_DESC, MILESTONE_ICON } from "./milestone-meta";
import type { VolunteerMilestone } from "@/lib/data/analytics/volunteer";

function pct(current: number, target: number): number {
  return target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
}

type BadgeState = "unlocked" | "progress" | "locked";

function badgeState(m: VolunteerMilestone): BadgeState {
  if (m.achieved) return "unlocked";
  if (m.current > 0) return "progress";
  return "locked";
}

export default function BadgeCard({ milestone }: { milestone: VolunteerMilestone }) {
  const state = badgeState(milestone);
  const progress = pct(milestone.current, milestone.target);
  const desc = MILESTONE_DESC[milestone.key] ?? "Earn this badge through real volunteer impact.";

  return (
    <li
      className={`badges-card badges-card--${state}`}
      aria-label={`${milestone.label}: ${state === "unlocked" ? "Unlocked" : state === "progress" ? "In progress" : "Locked"}`}
    >
      <div className={`badges-emblem badges-emblem--${state}`}>
        <Icon name={MILESTONE_ICON[milestone.key] ?? "sparkles"} size={state === "locked" ? 26 : 30} strokeWidth={2} />
      </div>

      <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 14, lineHeight: 1.3 }}>{milestone.label}</div>

      <span className={`badges-status badges-status--${state}`}>
        {state === "unlocked" && (
          <>
            <Icon name="check" size={12} strokeWidth={2.6} />
            Unlocked
          </>
        )}
        {state === "progress" && (
          <>
            {Math.min(milestone.current, milestone.target)} / {milestone.target} · In progress
          </>
        )}
        {state === "locked" && <>Locked · 0 / {milestone.target}</>}
      </span>

      {state !== "unlocked" && (
        <div className="badges-card-progress" aria-hidden>
          <span style={{ width: `${Math.max(4, progress)}%` }} />
        </div>
      )}

      <details className="badges-card-details">
        <summary>View details</summary>
        <p style={{ fontSize: 12.5, color: "var(--muted-2)", margin: "8px 0 0", lineHeight: 1.5 }}>{desc}</p>
        <p style={{ fontSize: 11.5, color: "var(--muted-3)", margin: "6px 0 0", fontWeight: 600 }}>
          Requirement: {milestone.target} {milestone.key.includes("hours") ? "hours" : milestone.key.includes("causes") ? "causes" : milestone.key === "certified" ? "certificate" : "missions"}
        </p>
      </details>
    </li>
  );
}
