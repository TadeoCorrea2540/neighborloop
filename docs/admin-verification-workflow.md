# Admin Verification Workflow

How an organization gets verified. Data: `lib/data/admin-verification.ts`. Actions: `app/admin/verification/actions.ts`. UI: `/admin/verification` (+`/[id]`) and `components/admin/verification-decision.tsx`.

## Two places store status (kept in sync by the admin action)
- **`organizations.verification_status`** (+ `verification_note`) — the **source of truth**. Drives the public verified badge, the organizer settings banner, and is organizer-readable. Only an admin can change it (guard trigger `trg_guard_org_verification`).
- **`organization_verifications`** — the **decision/history log**: one row per request, with `status`, `reviewed_by`, `reviewed_at`, `public_reason`, and admin-only `internal_note`. Organizers can INSERT (request) but **cannot SELECT** it — so `internal_note` never leaks.

## Statuses (`verification_status` enum)
`not_required` (default for new orgs — publishing never waits on verification) · `pending` (awaiting review) · `verified` (badge shows) · `rejected`.

## How a request enters the queue
The organizer clicks **Request verification** on `/manage/settings` → `requestVerificationAction()` inserts a `pending` organization_verifications row (RLS `org_verif_insert`). At most one **open** request per org is allowed — enforced by a partial unique index (`uq_org_verif_one_pending`, migration 013), since organizers can't SELECT the table to dedupe in app code; a duplicate insert returns 23505 → "already awaiting review". The org's `verification_status` is **not** changed by the organizer — only an admin decision moves it.

## Approve
`approveVerificationAction(id, internalNote?)`:
1. `organizations.verification_status = 'verified'`, `verification_note = null`.
2. verification row → `verified` + `reviewed_by`/`reviewed_at` + optional `internal_note`.
3. Audit `organization_verification_approved`.
4. Revalidate `/admin/**`, `/manage/settings`, `/org/[slug]`, `/`.

→ Public org page shows the ✓ Verified badge; organizer settings shows the verified banner.

## Reject
`rejectVerificationAction(id, publicReason, internalNote?)` — **publicReason required**:
1. `organizations.verification_status = 'rejected'`, `verification_note = publicReason`.
2. verification row → `rejected` + public_reason + admin-only internal_note + reviewer fields.
3. Audit `organization_verification_rejected`.

→ Organizer sees the **public reason** on `/manage/settings` (from `verification_note`). The internal note is **never** shown to them.

## Return to pending
`returnVerificationToPendingAction(id, internalNote)` — internalNote required. Resets both the org status and the log row to `pending`, clears `verification_note`, audits `organization_verification_returned_to_pending`.

## Organizer visibility (recap)
Organizer may see: `verification_status`, the public reason (`verification_note`), general next steps. Organizer must NOT see: `internal_note`, reviewer identity, audit metadata. Public pages show the verified badge only when `verification_status = 'verified'`.

## Later
Document upload + review UI is a future phase — the detail page currently shows a clear placeholder and review is based on the org profile, links, and admin judgment.
