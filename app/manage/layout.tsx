import OrgShell from "@/components/org-shell";
import { requireRole } from "@/lib/auth/server";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Organizers and admins only; anonymous → /auth, wrong role → own dashboard.
  // The "no organization yet → onboarding" nudge lives in the dashboard page
  // (not here) so /manage/onboarding itself doesn't redirect-loop.
  await requireRole(["organizer", "admin"]);
  return <OrgShell>{children}</OrgShell>;
}
