import AdminShell from "@/components/admin-shell";
import { requireRole } from "@/lib/auth/server";
import { getPendingVerificationCount } from "@/lib/data/admin-verification";
import { getOpenReportCount } from "@/lib/data/admin-reports";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin only; everyone else is redirected to their own dashboard / auth.
  await requireRole("admin");

  // Sidebar badges reflect real queues.
  const [pendingVerifications, openReports] = await Promise.all([
    getPendingVerificationCount(),
    getOpenReportCount(),
  ]);

  return (
    <AdminShell pendingVerifications={pendingVerifications} openReports={openReports}>
      {children}
    </AdminShell>
  );
}
