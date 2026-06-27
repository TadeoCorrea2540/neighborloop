"use client";

import type { ReactNode } from "react";

export default function BadgesStagger({ children }: { children: ReactNode }) {
  return <div className="badges-stagger">{children}</div>;
}
