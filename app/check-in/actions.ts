"use server";

/**
 * Volunteer QR self-check-in. Runs the SECURITY DEFINER qr_check_in() RPC so
 * the volunteer never writes attendance directly or reads check_in_tokens. The
 * raw token comes from the QR URL; we hash it (SHA-256) and pass only the hash.
 */
import { createHash } from "node:crypto";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";
import { getServerDb } from "@/lib/supabase/db";

export type CheckInResult =
  | { ok: true; code: "ok" | "already" }
  | { ok: false; code: "auth" | "role" | "not_approved" | "expired" | "invalid" };

export async function qrCheckInAction(rawToken: string): Promise<CheckInResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "auth" };

  const role = await getCurrentUserRole();
  if (role !== "volunteer") return { ok: false, code: "role" };

  if (!rawToken || rawToken.length < 8) return { ok: false, code: "invalid" };
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const { data, error } = await getServerDb().rpc("qr_check_in", { p_token_hash: tokenHash });
  if (error) return { ok: false, code: "invalid" };

  switch (data as string) {
    case "ok":
      return { ok: true, code: "ok" };
    case "already":
      return { ok: true, code: "already" };
    case "not_approved":
      return { ok: false, code: "not_approved" };
    case "expired":
    case "inactive":
      return { ok: false, code: "expired" };
    case "auth":
      return { ok: false, code: "auth" };
    default:
      return { ok: false, code: "invalid" };
  }
}
