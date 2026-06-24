"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface SessionAccount {
  name: string;
  role: "volunteer" | "organizer" | "admin" | null;
  userId: string;
  notificationCount: number;
  messageCount: number;
}

/**
 * Auth state resolved on the SERVER (via cookies) and handed to client
 * components. Reliable for SSR — does not depend on the browser reading the
 * Supabase auth cookies. `null` = signed out.
 */
const SessionContext = createContext<SessionAccount | null>(null);

export function SessionProvider({
  account,
  children,
}: {
  account: SessionAccount | null;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={account}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionAccount | null {
  return useContext(SessionContext);
}
