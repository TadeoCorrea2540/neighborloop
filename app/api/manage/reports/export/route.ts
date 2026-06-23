/**
 * Organization report CSV exports. Guarded by requireOrganizer() — the org id is
 * pinned to guard.orgId (never a query param), so one org can never export
 * another's data. Excludes PII beyond what the org already sees on its own
 * roster (no emails, no raw UUIDs, no internal notes). Same permissions as the UI.
 */
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { toCsv, safeFilename, type CsvColumn } from "@/lib/data/analytics/csv";
import { coerceDateRange } from "@/lib/data/analytics/date-range";
import {
  getOrganizationMissionPerformance,
  getOrganizationVolunteerHours,
  type OrgMissionPerformance,
  type OrgVolunteerHoursRow,
} from "@/lib/data/analytics/organization";
import { getOrganizationCertificates, type CertificateItem } from "@/lib/data/certificates";

export const dynamic = "force-dynamic";

const TYPES = ["mission-performance", "attendance-summary", "volunteer-hours", "certificates-issued"] as const;
type ExportType = (typeof TYPES)[number];

function isType(v: string | null): v is ExportType {
  return v != null && (TYPES as readonly string[]).includes(v);
}

export async function GET(req: Request) {
  const guard = await requireOrganizer();
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
  let name: string;

  if (type === "mission-performance") {
    const rows = await getOrganizationMissionPerformance(guard.orgId, range, cf, ct);
    const cols: CsvColumn<OrgMissionPerformance>[] = [
      { header: "Mission", value: (r) => r.title },
      { header: "Status", value: (r) => r.status },
      { header: "Starts at", value: (r) => r.startsAt },
      { header: "Capacity", value: (r) => r.capacity },
      { header: "Approved", value: (r) => r.approved },
      { header: "Checked in", value: (r) => r.checkedIn },
      { header: "Completed", value: (r) => r.completed },
      { header: "No-shows", value: (r) => r.noShow },
      { header: "Hours", value: (r) => r.hours },
      { header: "Certificates", value: (r) => r.certificates },
      { header: "Fill rate %", value: (r) => (r.fillRate != null ? Math.round(r.fillRate * 100) : "") },
      { header: "No-show rate %", value: (r) => (r.noShowRate != null ? Math.round(r.noShowRate * 100) : "") },
    ];
    csv = toCsv(rows, cols);
    name = "mission-performance";
  } else if (type === "attendance-summary") {
    const rows = await getOrganizationMissionPerformance(guard.orgId, range, cf, ct);
    const cols: CsvColumn<OrgMissionPerformance>[] = [
      { header: "Mission", value: (r) => r.title },
      { header: "Starts at", value: (r) => r.startsAt },
      { header: "Approved", value: (r) => r.approved },
      { header: "Checked in", value: (r) => r.checkedIn },
      { header: "Completed", value: (r) => r.completed },
      { header: "No-shows", value: (r) => r.noShow },
      { header: "Hours credited", value: (r) => r.hours },
    ];
    csv = toCsv(rows, cols);
    name = "attendance-summary";
  } else if (type === "volunteer-hours") {
    const rows = await getOrganizationVolunteerHours(guard.orgId, range, cf, ct);
    const cols: CsvColumn<OrgVolunteerHoursRow>[] = [
      { header: "Volunteer", value: (r) => r.displayName },
      { header: "Completed missions", value: (r) => r.completedMissions },
      { header: "Hours", value: (r) => r.hours },
    ];
    csv = toCsv(rows, cols);
    name = "volunteer-hours";
  } else {
    const rows = await getOrganizationCertificates(guard.orgId);
    const cols: CsvColumn<CertificateItem>[] = [
      { header: "Certificate #", value: (r) => r.certificateNumber },
      { header: "Mission", value: (r) => r.missionTitle },
      { header: "Hours", value: (r) => r.hoursCredited },
      { header: "Issued at", value: (r) => r.issuedAt },
    ];
    csv = toCsv(rows, cols);
    name = "certificates-issued";
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename(`${name}-${range}`)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
