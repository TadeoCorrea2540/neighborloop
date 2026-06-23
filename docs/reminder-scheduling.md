# Reminder Scheduling

Table: `scheduled_reminders` (migration 017). Data: `lib/data/reminders.ts`.

## What exists now
**Reminder records only — there is NO automatic scheduler this phase.** Reminders are created best-effort from existing flows and can be displayed in-app / processed manually.

Types (`reminder_type`): `mission_24h_before`, `mission_2h_before`, `saved_mission_before_deadline`, `attendance_followup`, `certificate_available`. Status (`reminder_status`): `pending`, `sent`, `cancelled`, `failed`.

## When records are created
- Volunteer **approved** → `mission_24h_before` + `mission_2h_before` (only if those times are still in the future).
- Volunteer **saves** a mission → `saved_mission_before_deadline` (24h before start).

`getUpcomingRemindersForUser(userId)` lists a user's pending future reminders; `getDueReminders()` lists pending reminders whose time has passed (for manual processing).

## What is NOT automatic yet
Nothing sends reminders on a schedule. Turning a due `pending` reminder into a notification requires a processor that calls `create_notification()` and flips the row to `sent`.

## Future scheduling options
- **Vercel Cron** → a protected route handler that runs `getDueReminders()` → emits notifications → marks sent.
- **Supabase Edge Function** on a schedule (Deno) hitting the same logic.
- **Supabase `pg_cron`** calling a SECURITY DEFINER SQL function.
- An **external scheduler** (GitHub Actions, etc.) hitting a protected endpoint.

Any of these is additive; the table + creation logic are already in place. RLS keeps reminders private to the user / org managers / admin.
