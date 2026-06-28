import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getMissionCategories } from "@/lib/data/missions";
import MissionForm from "@/components/manage/mission-form";

export const dynamic = "force-dynamic";

export default async function CreateMissionPage() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/missions/new");
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const categories = await getMissionCategories();

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, color: "var(--muted-3)", marginBottom: 4 }}>
        <Link href="/manage/missions" style={{ color: "var(--muted-3)" }}>Missions</Link> /{" "}
        <span style={{ color: "var(--muted-1)", fontWeight: 600 }}>New mission</span>
      </div>
      <h2 className="mf-create-title">Create a mission</h2>
      <p className="mf-create-intro">
        Save it as a private draft, or publish straight to Explore. You can edit anything later.
      </p>
      <MissionForm mode="create" mission={null} categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))} />
    </div>
  );
}
