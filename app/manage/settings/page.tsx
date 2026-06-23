import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getServerSupabase } from "@/lib/supabase/server";
import { publicMediaUrl } from "@/lib/storage/urls";
import { BUCKETS } from "@/lib/storage/storage-paths";
import type { VerificationStatus } from "@/types/database";
import SettingsClient from "./settings-client";
import RequestVerificationButton from "@/components/manage/request-verification-button";

export const dynamic = "force-dynamic";

export interface OrgSettings {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  city: string | null;
  countryCode: string | null;
  isPublic: boolean;
  verificationStatus: VerificationStatus;
}

const VERIFY_BANNER: Record<VerificationStatus, { emoji: string; bg: string; color: string; text: string }> = {
  not_required: { emoji: "✅", bg: "#dff6ea", color: "#147a57", text: "Your organization can publish missions freely — no verification required." },
  verified: { emoji: "✓", bg: "#dff6ea", color: "#147a57", text: "Verified organization. The verified badge shows on your public pages." },
  pending: { emoji: "⏳", bg: "#fff0dd", color: "#b9651b", text: "Verification is pending admin review. You can still publish missions in the meantime." },
  rejected: { emoji: "ℹ️", bg: "#f1f3f8", color: "#5a6685", text: "Verification wasn’t granted. You can still publish missions; contact support for details." },
};

export default async function SettingsPage() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/settings");
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, slug, short_description, description, website_url, instagram_url, city, country_code, is_public, verification_status, verification_note, logo_path, cover_image_path")
    .eq("id", guard.orgId)
    .maybeSingle();

  if (!data) redirect("/manage/onboarding");
  const r = data as {
    id: string; name: string; slug: string; short_description: string | null;
    description: string | null; website_url: string | null; instagram_url: string | null;
    city: string | null; country_code: string | null; is_public: boolean;
    verification_status: VerificationStatus; verification_note: string | null;
    logo_path: string | null; cover_image_path: string | null;
  };
  const logoUrl = publicMediaUrl(BUCKETS.orgMedia, r.logo_path);
  const coverUrl = publicMediaUrl(BUCKETS.orgMedia, r.cover_image_path);
  const org: OrgSettings = {
    id: r.id, name: r.name, slug: r.slug, shortDescription: r.short_description,
    description: r.description, websiteUrl: r.website_url, instagramUrl: r.instagram_url,
    city: r.city, countryCode: r.country_code, isPublic: r.is_public, verificationStatus: r.verification_status,
  };
  const banner = VERIFY_BANNER[org.verificationStatus];
  const canRequest = org.verificationStatus === "not_required" || org.verificationStatus === "rejected";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-.02em" }}>Organization settings</h2>
      <p style={{ margin: "0 0 18px", color: "var(--muted-2)", fontSize: 14 }}>
        This is your public profile. Your link <code style={{ background: "#f1f3f8", padding: "1px 6px", borderRadius: 6 }}>/org/{org.slug}</code> stays the same.
      </p>

      <div style={{ background: banner.bg, color: banner.color, borderRadius: 14, padding: "13px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 600 }}>
            <span style={{ fontSize: 16 }}>{banner.emoji}</span>
            <span>{banner.text}</span>
          </div>
          {canRequest && <RequestVerificationButton />}
        </div>
        {org.verificationStatus === "rejected" && r.verification_note && (
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink)", background: "#fff", border: "1px solid rgba(24,32,59,.08)", borderRadius: 10, padding: "10px 12px" }}>
            <strong>Reviewer note:</strong> {r.verification_note}
          </div>
        )}
      </div>

      <SettingsClient org={org} logoUrl={logoUrl} coverUrl={coverUrl} />
    </div>
  );
}
