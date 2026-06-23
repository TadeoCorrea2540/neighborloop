# Audit Events

A tamper-evident log of admin decisions. Table `audit_events`. Writer: `lib/data/audit.ts` (`writeAuditEvent`). Reader: `lib/data/admin-audit.ts`. UI: `/admin/audit`.

## Schema (`audit_events`)
`id` · `actor_id` (the admin, FK profiles) · `event_type` (text) · `entity_type` (text: organization / report / mission) · `entity_id` (uuid) · `metadata` (jsonb) · `created_at`.

## What gets logged (Phase 6)
| event_type | when | metadata |
|---|---|---|
| `organization_verification_approved` | admin approves an org | `{ verificationId, status }` |
| `organization_verification_rejected` | admin rejects an org | `{ verificationId, status }` |
| `organization_verification_returned_to_pending` | admin reopens | `{ verificationId, status }` |
| `report_resolved` | admin resolves a report | `{ status }` |
| `report_dismissed` | admin dismisses a report | `{ status }` |
| `mission_moderated` | admin pauses/cancels/archives or marks-reviewed | `{ action, reason, from, to }` |

`event_type` is free text (no DB enum) — `writeAuditEvent` constrains it via the `AuditEventType` union. `actor_id` is stamped server-side from the authenticated admin; clients never supply it.

## Who can read
**Admins only.** RLS `audit_select_admin` (`using public.is_admin()`). Non-admins get nothing. The log is never surfaced on public, volunteer, or organizer pages.

## Who can write
**Admins only**, via migration `012_audit_events_insert.sql`:
```sql
create policy audit_insert_admin on public.audit_events
  for insert to authenticated with check (public.is_admin());
```
This is the one narrow RLS addition in Phase 6 — 005 had an admin SELECT policy but no INSERT, so writes were default-denied. Reads were unchanged.

## Reliability
`writeAuditEvent` is **best-effort**: on failure it logs to the server console and swallows the error, so an audit hiccup never rolls back the primary admin action (which already committed). A failed write is visible in server logs, not to the user.

## Privacy
Metadata holds operational fields (ids, action, transition, reason) — never private personal data. The audit UI renders metadata inside a collapsible `details` block, never as a raw wall of JSON.
