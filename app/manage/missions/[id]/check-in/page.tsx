import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOrganizer, UUID_RE } from "@/lib/auth/require-organizer";
import { getOrganizationMissionById } from "@/lib/data/organization-missions";
import { getActiveCheckInToken } from "@/lib/data/check-in";
import CheckInQr from "@/components/manage/check-in-qr";

export const dynamic = "force-dynamic";

export default async function MissionCheckInPage({ params }: { params: { id: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect(`/auth?next=/manage/missions/${params.id}/check-in`);
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }
  if (!UUID_RE.test(params.id)) notFound();

  const mission = await getOrganizationMissionById(guard.orgId, params.id);
  if (!mission) notFound();
  const token = await getActiveCheckInToken(guard.orgId, mission.id);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/manage/attendance" style={{ color: "var(--muted-3)" }}>Attendance</Link> /{" "}
        <Link href={`/manage/missions/${mission.id}/attendance`} style={{ color: "var(--muted-3)" }}>{mission.title}</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>Check-in QR</span>
      </div>
      <h2 style={{ fontSize: 23, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-.02em" }}>Check-in QR</h2>
      <p style={{ margin: "0 0 18px", color: "var(--muted-2)", fontSize: 14 }}>
        Display this at your event. Approved volunteers scan it to check themselves in.
      </p>

      <CheckInQr missionId={mission.id} hasActiveToken={!!token} activeTokenId={token?.id ?? null} />
    </div>
  );
}
