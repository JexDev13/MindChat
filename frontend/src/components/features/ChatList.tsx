"use client";

import { Avatar, Badge } from "@/components/ui";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { Chat } from "@/types";

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string | null;
  onSelectChat: (chat: Chat) => void;
  isLoading?: boolean;
}

export function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  isLoading = false,
}: ChatListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-dark-600" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-dark-600 rounded" />
              <div className="h-3 w-32 bg-dark-600 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-gray-500 mb-2">No tienes conversaciones activas</p>
        <p className="text-xs text-gray-600">
          Cuando inicies un chat, aparecerá aquí
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={cn(
            "w-full flex items-center gap-3 p-3 border-b border-dark-700/50 hover:bg-dark-700/50 transition-colors text-left",
            selectedChatId === chat.id && "bg-dark-700"
          )}
        >
          <div className="relative">
            <Avatar name={chat.participantName || "Usuario"} size="md" />
            {!chat.isClosed && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-dark-800" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-sm font-medium text-white truncate">
                {chat.participantName || "Usuario"}
              </p>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {chat.lastMessageAt
                  ? formatRelativeTime(chat.lastMessageAt)
                  : formatRelativeTime(chat.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 truncate">
                {chat.lastMessage
                  ? truncate(chat.lastMessage, 30)
                  : "Sin mensajes"}
              </p>
              {chat.messageCount > 0 && (
                <Badge variant="purple" size="sm" className="ml-2 flex-shrink-0">
                  {chat.messageCount}
                </Badge>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ChatList;
