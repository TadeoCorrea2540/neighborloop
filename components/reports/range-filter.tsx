"use client";

/**
 * Date-range selector for report pages. Server pages read `?range=` from
 * searchParams; this just updates the URL (and preserves other params).
 */
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { DATE_RANGES, type DateRange } from "@/lib/data/analytics/date-range";

export default function RangeFilter({ value }: { value: DateRange }) {
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
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", opacity: pending ? 0.6 : 1 }}>
      {DATE_RANGES.map((r) => {
        const active = r.value === value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => select(r.value)}
            style={{
              fontSize: 13, fontWeight: 600, padding: "8px 13px", borderRadius: 11, cursor: "pointer",
              background: active ? "#18203b" : "#fff",
              color: active ? "#fff" : "var(--muted-1)",
              border: active ? "none" : "1px solid rgba(24,32,59,.1)",
              whiteSpace: "nowrap",
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
