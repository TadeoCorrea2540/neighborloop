import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider, type SessionAccount } from "@/components/session-provider";
import ChunkReloadGuard from "@/components/chunk-reload-guard";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { getUnreadMessageCount } from "@/lib/data/conversations";
import { getPrimaryOrganizationForUser } from "@/lib/data/organization-membership";

export const metadata: Metadata = {
  title: "NeighborLoop — Turn free time into real-world impact",
  description:
    "Discover local volunteer missions, join in a tap, and watch your real-world impact stack up — hours, people helped, and badges earned.",
};

async function resolveAccount(): Promise<SessionAccount | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as { display_name?: string; full_name?: string };
  const name = meta.display_name || meta.full_name || user.email?.split("@")[0] || "Neighbor";
  // Header badge counts are best-effort: a transient Supabase failure must never
  // break the whole layout, so fall back to 0 (the menus refresh on focus/poll).
  const role = await getCurrentUserRole();
  const [notificationCount, messageCount, org] = await Promise.all([
    getUnreadNotificationCount(user.id).catch(() => 0),
    getUnreadMessageCount(user.id).catch(() => 0),
    role === "organizer" ? getPrimaryOrganizationForUser(user.id).catch(() => null) : Promise.resolve(null),
  ]);
  return {
    name,
    orgName: org?.name ?? null,
    role,
    userId: user.id,
    notificationCount,
    messageCount,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await resolveAccount();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ChunkReloadGuard />
        <SessionProvider account={account}>{children}</SessionProvider>
      </body>
    </html>
  );
}
