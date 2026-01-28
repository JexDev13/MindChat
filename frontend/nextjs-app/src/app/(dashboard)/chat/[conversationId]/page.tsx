import { ChatWindow } from "@/components/chat/ChatWindow";

interface PageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  return <ChatWindow conversationId={conversationId} />;
}
