/**
 * Private mission details (exact address, contact, instructions). RLS: only org
 * members can read, only org managers can write (mpd_write). NEVER rendered on
 * public pages.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { MissionPrivateDetailRow } from "@/types/database";

export async function getMissionPrivateDetails(
  missionId: string
): Promise<MissionPrivateDetailRow | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("mission_private_details")
    .select("*")
    .eq("mission_id", missionId)
    .maybeSingle();
  return (data as unknown as MissionPrivateDetailRow) ?? null;
}
