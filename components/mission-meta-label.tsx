import type { CSSProperties, ReactNode } from "react";
import Icon, { type IconName } from "./icons";

const inlineRow: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};

const locationRow: CSSProperties = {
  display: "inline-flex",
  alignItems: "flex-start",
  gap: 5,
};

export function MissionDateLabel({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span style={{ ...inlineRow, ...style }}>
      <Icon name="calendar" size={13} style={{ flexShrink: 0 }} />
      <span>{children}</span>
    </span>
  );
}

export function MissionLocationLabel({
  children,
  virtual = false,
  style,
}: {
  children: ReactNode;
  virtual?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span style={{ ...locationRow, ...style }}>
      <Icon
        name={virtual ? "globe" : "pin"}
        size={13}
        style={{ flexShrink: 0, marginTop: "0.2em" }}
      />
      <span>{children}</span>
    </span>
  );
}

export function MissionMetaTile({
  name,
  background,
}: {
  name: IconName;
  background: string;
}) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink)",
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={18} />
    </span>
  );
}
