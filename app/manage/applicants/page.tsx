import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getApplicationsForOrganization } from "@/lib/data/organization-applications";
import ApplicationsReview from "@/components/manage/applications-review";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/applicants");
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const applications = await getApplicationsForOrganization(guard.orgId);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>Applicants</h2>
        <p style={{ margin: "4px 0 0", color: "var(--muted-2)", fontSize: 14 }}>
          Review volunteers across all your missions. Approving respects each mission’s capacity.
        </p>
      </div>
      <ApplicationsReview applications={applications} showMission />
    </div>
  );
}
