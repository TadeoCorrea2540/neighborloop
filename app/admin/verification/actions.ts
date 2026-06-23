"use server";

/**
 * Admin organization-verification decisions. Admin-only (requireAdmin + RLS).
 * Writes the decision to BOTH the organization_verifications log row and the
 * denormalized organizations.verification_status (the source of truth for
 * badges / banners). The public reason goes to organizations.verification_note
 * (organizer-readable); internal_note stays on the log row (admin-only).
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireAdmin, UUID_RE, type ActionResult } from "@/lib/auth/require-admin";
import { writeAuditEvent } from "@/lib/data/audit";
import type { VerificationStatus } from "@/types/database";

interface VerifContext {
  organizationId: string;
  status: VerificationStatus;
}

async function loadVerification(id: string): Promise<VerifContext | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("organization_verifications")
    .select("organization_id, status")
    .eq("id", id)
    .maybeSingle();
  // NB: the row uses snake_case (organization_id) — map it; a bare cast would
  // leave ctx.organizationId undefined.
  const row = data as { organization_id: string; status: VerificationStatus } | null;
  return row ? { organizationId: row.organization_id, status: row.status } : null;
}

function revalidate(orgSlug: string | null) {
  revalidatePath("/admin", "layout"); // dashboard + all admin sub-pages
  revalidatePath("/manage/settings");
  revalidatePath("/manage/dashboard");
  revalidatePath("/", "layout"); // home featured + public org pages
  if (orgSlug) revalidatePath(`/org/${orgSlug}`);
}

async function applyDecision(
  id: string,
  next: VerificationStatus,
  opts: { publicReason?: string | null; internalNote?: string | null; eventType: Parameters<typeof writeAuditEvent>[0]["eventType"] }
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(id)) return { ok: false, code: "validation", error: "Invalid verification record." };

  const ctx = await loadVerification(id);
  if (!ctx) return { ok: false, code: "not_found", error: "That verification record no longer exists." };

  const supabase = getServerSupabase();
  const nowIso = new Date().toISOString();

  // 1) Org status (source of truth). verification_note holds the SAFE public reason.
  const { data: orgRow, error: orgErr } = await supabase
    .from("organizations")
    .update({ verification_status: next, verification_note: opts.publicReason ?? null })
    .eq("id", ctx.organizationId)
    .select("slug")
    .maybeSingle();
  if (orgErr) return { ok: false, code: "unknown", error: "Couldn’t update the organization. Please try again." };

  // 2) Decision log row (internal_note is admin-only).
  const { error: verifErr } = await supabase
    .from("organization_verifications")
    .update({
      status: next,
      reviewed_by: guard.userId,
      reviewed_at: nowIso,
      public_reason: opts.publicReason ?? null,
      internal_note: opts.internalNote ?? null,
    })
    .eq("id", id);
  if (verifErr) return { ok: false, code: "unknown", error: "Couldn’t record the decision. Please try again." };

  await writeAuditEvent({
    actorId: guard.userId,
    eventType: opts.eventType,
    entityType: "organization",
    entityId: ctx.organizationId,
    metadata: { verificationId: id, status: next },
  });

  revalidate((orgRow as { slug: string } | null)?.slug ?? null);
  return { ok: true };
}

export async function approveVerificationAction(id: string, internalNote?: string): Promise<ActionResult> {
  return applyDecision(id, "verified", {
    publicReason: null,
    internalNote: internalNote?.trim().slice(0, 2000) || null,
    eventType: "organization_verification_approved",
  });
}

export async function rejectVerificationAction(
  id: string,
  publicReason: string,
  internalNote?: string
): Promise<ActionResult> {
  const reason = publicReason?.trim();
  if (!reason) {
    return { ok: false, code: "validation", error: "A public reason is required when rejecting." };
  }
  return applyDecision(id, "rejected", {
    publicReason: reason.slice(0, 600),
    internalNote: internalNote?.trim().slice(0, 2000) || null,
    eventType: "organization_verification_rejected",
  });
}

export async function returnVerificationToPendingAction(
  id: string,
  internalNote: string
): Promise<ActionResult> {
  const note = internalNote?.trim();
  if (!note) {
    return { ok: false, code: "validation", error: "Add an internal note explaining why this is reopened." };
  }
  return applyDecision(id, "pending", {
    publicReason: null,
    internalNote: note.slice(0, 2000),
    eventType: "organization_verification_returned_to_pending",
  });
}
