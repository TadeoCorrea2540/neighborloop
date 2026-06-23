# Report & Moderation Flow

How admins triage reports and moderate missions. Data: `lib/data/admin-reports.ts`, `lib/data/admin-missions.ts`. Actions: `app/admin/reports/actions.ts`, `app/admin/missions/actions.ts`. UI: `/admin/reports` (+`/[id]`), `/admin/missions`.

## Report targets
A report targets exactly **one** of a mission, an organization, or a user (`reports` single-target check constraint). Anyone authenticated can file a report (RLS `reports_insert_self`, `reporter_id = auth.uid()`). Only admins can read/update reports.

## Report statuses
`open` → `reviewing` → `resolved` | `dismissed`. (Reports are filed `open`.)

## Triage
- **Resolve** — `resolveReportAction(id, internalNote?)`: status → `resolved`, set `reviewed_by`/`reviewed_at`, save admin-only `internal_note`. Audit `report_resolved`.
- **Dismiss** — `dismissReportAction(id, internalNote?)`: status → `dismissed`, reviewer fields, internal note. Audit `report_dismissed`.

Already-closed reports show no controls. Each action re-checks `requireAdmin()`.

## Mission moderation (separate, explicit action)
Moderation lives in `app/admin/missions/actions.ts` so the transition logic stays in one place — the report detail page links to it. Admins act on **any** org's mission (RLS lets admins update any mission; the Phase-5 organizer actions are own-org scoped).

`moderateMissionAction(id, action, reason)` — `action ∈ pause | cancel | archive`, **reason required**:
| Action | From → To |
|---|---|
| pause | published → paused |
| cancel | draft / pending_review / published / paused → cancelled |
| archive | draft / pending_review / closed / cancelled → archived |

Invalid transitions return `{ code: 'transition' }`. The reason is stored in the **audit metadata** (missions has no moderation-note column). Audit `mission_moderated`.

`markMissionReviewedAction(id)` — audit-only stamp, no status change (`mission_moderated`, metadata `action: reviewed`).

## Effects
- Pausing/cancelling/archiving a **published** mission removes it from `/explore` and the public detail page (only `published` missions are public). Revalidates `/explore`, `/missions/[slug]`, `/`.
- The organizer dashboard reflects the new status.

## Privacy
- `reports.internal_note` and the **reporter's identity** are admin-only — never shown publicly.
- Internal moderation reasons live only in the audit log (admin-only), never on public mission pages.
