/**
 * Human-friendly auth error copy. Pure + client-safe (no Supabase import).
 * Deliberately generic on signup / password-reset to avoid email enumeration.
 */
export function humanizeAuthError(message?: string | null): string {
  const m = (message ?? "").toLowerCase();
  if (!m) return "Something went wrong. Please try again.";

  if (m.includes("invalid login credentials"))
    return "That email or password didn't match. Please try again.";
  if (m.includes("email not confirmed"))
    return "Please verify your email before continuing — check your inbox for the confirmation link.";
  if (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already exists")
  )
    return "This email may already be registered. Try logging in instead.";
  if (
    m.includes("password should be at least") ||
    m.includes("password is too short") ||
    m.includes("weak password")
  )
    return "Please choose a stronger password (at least 8 characters).";
  if (m.includes("unable to validate email") || m.includes("invalid email") || m.includes("invalid format"))
    return "That email address doesn't look right.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("expired") || m.includes("invalid token") || m.includes("token has"))
    return "That link is invalid or has expired. Please request a new one.";

  return "Something went wrong. Please try again.";
}
