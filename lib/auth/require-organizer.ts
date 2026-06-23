/**
 * Server-side organizer guard + shared action result types. Non-redirecting:
 * returns a code so the client decides (toast vs route). Used by all organizer
 * server actions. (Not a "use server" file — it exports helpers, not actions.)
 */
import "server-only";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";
import { getPrimaryOrganizationForUser } from "@/lib/data/organization-membership";
import type { AppRole } from "@/types/database";

export type ActionCode =
  | "auth"
  | "role"
  | "no_org"
  | "not_found"
  | "forbidden"
  | "transition"
  | "full"
  | "conflict"
  | "validation"
  | "unknown";

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string; code: ActionCode };

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type OrganizerGuard =
  | { ok: true; userId: string; role: AppRole; orgId: string }
  | { ok: false; error: string; code: "auth" | "role" | "no_org" };

/** Resolve the authenticated organizer + their organization, or a failure code. */
export async function requireOrganizer(): Promise<OrganizerGuard> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in to continue." };

  const role = await getCurrentUserRole();
  if (role !== "organizer" && role !== "admin") {
    return { ok: false, code: "role", error: "This area is available to organizer accounts." };
  }

  const org = await getPrimaryOrganizationForUser(user.id);
  if (!org) {
    return { ok: false, code: "no_org", error: "Create your organization first." };
  }
  return { ok: true, userId: user.id, role, orgId: org.id };
}
