"use client";

/** Shared chrome for the header dropdown menus (notifications + messages). */
import type { CSSProperties, ReactNode } from "react";
import Icon, { type IconName } from "../icons";

export const panelStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid var(--line-2)",
  borderRadius: 18,
  boxShadow: "0 24px 60px -18px rgba(24,32,59,.35), 0 6px 16px -8px rgba(24,32,59,.16)",
  overflow: "hidden",
  zIndex: 200,
};

export function Caret() {
  return (
    <span
      className="hdr-pop-caret"
      aria-hidden
      style={{
        position: "absolute", top: -6, right: 20, width: 12, height: 12, background: "#fff",
        borderLeft: "1px solid var(--line-2)", borderTop: "1px solid var(--line-2)",
        transform: "rotate(45deg)", borderTopLeftRadius: 3,
      }}
    />
  );
}

export function MenuHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="hdr-pop-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontWeight: 800, fontSize: 15 }}>{title}</span>
      {action}
    </div>
  );
}

export function MenuEmpty({
  emoji,
  icon,
  title,
  hint,
}: {
  emoji?: string;
  icon?: IconName;
  title: string;
  hint: string;
}) {
  return (
    <div style={{ padding: "38px 26px", textAlign: "center" }}>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
        {icon ? (
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#f1f3f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted-2)",
            }}
          >
            <Icon name={icon} size={26} />
          </span>
        ) : (
          <div style={{ fontSize: 30 }}>{emoji}</div>
        )}
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700 }}>{title}</div>
      <p style={{ fontSize: 13, color: "var(--muted-3)", margin: "5px 0 0", lineHeight: 1.45 }}>{hint}</p>
    </div>
  );
}

export function MenuSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ padding: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 10px" }}>
          <span className="hdr-skel" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span className="hdr-skel" style={{ display: "block", height: 11, width: "58%", marginBottom: 8 }} />
            <span className="hdr-skel" style={{ display: "block", height: 10, width: "85%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        position: "absolute", top: 3, right: 3, minWidth: 17, height: 17, padding: "0 4px", borderRadius: 99,
        background: "var(--coral)", color: "#fff", fontSize: 10, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
