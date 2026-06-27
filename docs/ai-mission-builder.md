# AI Mission Builder

A guided "Draft with AI" flow that helps organizers create a mission draft from
**four short questions** instead of filling the whole form by hand. It is a
*drafting assistant only* — the organizer always reviews, edits, and saves
through the normal mission form. **Nothing is ever auto-saved or auto-published.**

## Where it lives

- Trigger + flow: [`components/manage/ai-mission-builder.tsx`](../components/manage/ai-mission-builder.tsx) (+ `.css`)
- Server action: [`app/manage/missions/ai-actions.ts`](../app/manage/missions/ai-actions.ts)
- Gemini client (server-only): [`lib/ai/gemini.ts`](../lib/ai/gemini.ts)
- Types + sanitization: [`lib/ai/mission-draft-schema.ts`](../lib/ai/mission-draft-schema.ts)
- Integration: rendered at the top of the **create** mission form
  ([`components/manage/mission-form.tsx`](../components/manage/mission-form.tsx)),
  create mode only. The manual form is unchanged and remains the only write path.

## Flow

```
Create Mission → "Draft with AI"
→ 4 guided questions (Purpose → Where & when → Requirements → Impact)
→ Gemini generates a structured draft (server-side)
→ Organizer reviews & edits the draft
→ "Use this draft" fills the existing form (still editable)
→ Organizer saves as draft or publishes via the normal actions/validation
```

The AI never bypasses validation or publishing rules. `createMissionDraftAction`
/ `publishMissionAction` still run exactly as before.

## The four questions

1. **What is this mission about?** → title, summary, description, impact, category
2. **Where and when will it happen?** → location label, city, virtual flag, suggested start/end
3. **What will volunteers do, and what should they bring/know?** → tasks, skills, materials, safety, difficulty
4. **How many volunteers, and what impact?** → capacity, estimated hours, impact goal, perks

A minimum length is required per question before a generation is attempted.

## Output

Gemini returns a single JSON object that is sanitized into `AIMissionDraft`
(see the schema file). Sanitization:

- coerces arrays to arrays and bounds their length,
- clamps numbers to sane ranges (hours `0.5–24`, capacity `1–10000`),
- constrains `categorySlug` to a category that actually exists (else `null`),
- validates `difficulty` against the form's options (`easy|moderate|challenging`),
- parses dates to ISO or `null`,
- surfaces `missingInformation` instead of inventing facts.

## How the draft fills the form

`MissionForm.applyDraft` maps the draft onto the existing form state and merges
it (every field stays editable):

- `title`, `summary` → same fields
- `description` ← description + a "What you'll do" list + the impact goal
- `categorySlug` → resolved to the category `id` (or left blank to choose)
- `difficulty`, `isBeginnerFriendly`, `estimatedHours`, `volunteerCapacity`
- `isVirtual`, `publicLocationLabel` → location label, `city`
- `requiredSkills`, `materialsNeeded`, `perks`, `safetyNotes`
- `suggestedStartsAt`/`suggestedEndsAt` → the datetime inputs (when present)
- `privateMeetingInstructions` is **not** written to public fields — the
  organizer is prompted to add it under private details after saving.

## Access control

`generateMissionDraftAction` runs `requireOrganizer()` first: anonymous users
and volunteers get a friendly refusal and no Gemini call is made.

## Setup

See [`gemini-api-setup.md`](./gemini-api-setup.md). If `GEMINI_API_KEY` is unset,
the manual form works exactly as before and the AI flow shows a friendly
"unavailable" message.

## Future improvements

- Stream the draft as it generates.
- Let the AI suggest a cover image prompt (image generation is out of scope now).
- Persist the private meeting instructions directly into the private-details form.
- Localize prompts/output.
