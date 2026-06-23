"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/server";
import type { OrganizationType } from "@/types/database";
import type { AuthActionState } from "@/app/auth/actions";
import { ORG_TYPES } from "./org-types";

export interface OrgOnboardingInput {
  name: string;
  organizationType: string;
  city?: string;
  countryCode?: string;
  shortDescription?: string;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "org"
  );
}

export async function createOrganizationAction(input: OrgOnboardingInput): Promise<AuthActionState> {
  // Only organizers/admins reach here; volunteers are bounced by requireRole.
  const { user } = await requireRole(["organizer", "admin"]);

  const name = input.name?.trim();
  if (!name) return { error: "Please enter your organization name." };
  if (!input.shortDescription?.trim()) return { error: "Please add a short description." };

  const validType = ORG_TYPES.some((t) => t.value === input.organizationType)
    ? (input.organizationType as OrganizationType)
    : "other";

  const supabase = getServerSupabase();
  const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 6)}`;

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      owner_id: user.id,
      organization_type: validType,
      name,
      slug,
      short_description: input.shortDescription.trim(),
      city: input.city?.trim() || null,
      country_code: input.countryCode?.trim() || null,
      is_public: true,
      // Phase 5 product rule: organizers can publish without formal verification.
      // Admin verification (Phase 6) upgrades this to 'verified' for the badge.
      verification_status: "not_required",
    })
    .select("id")
    .single();

  if (error || !org) {
    return { error: "We couldn’t create your organization. Please try again." };
  }

  // Bootstrap the owner membership (RLS allows the owner to self-insert this row).
  await supabase.from("organization_members").insert({
    organization_id: (org as { id: string }).id,
    user_id: user.id,
    member_role: "owner",
  });

  revalidatePath("/manage", "layout");
  redirect("/manage/dashboard");
}
