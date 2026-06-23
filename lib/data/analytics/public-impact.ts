import "server-only";

/**
 * Public-safe impact wrappers. Anonymous visitors cannot read
 * attendance_records/certificates (RLS), so public impact numbers come from the
 * SECURITY DEFINER aggregates in migration 019 — totals only, never PII, gated on
 * organizations.is_public + published/closed missions. Best-effort: any error or
 * a non-public org yields null and the page falls back gracefully.
 */
import { getServerSupabase } from "@/lib/supabase/server";

export interface PublicOrgImpact {
  missionsHosted: number;
  volunteerHours: number;
  certificatesIssued: number;
  uniqueVolunteers: number;
  causesSupported: number;
}

export interface PublicPlatformImpact {
  organizationsActive: number;
  missionsHosted: number;
  volunteerHours: number;
  certificatesIssued: number;
  uniqueVolunteers: number;
}

// Minimal rpc typing so this compiles before `db:types` regenerates the functions.
type PublicImpactRpc = {
  rpc: ((
    fn: "get_public_organization_impact",
    args: { p_organization_id: string },
  ) => Promise<{ data: PublicOrgRow[] | null; error: { message: string } | null }>) &
    ((
      fn: "get_public_platform_impact",
      args?: Record<string, never>,
    ) => Promise<{ data: PublicPlatformRow[] | null; error: { message: string } | null }>);
};

type PublicOrgRow = { missions_hosted: number; volunteer_hours: number; certificates_issued: number; unique_volunteers: number; causes_supported: number };
type PublicPlatformRow = { organizations_active: number; missions_hosted: number; volunteer_hours: number; certificates_issued: number; unique_volunteers: number };

export async function getPublicOrganizationImpact(organizationId: string): Promise<PublicOrgImpact | null> {
  const supabase = getServerSupabase() as unknown as PublicImpactRpc;
  const { data, error } = await supabase.rpc("get_public_organization_impact", { p_organization_id: organizationId });
  if (error || !data || data.length === 0) return null;
  const r = data[0];
  return {
    missionsHosted: r.missions_hosted,
    volunteerHours: Number(r.volunteer_hours),
    certificatesIssued: r.certificates_issued,
    uniqueVolunteers: r.unique_volunteers,
    causesSupported: r.causes_supported,
  };
}

export async function getPublicPlatformImpact(): Promise<PublicPlatformImpact | null> {
  const supabase = getServerSupabase() as unknown as PublicImpactRpc;
  const { data, error } = await supabase.rpc("get_public_platform_impact");
  if (error || !data || data.length === 0) return null;
  const r = data[0];
  return {
    organizationsActive: r.organizations_active,
    missionsHosted: r.missions_hosted,
    volunteerHours: Number(r.volunteer_hours),
    certificatesIssued: r.certificates_issued,
    uniqueVolunteers: r.unique_volunteers,
  };
}
