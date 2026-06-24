import Link from "next/link";
import Icon, { type IconName } from "@/components/icons";

export type AttentionItem = {
  id: string;
  priority: "high" | "medium";
  label: string;
  href: string;
  cta: string;
};

export default function NeedsAttentionPanel({ items }: { items: AttentionItem[] }) {
  return (
    <section className="org-panel org-attention-col" aria-labelledby="attention-heading">
      <h3 id="attention-heading" style={{ fontWeight: 800, fontSize: 17, margin: "0 0 4px", letterSpacing: "-.02em" }}>
        Needs attention
      </h3>
      <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "0 0 14px" }}>
        Prioritized actions for your organization
      </p>

      {items.length === 0 ? (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <Icon name="check-circle" size={28} style={{ color: "var(--mint)" }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>You&apos;re all caught up</div>
          <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "6px 0 0" }}>
            No urgent items right now. Check back as volunteers apply.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} className="org-attention-item">
              <span className={`org-attention-priority org-attention-priority--${item.priority}`}>
                {item.priority === "high" ? "HIGH" : "MED"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{item.label}</div>
              </div>
              <Link
                href={item.href}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--coral-deep)",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                {item.cta} →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
