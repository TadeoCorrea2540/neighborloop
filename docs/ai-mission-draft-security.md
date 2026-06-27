# AI Mission Builder — privacy & safety

## Key principle

The AI is a **drafting assistant**. It proposes text; the organizer reviews,
edits, and saves through the normal mission flow. The model can never write to
the database, publish a mission, or bypass validation.

## Secret handling

- `GEMINI_API_KEY` is **server-only** (no `NEXT_PUBLIC_` prefix).
- It is read only in [`lib/ai/gemini.ts`](../lib/ai/gemini.ts), which starts with
  `import "server-only"` so it can never be bundled into a client component.
- The only browser-reachable entry point is the server action
  `generateMissionDraftAction`. The key never reaches the browser.
- A missing key logs a developer-facing message and returns a generic
  "unavailable" result — the config state is never leaked to the client.

## Access control

`generateMissionDraftAction` calls `requireOrganizer()` before anything else:

- Anonymous users → refused (`auth`), no Gemini call.
- Volunteers → refused (`forbidden`), no Gemini call.
- Organizers must belong to an organization.

## What is sent to Gemini

Only:

1. The organizer's four free-text answers.
2. The organization's **public** mission categories (slug + name) so the model
   can pick a valid one.

## What is NOT sent

- No user IDs, emails, or auth tokens.
- No volunteer data or applications.
- No admin notes, reports, or moderation data.
- No internal database IDs.
- No other organization's data.

## Private addresses

The system prompt instructs the model to keep exact/private addresses **out of
public fields**. If the organizer provides private access details, they go into
`privateMeetingInstructions`, and the public listing only gets a general meeting
point. `applyDraft` deliberately does **not** write `privateMeetingInstructions`
into any public form field — the organizer is prompted to add it under the
mission's private details after saving.

## Output validation

Every field returned by Gemini is sanitized in
[`lib/ai/mission-draft-schema.ts`](../lib/ai/mission-draft-schema.ts) before it
reaches the UI:

- arrays coerced to arrays and length-bounded,
- numbers clamped (hours `0.5–24`, capacity `1–10000`),
- `categorySlug` constrained to an existing category (else `null`),
- `difficulty` constrained to `easy|moderate|challenging` (else `null`),
- dates parsed to ISO or `null`,
- invalid/empty JSON is caught and surfaced as a friendly retry — the page
  never crashes.

## Safety content

The prompt asks for reasonable, non-dangerous safety notes when a mission
involves children, animals, health, elderly people, physical work, or public
spaces, and forbids medical/legal/hazardous instructions, invented certificates,
and payment promises the organizer didn't make.

## Still required after AI

Normal mission validation and publishing rules are unchanged. A mission can only
go live through `publishMissionAction`, which enforces the same requirements as a
manually created mission.
