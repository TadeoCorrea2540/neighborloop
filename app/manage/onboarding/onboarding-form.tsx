"use client";

import { useState } from "react";
import { createOrganizationAction } from "./actions";
import { ORG_TYPES } from "./org-types";
import { AuthNotice } from "@/components/auth/auth-card";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--ink, #18203b)",
  marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(24,32,59,.16)",
  fontSize: 14.5,
  outline: "none",
  background: "#fbfcfe",
};

export default function OnboardingForm() {
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<string>(ORG_TYPES[0].value);
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter your organization name.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a short description.");
      return;
    }
    setPending(true);
    // On success this action redirects to /manage/dashboard.
    const res = await createOrganizationAction({
      name,
      organizationType: orgType,
      city,
      countryCode,
      shortDescription: description,
    });
    setPending(false);
    if (res?.error) setError(res.error);
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "8px 4px 40px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-deep, #e8543f)", letterSpacing: ".06em" }}>
        WELCOME, ORGANIZER
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", margin: "6px 0 8px" }}>
        Set up your organization
      </h1>
      <p style={{ fontSize: 15, color: "var(--muted-2, #5a6685)", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 520 }}>
        Tell neighbors who you are. You can post and manage missions once your organization
        profile exists — you’ll add the rest (logo, full description, verification) later.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        style={{
          background: "#fff",
          border: "1px solid rgba(24,32,59,.08)",
          borderRadius: 20,
          padding: "26px 24px 28px",
          boxShadow: "0 20px 48px -32px rgba(24,32,59,.5)",
        }}
      >
        {error && <AuthNotice tone="error">{error}</AuthNotice>}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="org-name">Organization name</label>
          <input
            id="org-name"
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="GreenRoots Collective"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="org-type">Type</label>
          <select id="org-type" style={inputStyle} value={orgType} onChange={(e) => setOrgType(e.target.value)}>
            {ORG_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="org-city">City</label>
            <input
              id="org-city"
              style={inputStyle}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="San Francisco"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="org-country">Country</label>
            <input
              id="org-country"
              style={inputStyle}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="US"
              maxLength={8}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="org-desc">Short description</label>
          <textarea
            id="org-desc"
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your organization do? (one or two sentences)"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-coral"
          style={{
            width: "100%",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: 14,
            borderRadius: 12,
            border: "none",
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1,
            boxShadow: "0 14px 28px -14px rgba(255,111,94,.8)",
          }}
        >
          {pending ? "Creating…" : "Create organization →"}
        </button>
      </form>
    </div>
  );
}
