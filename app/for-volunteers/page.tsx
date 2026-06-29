/**
 * For Volunteers (server). Loads published missions for the mobile swipe stack and
 * related sections. Falls back to an empty list when Supabase is unavailable.
 */
import ForVolunteersClient from "./for-volunteers-client";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { getExploreMissionCards, type MissionCard } from "@/lib/data/mission-cards";
import { getCurrentUser } from "@/lib/auth/server";

async function loadMissionCards(): Promise<MissionCard[]> {
  if (!hasPublicSupabaseEnv()) return [];
  try {
    const user = await getCurrentUser();
    return await getExploreMissionCards({ sort: "soonest", limit: 12 }, { userId: user?.id });
  } catch {
    return [];
  }
}

export default async function ForVolunteersPage() {
  const missionCards = await loadMissionCards();
  return <ForVolunteersClient missionCards={missionCards} />;
}
