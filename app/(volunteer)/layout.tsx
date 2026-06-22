import VolunteerShell from "@/components/volunteer-shell";
import { requireAuth, getCurrentUserRole, getCurrentProfile } from "@/lib/auth/server";
import { redirectToDashboardByRole } from "@/lib/auth/redirect-by-role";

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const role = await getCurrentUserRole();
  // Volunteers and admins may view; organizers belong in their own area.
  if (role === "organizer") {
    redirectToDashboardByRole("organizer");
  }
  const profile = await getCurrentProfile();
  return (
    <VolunteerShell
      userName={profile?.display_name ?? "Neighbor"}
      roleLabel={role === "admin" ? "Admin" : "Volunteer"}
    >
      {children}
    </VolunteerShell>
  );
}
