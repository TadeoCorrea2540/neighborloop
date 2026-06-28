"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/auth/actions";
import { AuthCard, AuthField, AuthSubmit, AuthNotice } from "@/components/auth/auth-card";
import "@/app/auth/auth-form.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    const res = await requestPasswordResetAction(email);
    setPending(false);
    if (res.error) setError(res.error);
    else setSuccess(res.success ?? "Check your email for a reset link.");
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a link to set a new password."
    >
      {success ? (
        <AuthNotice tone="success">
          {success}
          <div style={{ marginTop: 14 }}>
            <Link href="/auth" className="auth-card-link">
              ← Back to log in
            </Link>
          </div>
        </AuthNotice>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {error && <AuthNotice tone="error">{error}</AuthNotice>}
          <AuthField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@neighborhood.com"
            autoComplete="email"
            required
          />
          <AuthSubmit pending={pending} label="Send reset link" pendingLabel="Sending…" />
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Link href="/auth" className="auth-card-link">
              ← Back to log in
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
