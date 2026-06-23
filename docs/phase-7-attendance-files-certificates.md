# Phase 7 — Attendance, Files, QR Check-In, Hours, Certificates

Makes NeighborLoop usable for real volunteering operations: organizers track attendance (manual + QR), confirm hours, and issue certificates; volunteers get real hours + downloadable proof. Also adds organization/mission image uploads and private verification documents. Design preserved.

## Real-world workflow
Organizer creates & publishes a mission → volunteers apply & are approved → organizer prepares check-in (manual or QR) → volunteer checks in → organizer checks out / confirms hours → marks completed → issues certificate → volunteer sees participation history + certificate.

## Routes (app uses `/manage/*` and `/impact`, not the spec's `/organization/*` / `/impact-profile`)
- `/manage/attendance` — missions with attendance summaries.
- `/manage/missions/[id]/attendance` — roster + per-volunteer actions.
- `/manage/missions/[id]/check-in` — generate/show the check-in QR.
- `/check-in/[token]` — volunteer QR landing (self-check-in).
- `/certificates/[id]` — print-friendly certificate (RLS-guarded).
- Volunteer `/impact`, `/my-missions` (Completed + Certificates tabs), `/dashboard` — real hours/completed/certs.
- Uploads: org logo/cover on `/manage/settings`; mission cover on `/manage/missions/[id]/edit`; verification document on the `/manage/settings` "Request verification" control; admin views it on `/admin/verification/[id]`.

## Tables / objects
New (migration 014): `attendance_records`, `check_in_tokens`, `certificates` (+ enums `attendance_status`, `check_in_method`). New fn (015): `qr_check_in()`. Storage RLS + `organization_verifications.document_path` (016). Buckets (from 006): `mission-media`, `organization-media` (public), `verification-documents` (private).

## What Phase 7 does NOT implement
Messaging, notifications/email, AI, payments, advanced analytics, recurring missions, calendar sync, a complex certificate designer, a full PDF-generation pipeline (certificates are a print-to-PDF page), a public certificate-verification portal, and a production document-review workflow. Badges remain "coming soon".

## New dependency
`qrcode` (server-side QR SVG/data-URL generation). The only new package.

## See also
[storage-security.md](storage-security.md) · [attendance-workflow.md](attendance-workflow.md) · [qr-check-in-flow.md](qr-check-in-flow.md) · [volunteer-hours.md](volunteer-hours.md) · [certificates.md](certificates.md) · [phase-7-test-checklist.md](phase-7-test-checklist.md) · [phase-7-test-data.md](phase-7-test-data.md)
