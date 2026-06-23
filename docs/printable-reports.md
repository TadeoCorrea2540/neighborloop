# Printable Reports

Route: `/reports/print?range=<r>`. Component: `app/reports/print/page.tsx` + `components/reports/print-button.tsx`. Print CSS: `app/globals.css` (`@media print`).

## Layout
The print route lives **outside `/manage`** on purpose — `app/manage/layout.tsx` wraps every `/manage/*` page in the organizer sidebar/topbar, which we don't want in a printout. The standalone route renders a clean, centered document (max-width 920px) with the NeighborLoop logo, org name, date range, generated date, and the same analytics blocks as `/manage/reports` (impact stats, monthly hours, cause breakdown, mission performance, engagement).

Guarded by `requireOrganizer()`; the org id is `guard.orgId`, so a print report only ever shows the caller's own org.

## Save as PDF
The "🖨 Print / Save as PDF" button calls `window.print()`. Users choose "Save as PDF" as the destination in the browser print dialog. `@media print` rules: hide `.print-hide` (back link + button), force a white background, drop shadows, and set `@page { margin: 14mm }`.

## What remains for full PDF generation
We deliberately did **not** add a server-side PDF dependency (e.g. Puppeteer/`@react-pdf`) — it's heavy and fragile. Browser print-to-PDF covers the pilot/portfolio need. A future enhancement could add a server route that renders the same component to PDF for emailing/attaching without a browser.
