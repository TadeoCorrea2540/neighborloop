/**
 * Profile data access (server-safe).
 * RLS ensures users only read public profiles or their own; saved missions are
 * owner-only.
 */

import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { getMissionsByIds } from "@/lib/data/missions";
import type { MissionSummary } from "@/types/domain";

export interface PublicProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  interests: string[];
}

function fail(context: string, message: string): never {
  throw new Error(`[data/profiles] ${context}: ${message}`);
}

export async function getProfileById(userId: string): Promise<PublicProfile | null> {
  const supabase = getServerSupabase();
  const res = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, city, interests")
    .eq("id", userId)
    .maybeSingle();

  if (res.error) fail("getProfileById", res.error.message);
  const data = res.data as {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    interests: string[] | null;
  } | null;
  if (!data) return null;
  return {
    id: data.id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    city: data.city,
    interests: data.interests ?? [],
  };
}

/** Mission ids the user has saved (owner-only via RLS). */
export async function getSavedMissionIdsForUser(userId: string): Promise<string[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("saved_missions")
    .select("mission_id")
    .eq("user_id", userId);

  if (error) fail("getSavedMissionIdsForUser", error.message);
  const rows = (data ?? []) as { mission_id: string }[];
  return rows.map((r) => r.mission_id);
}

/**
 * A volunteer's saved missions as public mission summaries (newest first).
 * Two queries (ids → published missions) to avoid embedded-select fragility;
 * since-unpublished saved missions naturally drop out.
 */
export async function getVolunteerSavedMissions(userId: string): Promise<MissionSummary[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("saved_missions")
    .select("mission_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) fail("getVolunteerSavedMissions", error.message);
  const rows = (data ?? []) as { mission_id: string; created_at: string }[];
  if (rows.length === 0) return [];

  const missions = await getMissionsByIds(rows.map((r) => r.mission_id));
  const byId = new Map(missions.map((m) => [m.id, m]));
  // Preserve saved-order (newest first).
  return rows.map((r) => byId.get(r.mission_id)).filter((m): m is MissionSummary => Boolean(m));
}
