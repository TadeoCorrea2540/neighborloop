import Icon, { type IconName } from "@/components/icons";
import AnimatedCount from "@/components/volunteer/dashboard/animated-count";

export type OrgStatItem = {
  icon: IconName;
  value: number;
  label: string;
  hint: string;
  warm?: boolean;
};

export default function OrganizationStatGrid({ stats }: { stats: OrgStatItem[] }) {
  return (
    <div className="org-stat-grid card-grid-4" role="list" aria-label="Organization metrics">
      {stats.map((s) => (
        <article
          key={s.label}
          className={`org-stat-card${s.warm ? " org-stat-card--warm" : ""}`}
          role="listitem"
        >
          <div className="org-stat-card-head">
            <AnimatedCount
              value={s.value}
              className="org-stat-value"
              style={{ color: s.warm ? "var(--coral-deep)" : "var(--ink)" }}
            />
            <div className={`org-stat-icon${s.warm ? " org-stat-icon--warm" : ""}`}>
              <Icon name={s.icon} size={18} />
            </div>
          </div>
          <div className="org-stat-label">{s.label}</div>
          <div className="org-stat-hint">{s.hint}</div>
        </article>
      ))}
    </div>
  );
}
