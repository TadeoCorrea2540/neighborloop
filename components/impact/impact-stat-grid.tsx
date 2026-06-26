import Icon, { type IconName } from "@/components/icons";
import AnimatedCount from "@/components/volunteer/dashboard/animated-count";

export type ImpactStatItem = {
  icon: IconName;
  value: number;
  label: string;
  hint: string;
  warm?: boolean;
};

export default function ImpactStatGrid({ stats }: { stats: ImpactStatItem[] }) {
  return (
    <div className="impact-stat-grid card-grid-4" role="list" aria-label="Impact statistics">
      {stats.map((s) => (
        <article
          key={s.label}
          className={`impact-stat-card${s.warm ? " impact-stat-card--warm" : ""}`}
          role="listitem"
        >
          <div className="impact-stat-head">
            <AnimatedCount
              value={s.value}
              className="impact-stat-value"
              style={{ color: s.warm ? "var(--coral-deep)" : "var(--ink)" }}
            />
            <div className={`impact-stat-icon${s.warm ? " impact-stat-icon--warm" : ""}`}>
              <Icon name={s.icon} size={17} />
            </div>
          </div>
          <div className="impact-stat-label">{s.label}</div>
          <div className="impact-stat-hint">{s.hint}</div>
        </article>
      ))}
    </div>
  );
}
