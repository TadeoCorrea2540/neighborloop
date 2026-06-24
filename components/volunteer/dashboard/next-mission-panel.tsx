import Link from "next/link";
import Icon from "@/components/icons";
import DashboardEmptyState from "./dashboard-empty-state";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const READINESS = [
  { key: "approved", label: "Approved", icon: "check-circle" as const },
  { key: "date", label: "Date confirmed", icon: "calendar" as const },
  { key: "cert", label: "Certificate eligible", icon: "award" as const },
];

export default function NextMissionPanel({
  next,
}: {
  next: { slug: string; title: string; startsAt: string } | null;
}) {
  return (
    <section className="vol-panel" aria-labelledby="next-mission-heading">
      <h3 id="next-mission-heading" style={{ fontWeight: 800, fontSize: 17, margin: "0 0 14px", letterSpacing: "-.02em" }}>
        Next mission
      </h3>

      {next ? (
        <div className="vol-next-mission">
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--mint)",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#dff6ea",
            }}
          >
            <Icon name="check" size={13} strokeWidth={2.4} />
            Approved
          </span>

          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 10, lineHeight: 1.3 }}>{next.title}</div>

          <div
            style={{
              fontSize: 13,
              color: "var(--muted-2)",
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="calendar" size={14} />
            {fmtDate(next.startsAt)}
          </div>

          <ul className="vol-readiness" aria-label="Mission readiness">
            {READINESS.map((item) => (
              <li key={item.key} className="vol-readiness-item">
                <Icon name={item.icon} size={14} style={{ color: "var(--mint)", flexShrink: 0 }} />
                {item.label}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link
              href="/my-missions"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                background: "#18203b",
                padding: "10px 16px",
                borderRadius: 11,
                textDecoration: "none",
              }}
            >
              View My Missions
            </Link>
            <Link href={`/missions/${next.slug}`} className="vol-btn-ghost" style={{ minHeight: 44, padding: "10px 14px" }}>
              View details
            </Link>
          </div>
        </div>
      ) : (
        <DashboardEmptyState
          icon="calendar"
          title="No upcoming mission yet"
          body="Apply to a mission and get approved — your next shift will show up here with date and readiness details."
          ctaLabel="Find a mission"
          ctaHref="/explore"
        />
      )}
    </section>
  );
}
