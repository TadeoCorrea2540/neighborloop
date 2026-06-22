"use client";

import { AuthFormPanel } from "@/components/auth-form-panel";
import AuthMobileHeader from "./auth-mobile-header";

export default function AuthMobileExperience() {
  return (
    <div className="auth-mobile-shell">
      <AuthMobileHeader />

      <div className="auth-mobile-form-card">
        <AuthFormPanel variant="mobile" />
      </div>
    </div>
  );
}
