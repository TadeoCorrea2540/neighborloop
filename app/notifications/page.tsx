import { redirect } from "next/navigation";
import PublicNav from "@/components/public-nav";
import { getCurrentUser } from "@/lib/auth/server";
import { getUserNotifications } from "@/lib/data/notifications";
import NotificationList from "@/components/notifications/notification-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?redirect=/notifications");

  const notifications = await getUserNotifications(user.id, { filter: "all" });

  return (
    <div style={{ background: "var(--bg-app, #f6f8fc)", minHeight: "100vh" }}>
      <PublicNav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 48px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", margin: "0 0 6px" }}>Notifications</h1>
        <p style={{ margin: "0 0 20px", color: "var(--muted-2)", fontSize: 14 }}>
          Updates about your missions, applications, messages, and certificates.
        </p>
        <NotificationList initial={notifications} />
      </div>
    </div>
  );
}
