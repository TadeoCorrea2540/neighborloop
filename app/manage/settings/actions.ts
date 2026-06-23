"use server";

/**
 * Organization profile update. Owner/admin only (RLS is_org_manager). NEVER
 * includes verification_status / verification_note — the guard trigger blocks
 * non-admins from changing those. Slug is immutable (public URLs depend on it).
 */
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireOrganizer, type ActionResult } from "@/lib/auth/require-organizer";
import { getServerDb } from "@/lib/supabase/db";
import { uploadFile, readFile, IMAGE_TYPES, DOC_TYPES } from "@/lib/storage/upload";
import { BUCKETS, orgLogoPath, orgCoverPath, verificationDocPath } from "@/lib/storage/storage-paths";

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
export async function requestVerificationAction(fd?: FormData): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;

  // Optional supporting document. Organizers can't UPDATE the verification row
  // (admin-only), so the doc must be attached at insert time.
  let documentPath: string | null = null;
  const file = fd ? readFile(fd, "document") : null;
  if (file) {
    const up = await uploadFile({
      bucket: BUCKETS.verificationDocs,
      path: verificationDocPath(guard.orgId, randomUUID(), file.type),
      file,
      allowedTypes: DOC_TYPES,
      maxBytes: 10 * 1_048_576,
    });
    if (!up.ok) return { ok: false, code: "validation", error: up.error };
    documentPath = up.path;
  }

  // getServerDb(): document_path column isn't in generated types until 016 + regen.
  const { error } = await getServerDb().from("organization_verifications").insert({
    organization_id: guard.orgId,
    submitted_by: guard.userId,
    status: "pending",
    document_path: documentPath,
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

// ---------- organization media uploads ----------
async function uploadOrgMedia(
  fd: FormData,
  column: "logo_path" | "cover_image_path",
  pathFor: (orgId: string, mime: string) => string,
  maxBytes: number
): Promise<ActionResult> {
  const guard = await requireOrganizer();
  if (!guard.ok) return guard;
  const file = readFile(fd);
  if (!file) return { ok: false, code: "validation", error: "Please choose an image." };

  const up = await uploadFile({ bucket: BUCKETS.orgMedia, path: pathFor(guard.orgId, file.type), file, allowedTypes: IMAGE_TYPES, maxBytes });
  if (!up.ok) return { ok: false, code: "validation", error: up.error };

  const supabase = getServerSupabase();
  const patch = column === "logo_path" ? { logo_path: up.path } : { cover_image_path: up.path };
  const { error } = await supabase.from("organizations").update(patch).eq("id", guard.orgId);
  if (error) return { ok: false, code: "unknown", error: "Uploaded, but couldn’t save it to your profile." };

  revalidatePath("/manage/settings");
  revalidatePath("/", "layout"); // public org page
  return { ok: true };
}

export const uploadOrganizationLogoAction = (fd: FormData) =>
  uploadOrgMedia(fd, "logo_path", orgLogoPath, 2 * 1_048_576);
export const uploadOrganizationCoverAction = (fd: FormData) =>
  uploadOrgMedia(fd, "cover_image_path", orgCoverPath, 5 * 1_048_576);
