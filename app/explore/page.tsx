/**
 * Explore (server). Reads filters from the URL, loads real published missions as
 * cards (with the viewer's saved/application state), and renders the client UI.
 * Defensive: if Supabase env is missing it falls back to mock categories + an
 * empty mission list (polished empty state), never a crash.
 */
import ExploreClient, { type ExploreParams } from "./explore-client";
import { MOCK_CATEGORIES, toUICategory, type UICategory } from "@/lib/categories";
import { hasPublicSupabaseEnv } from "@/lib/supabase/env";
import { getMissionCategories, type MissionFilters } from "@/lib/data/missions";
import { getExploreMissionCards, type MissionCard } from "@/lib/data/mission-cards";
import { getCurrentUser } from "@/lib/auth/server";

const WHENS = ["today", "weekend", "week", "month"] as const;
const SORTS = ["soonest", "newest", "spots"] as const;

export default async function Explore({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const str = (k: string) => (typeof searchParams[k] === "string" ? (searchParams[k] as string) : "");

  const params: ExploreParams = {
    category: str("category") || "all",
    q: str("q"),
    when: WHENS.includes(str("when") as (typeof WHENS)[number]) ? str("when") : "",
    beginner: str("beginner") === "true",
    virtual: str("virtual") === "true" ? "true" : str("virtual") === "false" ? "false" : "",
    difficulty: str("difficulty"),
    sort: SORTS.includes(str("sort") as (typeof SORTS)[number]) ? str("sort") : "soonest",
  };

  let categories: UICategory[] = MOCK_CATEGORIES;
  let cards: MissionCard[] = [];

  if (hasPublicSupabaseEnv()) {
    try {
      const cats = await getMissionCategories();
      if (cats.length) categories = cats.map(toUICategory);
    } catch {
      /* keep mock categories */
    }
    try {
      const user = await getCurrentUser();
      const filters: MissionFilters = {
        q: params.q || undefined,
        categorySlug: params.category !== "all" ? params.category : undefined,
        when: (params.when || undefined) as MissionFilters["when"],
        beginner: params.beginner || undefined,
        isVirtual: params.virtual === "true" ? true : params.virtual === "false" ? false : undefined,
        difficulty: params.difficulty || undefined,
        sort: params.sort as MissionFilters["sort"],
      };
      cards = await getExploreMissionCards(filters, { userId: user?.id });
    } catch {
      /* empty state */
    }
  }

  return <ExploreClient cards={cards} categories={categories} params={params} />;
}
