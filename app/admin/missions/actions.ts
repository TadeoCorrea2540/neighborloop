"use server";

/**
 * Admin mission moderation. Admin-only (requireAdmin + RLS lets admins update
 * ANY org's mission). Distinct from the organizer actions, which are own-org
 * scoped. Uses the existing mission status model; the moderation reason is
 * stored in the audit metadata (missions has no moderation-note column).
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireAdmin, UUID_RE, type ActionResult } from "@/lib/auth/require-admin";
import { writeAuditEvent } from "@/lib/data/audit";
import type { MissionStatus } from "@/types/database";

export type ModerationAction = "pause" | "cancel" | "archive";

const TRANSITIONS: Record<ModerationAction, { from: MissionStatus[]; to: MissionStatus }> = {
  pause: { from: ["published"], to: "paused" },
  cancel: { from: ["draft", "pending_review", "published", "paused"], to: "cancelled" },
  archive: { from: ["draft", "pending_review", "closed", "cancelled"], to: "archived" },
};

function revalidate(slug: string | null) {
  revalidatePath("/admin", "layout");
  revalidatePath("/explore");
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/missions/${slug}`);
}

async function loadMission(id: string): Promise<{ status: MissionStatus; slug: string } | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase.from("missions").select("status, slug").eq("id", id).maybeSingle();
  return (data as { status: MissionStatus; slug: string } | null) ?? null;
}

export async function moderateMissionAction(
  missionId: string,
  action: ModerationAction,
  reason: string
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };
  const map = TRANSITIONS[action];
  if (!map) return { ok: false, code: "validation", error: "Unknown moderation action." };
  const trimmedReason = reason?.trim();
  if (!trimmedReason) return { ok: false, code: "validation", error: "A reason is required to moderate a mission." };

  const mission = await loadMission(missionId);
  if (!mission) return { ok: false, code: "not_found", error: "That mission no longer exists." };
  if (!map.from.includes(mission.status)) {
    return { ok: false, code: "transition", error: `Can’t ${action} a mission that is ${mission.status}.` };
  }

  const supabase = getServerSupabase();
  const { error } = await supabase.from("missions").update({ status: map.to }).eq("id", missionId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update this mission." };

  await writeAuditEvent({
    actorId: guard.userId,
    eventType: "mission_moderated",
    entityType: "mission",
    entityId: missionId,
    metadata: { action, reason: trimmedReason.slice(0, 1000), from: mission.status, to: map.to },
  });

  revalidate(mission.slug);
  return { ok: true };
}

/** Audit-only "reviewed" stamp — no status change. */
export async function markMissionReviewedAction(missionId: string, note?: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(missionId)) return { ok: false, code: "validation", error: "Invalid mission." };

  const mission = await loadMission(missionId);
  if (!mission) return { ok: false, code: "not_found", error: "That mission no longer exists." };

  await writeAuditEvent({
    actorId: guard.userId,
    eventType: "mission_moderated",
    entityType: "mission",
    entityId: missionId,
    metadata: { action: "reviewed", note: note?.trim().slice(0, 1000) ?? null, status: mission.status },
  });

  revalidatePath("/admin", "layout");
  return { ok: true };
}
