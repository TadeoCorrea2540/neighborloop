/**
 * Admin/platform report CSV exports. Guarded by requireAdmin(). Aggregate-only:
 * no personal data, no report bodies, no reporter identities (moderation =
 * counts/status only). Same permissions as the admin UI.
 */
import { requireAdmin } from "@/lib/auth/require-admin";
import { toCsv, safeFilename, type CsvColumn } from "@/lib/data/analytics/csv";
import { coerceDateRange } from "@/lib/data/analytics/date-range";
import { getAdminDashboardSummary } from "@/lib/data/admin-dashboard";
import {
  getAdminImpactAdditions,
  getTopOrganizationsByHours,
  getCategoryParticipation,
  getAdminModerationSummary,
  type OrgLeaderboardRow,
  type CategoryParticipationRow,
} from "@/lib/data/analytics/admin";

export const dynamic = "force-dynamic";

const TYPES = ["platform-summary", "organization-impact", "category-impact", "moderation-summary"] as const;
type ExportType = (typeof TYPES)[number];

function isType(v: string | null): v is ExportType {
  return v != null && (TYPES as readonly string[]).includes(v);
}

type KV = { metric: string; value: string | number };
const KV_COLS: CsvColumn<KV>[] = [
  { header: "Metric", value: (r) => r.metric },
  { header: "Value", value: (r) => r.value },
];

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return new Response(guard.error, { status: guard.code === "auth" ? 401 : 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  if (!isType(type)) return new Response("Unknown export type", { status: 400 });
  const range = coerceDateRange(searchParams.get("range"));
  const cf = searchParams.get("from") ?? undefined;
  const ct = searchParams.get("to") ?? undefined;

  let csv: string;

  if (type === "platform-summary") {
    const [s, impact] = await Promise.all([getAdminDashboardSummary(), getAdminImpactAdditions(range, cf, ct)]);
    const rows: KV[] = [
      { metric: "Total users", value: s.totalUsers },
      { metric: "Volunteers", value: s.volunteers },
      { metric: "Organizers", value: s.organizers },
      { metric: "Admins", value: s.admins },
      { metric: "Organizations", value: s.totalOrganizations },
      { metric: "Pending verifications", value: s.pendingVerifications },
      { metric: "Published missions", value: s.publishedMissions },
      { metric: "Applications submitted", value: s.applicationsSubmitted },
      { metric: "Completed attendances", value: impact.completedAttendances },
      { metric: "Volunteer hours", value: impact.totalHours },
      { metric: "Certificates issued", value: impact.certificatesIssued },
      { metric: "Active volunteers", value: impact.uniqueActiveVolunteers },
      { metric: "Open reports", value: s.openReports },
      { metric: "Resolved reports", value: s.resolvedReports },
    ];
    csv = toCsv(rows, KV_COLS);
  } else if (type === "organization-impact") {
    const rows = await getTopOrganizationsByHours(range, 1000, cf, ct);
    const cols: CsvColumn<OrgLeaderboardRow>[] = [
      { header: "Organization", value: (r) => r.name },
      { header: "Completed attendances", value: (r) => r.completedAttendances },
      { header: "Hours", value: (r) => r.hours },
    ];
    csv = toCsv(rows, cols);
  } else if (type === "category-impact") {
    const rows = await getCategoryParticipation(range, cf, ct);
    const cols: CsvColumn<CategoryParticipationRow>[] = [
      { header: "Category", value: (r) => r.name },
      { header: "Missions", value: (r) => r.missions },
      { header: "Completed attendances", value: (r) => r.completedAttendances },
      { header: "Hours", value: (r) => r.hours },
    ];
    csv = toCsv(rows, cols);
  } else {
    const m = await getAdminModerationSummary(range, cf, ct);
    const rows: KV[] = [
      { metric: "Open reports", value: m.openReports },
      { metric: "Reviewing reports", value: m.reviewingReports },
      { metric: "Resolved reports", value: m.resolvedReports },
      { metric: "Dismissed reports", value: m.dismissedReports },
      { metric: "Audit events", value: m.auditEvents },
    ];
    csv = toCsv(rows, KV_COLS);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename(`${type}-${range}`)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
