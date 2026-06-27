import { CATEGORY_ORDER, MILESTONE_CATEGORY } from "./milestone-meta";
import BadgeCard from "./badge-card";
import type { VolunteerMilestone } from "@/lib/data/analytics/volunteer";

export default function BadgeGrid({ milestones }: { milestones: VolunteerMilestone[] }) {
  const grouped = new Map<string, VolunteerMilestone[]>();
  for (const m of milestones) {
    const cat = MILESTONE_CATEGORY[m.key] ?? "Community milestones";
    const list = grouped.get(cat) ?? [];
    list.push(m);
    grouped.set(cat, list);
  }

  return (
    <div>
      {CATEGORY_ORDER.map((category) => {
        const items = grouped.get(category);
        if (!items?.length) return null;
        return (
          <section key={category} style={{ marginBottom: 22 }}>
            <h2 className="badges-category-title">{category}</h2>
            <ul className="badges-grid card-grid-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((m) => (
                <BadgeCard key={m.key} milestone={m} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
