import Link from "next/link";

export default function DashboardSectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "See all →",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <header className="vol-section-header">
      <div>
        <h3 className="vol-section-title">{title}</h3>
        {subtitle && <p className="vol-section-sub">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)", whiteSpace: "nowrap" }}>
          {linkLabel}
        </Link>
      )}
    </header>
  );
}
