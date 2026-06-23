/**
 * Shared admin presentational helpers (server-importable — no "use client").
 * Status badges + a deterministic date formatter (fixed locale/timeZone so
 * server and client render identically — avoids hydration mismatches).
 */
import type { VerificationStatus, MissionStatus } from "@/types/database";

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: bg, color, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const VERIFY: Record<VerificationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "Pending", bg: "#fff0dd", color: "#b9651b" },
  verified: { label: "✓ Verified", bg: "#dff6ea", color: "#147a57" },
  rejected: { label: "Rejected", bg: "#ffeae6", color: "#c0392b" },
  not_required: { label: "Not required", bg: "#f1f3f8", color: "#5a6685" },
};
export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const p = VERIFY[status];
  return <Pill label={p.label} bg={p.bg} color={p.color} />;
}

const MISSION: Record<MissionStatus, { label: string; bg: string; color: string }> = {
  draft: { label: "Draft", bg: "#f1f3f8", color: "#5a6685" },
  pending_review: { label: "Pending review", bg: "#fff0dd", color: "#b9651b" },
  published: { label: "Published", bg: "#dff6ea", color: "#147a57" },
  paused: { label: "Paused", bg: "#fff0dd", color: "#b9651b" },
  closed: { label: "Closed", bg: "#e2effd", color: "#2b6cb0" },
  cancelled: { label: "Cancelled", bg: "#ffeae6", color: "#c0392b" },
  archived: { label: "Archived", bg: "#f1f3f8", color: "#5a6685" },
};
export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  const p = MISSION[status] ?? MISSION.draft;
  return <Pill label={p.label} bg={p.bg} color={p.color} />;
}

const REPORT: Record<string, { label: string; bg: string; color: string }> = {
  open: { label: "Open", bg: "#fff0dd", color: "#b9651b" },
  reviewing: { label: "Reviewing", bg: "#e2effd", color: "#2b6cb0" },
  resolved: { label: "Resolved", bg: "#dff6ea", color: "#147a57" },
  dismissed: { label: "Dismissed", bg: "#f1f3f8", color: "#5a6685" },
};
export function ReportStatusBadge({ status }: { status: string }) {
  const p = REPORT[status] ?? REPORT.open;
  return <Pill label={p.label} bg={p.bg} color={p.color} />;
}

/** Filter-chip link row (URL-param driven, server component). */
export function FilterChips({
  options,
  active,
  hrefFor,
}: {
  options: { value: string; label: string }[];
  active: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
      {options.map((o) => {
        const on = o.value === active;
        return (
          <a
            key={o.value}
            href={hrefFor(o.value)}
            style={{
              fontSize: 13, fontWeight: 600, padding: "9px 14px", borderRadius: 11,
              background: on ? "#18203b" : "#fff", color: on ? "#fff" : "var(--muted-1)",
              border: on ? "none" : "1px solid rgba(24,32,59,.1)",
            }}
          >
            {o.label}
          </a>
        );
      })}
    </div>
  );
}
