# Gemini API setup

The AI Mission Builder calls Google's Gemini API **server-side only**.

## 1. Get an API key

1. Go to <https://aistudio.google.com/app/apikey>.
2. Create an API key (free tier is fine for drafting).
3. Copy the key.

## 2. Add it locally

Add the key to `.env.local` (git-ignored — never commit real keys):

```bash
GEMINI_API_KEY=your_key_here
# optional, defaults to gemini-2.0-flash
# GEMINI_MODEL=gemini-2.0-flash
```

`.env.example` already documents these as placeholders.

Restart the dev server after adding the key.

## 3. In production

Set `GEMINI_API_KEY` as a server-side environment variable on your host
(Vercel: Project → Settings → Environment Variables). Do **not** prefix it with
`NEXT_PUBLIC_` — that would bundle it into the browser. It is read only in
[`lib/ai/gemini.ts`](../lib/ai/gemini.ts), which is `import "server-only"`.

## Behavior without a key

The feature is optional. If `GEMINI_API_KEY` is missing:

- The manual mission form works exactly as before.
- "Draft with AI" shows: *"AI drafting isn't available right now — you can
  continue with the manual form."*
- A developer-facing line is logged server-side; **no secret is exposed**.

## Model

Defaults to `gemini-2.0-flash` (fast, supports JSON responses). Override with
`GEMINI_MODEL`. The request uses `responseMimeType: application/json` and a
strict prompt; the response is parsed and sanitized before use.

## Cost / rate limits

Each draft is a single request (~2k output tokens). Generation only happens when
an organizer explicitly clicks "Generate draft" after answering all four
questions, so volume is naturally low.
