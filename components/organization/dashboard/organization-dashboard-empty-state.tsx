import Link from "next/link";
import Icon, { type IconName } from "@/components/icons";

export default function OrganizationDashboardEmptyState({
  icon,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  icon: IconName;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="org-empty" role="status">
      <div className="org-empty-icon" aria-hidden>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "0 0 12px", lineHeight: 1.55 }}>{body}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="btn-coral"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 16px",
            borderRadius: 12,
            textDecoration: "none",
          }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
