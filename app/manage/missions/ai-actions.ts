"use server";

/**
 * AI Mission Builder server action. The only entry point to Gemini from the app.
 * Re-checks organizer auth/role/org, validates the answers, calls Gemini
 * server-side, and returns a sanitized draft. It NEVER writes to the database —
 * saving/publishing still goes through the normal mission actions after the
 * organizer reviews and accepts the draft.
 */
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getMissionCategories } from "@/lib/data/missions";
import { generateMissionDraft, GeminiConfigError } from "@/lib/ai/gemini";
import {
  validateAnswers,
  type AIMissionAnswers,
  type AIMissionDraft,
} from "@/lib/ai/mission-draft-schema";

export type AIDraftResult =
  | { ok: true; draft: AIMissionDraft }
  | { ok: false; code: "auth" | "forbidden" | "validation" | "config" | "unknown"; error: string };

export async function generateMissionDraftAction(answers: AIMissionAnswers): Promise<AIDraftResult> {
  // 1-3. Authenticated organizer that belongs to an organization.
  const guard = await requireOrganizer();
  if (!guard.ok) {
    return {
      ok: false,
      code: guard.code === "auth" ? "auth" : "forbidden",
      error:
        guard.code === "auth"
          ? "Please sign in as an organizer to use the AI builder."
          : "The AI builder is available to organizer accounts.",
    };
  }

  // 4. Enough context to be worth a generation.
  const invalid = validateAnswers(answers);
  if (invalid) return { ok: false, code: "validation", error: invalid };

  try {
    // Only the org's public categories are shared with the model (no PII/IDs).
    const categories = await getMissionCategories();
    const draft = await generateMissionDraft(
      {
        purpose: answers.purpose.trim(),
        whereWhen: answers.whereWhen.trim(),
        tasksRequirements: answers.tasksRequirements.trim(),
        volunteersImpact: answers.volunteersImpact.trim(),
      },
      categories.map((c) => ({ slug: c.slug, name: c.name }))
    );
    return { ok: true, draft };
  } catch (e) {
    if (e instanceof GeminiConfigError) {
      // Developer-facing only; never leak config state to the client.
      console.error("[ai-mission-builder] GEMINI_API_KEY is not configured.");
      return {
        ok: false,
        code: "config",
        error: "AI drafting isn’t available right now — you can continue with the manual form.",
      };
    }
    console.error("[ai-mission-builder] draft generation failed:", e);
    return {
      ok: false,
      code: "unknown",
      error: "We couldn’t generate a draft right now. Please try again, or use the manual form.",
    };
  }
}
