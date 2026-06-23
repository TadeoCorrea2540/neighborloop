# Messaging Security

Tables: `conversations`, `conversation_participants`, `messages` (migration 018). Data: `lib/data/conversations.ts`, `messages.ts`. Actions: `app/messages/actions.ts`.

## Who can message whom
A conversation is **mission-scoped** and exists once a volunteer has an **application** to the mission. There are no pre-application DMs this phase. A conversation has exactly two participant rows: the **volunteer** and the org **owner** (organizer).

Created via `create_application_conversation(application_id)` (SECURITY DEFINER), which authorizes the caller as **either** the application's volunteer **or** a manager of the mission's org, then creates the conversation + both participant rows atomically (idempotent — returns the existing one). This avoids the participant-insert chicken-and-egg and RLS recursion.

## Access (RLS)
- **Conversations / messages:** readable only by participants — `is_conversation_participant(id)` (a SECURITY DEFINER helper, so policies don't recurse) or admin.
- **Send:** `messages` insert requires `sender_id = auth.uid()` AND `is_conversation_participant(conversation_id)`. The action also rejects closed conversations and caps the body at 2000 chars.
- **conversation_participants:** you can read rows for conversations you're in; you can update only **your own** row (last_read_at / mute / archive).
- One organization cannot see another's conversations — access is purely by participant membership, never by org.
- Public/anonymous users can't read anything (default-deny + authenticated-only policies).

## Privacy
- Internal organizer/admin notes (e.g. `applications.organizer_note`) are never exposed through messages.
- Private-profile counterparts show a safe fallback name ("Volunteer"/"Member"); profile RLS still applies to name lookups.
- Realtime is RLS-filtered and subscribed per-conversation (`conversation_id=eq.…`) — a client never receives messages from conversations it isn't in.

## Read state
`conversation_participants.last_read_at` (no per-message receipts). A conversation is "unread" when `conversations.last_message_at` is newer than the viewer's `last_read_at`. Opening a thread marks it read.
