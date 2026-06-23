"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthToast from "@/components/auth/auth-toast";
import { updateOrganizationAction, uploadOrganizationLogoAction, uploadOrganizationCoverAction } from "./actions";
import ImageUpload from "@/components/manage/image-upload";
import type { OrgSettings } from "./page";

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#3a425e", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", border: "1px solid rgba(24,32,59,.14)",
  borderRadius: 12, padding: "11px 13px", fontSize: 14, outline: "none", background: "#fbfcfe",
};

export default function SettingsClient({ org, logoUrl, coverUrl }: { org: OrgSettings; logoUrl: string | null; coverUrl: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; tone: "error" | "success" } | null>(null);
  const [seq, setSeq] = useState(0);
  const show = (msg: string, tone: "error" | "success") => {
    setToast({ msg, tone });
    setSeq((n) => n + 1);
  };

  const [f, setF] = useState({
    name: org.name,
    short_description: org.shortDescription ?? "",
    description: org.description ?? "",
    website_url: org.websiteUrl ?? "",
    instagram_url: org.instagramUrl ?? "",
    city: org.city ?? "",
    country_code: org.countryCode ?? "",
    is_public: org.isPublic,
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  function save() {
    start(async () => {
      const fd = new FormData();
      fd.set("name", f.name.trim());
      fd.set("short_description", f.short_description.trim());
      if (f.description.trim()) fd.set("description", f.description.trim());
      if (f.website_url.trim()) fd.set("website_url", f.website_url.trim());
      if (f.instagram_url.trim()) fd.set("instagram_url", f.instagram_url.trim());
      if (f.city.trim()) fd.set("city", f.city.trim());
      if (f.country_code.trim()) fd.set("country_code", f.country_code.trim());
      if (f.is_public) fd.set("is_public", "on");

      const res = await updateOrganizationAction(fd);
      if (!res.ok) {
        if (res.code === "auth") return router.push("/auth?next=/manage/settings");
        if (res.code === "no_org") return router.push("/manage/onboarding");
        return show(res.error, "error");
      }
      show("Organization saved.", "success");
      router.refresh();
    });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(24,32,59,.06)", padding: 24 }}>
      <ImageUpload label="Logo" shape="circle" currentUrl={logoUrl} hint="Square image, up to 2MB (JPG/PNG/WebP)." upload={uploadOrganizationLogoAction} />
      <ImageUpload label="Cover image" currentUrl={coverUrl} hint="Wide banner, up to 5MB." upload={uploadOrganizationCoverAction} />

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="name">Organization name</label>
        <input id="name" style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={120} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="short_description">Short description</label>
        <input id="short_description" style={inputStyle} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} placeholder="One line about your mission" maxLength={200} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="description">Full description</label>
        <textarea id="description" style={{ ...inputStyle, minHeight: 110, resize: "vertical", lineHeight: 1.5 }} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell volunteers who you are and the impact you create." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }} className="form-2col">
        <div>
          <label style={labelStyle} htmlFor="website_url">Website</label>
          <input id="website_url" style={inputStyle} value={f.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://example.org" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="instagram_url">Instagram / social</label>
          <input id="instagram_url" style={inputStyle} value={f.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/yourorg" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }} className="form-2col">
        <div>
          <label style={labelStyle} htmlFor="city">City</label>
          <input id="city" style={inputStyle} value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="San Francisco" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="country_code">Country code</label>
          <input id="country_code" style={inputStyle} value={f.country_code} onChange={(e) => set("country_code", e.target.value)} placeholder="US" maxLength={8} />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 6 }}>
        <input type="checkbox" checked={f.is_public} onChange={(e) => set("is_public", e.target.checked)} style={{ width: 18, height: 18 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#3a425e" }}>Show our organization profile publicly</span>
      </label>
      <p style={{ fontSize: 12.5, color: "var(--muted-3)", margin: "0 0 18px" }}>
        When off, your public org page is hidden. Published missions still appear on Explore.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" disabled={pending} onClick={save} className="btn-coral" style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "12px 24px", borderRadius: 12, border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1, boxShadow: "0 14px 28px -12px rgba(255,111,94,.8)" }}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>

      {toast && <AuthToast key={seq} message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
