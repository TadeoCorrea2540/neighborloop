/**
 * Pure role→route helpers. No Supabase, no "server-only" — safe to import from
 * client components (e.g. to pick a post-login link) and server code alike.
 */
import { redirect } from "next/navigation";
import type { AppRole } from "@/types/database";

export const DASHBOARD_BY_ROLE: Record<AppRole, string> = {
  admin: "/admin",
  organizer: "/manage/dashboard",
  volunteer: "/dashboard",
};

/** Where a given role's home is; anonymous (null) → the auth page. */
export function dashboardPathForRole(role: AppRole | null | undefined): string {
  if (!role) return "/auth";
  return DASHBOARD_BY_ROLE[role] ?? "/dashboard";
}

/** Server-side redirect to the role's dashboard (throws, never returns). */
export function redirectToDashboardByRole(role: AppRole | null | undefined): never {
  redirect(dashboardPathForRole(role));
}
