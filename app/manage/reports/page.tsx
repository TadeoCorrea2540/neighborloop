import { redirect } from "next/navigation";
import Link from "next/link";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getPrimaryOrganizationForUser } from "@/lib/data/organization-membership";
import { getOrganizationReport } from "@/lib/data/analytics/organization";
import { coerceDateRange, DATE_RANGES } from "@/lib/data/analytics/date-range";
import RangeFilter from "@/components/reports/range-filter";
import {
  ImpactStatGrid,
  MonthlyHoursChart,
  CategoryBreakdown,
  EngagementCard,
  MissionPerformanceTable,
} from "@/components/reports/analytics-cards";

export const dynamic = "force-dynamic";

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function Reports({ searchParams }: { searchParams: { range?: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect(guard.code === "auth" ? "/auth?next=/manage/reports" : "/dashboard");
  }

  const range = coerceDateRange(searchParams.range);
  const [org, report] = await Promise.all([
    getPrimaryOrganizationForUser(guard.userId),
    getOrganizationReport(guard.orgId, range),
  ]);
  const rangeLabel = DATE_RANGES.find((r) => r.value === range)?.label ?? "All time";

  // Monthly hours derived from mission performance (missions bucketed by start month).
  const byMonth = new Map<string, number>();
  for (const p of report.performance) {
    const key = p.startsAt?.slice(0, 7);
    if (!key) continue;
    byMonth.set(key, (byMonth.get(key) ?? 0) + p.hours);
  }
  const monthly = Array.from(byMonth.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-12)
    .map(([k, h]) => ({ label: `${MONTH[Number(k.split("-")[1]) - 1]} ${k.slice(0, 4)}`, hours: Math.round(h * 100) / 100 }));

  const empty = report.summary.missionsHosted === 0;

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Impact report{org?.name ? ` · ${org.name}` : ""}</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>{rangeLabel} · real attendance &amp; hours data</p>
        </div>
        <RangeFilter value={range} />
      </div>

      {empty ? (
        <div style={{ background: "#fff", border: "1px dashed rgba(24,32,59,.16)", borderRadius: 18, padding: "44px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>No mission activity in this range yet</div>
          <p style={{ fontSize: 14, color: "var(--muted-3)", margin: "6px auto 0", maxWidth: 440, lineHeight: 1.5 }}>
            Once volunteers are approved and you confirm attendance, your impact report fills in automatically — hours, completion rates, and certificates.
          </p>
          <Link href="/manage/missions/new" style={{ display: "inline-block", marginTop: 16, fontSize: 13.5, fontWeight: 700, color: "#fff", background: "#18203b", padding: "10px 16px", borderRadius: 11 }}>+ Create a mission</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* impact overview */}
          <ImpactStatGrid summary={report.summary} />

          {/* hours over time + cause breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }} className="dash-split">
            <MonthlyHoursChart data={monthly} />
            <CategoryBreakdown rows={report.categories} />
          </div>

          {/* mission performance + engagement */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }} className="dash-split">
            <MissionPerformanceTable rows={report.performance} />
            <EngagementCard engagement={report.engagement} />
          </div>
        </div>
      )}
    </div>
  );
}
