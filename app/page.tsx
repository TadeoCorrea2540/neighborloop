/**
 * Home page (server component).
 *
 * Loads the volunteer category taxonomy and published missions from Supabase.
 * Defensive: if Supabase env is absent or queries fail, categories fall back to
 * mock data and missions render an empty state — never fake demo missions.
 */

import HomeClient from "./home-client";
import { MOCK_CATEGORIES, toUICategory, type UICategory } from "@/lib/categories";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { getMissionCategories } from "@/lib/data/missions";
import { getExploreMissionCards, type MissionCard } from "@/lib/data/mission-cards";
import { getCurrentUser } from "@/lib/auth/server";

async function loadCategories(): Promise<UICategory[]> {
  if (!hasPublicSupabaseEnv()) return MOCK_CATEGORIES;
  try {
    const categories = await getMissionCategories();
    if (categories.length === 0) return MOCK_CATEGORIES;
    return categories.map(toUICategory);
  } catch {
    return MOCK_CATEGORIES;
  }
}

async function loadMissionCards(): Promise<MissionCard[]> {
  if (!hasPublicSupabaseEnv()) return [];
  try {
    const user = await getCurrentUser();
    return await getExploreMissionCards({ sort: "soonest", limit: 12 }, { userId: user?.id });
  } catch {
    return [];
  }
}

export default async function Page() {
  const [categories, missionCards] = await Promise.all([loadCategories(), loadMissionCards()]);
  return <HomeClient categories={categories} missionCards={missionCards} />;
}
