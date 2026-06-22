/**
 * Edge middleware: refresh the Supabase session cookie on every request and
 * gate anonymous users out of protected areas. ROLE checks live in the route
 * group layouts (role is a DB row, not the JWT) — middleware stays role-agnostic.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasPublicSupabaseEnv, getPublicSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database.generated";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/my-missions",
  "/impact",
  "/badges",
  "/messages",
  "/settings",
  "/manage",
  "/admin",
];

function isProtected(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If env isn't configured, don't block the app — just pass through.
  if (!hasPublicSupabaseEnv()) return response;
  const { url, publishableKey } = getPublicSupabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() validates the JWT and refreshes the cookie as a side effect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && isProtected(path)) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: return the response carrying refreshed cookies.
  return response;
}

export const config = {
  // Run on everything except static assets; public pages still get session refresh.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff2?)$).*)",
  ],
};
