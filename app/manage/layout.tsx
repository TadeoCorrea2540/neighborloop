import OrgShell from "@/components/org-shell";
import { requireRole } from "@/lib/auth/server";
import { getPrimaryOrganizationForUser } from "@/lib/data/organization-membership";
import { getPendingApplicationCount } from "@/lib/data/organization-applications";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Organizers and admins only; anonymous → /auth, wrong role → own dashboard.
  // The "no organization yet → onboarding" nudge lives in the pages (not here)
  // so /manage/onboarding itself doesn't redirect-loop.
  const { user } = await requireRole(["organizer", "admin"]);

  // Resolve the org for the sidebar (name + verified badge + pending count).
  // Null when the organizer hasn't created an org yet (onboarding).
  const org = await getPrimaryOrganizationForUser(user.id);
  const pendingCount = org ? await getPendingApplicationCount(org.id) : 0;

  return (
    <OrgShell
      orgName={org?.name ?? null}
      verified={org?.verificationStatus === "verified"}
      pendingCount={pendingCount}
    >
      {children}
    </OrgShell>
  );
}
