import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOrganizer, UUID_RE } from "@/lib/auth/require-organizer";
import { getMissionCategories } from "@/lib/data/missions";
import { getOrganizationMissionById } from "@/lib/data/organization-missions";
import { getMissionPrivateDetails } from "@/lib/data/mission-private-details";
import { getApplicationsForMission } from "@/lib/data/organization-applications";
import MissionForm from "@/components/manage/mission-form";
import MissionStatusActions from "@/components/manage/mission-status-actions";
import PrivateDetailsForm from "@/components/manage/private-details-form";
import { publicMediaUrl } from "@/lib/storage/urls";
import { BUCKETS } from "@/lib/storage/storage-paths";

export const dynamic = "force-dynamic";

export default async function EditMissionPage({ params }: { params: { id: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect(`/auth?next=/manage/missions/${params.id}/edit`);
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }
  if (!UUID_RE.test(params.id)) notFound();

  const [mission, categories] = await Promise.all([
    getOrganizationMissionById(guard.orgId, params.id),
    getMissionCategories(),
  ]);
  if (!mission) notFound(); // not your org, or doesn't exist

  const [details, applications] = await Promise.all([
    getMissionPrivateDetails(mission.id),
    getApplicationsForMission(guard.orgId, mission.id),
  ]);
  const pending = applications.filter((a) => a.status === "pending" || a.status === "waitlisted").length;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/manage/missions" style={{ color: "var(--muted-3)" }}>Missions</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>{mission.title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <h2 style={{ fontSize: 25, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Edit mission</h2>
        <Link href={`/manage/missions/${mission.id}/applications`} style={{ fontSize: 13.5, fontWeight: 700, color: "var(--muted-1)", background: "#fff", border: "1px solid rgba(24,32,59,.12)", padding: "10px 16px", borderRadius: 12 }}>
          Review applicants{pending > 0 ? ` · ${pending} new` : ""}
        </Link>
      </div>

      <div style={{ marginBottom: 18 }}>
        <MissionStatusActions missionId={mission.id} status={mission.status} publicSlug={mission.slug} />
      </div>

      <MissionForm
        mode="edit"
        mission={mission}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        coverImageUrl={publicMediaUrl(BUCKETS.missionMedia, mission.coverImagePath)}
      />

      <div style={{ marginTop: 18 }}>
        <PrivateDetailsForm missionId={mission.id} details={details} />
      </div>
    </div>
  );
}
