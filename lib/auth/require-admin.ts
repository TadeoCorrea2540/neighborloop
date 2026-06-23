/**
 * Server-side admin guard for admin server actions. Non-redirecting: returns a
 * code so the client decides (toast vs route). Pages use the redirecting
 * `requireRole(["admin"])` in app/admin/layout.tsx; ACTIONS use this.
 *
 * The admin role comes from the secure role system (user_roles via
 * getCurrentUserRole / is_admin()), never from user-editable profile data.
 * RLS (is_admin()) is the final gate on every admin read/write.
 */
import "server-only";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";

// Reuse the shared action result shape from the organizer guard — no duplication.
export {
  type ActionCode,
  type ActionResult,
  UUID_RE,
} from "@/lib/auth/require-organizer";

export type AdminGuard =
  | { ok: true; userId: string; role: "admin" }
  | { ok: false; error: string; code: "auth" | "role" };

/** Resolve the authenticated admin, or a failure code. */
export async function requireAdmin(): Promise<AdminGuard> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth", error: "Please sign in to continue." };

  const role = await getCurrentUserRole();
  if (role !== "admin") {
    return { ok: false, code: "role", error: "This area is available to administrators only." };
  }
  return { ok: true, userId: user.id, role: "admin" };
}
