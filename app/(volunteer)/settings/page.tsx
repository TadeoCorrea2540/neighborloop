import { requireAuth, getCurrentProfile } from "@/lib/auth/server";
import SettingsClient from "./settings-client";

export default async function Settings() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();

  return (
    <SettingsClient
      email={user.email ?? ""}
      initial={{
        displayName: profile?.display_name ?? "",
        bio: profile?.bio ?? "",
        city: profile?.city ?? "",
        countryCode: profile?.country_code ?? "",
        interests: (profile?.interests ?? []).join(", "),
        isProfilePublic: profile?.is_profile_public ?? true,
      }}
    />
  );
}
