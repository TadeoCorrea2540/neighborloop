"use server";

/**
 * Organization profile update. Owner/admin only (RLS is_org_manager). NEVER
 * includes verification_status / verification_note — the guard trigger blocks
 * non-admins from changing those. Slug is immutable (public URLs depend on it).
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireOrganizer, type ActionResult } from "@/lib/auth/require-organizer";

function clean(fd: FormData, k: string, max = 600): string | null {
  const v = (fd.get(k) ?? "").toString().trim();
  return v ? v.slice(0, max) : null;
}

function validUrl(v: string | null): boolean {
  if (!v) return true; // optional
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateOrganizationAction(fd: FormData): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;

  const name = clean(fd, "name", 120);
  if (!name) return { ok: false, code: "validation", error: "Please enter your organization name." };
  const shortDescription = clean(fd, "short_description", 200);
  if (!shortDescription) return { ok: false, code: "validation", error: "Please add a short description." };

  const websiteUrl = clean(fd, "website_url", 300);
  const instagramUrl = clean(fd, "instagram_url", 300);
  if (!validUrl(websiteUrl) || !validUrl(instagramUrl)) {
    return { ok: false, code: "validation", error: "Please enter valid website / social links (including https://)." };
  }

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      short_description: shortDescription,
      description: clean(fd, "description", 4000),
      website_url: websiteUrl,
      instagram_url: instagramUrl,
      city: clean(fd, "city", 120),
      country_code: clean(fd, "country_code", 8),
      is_public: fd.get("is_public") != null,
      // verification_status / verification_note intentionally omitted (trigger).
    })
    .eq("id", guard.orgId);

  if (error) return { ok: false, code: "unknown", error: "Couldn’t save your organization. Please try again." };

  revalidatePath("/manage", "layout");
  revalidatePath("/manage/settings");
  revalidatePath("/", "layout"); // public org page
  return { ok: true };
}

/**
 * Organizer requests admin verification. Inserts a PENDING
 * organization_verifications row (RLS org_verif_insert allows org managers to
 * submit for their own org). This is the producer for the admin verification
 * queue. The org's verification_status is only moved by an admin decision —
 * organizers can't self-verify (guard trigger).
 *
 * Dedupe is enforced at the DB (partial unique index uq_org_verif_one_pending,
 * migration 013) — NOT by reading first, because organizers can't SELECT
 * organization_verifications (admin-only read). A duplicate pending insert
 * returns 23505, which we map to a friendly message.
 */
export async function requestVerificationAction(): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;

  const supabase = getServerSupabase();
  const { error } = await supabase.from("organization_verifications").insert({
    organization_id: guard.orgId,
    submitted_by: guard.userId,
    status: "pending",
  });
  if (error) {
    if (error.code === "23505") {
      return { ok: false, code: "conflict", error: "You already have a verification request awaiting review." };
    }
    return { ok: false, code: "unknown", error: "Couldn’t submit your request. Please try again." };
  }

  revalidatePath("/manage/settings");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
