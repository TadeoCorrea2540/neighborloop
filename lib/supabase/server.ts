/**
 * Server-safe Supabase client for App Router Server Components, Route Handlers,
 * and Server Actions.
 *
 * - Uses the public URL + publishable key (cookie-based session, ready for
 *   Phase 3 auth).
 * - Does NOT implement auth middleware or route protection (that is Phase 3).
 * - Cookie writes are wrapped in try/catch: Server Components cannot set
 *   cookies, so those writes are safely ignored there and succeed inside
 *   Server Actions / Route Handlers.
 *
 * Never use the service-role key here. A future server-only admin client
 * (Phase 6) belongs in its own file behind a private, server-only env var.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";
import { getPublicSupabaseEnv } from "./env";

export function getServerSupabase() {
  const cookieStore = cookies();
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — cookie mutations are not allowed
          // here and can be safely ignored (session refresh handled elsewhere
          // once Phase 3 middleware is added).
        }
      },
    },
  });
}
