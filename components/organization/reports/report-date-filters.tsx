"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { DATE_RANGES, type DateRange } from "@/lib/data/analytics/date-range";

export default function ReportDateFilters({ value }: { value: DateRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  function select(v: DateRange) {
    if (v === value) return;
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    params.set("range", v);
    start(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div
      className={`rpt-range-scroll${pending ? " rpt-range--pending" : ""}`}
      role="group"
      aria-label="Report date range"
    >
      {DATE_RANGES.map((r) => {
        const active = r.value === value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => select(r.value)}
            className={`rpt-range-btn${active ? " rpt-range-btn--active" : ""}`}
            aria-pressed={active}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
