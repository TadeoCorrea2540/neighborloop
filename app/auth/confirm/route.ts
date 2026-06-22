/**
 * Email confirmation + password-recovery handler (token_hash + verifyOtp flow).
 *
 * Supabase email templates must point their links here, e.g.:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
 */
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { dashboardPathForRole } from "@/lib/auth/redirect-by-role";
import type { AppRole } from "@/types/database";

const ROLE_PRECEDENCE: AppRole[] = ["admin", "organizer", "volunteer"];

/** Only allow same-origin relative redirect targets (open-redirect guard). */
function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL("/auth/error?reason=link_invalid", origin));
  }

  const supabase = getServerSupabase();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) {
    return NextResponse.redirect(new URL("/auth/error?reason=link_invalid", origin));
  }

  // Password recovery: user now has a short-lived session to set a new password.
  if (type === "recovery") {
    return NextResponse.redirect(new URL(next ?? "/reset-password", origin));
  }

  // Signup / email change: self-heal provisioning (idempotent), then route by role.
  await supabase.rpc("ensure_user_provisioned");

  const { data } = await supabase.auth.getUser();
  let role: AppRole | null = null;
  if (data.user) {
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const roles = ((roleRows ?? []) as { role: AppRole }[]).map((r) => r.role);
    role = ROLE_PRECEDENCE.find((r) => roles.includes(r)) ?? null;
  }

  return NextResponse.redirect(new URL(next ?? dashboardPathForRole(role), origin));
}
