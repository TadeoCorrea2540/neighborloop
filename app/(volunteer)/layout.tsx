import VolunteerShell from "@/components/volunteer-shell";
import { requireAuth, getCurrentUserRole, getCurrentProfile } from "@/lib/auth/server";
import { redirectToDashboardByRole } from "@/lib/auth/redirect-by-role";
import { getUnreadNotificationCount } from "@/lib/data/notifications";

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const role = await getCurrentUserRole();
  // Volunteers and admins may view; organizers belong in their own area.
  if (role === "organizer") {
    redirectToDashboardByRole("organizer");
  }
  const [profile, notificationCount] = await Promise.all([
    getCurrentProfile(),
    getUnreadNotificationCount(user.id),
  ]);
  return (
    <VolunteerShell
      userName={profile?.display_name ?? "Neighbor"}
      roleLabel={role === "admin" ? "Admin" : "Volunteer"}
      userId={user.id}
      notificationCount={notificationCount}
    >
      {children}
    </VolunteerShell>
  );
}
