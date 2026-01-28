import { ConversationList } from "@/components/chat/ConversationList";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-8rem)] w-full rounded-2xl overflow-hidden border border-white/10 flex bg-white/5 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
      <div className="hidden md:block h-full flex-shrink-0">
        <ConversationList />
      </div>
      <div className="flex-1 h-full min-w-0 relative">
        {children}
      </div>
    </div>
  );
}
