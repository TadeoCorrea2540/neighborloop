"use client";

/**
 * Small inline-styled auth primitives shared by the standalone auth pages
 * (forgot-password, reset-password, auth/error). Matches the NeighborLoop
 * design tokens (coral / ink / muted CSS vars) without any UI framework.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

function PasswordToggleIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M10.6 10.6A4 4 0 0 0 12 16a4 4 0 0 0 3.4-1.9M6.7 6.7C4.1 8.4 2.5 12 2.5 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.3M17.3 17.3C19.9 15.6 21.5 12 21.5 12s-3.5-7-10-7c-1.8 0-3.4.5-4.7 1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#fff,#fdf2ee 70%,#fff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 22,
            fontWeight: 800,
            fontSize: 18,
            color: "var(--ink, #18203b)",
            textDecoration: "none",
          }}
        >
          <Logo size={28} />
          NeighborLoop
        </Link>
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(24,32,59,.08)",
            borderRadius: 22,
            padding: "30px 28px 32px",
            boxShadow: "0 26px 60px -34px rgba(24,32,59,.5)",
          }}
        >
          <h1 style={{ fontSize: 23, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-.02em" }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 14.5, color: "var(--muted-2, #5a6685)", lineHeight: 1.55, margin: "0 0 22px" }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthNotice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? { background: "#fff0ec", color: "#c0392b", border: "1px solid #ffd5cb" }
      : { background: "#dff6ea", color: "#147a57", border: "1px solid #b7e9cf" };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      style={{
        ...styles,
        borderRadius: 12,
        padding: "11px 14px",
        fontSize: 13.5,
        lineHeight: 1.5,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  withToggle,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  withToggle?: boolean;
}) {
  const [show, setShow] = useState(false);
  const inputType = withToggle ? (show ? "text" : "password") : type;
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink, #18203b)", marginBottom: 6 }}>
        {label}
      </span>
      <span style={{ position: "relative", display: "block" }}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: withToggle ? "12px 44px 12px 14px" : "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(24,32,59,.16)",
            fontSize: 14.5,
            outline: "none",
            background: "#fbfcfe",
          }}
        />
        {withToggle && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--muted-2, #5a6685)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6,
              lineHeight: 1,
            }}
          >
            <PasswordToggleIcon visible={show} />
          </button>
        )}
      </span>
    </label>
  );
}

export function AuthSubmit({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-coral"
      style={{
        width: "100%",
        marginTop: 6,
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        padding: 13,
        borderRadius: 12,
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.7 : 1,
        boxShadow: "0 14px 28px -14px rgba(255,111,94,.8)",
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
