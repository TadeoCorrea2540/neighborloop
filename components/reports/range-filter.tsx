"use client";

/**
 * Date-range selector for report pages. Server pages read `?range=` from
 * searchParams; this just updates the URL (and preserves other params).
 * @deprecated Prefer ReportDateFilters from components/organization/reports/
 */
export { default } from "@/components/organization/reports/report-date-filters";
