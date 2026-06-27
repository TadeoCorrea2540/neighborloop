/**
 * Remove emoji/pictographs from a user-facing string and tidy whitespace.
 * Used to render notification titles/bodies cleanly — the icon tile already
 * conveys the type, and historic notifications have emoji baked into their text.
 *
 * Matches astral-plane emoji (surrogate pairs, e.g. medal/party/megaphone) plus
 * BMP pictographs (check marks, hourglass, alarm, stars) and variation
 * selectors. Built with plain \uXXXX escapes (no `u` flag) for the TS target.
 */
const EMOJI_RE = new RegExp(
  "([\\uD800-\\uDBFF][\\uDC00-\\uDFFF])" + // astral emoji (surrogate pairs)
    "|[\\u2300-\\u27BF\\u2B00-\\u2BFF\\uFE0E\\uFE0F\\u200D]", // BMP pictographs + selectors
  "g"
);

export function stripEmoji(s: string): string {
  return s.replace(EMOJI_RE, "").replace(/\s{2,}/g, " ").trim();
}
