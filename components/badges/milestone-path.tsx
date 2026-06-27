import Icon from "@/components/icons";
import { JOURNEY_ORDER, MILESTONE_ICON } from "./milestone-meta";
import type { VolunteerMilestone } from "@/lib/data/analytics/volunteer";

const SHORT_LABEL: Record<string, string> = {
  first_mission: "First mission",
  ten_hours: "10 hours",
  certified: "Certificate",
  five_missions: "5 missions",
  three_causes: "3 causes",
  fifty_hours: "50 hours",
  hundred_hours: "100 hours",
};

export default function MilestonePath({
  milestones,
  nextKey,
}: {
  milestones: VolunteerMilestone[];
  nextKey: string | null;
}) {
  const byKey = new Map(milestones.map((m) => [m.key, m]));

  return (
    <section className="badges-path" aria-label="Achievement journey path">
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", letterSpacing: "-.02em" }}>
        Your achievement journey
      </h2>
      <div className="badges-path-track">
        {JOURNEY_ORDER.map((key) => {
          const m = byKey.get(key);
          if (!m) return null;
          const unlocked = m.achieved;
          const current = key === nextKey;
          const state = unlocked ? "unlocked" : current ? "current" : "";
          return (
            <div
              key={key}
              className={`badges-path-step${state ? ` badges-path-step--${state}` : ""}`}
              aria-label={`${SHORT_LABEL[key] ?? m.label}: ${unlocked ? "unlocked" : current ? "in progress" : "locked"}`}
            >
              <span className="badges-path-dot">
                <Icon name={MILESTONE_ICON[key] ?? "sparkles"} size={16} />
              </span>
              <span className="badges-path-label">{SHORT_LABEL[key] ?? m.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
