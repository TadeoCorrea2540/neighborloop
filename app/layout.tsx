import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider, type SessionAccount } from "@/components/session-provider";
import ChunkReloadGuard from "@/components/chunk-reload-guard";
import { getCurrentUser, getCurrentUserRole } from "@/lib/auth/server";

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
  const role = await getCurrentUserRole();
  return { name, role };
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
