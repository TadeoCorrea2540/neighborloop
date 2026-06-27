import Icon, { type IconName } from "@/components/icons";
import type { NotificationType } from "@/lib/data/notifications";

/**
 * Color-coded notification icon tile. Each notification type maps to a polished
 * line icon and a soft, on-brand tint so the feed reads at a glance.
 */
type Theme = { icon: IconName; bg: string; fg: string };

const MINT: Pick<Theme, "bg" | "fg"> = { bg: "#e8faf3", fg: "#147a57" };
const BLUE: Pick<Theme, "bg" | "fg"> = { bg: "#e7f0fb", fg: "#2b6cb0" };
const AMBER: Pick<Theme, "bg" | "fg"> = { bg: "#fff3e1", fg: "#9a6314" };
const NEUTRAL: Pick<Theme, "bg" | "fg"> = { bg: "#f1f3f8", fg: "#5a6685" };
const CORAL: Pick<Theme, "bg" | "fg"> = { bg: "#fff0ec", fg: "#ef5238" };
const DANGER: Pick<Theme, "bg" | "fg"> = { bg: "#ffeae6", fg: "#c0392b" };

const NOTIF: Record<NotificationType, Theme> = {
  application_submitted: { icon: "clipboard", ...BLUE },
  application_approved: { icon: "check-circle", ...MINT },
  application_declined: { icon: "inbox", ...NEUTRAL },
  application_waitlisted: { icon: "clock", ...AMBER },
  mission_update: { icon: "megaphone", ...CORAL },
  mission_reminder: { icon: "bell", ...AMBER },
  mission_cancelled: { icon: "x-circle", ...DANGER },
  attendance_checked_in: { icon: "check-square", ...MINT },
  attendance_completed: { icon: "sparkles", ...MINT },
  certificate_issued: { icon: "award", ...AMBER },
  message_received: { icon: "message", ...BLUE },
  organization_verified: { icon: "verified", ...MINT },
  organization_rejected: { icon: "info", ...NEUTRAL },
  report_resolved: { icon: "shield-check", ...MINT },
  system: { icon: "bell", ...NEUTRAL },
};

export default function NotificationIcon({ type, size = 38 }: { type: NotificationType; size?: number }) {
  const t = NOTIF[type] ?? NOTIF.system;
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: Math.round(size * 0.3),
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.bg,
        color: t.fg,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.6)",
      }}
    >
      <Icon name={t.icon} size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  );
}
