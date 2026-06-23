# Phase 6 — Admin, Verification, Reports, Moderation, Audit

Connects the **admin** surface to real Supabase data so NeighborLoop has a real trust & safety foundation, while preserving the design. Phases 1–5 (public, volunteer, organizer) are unchanged.

## Admin journey
View platform activity → review organizations → approve/reject verification → triage reports → moderate unsafe missions → track every action in the audit log.

## Routes (all under `app/admin/**`, gated by `requireRole(["admin"])` in `app/admin/layout.tsx`)
- `/admin` — real dashboard: platform counts + verification queue + recent reports + recent admin actions.
- `/admin/verification` (+ `/[id]`) — verification queue and decision detail (approve / reject / return-to-pending).
- `/admin/reports` (+ `/[id]`) — report triage (resolve / dismiss).
- `/admin/missions` — mission moderation across all orgs (pause / cancel / archive / mark-reviewed).
- `/admin/organizations` — read-only org overview with verification status + counts.
- `/admin/users` — read-only user overview (safe profile fields only).
- `/admin/audit` — admin-only audit log with category filters.

The mock `/admin/verify` page was removed.

## What Phase 6 implements
Real admin dashboard, organization verification workflow, report/moderation workflow, mission moderation, organizations/users overviews, audit events, and a small organizer **"Request verification"** button (`/manage/settings`) that produces the verification queue.

## What it does NOT implement (later phases)
Verification document uploads, QR/attendance, certificates, PDF, messaging, notifications, payments, AI/risk scoring, advanced analytics, user bans/suspensions, admin email notifications.

## Tables used
`profiles`, `user_roles`, `organizations`, `organization_members`, `organization_verifications`, `missions`, `applications`, `reports`, `audit_events`, `mission_categories`.

## Data & security model
- Reads: `lib/data/admin-*.ts` (server-only). RLS already grants admins full read across these tables — no broad changes.
- Writes: server actions in `app/admin/**/actions.ts` behind `requireAdmin()` (`lib/auth/require-admin.ts`) + RLS `is_admin()`.
- The only schema change is migration `012_audit_events_insert.sql` (admin-only INSERT policy so the audit log can be written). See [audit-events.md](audit-events.md).
- Source of truth for an org's status is `organizations.verification_status`; `organization_verifications` is the decision history. Public reason → `organizations.verification_note` (organizer-readable); `internal_note` stays admin-only.

## See also
[admin-verification-workflow.md](admin-verification-workflow.md) · [report-moderation-flow.md](report-moderation-flow.md) · [admin-route-protection.md](admin-route-protection.md) · [audit-events.md](audit-events.md) · [phase-6-test-checklist.md](phase-6-test-checklist.md) · [phase-6-test-data.md](phase-6-test-data.md)
