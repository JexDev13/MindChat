"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { sessionRequestsService, SessionRequest, chatsService } from "@/lib/api/chat-rest.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";

interface ConversationDisplay {
  id: string;
  sessionRequestId: string;
  chatId?: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
}

export function ConversationList() {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.conversationId;
  const user = useAuthStore((state) => state.user);
  
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.profileId || !user?.userType) {
        setLoading(false);
        return;
      }

      try {
        // Fetch session requests based on user type
        let sessionRequests: SessionRequest[];
        if (user.userType === 'patient') {
          sessionRequests = await sessionRequestsService.getByPatient(user.profileId);
        } else {
          sessionRequests = await sessionRequestsService.getByPsychologist(user.profileId);
        }

        // Transform session requests into conversation display format
        // Show both Pending and Accepted (not Rejected)
        const conversationPromises = sessionRequests
          .filter(sr => sr.status === 'Accepted' || sr.status === 'Pending')
          .map(async (sr): Promise<ConversationDisplay> => {
            let chatId: string | undefined;
            let lastMessage = sr.initialMessage || 'Start a conversation';
            
            try {
              const chat = await chatsService.getBySessionRequest(sr.id);
              chatId = chat.id;
            } catch {
              // No chat created yet for this session
            }

            return {
              id: sr.id,
              sessionRequestId: sr.id,
              chatId,
              name: user.userType === 'patient' ? 'Psychologist' : 'Patient',
              lastMessage,
              time: new Date(sr.createdAt).toLocaleDateString(),
              unread: 0,
              status: sr.status,
            };
          });

        const convs = await Promise.all(conversationPromises);
        setConversations(convs);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.profileId, user?.userType]);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white/5 border-r border-white/10 w-full md:w-80">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                if (conv.chatId) {
                  router.push(`/chat/${conv.chatId}`);
                } else {
                  toast.message('Chat not available yet', {
                    description: 'The psychologist must accept the request before chat is created.'
                  });
                }
              }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                currentId === conv.id || currentId === conv.chatId
                  ? "bg-purple-500/20 border border-purple-500/30"
                  : "hover:bg-white/5 border border-transparent",
                !conv.chatId && "opacity-60"
              )}
            >
              <div className="relative">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    {conv.name[0]}
                  </AvatarFallback>
                </Avatar>
                {/* Status indicator */}
                {conv.status === 'Pending' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-black" title="Pending" />
                )}
                {conv.status === 'Accepted' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black" title="Connected" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{conv.name}</p>
                    {conv.status === 'Pending' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <p className={cn(
                  "text-xs truncate",
                  conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {conv.lastMessage}
                </p>
              </div>
              
              {conv.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-purple-500/40">
                  {conv.unread}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-2">Start by connecting with a psychologist</p>
          </div>
        )}
      </div>
    </div>
  );
}
