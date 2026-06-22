"use client";

import { useState } from "react";
import { updatePasswordAction } from "@/app/auth/actions";
import { AuthCard, AuthField, AuthSubmit, AuthNotice } from "@/components/auth/auth-card";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Please choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don’t match.");
      return;
    }
    setPending(true);
    // On success this action redirects to /auth?reset=success.
    const res = await updatePasswordAction(password);
    setPending(false);
    if (res?.error) setError(res.error);
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={onSubmit} noValidate>
        {error && <AuthNotice tone="error">{error}</AuthNotice>}
        <AuthField
          label="New password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          withToggle
          required
        />
        <AuthField
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          withToggle
          required
        />
        <AuthSubmit pending={pending} label="Update password" pendingLabel="Updating…" />
      </form>
    </AuthCard>
  );
}
