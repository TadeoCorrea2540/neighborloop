# Phase 8 — Test Checklist

Setup: apply migrations 017 + 018; have an organizer+org+published mission, an approved volunteer, and an admin ([phase-8-test-data.md](phase-8-test-data.md)).

## Messaging
- [ ] Volunteer can view the message inbox (`/messages`).
- [ ] Organizer can view the message inbox (`/manage/messages`).
- [ ] Volunteer can open a conversation from My Missions and send a message.
- [ ] Organizer can reply in the conversation.
- [ ] A user cannot open a conversation they aren't part of (404 / RLS).
- [ ] One organization cannot access another organization's conversations.
- [ ] Sending a message creates a `message_received` notification for the other participant.
- [ ] Marking a conversation read clears its unread state.

## Mission updates
- [ ] Organizer can create a mission update.
- [ ] Approved volunteers receive a `mission_update` notification.
- [ ] Pending applicants do NOT see approved-only updates.

## Notifications
- [ ] Volunteer can view `/notifications`.
- [ ] Mark one read / mark all read work (own only).
- [ ] Bell badge reflects the unread count and updates live.
- [ ] Application approved creates a notification.
- [ ] Mission cancelled creates notifications for approved volunteers.
- [ ] Certificate issued creates a notification.
- [ ] Notification preferences can be updated; a disabled category is skipped.
- [ ] Email/push are clearly marked "Coming soon".

## Reminders
- [ ] Reminder records are created on approve and on save (no auto-send; documented).

## Security / privacy
- [ ] No public access to messages or notifications (SQL: anon = 0 rows).
- [ ] Internal notes never appear in messages/notifications.
- [ ] No service-role key in client/server-action code.

## Regression
- [ ] Public, volunteer, organizer, and admin routes still work.

## Mobile (320 / 375 / 390 / 414 / 768px)
- [ ] `/messages`, conversation thread (sticky composer), `/notifications`, `/settings/notifications`, `/manage/missions/[id]/updates` — no overflow, 44px targets, long messages wrap.

## Build
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` passes (stop the dev server first).
