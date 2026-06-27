"use server";

/**
 * Organizer application review actions. Organizers may only review applications
 * for missions belonging to their own org (verified here + RLS). Approving
 * respects mission capacity (direct approved-count — organizers can read their
 * own apps). Applications are never hard-deleted.
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireOrganizer, UUID_RE, type ActionResult } from "@/lib/auth/require-organizer";
import { createNotification, type NotificationType } from "@/lib/data/notifications";
import { createReminder } from "@/lib/data/reminders";
import type { ApplicationStatus } from "@/types/database";

interface AppContext {
  status: ApplicationStatus;
  missionId: string;
  capacity: number | null;
  volunteerId: string;
  missionTitle: string;
  missionSlug: string;
  startsAt: string | null;
}

async function loadOwnedApplication(
  orgId: string,
  applicationId: string
): Promise<AppContext | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("applications")
    .select("id, status, mission_id, volunteer_id, missions!inner(organization_id, volunteer_capacity, title, slug, starts_at)")
    .eq("id", applicationId)
    .maybeSingle();
  const row = data as
    | {
        status: ApplicationStatus; mission_id: string; volunteer_id: string;
        missions: { organization_id: string; volunteer_capacity: number | null; title: string; slug: string; starts_at: string | null } | null;
      }
    | null;
  if (!row || !row.missions || row.missions.organization_id !== orgId) return null;
  return {
    status: row.status,
    missionId: row.mission_id,
    capacity: row.missions.volunteer_capacity,
    volunteerId: row.volunteer_id,
    missionTitle: row.missions.title,
    missionSlug: row.missions.slug,
    startsAt: row.missions.starts_at,
  };
}

const STATUS_NOTIF: Record<"approved" | "declined" | "waitlisted", { type: NotificationType; title: string; body: (t: string) => string }> = {
  approved: { type: "application_approved", title: "You’re approved", body: (t) => `You’re approved for “${t}”. See you there!` },
  declined: { type: "application_declined", title: "Application update", body: (t) => `Your application for “${t}” wasn’t selected this time.` },
  waitlisted: { type: "application_waitlisted", title: "You’re on the waitlist", body: (t) => `You’ve been added to the waitlist for “${t}”.` },
};

function revalidate(missionId: string) {
  revalidatePath("/manage/applicants");
  revalidatePath(`/manage/missions/${missionId}/applications`);
  revalidatePath("/manage/dashboard");
}

async function review(
  applicationId: string,
  to: ApplicationStatus,
  allowedFrom: ApplicationStatus[],
  note: string | undefined,
  opts: { checkCapacity?: boolean } = {}
): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(applicationId)) return { ok: false, code: "validation", error: "Invalid application." };

  const ctx = await loadOwnedApplication(guard.orgId, applicationId);
  if (!ctx) return { ok: false, code: "forbidden", error: "You don’t have permission to review this application." };
  if (!allowedFrom.includes(ctx.status)) {
    return { ok: false, code: "transition", error: "This application can’t change to that status from its current one." };
  }

  const supabase = getServerSupabase();

  if (opts.checkCapacity && ctx.capacity != null) {
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("mission_id", ctx.missionId)
      .eq("status", "approved");
    if ((count ?? 0) >= ctx.capacity) {
      return { ok: false, code: "full", error: "This mission already has the maximum number of approved volunteers. Try the waitlist." };
    }
  }

  const patch: {
    status: ApplicationStatus;
    reviewed_by: string;
    reviewed_at: string;
    organizer_note?: string | null;
  } = {
    status: to,
    reviewed_by: guard.userId,
    reviewed_at: new Date().toISOString(),
  };
  if (note !== undefined) patch.organizer_note = note.trim().slice(0, 1000) || null;

  const { error } = await supabase.from("applications").update(patch).eq("id", applicationId);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update this application." };

  // Notify the volunteer of the decision (best-effort).
  const notif = STATUS_NOTIF[to as "approved" | "declined" | "waitlisted"];
  if (notif) {
    await createNotification(ctx.volunteerId, {
      type: notif.type,
      title: notif.title,
      body: notif.body(ctx.missionTitle),
      linkUrl: `/missions/${ctx.missionSlug}`,
      entityType: "mission",
      entityId: ctx.missionId,
    });
  }

  // On approval, seed event reminders for the volunteer (records only; no cron).
  if (to === "approved" && ctx.startsAt) {
    const start = Date.parse(ctx.startsAt);
    const now = Date.now();
    const seed = [
      { type: "mission_24h_before" as const, at: start - 24 * 3_600_000 },
      { type: "mission_2h_before" as const, at: start - 2 * 3_600_000 },
    ];
    for (const r of seed) {
      if (r.at > now) {
        await createReminder({
          type: r.type,
          scheduledFor: new Date(r.at).toISOString(),
          missionId: ctx.missionId,
          userId: ctx.volunteerId,
          organizationId: guard.orgId,
          metadata: { missionTitle: ctx.missionTitle, missionSlug: ctx.missionSlug },
        });
      }
    }
  }

  revalidate(ctx.missionId);
  return { ok: true };
}

export const approveApplicationAction = (id: string) =>
  review(id, "approved", ["pending", "waitlisted"], undefined, { checkCapacity: true });

export const declineApplicationAction = (id: string, note?: string) =>
  review(id, "declined", ["pending", "waitlisted", "approved"], note);

export const waitlistApplicationAction = (id: string, note?: string) =>
  review(id, "waitlisted", ["pending", "approved"], note);
