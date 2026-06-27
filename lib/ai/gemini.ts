/**
 * Server-only Gemini client for the AI Mission Builder.
 *
 * SECURITY: this module must never be imported into a client component. It reads
 * GEMINI_API_KEY from the server environment and is only reached through the
 * `generateMissionDraftAction` server action. The key is never sent to the
 * browser. Only the organizer's four answers + the org's public category list
 * are sent to Gemini — no user IDs, volunteer data, admin notes, or reports.
 */
import "server-only";
import {
  sanitizeDraft,
  type AIMissionAnswers,
  type AIMissionDraft,
} from "./mission-draft-schema";

/** Thrown when GEMINI_API_KEY is absent — surfaced to the user as "unavailable". */
export class GeminiConfigError extends Error {}
/** Thrown for network / API / parse failures — surfaced as "try again". */
export class GeminiGenerationError extends Error {}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const ENDPOINT = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const SYSTEM_PROMPT = `You are NeighborLoop's mission drafting assistant. NeighborLoop is a community volunteering platform. An organizer answered four short questions; turn them into ONE clear, motivating volunteer mission draft.

VOICE: warm, clear, community-centered, professional, optimistic, practical. Never corporate, exaggerated, childish, or vague.

HARD RULES:
- Do NOT invent precise facts (exact times, addresses, counts) that the organizer did not provide. When something is unknown, leave that field null/empty and add a short note to "missingInformation".
- Do NOT exaggerate impact or make promises. Do NOT promise payment unless the organizer mentioned it. Do NOT invent certificates.
- Do NOT put a private/exact home address in any public field. If the organizer gave a private address or access details, put a general public meeting point in publicLocationLabel and move the precise details into privateMeetingInstructions.
- Generate reasonable, non-dangerous safetyNotes when the work involves children, animals, health, elderly people, physical labor, or public spaces. Never give medical, legal, or hazardous instructions.
- Keep language simple and welcoming for volunteers. Be concise.
- Pick categorySlug ONLY from the provided list of allowed categories; if none clearly fit, use null.
- difficulty must be one of: "easy", "moderate", "challenging", or null.

OUTPUT: Respond with a SINGLE JSON object only (no markdown, no prose) using exactly these keys:
{
  "title": string,
  "summary": string,                       // one or two sentences
  "description": string,                   // 2-4 short paragraphs
  "categorySlug": string | null,
  "difficulty": "easy" | "moderate" | "challenging" | null,
  "isBeginnerFriendly": boolean,
  "estimatedHours": number | null,
  "volunteerCapacity": number | null,
  "publicLocationLabel": string | null,
  "city": string | null,
  "isVirtual": boolean,
  "whatYouWillDo": string[],               // concise task bullets
  "requiredSkills": string[],
  "materialsNeeded": string[],
  "perks": string[],
  "safetyNotes": string[],
  "impactGoal": string,
  "privateMeetingInstructions": string | null,
  "suggestedStartsAt": string | null,      // ISO 8601 if clearly given, else null
  "suggestedEndsAt": string | null,
  "confidenceNotes": string[],
  "missingInformation": string[]
}`;

function buildUserPrompt(a: AIMissionAnswers, categories: { slug: string; name: string }[]): string {
  const cats = categories.map((c) => `- ${c.slug} (${c.name})`).join("\n") || "(none configured)";
  return [
    "Allowed categories (use the slug, or null):",
    cats,
    "",
    "Organizer answers:",
    `1) What is this mission about?\n${a.purpose}`,
    `2) Where and when will it happen?\n${a.whereWhen}`,
    `3) What will volunteers do, and what should they bring or know?\n${a.tasksRequirements}`,
    `4) How many volunteers are needed, and what impact should it create?\n${a.volunteersImpact}`,
    "",
    "Return the JSON object now.",
  ].join("\n");
}

/** Extract a JSON object from a model response that may include stray text. */
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
    throw new GeminiGenerationError("Gemini returned content that was not valid JSON.");
  }
}

export async function generateMissionDraft(
  answers: AIMissionAnswers,
  categories: { slug: string; name: string }[]
): Promise<AIMissionDraft> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiConfigError("GEMINI_API_KEY is not set");

  let res: Response;
  try {
    res = await fetch(ENDPOINT(MODEL, key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: buildUserPrompt(answers, categories) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.55,
          maxOutputTokens: 2048,
        },
      }),
    });
  } catch (e) {
    throw new GeminiGenerationError(`Network error calling Gemini: ${(e as Error).message}`);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new GeminiGenerationError(`Gemini API ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json().catch(() => null)) as
    | { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    | null;
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  if (!text) throw new GeminiGenerationError("Gemini returned an empty response.");

  const draft = sanitizeDraft(parseJson(text), categories.map((c) => c.slug));
  if (!draft.title && !draft.description) {
    throw new GeminiGenerationError("Gemini did not return a usable draft.");
  }
  return draft;
}
