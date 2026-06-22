import Link from "next/link";
import { AuthCard, AuthNotice } from "@/components/auth/auth-card";

const REASONS: Record<string, string> = {
  link_invalid: "This link is invalid or has expired. Please request a new one.",
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const message = REASONS[searchParams.reason ?? ""] ?? "We couldn’t complete that request.";
  return (
    <AuthCard
      title="Something went wrong"
      subtitle="Don’t worry — you can try again from here."
    >
      <AuthNotice tone="error">{message}</AuthNotice>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        <Link
          href="/auth"
          className="btn-coral"
          style={{
            textAlign: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: 13,
            borderRadius: 12,
            textDecoration: "none",
            boxShadow: "0 14px 28px -14px rgba(255,111,94,.8)",
          }}
        >
          Go to log in
        </Link>
        <Link
          href="/"
          style={{
            textAlign: "center",
            color: "var(--ink, #18203b)",
            fontWeight: 600,
            fontSize: 14.5,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(24,32,59,.14)",
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>
    </AuthCard>
  );
}
