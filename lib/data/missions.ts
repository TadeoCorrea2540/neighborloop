/**
 * Mission data access (server-safe).
 *
 * Public queries select an EXPLICIT public column list and never touch
 * mission_private_details. RLS additionally guarantees only published missions
 * from public orgs are returned to anonymous callers.
 *
 * Results are cast to the generated row types: we select a public subset of
 * columns, and the mappers only read those fields, so the cast is sound.
 */

import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  toMissionSummary,
  toMissionCategory,
  type MissionSummary,
  type MissionCategory,
} from "@/types/domain";
import type { MissionRow, MissionCategoryRow } from "@/types/database";

// Explicit public columns — keeps private/location-sensitive data out.
const PUBLIC_MISSION_COLUMNS =
  "id, slug, title, summary, status, category_id, organization_id, cover_image_path, " +
  "is_virtual, location_label, city, starts_at, ends_at, timezone, volunteer_capacity, " +
  "estimated_hours, difficulty, is_beginner_friendly, skills, perks, published_at";

function fail(context: string, message: string): never {
  throw new Error(`[data/missions] ${context}: ${message}`);
}

export interface MissionFilters {
  q?: string;
  categorySlug?: string;
  when?: "today" | "weekend" | "week" | "month";
  beginner?: boolean;
  isVirtual?: boolean;
  difficulty?: string;
  sort?: "soonest" | "newest" | "spots";
  limit?: number;
}

/**
 * Make a user search term safe for a PostgREST `.or(...ilike...)` filter string:
 * commas/parentheses are filter-grammar separators and %/_ are LIKE wildcards.
 */
function sanitizeSearch(raw: string): string {
  return raw
    .trim()
    .replace(/[%_]/g, " ") // strip LIKE wildcards
    .replace(/[(),*]/g, " ") // strip PostgREST grammar chars
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

/** Compute a [start, end) ISO window for the `when` filter (server time). */
function whenRange(when: NonNullable<MissionFilters["when"]>): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (when === "today") {
    const to = new Date(start);
    to.setDate(to.getDate() + 1);
    return { from: now.toISOString(), to: to.toISOString() };
  }
  if (when === "weekend") {
    // upcoming Sat 00:00 → Mon 00:00
    const day = start.getDay(); // 0 Sun .. 6 Sat
    const sat = new Date(start);
    sat.setDate(sat.getDate() + ((6 - day + 7) % 7));
    const mon = new Date(sat);
    mon.setDate(mon.getDate() + 2);
    return { from: sat.toISOString(), to: mon.toISOString() };
  }
  const to = new Date(now);
  to.setDate(to.getDate() + (when === "week" ? 7 : 30));
  return { from: now.toISOString(), to: to.toISOString() };
}

// Cached per-request: Explore loads it for both the chips and the card builder,
// so this collapses those into a single query within one render.
export const getMissionCategories = cache(async (): Promise<MissionCategory[]> => {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("mission_categories")
    .select("id, slug, name, description, icon_key, accent_color, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) fail("getMissionCategories", error.message);
  return ((data ?? []) as unknown as MissionCategoryRow[]).map(toMissionCategory);
});

export async function getPublishedMissions(
  filters: MissionFilters = {}
): Promise<MissionSummary[]> {
  const supabase = getServerSupabase();

  // Resolve category slug → id up front (categories are public).
  let categoryId: string | null = null;
  if (filters.categorySlug && filters.categorySlug !== "all") {
    const catRes = await supabase
      .from("mission_categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (catRes.error) fail("getPublishedMissions", catRes.error.message);
    const cat = catRes.data as { id: string } | null;
    if (!cat) return []; // unknown category → no results
    categoryId = cat.id;
  }

  let query = supabase.from("missions").select(PUBLIC_MISSION_COLUMNS).eq("status", "published");

  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.beginner) query = query.eq("is_beginner_friendly", true);
  if (typeof filters.isVirtual === "boolean") query = query.eq("is_virtual", filters.isVirtual);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);

  if (filters.q) {
    const term = sanitizeSearch(filters.q);
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,summary.ilike.%${term}%,city.ilike.%${term}%,location_label.ilike.%${term}%`
      );
    }
  }

  if (filters.when) {
    const { from, to } = whenRange(filters.when);
    query = query.gte("starts_at", from).lt("starts_at", to);
  }

  // Sorting. `spots` can't be ordered in SQL (it's computed), so the card layer
  // re-sorts after merging counts; here we use a stable soonest order for it.
  if (filters.sort === "newest") {
    query = query.order("published_at", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("starts_at", { ascending: true });
  }

  query = query.limit(filters.limit ?? 24);

  const { data, error } = await query;
  if (error) fail("getPublishedMissions", error.message);
  return ((data ?? []) as unknown as MissionRow[]).map(toMissionSummary);
}

export async function getFeaturedMissions(limit = 6): Promise<MissionSummary[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("missions")
    .select(PUBLIC_MISSION_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) fail("getFeaturedMissions", error.message);
  return ((data ?? []) as unknown as MissionRow[]).map(toMissionSummary);
}

export async function getMissionBySlug(slug: string): Promise<MissionSummary | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("missions")
    .select(PUBLIC_MISSION_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail("getMissionBySlug", error.message);
  return data ? toMissionSummary(data as unknown as MissionRow) : null;
}

export async function getMissionsByCategory(categorySlug: string): Promise<MissionSummary[]> {
  const supabase = getServerSupabase();
  // Resolve category id from slug first (categories are public).
  const catRes = await supabase
    .from("mission_categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (catRes.error) fail("getMissionsByCategory", catRes.error.message);
  const category = catRes.data as { id: string } | null;
  if (!category) return [];

  const { data, error } = await supabase
    .from("missions")
    .select(PUBLIC_MISSION_COLUMNS)
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("starts_at", { ascending: true });

  if (error) fail("getMissionsByCategory", error.message);
  return ((data ?? []) as unknown as MissionRow[]).map(toMissionSummary);
}

/**
 * Fetch published missions by id (RLS returns only published/public ones, so
 * a since-unpublished mission simply won't come back). Order preserved by id set.
 */
export async function getMissionsByIds(ids: string[]): Promise<MissionSummary[]> {
  if (ids.length === 0) return [];
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("missions")
    .select(PUBLIC_MISSION_COLUMNS)
    .in("id", ids);

  if (error) fail("getMissionsByIds", error.message);
  return ((data ?? []) as unknown as MissionRow[]).map(toMissionSummary);
}

/**
 * Organizer dashboard: all missions for an org (any status). RLS restricts this
 * to org members / admins, so it returns nothing for unauthorized callers.
 */
export async function getOrganizationMissions(organizationId: string): Promise<MissionSummary[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("missions")
    .select(PUBLIC_MISSION_COLUMNS)
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: false });

  if (error) fail("getOrganizationMissions", error.message);
  return ((data ?? []) as unknown as MissionRow[]).map(toMissionSummary);
}
