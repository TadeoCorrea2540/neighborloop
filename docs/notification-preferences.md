# Notification Preferences

Table: `notification_preferences` (migration 017). Data: `lib/data/notification-preferences.ts`. Action: `app/settings/notifications/actions.ts`. UI: `/settings/notifications`.

## Preferences
In-app toggles (default **on**): Messages, Application updates, Mission updates, Mission reminders, Attendance updates, Certificates. Channel toggles shown **disabled "Coming soon"**: Email, Push.

## Defaults
If a user has no row, `getNotificationPreferences` returns all in-app categories enabled and email/push disabled. The first save upserts a row keyed by `user_id`.

## In-app vs future channels
- **In-app** notifications are the only delivered channel this phase.
- **Email/push are not implemented** — the toggles are visually disabled and the action keeps them `false`. We never claim they work.
- Essential events (verification, report, `system`) are **always** delivered in-app regardless of toggles — the UI notes this.

## How preferences gate creation
`createNotificationsForUsers` maps each `notification_type` to a preference column; before creating a toggleable notification it filters out recipients who disabled that category (missing row = enabled). Core types bypass the check. See [notification-system.md](notification-system.md).

## Privacy / control
Each user reads and writes only their own preferences (RLS `user_id = auth.uid()`).
