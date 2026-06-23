# Export Security

CSV exports are App Router route handlers that share the exact permissions of the UI. They never use a service-role key; they run as the authenticated caller under RLS.

## Endpoints
- `GET /api/manage/reports/export?type=&range=&from=&to=` — `requireOrganizer()`.
- `GET /api/admin/reports/export?type=&range=&from=&to=` — `requireAdmin()`.

## Role + boundary checks
- **Organizer route**: the org id is **pinned to `guard.orgId`** (resolved server-side). It is *never* read from a query param, so an organizer cannot export another organization's data. Unknown `type` → 400; not signed in → 401; wrong role → 403. (Verified: a non-admin hitting the admin export gets 403.)
- **Admin route**: `requireAdmin()` gate; platform-wide aggregates only.

## Sensitive fields excluded from every CSV
- No emails, phone numbers, addresses, or raw `volunteer_id`/`user_id` UUIDs.
- No internal `organizer_note` / `internal_note` free text.
- No report bodies or reporter identities — `moderation-summary` is counts/status only.
- `volunteer-hours` (org) includes a volunteer **display name** + aggregated hours/completed-count — data the organizer already sees on their own roster, scoped to their org. No contact info, no per-shift timestamps.

## Export types
- Organization: `mission-performance`, `attendance-summary`, `volunteer-hours`, `certificates-issued`.
- Admin: `platform-summary`, `organization-impact`, `category-impact`, `moderation-summary`.

## CSV correctness
`toCsv` (`lib/data/analytics/csv.ts`) quotes any cell containing `"`, `,`, or a newline and doubles inner quotes (RFC-4180-ish); rows are CRLF-joined. Filenames are sanitized (`safeFilename`) and sent with `Content-Disposition: attachment` + `Cache-Control: no-store`.
