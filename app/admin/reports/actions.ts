"use server";

/**
 * Admin report triage. Admin-only (requireAdmin + RLS). Resolve or dismiss a
 * report with an optional internal note (admin-only). Mission moderation is a
 * separate, explicit action (app/admin/missions/actions.ts) so transition logic
 * lives in one place — the report detail page links to it.
 */
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireAdmin, UUID_RE, type ActionResult } from "@/lib/auth/require-admin";
import { writeAuditEvent } from "@/lib/data/audit";

type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

async function loadReport(id: string): Promise<{ status: ReportStatus } | null> {
  const supabase = getServerSupabase();
  const { data } = await supabase.from("reports").select("status").eq("id", id).maybeSingle();
  return (data as { status: ReportStatus } | null) ?? null;
}

async function review(
  id: string,
  next: "resolved" | "dismissed",
  internalNote: string | undefined,
  eventType: "report_resolved" | "report_dismissed"
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (!UUID_RE.test(id)) return { ok: false, code: "validation", error: "Invalid report." };

  const report = await loadReport(id);
  if (!report) return { ok: false, code: "not_found", error: "That report no longer exists." };
  if (report.status === "resolved" || report.status === "dismissed") {
    return { ok: false, code: "transition", error: "This report has already been closed." };
  }

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("reports")
    .update({
      status: next,
      reviewed_by: guard.userId,
      reviewed_at: new Date().toISOString(),
      internal_note: internalNote?.trim().slice(0, 2000) || null,
    })
    .eq("id", id);
  if (error) return { ok: false, code: "unknown", error: "Couldn’t update this report." };

  await writeAuditEvent({
    actorId: guard.userId,
    eventType,
    entityType: "report",
    entityId: id,
    metadata: { status: next },
  });

  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/reports/${id}`);
  return { ok: true };
}

export async function resolveReportAction(id: string, internalNote?: string): Promise<ActionResult> {
  return review(id, "resolved", internalNote, "report_resolved");
}

export async function dismissReportAction(id: string, internalNote?: string): Promise<ActionResult> {
  return review(id, "dismissed", internalNote, "report_dismissed");
}
