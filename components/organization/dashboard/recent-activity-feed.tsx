import Link from "next/link";

export type ActivityFeedItem = {
  id: string;
  text: string;
  at: string;
  href?: string;
};

function fmtRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function RecentActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  return (
    <section className="org-panel" aria-labelledby="activity-heading">
      <h3 id="activity-heading" style={{ fontWeight: 800, fontSize: 17, margin: "0 0 4px", letterSpacing: "-.02em" }}>
        Recent activity
      </h3>
      <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "0 0 14px" }}>
        Applications and mission updates from your organization
      </p>

      {items.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: 0, lineHeight: 1.55 }}>
          Activity from applications and published missions will show up here as your organization grows.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} className="org-activity-row">
              <span className="org-activity-dot" aria-hidden />
              <div style={{ flex: 1, minWidth: 0 }}>
                {item.href ? (
                  <Link href={item.href} style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}>
                    {item.text}
                  </Link>
                ) : (
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{item.text}</span>
                )}
                <div style={{ fontSize: 11.5, color: "var(--muted-3)", marginTop: 2 }}>{fmtRelative(item.at)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
