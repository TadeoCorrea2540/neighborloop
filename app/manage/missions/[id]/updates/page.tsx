import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOrganizer, UUID_RE } from "@/lib/auth/require-organizer";
import { getServerSupabase } from "@/lib/supabase/server";
import { getOrganizationMissionById } from "@/lib/data/organization-missions";
import { getMissionUpdatesForOrganizer } from "@/lib/data/mission-updates";
import { fmtDate } from "@/components/admin/badges";
import MissionUpdateComposer from "@/components/manage/mission-update-composer";

export const dynamic = "force-dynamic";

export default async function MissionUpdatesPage({ params }: { params: { id: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect(`/auth?next=/manage/missions/${params.id}/updates`);
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }
  if (!UUID_RE.test(params.id)) notFound();

  const mission = await getOrganizationMissionById(guard.orgId, params.id);
  if (!mission) notFound();

  const [updates, { count }] = await Promise.all([
    getMissionUpdatesForOrganizer(guard.orgId, params.id),
    getServerSupabase().from("applications").select("id", { count: "exact", head: true }).eq("mission_id", params.id).eq("status", "approved"),
  ]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/manage/missions" style={{ color: "var(--muted-3)" }}>Missions</Link> /{" "}
        <Link href={`/manage/missions/${mission.id}/edit`} style={{ color: "var(--muted-3)" }}>{mission.title}</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>Updates</span>
      </div>
      <h2 style={{ fontSize: 23, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-.02em" }}>Mission updates</h2>

      <MissionUpdateComposer missionId={mission.id} recipientCount={count ?? 0} />

      <h3 style={{ fontSize: 15, fontWeight: 800, margin: "4px 0 12px" }}>Past updates</h3>
      {updates.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "28px 20px", textAlign: "center", color: "var(--muted-3)", fontSize: 14 }}>
          No updates posted yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {updates.map((u) => (
            <div key={u.id} style={{ background: "#fff", border: "1px solid rgba(24,32,59,.06)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{u.title}</span>
                <span style={{ fontSize: 11.5, color: "var(--muted-3)" }}>{fmtDate(u.createdAt)}</span>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--muted-1)", margin: "6px 0 0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{u.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
