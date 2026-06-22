"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { redirectToDashboardByRole } from "@/lib/auth/redirect-by-role";
import { humanizeAuthError } from "@/lib/auth/auth-errors";
import type { AppRole } from "@/types/database";

export type AuthActionState = { error?: string; success?: string };

export interface SignUpInput {
  email: string;
  password: string;
  selectedRole: "volunteer" | "organizer";
  displayName?: string;
  fullName?: string;
  bio?: string;
  city?: string;
  region?: string;
  countryCode?: string;
  interests?: string[];
  skills?: string[];
  availability?: string[];
  educationLevel?: string;
  volunteerExperience?: string;
  transport?: string;
  referralSource?: string;
  isProfilePublic?: boolean;
}

const ROLE_PRECEDENCE: AppRole[] = ["admin", "organizer", "volunteer"];

function getOrigin(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function pickRole(rows: { role: AppRole }[] | null | undefined): AppRole | null {
  const roles = (rows ?? []).map((r) => r.role);
  return ROLE_PRECEDENCE.find((r) => roles.includes(r)) ?? null;
}

/** Email/password signup. NEVER returns admin; role is whitelisted client + DB side. */
export async function signUpAction(input: SignUpInput): Promise<AuthActionState> {
  const email = input.email?.trim();
  const password = input.password ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Please enter a valid email address." };
  if (password.length < 8)
    return { error: "Please choose a password with at least 8 characters." };

  // Whitelist defensively here too — DB trigger enforces it again.
  const selected_role: AppRole = input.selectedRole === "organizer" ? "organizer" : "volunteer";

  const supabase = getServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Default Supabase email template ({{ .ConfirmationURL }}) lands here with
      // a ?code to exchange — works without custom SMTP / template edits.
      emailRedirectTo: `${getOrigin()}/auth/callback`,
      data: {
        selected_role,
        display_name: input.displayName?.trim() || undefined,
        full_name: input.fullName?.trim() || undefined,
        bio: input.bio?.trim() || undefined,
        city: input.city?.trim() || undefined,
        region: input.region?.trim() || undefined,
        country_code: input.countryCode?.trim() || undefined,
        interests: input.interests ?? undefined,
        skills: input.skills ?? undefined,
        availability: input.availability ?? undefined,
        education_level: input.educationLevel?.trim() || undefined,
        volunteer_experience: input.volunteerExperience?.trim() || undefined,
        transport: input.transport?.trim() || undefined,
        referral_source: input.referralSource?.trim() || undefined,
        is_profile_public: input.isProfilePublic ?? true,
      },
    },
  });

  if (error) {
    // With email-enumeration protection OFF, an existing email returns an explicit
    // error here — surface the "already registered, log in instead" message.
    if (
      error.code === "user_already_exists" ||
      error.code === "email_exists" ||
      /already registered|already been registered|user already exists/i.test(error.message)
    ) {
      return { error: "This email is already registered. Try logging in instead." };
    }
    return { error: humanizeAuthError(error.message) };
  }

  // With enumeration protection ON, an existing (confirmed) email returns success
  // with an empty identities array and no email sent — surface a helpful hint
  // instead of a misleading "check your email".
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: "This email is already registered. Try logging in instead." };
  }

  return { success: "Check your email to verify your account." };
}

/** Email/password login. Redirects to the role's dashboard on success. */
export async function signInAction(input: { email: string; password: string }): Promise<AuthActionState> {
  const email = input.email?.trim();
  const password = input.password ?? "";
  if (!email || !password) return { error: "Please enter your email and password." };

  const supabase = getServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: humanizeAuthError(error.message) };

  // Read role with the just-authenticated client (RLS sees auth.uid()).
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);

  revalidatePath("/", "layout");
  redirectToDashboardByRole(pickRole(roleRows as { role: AppRole }[] | null));
}

/** Sign out and return to the auth page. */
export async function signOutAction(): Promise<void> {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}

/** Request a password-reset email. Always reports success (anti-enumeration). */
export async function requestPasswordResetAction(email: string): Promise<AuthActionState> {
  const clean = email?.trim();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))
    return { error: "Please enter a valid email address." };

  const supabase = getServerSupabase();
  await supabase.auth.resetPasswordForEmail(clean, {
    // Default template lands on /auth/callback with a ?code; after exchange we
    // forward to /reset-password to set the new password.
    redirectTo: `${getOrigin()}/auth/callback?next=/reset-password`,
  });
  // Never reveal whether the address exists.
  return { success: "If that email is registered, a password reset link is on its way." };
}

/** Set a new password (called from /reset-password with a recovery session). */
export async function updatePasswordAction(password: string): Promise<AuthActionState> {
  if (!password || password.length < 8)
    return { error: "Please choose a password with at least 8 characters." };

  const supabase = getServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: humanizeAuthError(error.message) };

  revalidatePath("/", "layout");
  redirect("/auth?reset=success");
}
