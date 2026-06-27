import Link from "next/link";
import Icon, { type IconName } from "@/components/icons";

export default function BadgeEmptyState({
  icon = "award",
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  icon?: IconName;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="badges-empty" role="status">
      <div className="badges-empty-icon" aria-hidden>
        <Icon name={icon} size={26} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 14, color: "var(--muted-3)", margin: "0 0 16px", lineHeight: 1.55, maxWidth: 400, marginInline: "auto" }}>
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
