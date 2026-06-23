/** Mission update reads (server-only). RLS: org members + approved volunteers + admin. */
import "server-only";
import { getServerDb } from "@/lib/supabase/db";

export type MissionUpdateType =
  | "general" | "schedule_change" | "location_change" | "reminder" | "attendance" | "cancellation" | "thank_you";

export interface MissionUpdateItem {
  id: string;
  title: string;
  body: string;
  updateType: MissionUpdateType;
  createdAt: string;
}

type RawUpdate = { id: string; title: string; body: string; update_type: MissionUpdateType; created_at: string };

export async function getMissionUpdatesForOrganizer(organizationId: string, missionId: string): Promise<MissionUpdateItem[]> {
  const { data } = await getServerDb()
    .from("mission_updates")
    .select("id, title, body, update_type, created_at")
    .eq("organization_id", organizationId)
    .eq("mission_id", missionId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as RawUpdate[]).map(toItem);
}

export async function getMissionUpdatesForVolunteer(missionId: string): Promise<MissionUpdateItem[]> {
  // RLS limits visibility to approved volunteers / org members.
  const { data } = await getServerDb()
    .from("mission_updates")
    .select("id, title, body, update_type, created_at")
    .eq("mission_id", missionId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as RawUpdate[]).map(toItem);
}

function toItem(r: RawUpdate): MissionUpdateItem {
  return { id: r.id, title: r.title, body: r.body, updateType: r.update_type, createdAt: r.created_at };
}
