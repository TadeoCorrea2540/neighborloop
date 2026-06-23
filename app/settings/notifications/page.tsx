import Link from "next/link";
import { redirect } from "next/navigation";
import PublicNav from "@/components/public-nav";
import { getCurrentUser } from "@/lib/auth/server";
import { getNotificationPreferences } from "@/lib/data/notification-preferences";
import PreferencesForm from "@/components/notifications/preferences-form";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?redirect=/settings/notifications");

  const prefs = await getNotificationPreferences(user.id);

  return (
    <div style={{ background: "var(--bg-app, #f6f8fc)", minHeight: "100vh" }}>
      <PublicNav />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 48px" }}>
        <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
          <Link href="/notifications" style={{ color: "var(--muted-3)" }}>Notifications</Link> /{" "}
          <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>Preferences</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", margin: "0 0 6px" }}>Notification preferences</h1>
        <p style={{ margin: "0 0 20px", color: "var(--muted-2)", fontSize: 14 }}>Choose what you’re notified about in-app.</p>
        <PreferencesForm initial={prefs} />
      </div>
    </div>
  );
}
