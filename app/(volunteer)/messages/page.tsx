import { requireAuth } from "@/lib/auth/server";
import { getUserConversations } from "@/lib/data/conversations";
import ConversationList from "@/components/messaging/conversation-list";

export const dynamic = "force-dynamic";

export default async function VolunteerMessages() {
  const user = await requireAuth();
  const conversations = await getUserConversations(user.id);

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-.02em" }}>Messages</h2>
      <p style={{ margin: "0 0 18px", color: "var(--muted-2)", fontSize: 14 }}>Your conversations with mission organizers.</p>
      <ConversationList items={conversations} basePath="/messages" viewer="volunteer" />
    </div>
  );
}
