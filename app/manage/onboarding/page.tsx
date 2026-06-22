import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/server";
import { getServerSupabase } from "@/lib/supabase/server";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const { user } = await requireRole(["organizer", "admin"]);

  // Already have an organization? Skip onboarding.
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1);

  if (data && data.length > 0) {
    redirect("/manage/dashboard");
  }

  return <OnboardingForm />;
}
