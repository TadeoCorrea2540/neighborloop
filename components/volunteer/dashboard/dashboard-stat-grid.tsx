import Icon, { type IconName } from "@/components/icons";
import AnimatedCount from "./animated-count";

export type StatItem = {
  icon: IconName;
  value: number;
  label: string;
  hint: string;
  accent?: boolean;
};

export default function DashboardStatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="vol-stat-grid card-grid-4" role="list" aria-label="Mission activity summary">
      {stats.map((s) => (
        <article
          key={s.label}
          className={`vol-stat-card${s.accent ? " vol-stat-card--accent" : ""}`}
          role="listitem"
        >
          <div className="vol-stat-card-head">
            <AnimatedCount
              value={s.value}
              className="vol-stat-value"
              style={{ color: s.accent ? "var(--coral-deep)" : "var(--ink)" }}
            />
            <div className={`vol-stat-icon${s.accent ? "" : " vol-stat-icon--muted"}`}>
              <Icon name={s.icon} size={20} />
            </div>
          </div>
          <div className="vol-stat-label">{s.label}</div>
          <div className="vol-stat-hint">{s.hint}</div>
        </article>
      ))}
    </div>
  );
}
