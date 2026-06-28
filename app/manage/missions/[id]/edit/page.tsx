import { notFound, redirect } from "next/navigation";
import { requireOrganizer, UUID_RE } from "@/lib/auth/require-organizer";
import { getMissionCategories } from "@/lib/data/missions";
import { getOrganizationMissionById } from "@/lib/data/organization-missions";
import { getMissionPrivateDetails } from "@/lib/data/mission-private-details";
import { getApplicationsForMission } from "@/lib/data/organization-applications";
import MissionForm from "@/components/manage/mission-form";
import MissionStatusActions from "@/components/manage/mission-status-actions";
import MissionControlHeader from "@/components/manage/mission-control-header";
import { emptyPrivateDetails } from "@/components/manage/mission-private-details-section";
import { publicMediaUrl } from "@/lib/storage/urls";
import { BUCKETS } from "@/lib/storage/storage-paths";
import "@/components/manage/edit-mission.css";

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
  if (!mission) notFound();

  const [details, applications] = await Promise.all([
    getMissionPrivateDetails(mission.id),
    getApplicationsForMission(guard.orgId, mission.id),
  ]);
  const pending = applications.filter((a) => a.status === "pending" || a.status === "waitlisted").length;

  const initialPrivateDetails = {
    ...emptyPrivateDetails(),
    exact_address: details?.exact_address ?? "",
    private_meeting_instructions: details?.private_meeting_instructions ?? "",
    private_contact_name: details?.private_contact_name ?? "",
    private_contact_phone: details?.private_contact_phone ?? "",
    private_contact_email: details?.private_contact_email ?? "",
    show_exact_address_publicly: mission.showExactAddressPublicly,
  };

  return (
    <div className="me-page">
      <MissionControlHeader
        missionId={mission.id}
        missionTitle={mission.title}
        status={mission.status}
        publicSlug={mission.slug}
        pendingApplicants={pending}
      />

      <div className="me-layout">
        <aside className="me-status-panel" aria-label="Mission status and lifecycle">
          <MissionStatusActions
            missionId={mission.id}
            status={mission.status}
            publicSlug={mission.slug}
          />
        </aside>

        <div className="me-form">
          <MissionForm
            mode="edit"
            mission={mission}
            categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
            coverImageUrl={publicMediaUrl(BUCKETS.missionMedia, mission.coverImagePath)}
            initialPrivateDetails={initialPrivateDetails}
          />
        </div>
      </div>
    </div>
  );
}
