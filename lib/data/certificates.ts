/**
 * Certificate reads (server-only, RLS-scoped). Volunteers read their own; org
 * members read their org's; admins read all. New table → getServerDb().
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServerDb } from "@/lib/supabase/db";

export interface CertificateItem {
  id: string;
  certificateNumber: string;
  volunteerId: string;
  missionId: string;
  organizationId: string;
  hoursCredited: number;
  issuedAt: string;
  missionTitle: string;
  organizationName: string;
}

export interface CertificateFull extends CertificateItem {
  volunteerName: string;
}

type CertRow = {
  id: string;
  certificate_number: string;
  volunteer_id: string;
  mission_id: string;
  organization_id: string;
  hours_credited: number;
  issued_at: string;
};

async function decorate(rows: CertRow[]): Promise<CertificateItem[]> {
  if (rows.length === 0) return [];
  const supabase = getServerSupabase();
  const missionIds = Array.from(new Set(rows.map((r) => r.mission_id)));
  const orgIds = Array.from(new Set(rows.map((r) => r.organization_id)));
  const [{ data: missions }, { data: orgs }] = await Promise.all([
    supabase.from("missions").select("id, title").in("id", missionIds),
    supabase.from("organizations").select("id, name").in("id", orgIds),
  ]);
  const mTitle = new Map(((missions ?? []) as { id: string; title: string }[]).map((m) => [m.id, m.title]));
  const oName = new Map(((orgs ?? []) as { id: string; name: string }[]).map((o) => [o.id, o.name]));
  return rows.map((r) => ({
    id: r.id,
    certificateNumber: r.certificate_number,
    volunteerId: r.volunteer_id,
    missionId: r.mission_id,
    organizationId: r.organization_id,
    hoursCredited: Number(r.hours_credited),
    issuedAt: r.issued_at,
    missionTitle: mTitle.get(r.mission_id) ?? "Mission",
    organizationName: oName.get(r.organization_id) ?? "Organization",
  }));
}

const SELECT = "id, certificate_number, volunteer_id, mission_id, organization_id, hours_credited, issued_at";

export async function getVolunteerCertificates(userId: string): Promise<CertificateItem[]> {
  const { data } = await getServerDb()
    .from("certificates")
    .select(SELECT)
    .eq("volunteer_id", userId)
    .order("issued_at", { ascending: false });
  return decorate((data ?? []) as CertRow[]);
}

export async function getOrganizationCertificates(organizationId: string): Promise<CertificateItem[]> {
  const { data } = await getServerDb()
    .from("certificates")
    .select(SELECT)
    .eq("organization_id", organizationId)
    .order("issued_at", { ascending: false });
  return decorate((data ?? []) as CertRow[]);
}

/** RLS-scoped read — returns null if the certificate isn't readable by this user. */
export async function getCertificateByIdForUser(
  certificateId: string,
  _userId: string
): Promise<CertificateFull | null> {
  const { data } = await getServerDb().from("certificates").select(SELECT).eq("id", certificateId).maybeSingle();
  if (!data) return null;
  const [base] = await decorate([data as CertRow]);
  if (!base) return null;
  const supabase = getServerSupabase();
  const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", base.volunteerId).maybeSingle();
  const volunteerName = (prof as { display_name: string } | null)?.display_name ?? "Volunteer";
  return { ...base, volunteerName };
}
