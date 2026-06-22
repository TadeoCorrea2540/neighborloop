import { requireAuth } from "@/lib/auth/server";
import { getVolunteerApplicationsWithMissions } from "@/lib/data/applications";
import { getVolunteerSavedMissions } from "@/lib/data/profiles";
import { getMissionCards, type MissionCard } from "@/lib/data/mission-cards";
import type { MissionSummary } from "@/types/domain";
import type { ApplicationStatus } from "@/types/database";
import MyMissionsClient, { type MyRow } from "./my-missions-client";

const ACTIVE: ApplicationStatus[] = ["pending", "approved", "waitlisted"];

export default async function MyMissions() {
  const user = await requireAuth();

  const [apps, saved] = await Promise.all([
    getVolunteerApplicationsWithMissions(user.id),
    getVolunteerSavedMissions(user.id),
  ]);

  // Enrich all referenced missions with org/category/spots via the card pipeline.
  const missionMap = new Map<string, MissionSummary>();
  for (const a of apps) if (a.mission) missionMap.set(a.mission.id, a.mission);
  for (const s of saved) missionMap.set(s.id, s);
  const cards = await getMissionCards(Array.from(missionMap.values()), { userId: user.id });
  const cardById = new Map(cards.map((c) => [c.mission.id, c]));

  const now = new Date().toISOString();

  const toRow = (a: (typeof apps)[number]): MyRow => ({
    applicationId: a.application.id,
    status: a.application.status,
    withdrawable: ACTIVE.includes(a.application.status),
    card: a.mission ? cardById.get(a.mission.id) ?? null : null,
    title: a.mission?.title ?? null,
    slug: a.mission?.slug ?? null,
  });

  const rows = apps.map(toRow);
  const upcoming = rows.filter(
    (r) => r.status === "approved" && r.card && r.card.mission.startsAt >= now
  );
  const applications = rows.filter((r) => r.status === "pending" || r.status === "waitlisted");
  const past = rows.filter(
    (r) =>
      r.card &&
      r.card.mission.startsAt < now &&
      r.status !== "withdrawn" &&
      r.status !== "cancelled"
  );
  const cancelled = rows.filter((r) => r.status === "withdrawn" || r.status === "cancelled");

  // Saved cards in saved order.
  const savedCards = saved
    .map((s) => cardById.get(s.id))
    .filter((c): c is MissionCard => Boolean(c));

  return (
    <MyMissionsClient
      upcoming={upcoming}
      applications={applications}
      saved={savedCards}
      past={past}
      cancelled={cancelled}
    />
  );
}
