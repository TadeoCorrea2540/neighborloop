/**
 * Admin dashboard summary (server-only, ADMIN-ONLY by RLS). Platform-level
 * counts via cheap head-count queries + a few actionable lists. All counts are
 * accurate because RLS grants admins full read across these tables.
 */
import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { getOrganizationVerifications, type AdminVerificationItem } from "@/lib/data/admin-verification";
import { getAdminReports, type AdminReportItem } from "@/lib/data/admin-reports";
import { getAuditEvents, type AuditItem } from "@/lib/data/admin-audit";

export interface AdminDashboardSummary {
  totalUsers: number;
  volunteers: number;
  organizers: number;
  admins: number;
  totalOrganizations: number;
  pendingVerifications: number;
  publishedMissions: number;
  draftMissions: number;
  openReports: number;
  resolvedReports: number;
  applicationsSubmitted: number;
  verificationQueue: AdminVerificationItem[];
  recentReports: AdminReportItem[];
  recentAudit: AuditItem[];
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const supabase = getServerSupabase();

  const [
    users,
    volunteers,
    organizers,
    admins,
    orgs,
    pendingVerif,
    published,
    drafts,
    openReports,
    resolvedReports,
    applications,
    verificationQueue,
    recentReports,
    recentAudit,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "volunteer"),
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "organizer"),
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("organization_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("missions").select("id", { count: "exact", head: true }).in("status", ["draft", "pending_review"]),
    supabase.from("reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    getOrganizationVerifications("pending"),
    getAdminReports({}),
    getAuditEvents({ limit: 8 }),
  ]);

  return {
    totalUsers: users.count ?? 0,
    volunteers: volunteers.count ?? 0,
    organizers: organizers.count ?? 0,
    admins: admins.count ?? 0,
    totalOrganizations: orgs.count ?? 0,
    pendingVerifications: pendingVerif.count ?? 0,
    publishedMissions: published.count ?? 0,
    draftMissions: drafts.count ?? 0,
    openReports: openReports.count ?? 0,
    resolvedReports: resolvedReports.count ?? 0,
    applicationsSubmitted: applications.count ?? 0,
    verificationQueue: verificationQueue.slice(0, 5),
    recentReports: recentReports.slice(0, 5),
    recentAudit,
  };
}
