import AdminShell from "@/components/admin-shell";
import { requireRole } from "@/lib/auth/server";
import { getPendingVerificationCount } from "@/lib/data/admin-verification";
import { getOpenReportCount } from "@/lib/data/admin-reports";
import { getUnreadNotificationCount } from "@/lib/data/notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin only; everyone else is redirected to their own dashboard / auth.
  const { user } = await requireRole("admin");

  // Sidebar badges reflect real queues.
  const [pendingVerifications, openReports, notificationCount] = await Promise.all([
    getPendingVerificationCount(),
    getOpenReportCount(),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <AdminShell
      pendingVerifications={pendingVerifications}
      openReports={openReports}
      userId={user.id}
      notificationCount={notificationCount}
    >
      {children}
    </AdminShell>
  );
}
