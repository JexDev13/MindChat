"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services";
import { useAuth, ChatProvider } from "@/store";
import { Chat } from "@/types";
import { Card } from "@/components/ui";
import { ChatWindow, ChatList } from "@/components/features";
import { MessageSquare, Search } from "lucide-react";

function PatientChatContent() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's chats
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: () => chatService.getChatsByUser(user?.id || ""),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter chats by search query
  const filteredChats = chats.filter((chat) =>
    chat.participantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select first chat if none selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  return (
    <div className="h-[calc(100vh-8rem)] animate-in">
      <div className="grid h-full lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <Card padding="none" className="lg:col-span-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-white mb-3">
              Conversaciones
            </h2>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-dark-600 bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <ChatList
            chats={filteredChats}
            selectedChatId={selectedChat?.id}
            onSelectChat={setSelectedChat}
            isLoading={isLoading}
          />
        </Card>

        {/* Chat Window */}
        <Card padding="none" className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedChat ? (
            <ChatWindow
              chatId={selectedChat.id}
              participantName={selectedChat.participantName}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Elige un chat de la lista para ver los mensajes y continuar la conversación
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Wrap with ChatProvider
export default function PatientChatPage() {
  return (
    <ChatProvider>
      <PatientChatContent />
    </ChatProvider>
  );
}
