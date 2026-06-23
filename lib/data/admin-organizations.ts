/**
 * Admin organizations overview (server-only, ADMIN-ONLY by RLS). Lists every
 * org with verification status + member and mission counts. Read-only.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import type { VerificationStatus, OrganizationType } from "@/types/database";

function fail(context: string, message: string): never {
  throw new Error(`[data/admin-organizations] ${context}: ${message}`);
}

export interface AdminOrgItem {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType | null;
  verificationStatus: VerificationStatus;
  isPublic: boolean;
  city: string | null;
  countryCode: string | null;
  createdAt: string;
  memberCount: number;
  missionCount: number;
}

type RawOrg = {
  id: string;
  name: string;
  slug: string;
  organization_type: OrganizationType | null;
  verification_status: VerificationStatus;
  is_public: boolean;
  city: string | null;
  country_code: string | null;
  created_at: string;
};

export type OrgFilter = VerificationStatus | "all";

export async function getAdminOrganizations(filter: OrgFilter = "all"): Promise<AdminOrgItem[]> {
  const supabase = getServerSupabase();
  let query = supabase
    .from("organizations")
    .select("id, name, slug, organization_type, verification_status, is_public, city, country_code, created_at")
    .order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("verification_status", filter);

  const { data, error } = await query;
  if (error) fail("getAdminOrganizations", error.message);
  const rows = (data ?? []) as unknown as RawOrg[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [{ data: memberRows }, { data: missionRows }] = await Promise.all([
    supabase.from("organization_members").select("organization_id").in("organization_id", ids),
    supabase.from("missions").select("organization_id").in("organization_id", ids),
  ]);

  const members = new Map<string, number>();
  for (const m of (memberRows ?? []) as { organization_id: string }[])
    members.set(m.organization_id, (members.get(m.organization_id) ?? 0) + 1);
  const missions = new Map<string, number>();
  for (const m of (missionRows ?? []) as { organization_id: string }[])
    missions.set(m.organization_id, (missions.get(m.organization_id) ?? 0) + 1);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    type: r.organization_type,
    verificationStatus: r.verification_status,
    isPublic: r.is_public,
    city: r.city,
    countryCode: r.country_code,
    createdAt: r.created_at,
    memberCount: members.get(r.id) ?? 0,
    missionCount: missions.get(r.id) ?? 0,
  }));
}
