"use client";

import { AuthVisualPanel } from "@/components/auth-visual-panel";
import { AuthFormPanel } from "@/components/auth-form-panel";
import AuthMobileExperience from "@/components/auth/auth-mobile-experience";
import "./auth-form.css";
import "./auth-mobile.css";

export default function Auth() {
  return (
    <div className="auth-page">
      <div className="auth-mobile-only">
        <AuthMobileExperience />
      </div>

      <div
        className="auth-desktop-only"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "radial-gradient(circle at 20% 0%,#eef2fb,#e6e9f2)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1060,
            background: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--line)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: 680,
          }}
          className="auth-grid"
        >
          <AuthVisualPanel />
          <AuthFormPanel variant="desktop" />
        </div>
      </div>
    </div>
  );
}
