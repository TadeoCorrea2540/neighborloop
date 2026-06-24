"use client";

import type { ReactNode } from "react";

/** Staggered entrance wrapper — CSS delays in volunteer-dashboard.css */
export default function DashboardStagger({ children }: { children: ReactNode }) {
  return <div className="vol-dash-stagger">{children}</div>;
}
