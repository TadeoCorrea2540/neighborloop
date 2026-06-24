import Link from "next/link";
import DefaultAvatar from "@/components/default-avatar";
import OrganizationDashboardEmptyState from "./organization-dashboard-empty-state";
import type { OrganizerApplication } from "@/types/domain";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "Pending", bg: "#fff0dd", color: "#b9651b" },
  waitlisted: { label: "Waitlisted", bg: "#e2effd", color: "#2b6cb0" },
};

export default function ApplicantPreviewPanel({
  applicants,
  totalPending,
}: {
  applicants: OrganizerApplication[];
  totalPending: number;
}) {
  return (
    <section className="org-panel" aria-labelledby="applicants-heading">
      <div className="org-section-header" style={{ marginBottom: 12 }}>
        <div>
          <h3 id="applicants-heading" className="org-section-title">
            Applicant review
          </h3>
          <p className="org-section-sub">
            {totalPending > 0 ? `${totalPending} awaiting your review` : "Recent applications"}
          </p>
        </div>
        <Link href="/manage/applicants" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-1)" }}>
          All applicants →
        </Link>
      </div>

      {applicants.length === 0 ? (
        <OrganizationDashboardEmptyState
          icon="clipboard"
          title="No applicants yet"
          body="Once volunteers apply to your missions, you'll review and manage them here — no spreadsheets needed."
          ctaLabel="View missions"
          ctaHref="/manage/missions"
        />
      ) : (
        <div>
          {applicants.map((p) => {
            const pill = STATUS_LABEL[p.status] ?? STATUS_LABEL.pending;
            return (
              <div key={p.id} className="org-applicant-row">
                <DefaultAvatar size={40} radius={12} kind="user" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {p.volunteer?.displayName ?? "Volunteer"}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: pill.bg,
                        color: pill.color,
                      }}
                    >
                      {pill.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted-3)",
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.missionTitle} · Applied {fmtDate(p.appliedAt)}
                  </div>
                  {p.message && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--muted-2)",
                        margin: "6px 0 0",
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      &ldquo;{p.message}&rdquo;
                    </p>
                  )}
                </div>
                <Link
                  href={`/manage/missions/${p.missionId}/applications`}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "#18203b",
                    padding: "8px 12px",
                    borderRadius: 9,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    minHeight: 36,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Review
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
