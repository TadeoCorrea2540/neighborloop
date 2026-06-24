import Link from "next/link";
import Icon, { type IconName } from "@/components/icons";

export default function DashboardEmptyState({
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
    <div className="vol-empty" role="status">
      <div className="vol-empty-icon" aria-hidden>
        <Icon name={icon} size={24} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 13.5, color: "var(--muted-3)", margin: "0 0 14px", lineHeight: 1.55, maxWidth: 360, marginInline: "auto" }}>
        {body}
      </p>
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
            padding: "10px 18px",
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
