"use client";

/**
 * Browser-safe Supabase client for Client Components.
 *
 * Uses only the public URL + publishable key. Never import or reference the
 * service-role key here. Reusable later for client-side auth & interactions.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";
import { getPublicSupabaseEnv } from "./env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Returns a singleton browser Supabase client. */
export function getBrowserSupabase() {
  if (client) return client;
  const { url, publishableKey } = getPublicSupabaseEnv();
  client = createBrowserClient<Database>(url, publishableKey);
  return client;
}
