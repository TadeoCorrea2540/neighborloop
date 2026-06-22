import AdminShell from "@/components/admin-shell";
import { requireRole } from "@/lib/auth/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin only; everyone else is redirected to their own dashboard / auth.
  await requireRole("admin");
  return <AdminShell>{children}</AdminShell>;
}
