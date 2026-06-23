import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getOrganizationMissionsWithCounts } from "@/lib/data/organization-missions";
import MissionsList from "@/components/manage/missions-list";

export const dynamic = "force-dynamic";

export default async function ManageMissionsPage() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/missions");
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const missions = await getOrganizationMissionsWithCounts(guard.orgId);
  const drafts = missions.filter((m) => m.status === "draft" || m.status === "pending_review").length;
  const published = missions.filter((m) => m.status === "published").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Manage missions</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
            {missions.length} mission{missions.length === 1 ? "" : "s"} · {published} published · {drafts} draft{drafts === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/manage/missions/new" className="btn-coral" style={{ color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 24px -12px rgba(255,111,94,.8)" }}>+ Create mission</Link>
      </div>

      <MissionsList missions={missions} />
    </div>
  );
}
