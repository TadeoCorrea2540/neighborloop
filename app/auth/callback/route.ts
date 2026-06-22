/**
 * OAuth / PKCE code-exchange fallback. Email confirmation uses /auth/confirm;
 * this exists for provider sign-in (e.g. future Google) and magic links.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { dashboardPathForRole } from "@/lib/auth/redirect-by-role";
import type { AppRole } from "@/types/database";

const ROLE_PRECEDENCE: AppRole[] = ["admin", "organizer", "volunteer"];

function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?reason=link_invalid", origin));
  }

  const supabase = getServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/auth/error?reason=link_invalid", origin));
  }

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
