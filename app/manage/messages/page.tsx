import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth/require-organizer";
import { getUserConversations } from "@/lib/data/conversations";
import ConversationList from "@/components/messaging/conversation-list";

export const dynamic = "force-dynamic";

export default async function OrganizerMessages() {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect("/auth?next=/manage/messages");
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }

  const conversations = await getUserConversations(guard.userId);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-.02em" }}>Messages</h2>
      <p style={{ margin: "0 0 18px", color: "var(--muted-2)", fontSize: 14 }}>Conversations with volunteers across your missions.</p>
      <ConversationList items={conversations} basePath="/manage/messages" viewer="organizer" />
    </div>
  );
}
