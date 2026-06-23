# Mission Lifecycle

Mission status is a state machine (`mission_status` enum). The server (`changeStatus` / `publishMissionAction` in `app/manage/missions/actions.ts`) enforces every transition; the UI (`components/manage/mission-status-actions.tsx`) only shows valid options.

## States
- **draft** — created, private. Only the org sees it.
- **pending_review** — reserved for a future admin review queue (treated like draft for now).
- **published** — live on `/explore` and the public detail page; volunteers can apply.
- **paused** — temporarily hidden from public; not accepting applications.
- **closed** — finished/stopped; no new applications.
- **cancelled** — won't happen.
- **archived** — terminal; hidden from the active list.

## Transition map (enforced server-side)
```
draft          → published, pending_review, cancelled, archived
pending_review → published, draft, cancelled
published      → paused, closed, cancelled
paused         → published(resume), closed, cancelled
closed         → archived
cancelled      → archived
archived       → (terminal)
```
Any other transition returns `{ code: 'transition' }`.

## Action → transition
| Action | From → To |
|---|---|
| `publishMissionAction` | draft / pending_review / paused → **published** (sets `published_at` once) |
| `pauseMissionAction` | published → paused |
| `resumeMissionAction` | paused → published |
| `closeMissionAction` | published / paused → closed |
| `cancelMissionAction` | draft / pending_review / published / paused → cancelled |
| `archiveMissionAction` | draft / pending_review / closed / cancelled → archived |

## Publish completeness (gate, not verification)
Publishing requires: **title, summary, description, category, start date**, and for in-person missions **city + location**. Missing fields return `{ code: 'validation' }` listing what's needed. Organization verification is **not** required.

## Public visibility
Only **published** missions appear publicly. Entering or leaving `published` revalidates `/explore` and `/` so the public surface updates immediately. Editing a published mission's date/capacity affects already-approved volunteers — surfaced to the organizer; notifications come in a later phase.
