import { notFound, redirect } from "next/navigation";
import { requireOrganizer, UUID_RE } from "@/lib/auth/require-organizer";
import { getConversationByIdForUser } from "@/lib/data/conversations";
import { getConversationMessages } from "@/lib/data/messages";
import MessageThread from "@/components/messaging/message-thread";

export const dynamic = "force-dynamic";

export default async function OrganizerConversationPage({ params }: { params: { id: string } }) {
  const guard = await requireOrganizer();
  if (!guard.ok) {
    if (guard.code === "auth") redirect(`/auth?next=/manage/messages/${params.id}`);
    if (guard.code === "no_org") redirect("/manage/onboarding");
    redirect("/dashboard");
  }
  if (!UUID_RE.test(params.id)) notFound();

  const conversation = await getConversationByIdForUser(params.id, guard.userId);
  if (!conversation) notFound();
  const messages = await getConversationMessages(params.id, guard.userId);

  return <MessageThread conversation={conversation} initialMessages={messages} currentUserId={guard.userId} backHref="/manage/messages" />;
}
