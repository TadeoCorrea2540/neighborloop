/**
 * Home page (server component).
 *
 * Loads the volunteer category taxonomy from Supabase for the desktop
 * "Find your cause" section and hands it to the client UI. Defensive by
 * design: if Supabase env is absent or the query fails, it falls back to the
 * mock categories so the page renders identically offline.
 */

import HomeClient from "./home-client";
import { MOCK_CATEGORIES, toUICategory, type UICategory } from "@/lib/categories";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { getMissionCategories } from "@/lib/data/missions";

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

export default async function Page() {
  const categories = await loadCategories();
  return <HomeClient categories={categories} />;
}
