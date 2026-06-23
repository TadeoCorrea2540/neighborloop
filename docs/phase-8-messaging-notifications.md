# Phase 8 — Messaging, Notifications, Mission Updates, Reminders

Turns NeighborLoop into a coordination platform: mission-scoped volunteer⇄organizer messaging, an in-app notification center wired into every flow, organizer announcements, a reminders foundation, and notification preferences. Design preserved. Delivered in two passes (notifications first, then messaging).

## Coordination workflow
Volunteer applies → organizer is notified → organizer approves → volunteer is notified → either side messages (mission-scoped) → organizer posts mission updates → approved volunteers are notified → attendance/certificate events notify the volunteer → everything has an in-app trail.

## Routes (app's real paths; not the spec's `/organization/*`)
- `/notifications` — per-user notification center (all roles).
- `/settings/notifications` — preference toggles.
- `/messages` (+ `/[id]`) — volunteer inbox + thread.
- `/manage/messages` (+ `/[id]`) — organizer inbox + thread.
- `/manage/missions/[id]/updates` — organizer announcements.
- Live 🔔 bell with unread badge in all three shells.

## Tables / functions (migrations 017–018)
017: `notifications`, `notification_preferences`, `scheduled_reminders` + `create_notification()`. 018: `conversations`, `conversation_participants`, `messages`, `mission_updates` + `is_conversation_participant()` + `create_application_conversation()`. Realtime enabled on `notifications` and `messages` (RLS-filtered).

## What Phase 8 does NOT implement
AI (recommend/draft/moderate), payments, advanced analytics, production email/SMS/push, WhatsApp, group chat, voice/video, chat file attachments, reactions, public comments, automated cron. Email/push toggles are shown as "Coming soon"; reminders are records only (no scheduler — see [reminder-scheduling.md](reminder-scheduling.md)).

## See also
[messaging-security.md](messaging-security.md) · [notification-system.md](notification-system.md) · [mission-updates.md](mission-updates.md) · [reminder-scheduling.md](reminder-scheduling.md) · [notification-preferences.md](notification-preferences.md) · [phase-8-test-checklist.md](phase-8-test-checklist.md) · [phase-8-test-data.md](phase-8-test-data.md)
