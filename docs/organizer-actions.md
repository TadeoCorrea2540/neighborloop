# Organizer Server Actions

All `"use server"`. Every action runs the shared guard `requireOrganizer()` (`lib/auth/require-organizer.ts`) → `{ ok, userId, role, orgId }` or `{ ok: false, code }`. They are **non-redirecting**: they return a typed `ActionResult` and the client decides (toast vs route).

```ts
type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string; code: ActionCode };

type ActionCode =
  | "auth" | "role" | "no_org"        // guard failures
  | "not_found" | "forbidden"          // ownership
  | "transition" | "full" | "conflict" // state machine / capacity / slug
  | "validation" | "unknown";
```

## Missions — `app/manage/missions/actions.ts`
| Action | Input | Notes |
|---|---|---|
| `createMissionDraftAction(fd)` | FormData | Inserts `status:'draft'`, generated unique slug (uuid suffix, 1 retry on `23505`). Requires title, summary, start. Returns `{ missionId, slug }`. |
| `updateMissionAction(id, fd)` | id, FormData | Editable columns only — never changes `status`, `slug`, `organization_id`. Re-checks ownership. |
| `publishMissionAction(id)` | id | Allowed from `draft`/`pending_review`/`paused`. Validates publish-completeness (title, summary, description, category, start, and city+location if in-person). Sets `published_at` once. **Verification not required.** |
| `pause/resume/close/cancel/archiveMissionAction(id)` | id | Status transitions — see [mission-lifecycle.md](mission-lifecycle.md). |
| `upsertMissionPrivateDetailsAction(id, fd)` | id, FormData | Upsert on `mission_id`. Revalidates the edit page only — **never** public. |

## Applications — `app/manage/applications/actions.ts`
| Action | Allowed from | Notes |
|---|---|---|
| `approveApplicationAction(id)` | pending, waitlisted | **Capacity check** via direct approved-count; returns `code:'full'` when at capacity. |
| `declineApplicationAction(id, note?)` | pending, waitlisted, approved | Optional private `organizer_note`. |
| `waitlistApplicationAction(id, note?)` | pending, approved | Optional private `organizer_note`. |

All set `reviewed_by` + `reviewed_at`. Ownership is verified by loading the application joined to `missions!inner(organization_id)` and checking it equals the caller's `orgId`.

## Organization
- `createOrganizationAction(input)` — `app/manage/onboarding/actions.ts`. Inserts the org with `verification_status:'not_required'` + owner membership, then redirects to the dashboard.
- `updateOrganizationAction(fd)` — `app/manage/settings/actions.ts`. Updates name/short_description/description/website/instagram/city/country/is_public. **Excludes** `verification_status` & `verification_note` (DB trigger blocks non-admins). Slug is immutable.

## Revalidation
Manage writes revalidate `/manage/missions` + `/manage/dashboard`. Publish/unpublish and any transition into/out of `published` also revalidate `/explore` and `/` (home featured + public org pages). Private-details writes revalidate only the edit page.
