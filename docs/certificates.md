# Certificates

Participation proof. Table: `certificates` (014). Action: `issueCertificateAction` (`app/manage/attendance/actions.ts`). Reads: `lib/data/certificates.ts`. Page: `/certificates/[id]` + `components/certificates/print-button.tsx`.

## When a certificate is issued
The organizer issues it from the attendance roster on a **completed** record. `issueCertificateAction(attendanceRecordId)`:
1. `requireOrganizer()` + ownership (record's `organization_id === orgId`).
2. Requires `status = 'completed'` and `hours_credited` set.
3. Generates a unique `certificate_number` (`NL-<year>-<6 hex>`, retried on collision).
4. Inserts one certificate per attendance record (unique on `attendance_record_id`; re-issuing returns the existing one).

One certificate per completed attendance record.

## Who can view
RLS (`certificates_select`): a volunteer reads **their own**; org members read **their org's**; admins read **all**. Public users cannot read certificates. `getCertificateByIdForUser` is RLS-scoped → returns null (→ 404) if the viewer may not see it.

## The certificate page
`/certificates/[id]` renders a NeighborLoop-styled card: volunteer name, mission title, organization, hours credited, certificate number, issued date — with a **Print / Save as PDF** button (`window.print()` + a print stylesheet that hides controls). Readable on mobile.

## Print / download behaviour
No PDF library this phase — download is the browser's "Save as PDF" from the print dialog. `certificates.file_path` exists but stays null (reserved for a future generated-PDF pipeline).

## What remains for full PDF generation
Server-side PDF rendering + storage to `file_path`, a public verification link, and richer certificate templates are deferred to a later phase. The current page is print-ready and respectable for school service hours, clubs, and nonprofits.
