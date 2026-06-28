"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Scrolls the organizer dashboard to the top after a successful publish (?published=1). */
export default function DashboardScrollTop() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("published") !== "1") return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const main = document.querySelector("main.fade-up");
    if (main instanceof HTMLElement) main.scrollTop = 0;

    router.replace("/manage/dashboard", { scroll: false });
  }, [searchParams, router]);

  return null;
}
