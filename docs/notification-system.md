# Notification System

Table: `notifications` (migration 017). Helper: `lib/data/notifications.ts`. Actions: `app/notifications/actions.ts`. UI: `/notifications` + the header bell (`components/notifications/*`).

## Types (`notification_type`)
`application_submitted`, `application_approved`, `application_declined`, `application_waitlisted`, `mission_update`, `mission_reminder`, `mission_cancelled`, `attendance_checked_in`, `attendance_completed`, `certificate_issued`, `message_received`, `organization_verified`, `organization_rejected`, `report_resolved`, `system`.

## When notifications are created
Wired into the existing actions (best-effort — a failure never blocks the action):
| Event | Recipient | Type |
|---|---|---|
| Volunteer applies | org owner | application_submitted |
| Approve / decline / waitlist | volunteer | application_approved/declined/waitlisted |
| Mission cancelled | approved volunteers | mission_cancelled |
| Mission update posted | approved volunteers | mission_update |
| Attendance completed | volunteer | attendance_completed |
| Certificate issued | volunteer | certificate_issued |
| Message sent | the other participant | message_received |
| Verification approved/rejected | org owner | organization_verified/rejected |

## Creation
A central helper (`createNotification` / `createNotificationsForUsers`) calls the SECURITY DEFINER `create_notification()` RPC. The creator is usually a *different* user than the recipient (organizer → volunteer), which an RLS insert policy can't express — hence the definer function. **Trade-off:** any authenticated user could call the RPC directly to create a notification for another user (spam only — no data is exposed). Future hardening: per-type authorization or a trusted worker.

Creation **respects preferences**: toggleable categories are skipped if the recipient disabled them (defaults are on); core types (verification, report, system) always send. See [notification-preferences.md](notification-preferences.md).

## Read / unread
Per-user `read_at`. `markNotificationReadAction` / `markAllNotificationsReadAction` update only the caller's own rows (RLS `user_id = auth.uid()`). The header bell shows the unread count (server-fetched per layout) and bumps live via an RLS-filtered realtime subscription to the user's own `notifications` INSERTs; the app is correct without realtime.

## Privacy
Users read only their own notifications (RLS). Bodies are safe, user-facing copy — never internal notes. `link_url` points to an in-app page the user can already access.
