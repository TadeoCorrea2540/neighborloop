import "@/app/volunteer-dashboard.css";
import "@/app/volunteer-impact.css";
import "@/app/volunteer-badges.css";
import VolunteerShell from "@/components/volunteer-shell";
import { requireAuth, getCurrentUserRole, getCurrentProfile } from "@/lib/auth/server";
import { redirectToDashboardByRole } from "@/lib/auth/redirect-by-role";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { getUnreadMessageCount } from "@/lib/data/conversations";
import { getVolunteerImpactSummary } from "@/lib/data/volunteer-impact";

const MONTHLY_GOAL_HOURS = 30;

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
  const [profile, notificationCount, messageCount, impact] = await Promise.all([
    getCurrentProfile(),
    getUnreadNotificationCount(user.id),
    getUnreadMessageCount(user.id),
    getVolunteerImpactSummary(user.id),
  ]);
  const monthlyGoalPct = Math.min(100, Math.round((impact.totalHours / MONTHLY_GOAL_HOURS) * 100));
  return (
    <VolunteerShell
      userName={profile?.display_name ?? "Neighbor"}
      roleLabel={role === "admin" ? "Admin" : "Volunteer"}
      userId={user.id}
      notificationCount={notificationCount}
      messageCount={messageCount}
      monthlyGoalHours={impact.totalHours}
      monthlyGoalPct={monthlyGoalPct}
    >
      {children}
    </VolunteerShell>
  );
}
