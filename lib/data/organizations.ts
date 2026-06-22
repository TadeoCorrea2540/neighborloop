/**
 * Organization data access (server-safe).
 * Public queries never expose verification internal notes (those live in
 * organization_verifications, which is admin-only via RLS).
 */

import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  toOrganizationSummary,
  toMissionSummary,
  type OrganizationSummary,
  type MissionSummary,
} from "@/types/domain";
import type { MissionRow, OrganizationRow } from "@/types/database";

const PUBLIC_ORG_COLUMNS =
  "id, slug, name, organization_type, short_description, description, website_url, " +
  "instagram_url, logo_path, cover_image_path, city, country_code, is_public, verification_status";

const PUBLIC_MISSION_COLUMNS =
  "id, slug, title, summary, status, category_id, organization_id, cover_image_path, " +
  "is_virtual, location_label, city, starts_at, ends_at, timezone, volunteer_capacity, " +
  "estimated_hours, difficulty, is_beginner_friendly, skills, perks, published_at";

function fail(context: string, message: string): never {
  throw new Error(`[data/organizations] ${context}: ${message}`);
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationSummary | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("organizations")
    .select(PUBLIC_ORG_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail("getOrganizationBySlug", error.message);
  return data ? toOrganizationSummary(data as unknown as OrganizationRow) : null;
}

export async function getOrganizationById(id: string): Promise<OrganizationSummary | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("organizations")
    .select(PUBLIC_ORG_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) fail("getOrganizationById", error.message);
  return data ? toOrganizationSummary(data as unknown as OrganizationRow) : null;
}

export async function getOrganizationPublicMissions(
  organizationSlug: string
): Promise<MissionSummary[]> {
  const supabase = getServerSupabase();
  const orgRes = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (orgRes.error) fail("getOrganizationPublicMissions", orgRes.error.message);
  const org = orgRes.data as { id: string } | null;
  if (!org) return [];

  const { data, error } = await supabase
    .from("missions")
    .select(PUBLIC_MISSION_COLUMNS)
    .eq("organization_id", org.id)
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) fail("getOrganizationPublicMissions", error.message);
  return ((data ?? []) as unknown as MissionRow[]).map(toMissionSummary);
}
