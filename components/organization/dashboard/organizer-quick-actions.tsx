import Link from "next/link";
import Icon, { type IconName } from "@/components/icons";

const ACTIONS: { href: string; label: string; icon: IconName; primary?: boolean }[] = [
  { href: "/manage/missions/new", label: "Create mission", icon: "target", primary: true },
  { href: "/manage/applicants", label: "Review applicants", icon: "clipboard" },
  { href: "/manage/missions", label: "Manage missions", icon: "check-square" },
  { href: "/manage/reports", label: "View reports", icon: "trending-up" },
  { href: "/manage/attendance", label: "Attendance", icon: "check-circle" },
  { href: "/manage/settings", label: "Org profile", icon: "settings" },
];

export default function OrganizerQuickActions() {
  return (
    <nav className="org-quick-actions" aria-label="Quick actions">
      {ACTIONS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className={`org-quick-action${a.primary ? " org-quick-action--primary" : ""}`}
        >
          <span className="org-quick-action-icon">
            <Icon name={a.icon} size={16} />
          </span>
          <span className="org-quick-action-label">{a.label}</span>
        </Link>
      ))}
    </nav>
  );
}
