import Link from "next/link";
import Icon, { type IconName } from "@/components/icons";
import type { VerificationStatus } from "@/types/database";

type Benefit = { icon: IconName; label: string };

type StatusConfig = {
  title: string;
  body: string;
  badge: string;
  badgeIcon: IconName;
  emblemIcon: IconName;
  panelClass: string;
  emblemClass: string;
  benefits?: Benefit[];
  footnote?: string;
  settingsLink?: boolean;
};

const COPY: Record<VerificationStatus, StatusConfig> = {
  verified: {
    title: "Verified organization",
    body: "Your organization is trusted and visible to volunteers across NeighborLoop.",
    badge: "Verified",
    badgeIcon: "check",
    emblemIcon: "verified",
    panelClass: "org-verify-panel--verified",
    emblemClass: "org-verify-emblem--verified",
    benefits: [
      { icon: "target", label: "Shown on missions" },
      { icon: "compass", label: "Shown on profile" },
      { icon: "sparkles", label: "Builds volunteer trust" },
    ],
  },
  pending: {
    title: "Verification pending",
    body: "You can prepare and publish missions while your organization details are reviewed.",
    badge: "Under review",
    badgeIcon: "clock",
    emblemIcon: "clock",
    panelClass: "org-verify-panel--pending",
    emblemClass: "org-verify-emblem--pending",
    benefits: [{ icon: "check", label: "Publishing enabled" }],
    footnote: "Typical review time varies by organization type.",
  },
  rejected: {
    title: "Verification not granted",
    body: "You can still publish missions. Update your profile or contact support if you have questions.",
    badge: "Not verified",
    badgeIcon: "message",
    emblemIcon: "message",
    panelClass: "org-verify-panel--rejected",
    emblemClass: "org-verify-emblem--rejected",
    settingsLink: true,
  },
  not_required: {
    title: "Ready to publish",
    body: "Request verification anytime to earn a trust badge on missions and your public profile.",
    badge: "Unverified",
    badgeIcon: "award",
    emblemIcon: "award",
    panelClass: "org-verify-panel--neutral",
    emblemClass: "org-verify-emblem--neutral",
    benefits: [
      { icon: "send", label: "Missions publishable" },
      { icon: "award", label: "Verification optional" },
    ],
    settingsLink: true,
  },
};

export default function VerificationStatusPanel({ status }: { status: VerificationStatus }) {
  const c = COPY[status];

  return (
    <section
      className={`org-panel org-verify-panel ${c.panelClass}`}
      aria-labelledby="verify-heading"
    >
      <div className="org-verify-head">
        <div className={`org-verify-emblem ${c.emblemClass}`} aria-hidden>
          <Icon name={c.emblemIcon} size={22} strokeWidth={2.2} />
        </div>

        <div className="org-verify-head-main">
          <div className="org-verify-head-row">
            <h3 id="verify-heading" className="org-verify-title">
              {c.title}
            </h3>
            <span className="org-verify-status-pill">
              <Icon name={c.badgeIcon} size={12} strokeWidth={2.8} aria-hidden />
              {c.badge}
            </span>
          </div>
          <p className="org-verify-desc">{c.body}</p>
        </div>
      </div>

      {c.benefits && c.benefits.length > 0 && (
        <ul className="org-verify-benefits" aria-label="Verification benefits">
          {c.benefits.map((b) => (
            <li key={b.label}>
              <Icon name={b.icon} size={12} strokeWidth={2.3} aria-hidden />
              {b.label}
            </li>
          ))}
        </ul>
      )}

      {c.footnote && <p className="org-verify-footnote">{c.footnote}</p>}

      {c.settingsLink && (
        <Link href="/manage/settings" className="org-verify-link">
          Organization settings →
        </Link>
      )}
    </section>
  );
}
