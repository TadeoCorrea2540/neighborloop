import Link from "next/link";
import { VerificationBadge } from "@/components/admin/badges";
import type { VerificationStatus } from "@/types/database";

const COPY: Record<VerificationStatus, { title: string; body: string; panelClass: string }> = {
  verified: {
    title: "Verified organization",
    body: "Volunteers can see your verified badge on public missions and your organization profile.",
    panelClass: "org-verify-panel--verified",
  },
  pending: {
    title: "Verification pending",
    body: "You can prepare and publish missions while your organization details are reviewed.",
    panelClass: "org-verify-panel--pending",
  },
  rejected: {
    title: "Verification not granted",
    body: "You can still publish missions. Update your profile or contact support if you have questions.",
    panelClass: "",
  },
  not_required: {
    title: "Ready to publish",
    body: "Your organization can publish missions freely. Request verification anytime for a trust badge.",
    panelClass: "",
  },
};

export default function VerificationStatusPanel({ status }: { status: VerificationStatus }) {
  const c = COPY[status];

  return (
    <section className={`org-panel org-verify-panel ${c.panelClass}`} aria-labelledby="verify-heading">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <h3 id="verify-heading" style={{ fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: "-.02em" }}>
          {c.title}
        </h3>
        <VerificationBadge status={status} />
      </div>
      <p style={{ fontSize: 13.5, color: "var(--muted-2)", margin: "0 0 14px", lineHeight: 1.55 }}>{c.body}</p>
      {(status === "not_required" || status === "rejected") && (
        <Link
          href="/manage/settings"
          style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}
        >
          Organization settings →
        </Link>
      )}
      {status === "pending" && (
        <span style={{ fontSize: 12.5, color: "var(--muted-3)", fontWeight: 600 }}>
          Typical review time varies by organization type.
        </span>
      )}
    </section>
  );
}
