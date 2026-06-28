import { notFound } from "next/navigation";
import PublicNav from "@/components/public-nav";
import { loadLiveMissionView } from "@/lib/mission-view";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";
import { getVolunteerApplicationForMission } from "@/lib/data/applications";
import { getSavedMissionIdsForUser } from "@/lib/data/profiles";
import { getVolunteerAttendanceForMission, type AttendanceStatus } from "@/lib/data/attendance";
import MissionDetailHero from "@/components/missions/mission-detail-hero";
import MissionDetailToolbar from "@/components/missions/mission-detail-toolbar";
import MissionDetailIdentity from "@/components/missions/mission-detail-identity";
import MissionActionCard from "@/components/missions/mission-action-card";
import MissionDetailSections from "@/components/missions/mission-detail-sections";
import ExploreMissionCard from "@/components/explore/explore-mission-card";
import type { ApplicationStatus } from "@/types/database";
import "./mission-detail.css";
import "@/app/explore/explore-mission-cards.css";

type ViewerRole = "anon" | "volunteer" | "organizer" | "admin";

export default async function MissionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const view = await loadLiveMissionView(params.slug);
  if (!view) notFound();

  const {
    missionId,
    mission,
    detail,
    recs,
    coverImageUrl,
    categoryName,
    isBeginnerFriendly,
    isVirtual,
    estimatedHours,
    locationDisplay,
    orgVerified,
    orgSlug,
    summary,
    capacityUnlimited,
  } = view;

  const user = await getCurrentUser();
  let role: ViewerRole = "anon";
  let appStatus: ApplicationStatus | null = null;
  let appId: string | null = null;
  let isSaved = false;
  let attendanceStatus: AttendanceStatus | null = null;
  let hoursCredited: number | null = null;
  let certificateId: string | null = null;

  if (user) {
    role = (await getCurrentUserRole()) ?? "volunteer";
    if (role === "volunteer") {
      const [app, savedIds, attendance] = await Promise.all([
        getVolunteerApplicationForMission(user.id, missionId),
        getSavedMissionIdsForUser(user.id),
        getVolunteerAttendanceForMission(user.id, missionId),
      ]);
      appStatus = app?.status ?? null;
      appId = app?.id ?? null;
      isSaved = savedIds.includes(missionId);
      attendanceStatus = attendance?.status ?? null;
      hoursCredited = attendance?.hoursCredited ?? null;
      certificateId = attendance?.certificateId ?? null;
    }
  }

  return (
    <div className="md-page">
      <PublicNav />

      <div className="md-wrap">
        <div className="md-hero-wrap md-reveal">
          <MissionDetailHero coverImageUrl={coverImageUrl} />
          <MissionDetailToolbar
            missionId={missionId}
            missionTitle={mission.title}
            initialSaved={isSaved}
          />
        </div>

        <div className="md-body detail-split">
          <div className="md-identity-col">
            <MissionDetailIdentity
              title={mission.title}
              summary={summary}
              organizationName={mission.org}
              orgSlug={orgSlug}
              orgVerified={orgVerified}
              categoryName={categoryName}
              difficulty={mission.diff}
              isBeginnerFriendly={isBeginnerFriendly}
            />
          </div>

          <div className="md-side-col">
            <MissionActionCard
              missionId={missionId}
              missionSlug={params.slug}
              role={role}
              initialStatus={appStatus}
              initialApplicationId={appId}
              initialSaved={isSaved}
              attendanceStatus={attendanceStatus}
              hoursCredited={hoursCredited}
              certificateId={certificateId}
              date={detail.date}
              time={detail.time}
              locationDisplay={locationDisplay}
              isVirtual={isVirtual}
              estimatedHours={estimatedHours}
              spotsLeft={detail.spotsLeft}
              spotsTotal={detail.spotsTotal}
              capacityUnlimited={capacityUnlimited}
            />
          </div>

          <div className="md-sections-col">
            <MissionDetailSections
              whatYoullDo={detail.whatYoullDo}
              bullets={detail.bullets}
              impactGoal={detail.impactGoal}
              skills={detail.skills}
              isBeginnerFriendly={isBeginnerFriendly}
              safety={detail.safety}
              orgVerified={orgVerified}
            />
          </div>
        </div>

        {recs.length > 0 && (
          <section className="md-similar" aria-labelledby="md-similar-heading">
            <h2 id="md-similar-heading" className="md-similar-title">
              Similar missions
            </h2>
            <div className="md-similar-grid card-grid-3">
              {recs.map((card, i) => (
                <ExploreMissionCard key={card.mission.id} card={card} index={i} layout="compact" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
