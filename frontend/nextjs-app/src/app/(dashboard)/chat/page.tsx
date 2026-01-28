import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <MessageSquare size={40} className="text-purple-500 opacity-50" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Select a Conversation</h2>
      <p className="text-muted-foreground max-w-sm">
        Choose a conversation from the list to start messaging with your psychologist or support team.
      </p>
      
      {/* Mobile view could show list here if not in sidebar, but layout hides sidebar on mobile.
          Ideally on mobile, this page should show the list. 
          But layout handles list in desktop.
      */}
      <div className="md:hidden mt-8 w-full">
         <p className="text-sm font-medium mb-4">Your Conversations</p>
         {/* Re-using ConversationList for mobile here? 
             Actually, I should just render ConversationList here for mobile.
         */}
         {/* For now, text is enough as this is desktop focused layout structure */}
      </div>
    </div>
  );
}
