/**
 * Admin verification reads (server-only, ADMIN-ONLY by RLS).
 *
 * organization_verifications is admin-read-only — organizers can't select it, so
 * internal_note never leaks. The org's *current* status lives on
 * organizations.verification_status (denormalized); these rows are the decision
 * history. RLS (is_admin) returns nothing to non-admins.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { VerificationStatus, OrganizationType } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/admin-verification] ${context}: ${message}`);
}

export interface AdminVerificationItem {
  id: string;
  organizationId: string;
  orgName: string;
  orgType: OrganizationType | null;
  orgSlug: string | null;
  city: string | null;
  countryCode: string | null;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  publicReason: string | null;
  internalNote: string | null;
}

export interface VerificationDetail {
  item: AdminVerificationItem;
  org: {
    id: string;
    name: string;
    slug: string;
    type: OrganizationType | null;
    shortDescription: string | null;
    description: string | null;
    websiteUrl: string | null;
    instagramUrl: string | null;
    city: string | null;
    countryCode: string | null;
    isPublic: boolean;
    verificationStatus: VerificationStatus;
    createdAt: string;
  };
  owner: { displayName: string; city: string | null } | null;
  missions: { id: string; title: string; status: string; startsAt: string }[];
  history: AdminVerificationItem[];
}

type RawVerif = {
  id: string;
  organization_id: string;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  public_reason: string | null;
  internal_note: string | null;
  organizations: {
    name: string;
    slug: string;
    organization_type: OrganizationType | null;
    city: string | null;
    country_code: string | null;
  } | null;
};

const SELECT =
  "id, organization_id, status, submitted_at, reviewed_at, public_reason, internal_note, " +
  "organizations(name, slug, organization_type, city, country_code)";

function toItem(r: RawVerif): AdminVerificationItem {
  return {
    id: r.id,
    organizationId: r.organization_id,
    orgName: r.organizations?.name ?? "Organization",
    orgType: r.organizations?.organization_type ?? null,
    orgSlug: r.organizations?.slug ?? null,
    city: r.organizations?.city ?? null,
    countryCode: r.organizations?.country_code ?? null,
    status: r.status,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
    publicReason: r.public_reason,
    internalNote: r.internal_note,
  };
}

export type VerificationFilter = VerificationStatus | "all";

export async function getOrganizationVerifications(
  filter: VerificationFilter = "pending"
): Promise<AdminVerificationItem[]> {
  const supabase = getServerSupabase();
  let query = supabase
    .from("organization_verifications")
    .select(SELECT)
    .order("submitted_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);

  const { data, error } = await query;
  if (error) fail("getOrganizationVerifications", error.message);
  return ((data ?? []) as unknown as RawVerif[]).map(toItem);
}

export async function getPendingVerificationCount(): Promise<number> {
  const supabase = getServerSupabase();
  const { count } = await supabase
    .from("organization_verifications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function getVerificationDetailById(id: string): Promise<VerificationDetail | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("organization_verifications")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) fail("getVerificationDetailById", error.message);
  if (!data) return null;
  const item = toItem(data as unknown as RawVerif);

  // Full org profile (admin can read any org).
  const { data: orgRow } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, organization_type, short_description, description, website_url, instagram_url, city, country_code, is_public, verification_status, owner_id, created_at"
    )
    .eq("id", item.organizationId)
    .maybeSingle();
  const o = orgRow as {
    id: string; name: string; slug: string; organization_type: OrganizationType | null;
    short_description: string | null; description: string | null; website_url: string | null;
    instagram_url: string | null; city: string | null; country_code: string | null;
    is_public: boolean; verification_status: VerificationStatus; owner_id: string; created_at: string;
  } | null;
  if (!o) return null;

  const [{ data: ownerRow }, { data: missionRows }, history] = await Promise.all([
    supabase.from("profiles").select("display_name, city").eq("id", o.owner_id).maybeSingle(),
    supabase
      .from("missions")
      .select("id, title, status, starts_at")
      .eq("organization_id", o.id)
      .order("created_at", { ascending: false })
      .limit(20),
    getVerificationHistory(o.id),
  ]);

  const owner = ownerRow as { display_name: string; city: string | null } | null;
  const missions = ((missionRows ?? []) as { id: string; title: string; status: string; starts_at: string }[]).map(
    (m) => ({ id: m.id, title: m.title, status: m.status, startsAt: m.starts_at })
  );

  return {
    item,
    org: {
      id: o.id, name: o.name, slug: o.slug, type: o.organization_type,
      shortDescription: o.short_description, description: o.description,
      websiteUrl: o.website_url, instagramUrl: o.instagram_url, city: o.city,
      countryCode: o.country_code, isPublic: o.is_public,
      verificationStatus: o.verification_status, createdAt: o.created_at,
    },
    owner: owner ? { displayName: owner.display_name, city: owner.city } : null,
    missions,
    history,
  };
}

async function getVerificationHistory(organizationId: string): Promise<AdminVerificationItem[]> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("organization_verifications")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .order("submitted_at", { ascending: false });
  return ((data ?? []) as unknown as RawVerif[]).map(toItem);
}
