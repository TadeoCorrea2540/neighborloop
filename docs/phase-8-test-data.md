# Phase 8 — Test Data

## 0. Apply migrations (Supabase SQL editor)
- `017_notifications.sql` — notifications, preferences, reminders + `create_notification()` + realtime.
- `018_messaging.sql` — conversations, participants, messages, mission_updates + `is_conversation_participant()` + `create_application_conversation()` + realtime.

Optionally `npm run db:types` to restore full typing (the app compiles without it via `lib/supabase/db.ts`).

## 1. Notifications loop
1. Organizer account + org + a published mission ([phase-5-test-data.md](phase-5-test-data.md)).
2. A separate **volunteer** applies → the organizer gets an `application_submitted` notification (bell badge + `/notifications`).
3. Organizer approves → the volunteer gets `application_approved` (bell badge updates live + `/notifications`).
4. Cancel a mission / complete attendance / issue a certificate / approve-reject verification → the right user is notified.
5. Mark one read, mark all read; confirm the badge clears. Confirm another user can't read your notifications (SQL).

## 2. Preferences
`/settings/notifications` → toggle off "Application updates" → trigger an application notification → it should be skipped. Email/Push are disabled "Coming soon".

## 3. Messaging
1. As the volunteer (with an application), open **My Missions** → **Message** on the mission row → a thread opens.
2. Send a message → the organizer gets a `message_received` notification and sees the message in `/manage/messages/[id]` (live if the thread is open).
3. Organizer replies → the volunteer sees it. Unread dots + mark-read on open.
4. A user who isn't a participant gets a 404 on the thread (RLS). One org can't see another's conversations.

## 4. Mission updates
Organizer → mission edit → **📣 Updates** → post an update → approved volunteers get a `mission_update` notification. A **pending** applicant does **not** see approved-only updates (SQL: `select * from mission_updates` returns nothing for them).

## SQL spot-checks
```sql
select notification_type, title, read_at from public.notifications order by created_at desc limit 15;
select conversation_type, last_message_at from public.conversations order by created_at desc limit 5;
select sender_role, left(body,40) from public.messages order by created_at desc limit 10;
-- a non-participant should get 0 rows from messages / a non-recipient 0 from notifications (RLS).
```

Keep test accounts throwaway; no destructive SQL needed.
