/**
 * Resolves the organization the current organizer belongs to. Most organizers
 * have exactly one (the org they own). Cached per request so the layout, page,
 * and actions share one lookup.
 */
import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import type { VerificationStatus } from "@/types/database";

export interface PrimaryOrganization {
  id: string;
  name: string;
  slug: string;
  verificationStatus: VerificationStatus;
}

export const getPrimaryOrganizationForUser = cache(
  async (userId: string): Promise<PrimaryOrganization | null> => {
    const supabase = getServerSupabase();
    const { data: members } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1);

    const orgId = (members?.[0] as { organization_id: string } | undefined)?.organization_id;
    if (!orgId) return null;

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, slug, verification_status")
      .eq("id", orgId)
      .maybeSingle();
    if (!org) return null;

    const o = org as { id: string; name: string; slug: string; verification_status: VerificationStatus };
    return { id: o.id, name: o.name, slug: o.slug, verificationStatus: o.verification_status };
  }
);
