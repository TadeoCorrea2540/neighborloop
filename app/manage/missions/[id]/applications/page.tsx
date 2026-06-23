import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOrganizer, UUID_RE } from "@/lib/auth/require-organizer";
import { getOrganizationMissionById } from "@/lib/data/organization-missions";
import { getApplicationsForMission } from "@/lib/data/organization-applications";
import ApplicationsReview from "@/components/manage/applications-review";

export const dynamic = "force-dynamic";

export default async function MissionApplicationsPage({ params }: { params: { id: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect(`/auth?next=/manage/missions/${params.id}/applications`);
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }
  if (!UUID_RE.test(params.id)) notFound();

  const mission = await getOrganizationMissionById(guard.orgId, params.id);
  if (!mission) notFound();

  const applications = await getApplicationsForMission(guard.orgId, mission.id);
  const approved = applications.filter((a) => a.status === "approved").length;
  const cap = mission.volunteerCapacity;

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/manage/missions" style={{ color: "var(--muted-3)" }}>Missions</Link> /{" "}
        <Link href={`/manage/missions/${mission.id}/edit`} style={{ color: "var(--muted-3)" }}>{mission.title}</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>Applicants</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Applicants · {mission.title}</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
            {approved}{cap != null ? ` of ${cap}` : ""} approved
            {cap != null && approved >= cap ? " · mission is full (use the waitlist)" : ""}
          </p>
        </div>
        <Link href={`/manage/missions/${mission.id}/edit`} style={{ fontSize: 13.5, fontWeight: 700, color: "var(--muted-1)", background: "#fff", border: "1px solid rgba(24,32,59,.12)", padding: "10px 16px", borderRadius: 12 }}>← Back to mission</Link>
      </div>

      <ApplicationsReview applications={applications} showMission={false} />
    </div>
  );
}
