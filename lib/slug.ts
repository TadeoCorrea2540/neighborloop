/** Shared slug helper for organizations and missions. URL-safe, lowercase. */
export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "item"
  );
}

/** A slug with a short random suffix to make collisions effectively impossible. */
export function slugWithSuffix(s: string): string {
  return `${slugify(s)}-${crypto.randomUUID().slice(0, 6)}`;
}
