import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/server";
import { UUID_RE } from "@/lib/auth/require-organizer";
import { getConversationByIdForUser } from "@/lib/data/conversations";
import { getConversationMessages } from "@/lib/data/messages";
import MessageThread from "@/components/messaging/message-thread";

export const dynamic = "force-dynamic";

export default async function VolunteerConversationPage({ params }: { params: { id: string } }) {
  const user = await requireAuth();
  if (!UUID_RE.test(params.id)) notFound();

  const conversation = await getConversationByIdForUser(params.id, user.id);
  if (!conversation) notFound(); // not a participant → RLS returns null
  const messages = await getConversationMessages(params.id, user.id);

  return <MessageThread conversation={conversation} initialMessages={messages} currentUserId={user.id} backHref="/messages" />;
}
