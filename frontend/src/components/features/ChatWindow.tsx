"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/store";
import { useAuth } from "@/store";
import { chatService } from "@/services";
import { ChatMessage } from "@/types";
import { Avatar, Spinner } from "@/components/ui";
import { cn, formatTime } from "@/lib/utils";
import { Send, Paperclip, Smile } from "lucide-react";

interface ChatWindowProps {
  chatId: string;
  participantName?: string;
}

export function ChatWindow({ chatId, participantName = "Usuario" }: ChatWindowProps) {
  const { user } = useAuth();
  const {
    joinChat,
    leaveChat,
    sendMessage,
    messages,
    setMessages,
    isConnected,
  } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Join chat and load messages
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        // Load existing messages from API
        const existingMessages = await chatService.getMessagesByChat(chatId);
        const formattedMessages: ChatMessage[] = existingMessages.map((msg) => ({
          ...msg,
          isOwnMessage: msg.senderUserId === user?.id,
        }));
        setMessages(formattedMessages);

        // Join SignalR chat room
        await joinChat(chatId);
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      leaveChat(chatId);
    };
  }, [chatId, user?.id, joinChat, leaveChat, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(chatId, inputMessage.trim());
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-dark-700 px-4 py-3">
        <Avatar name={participantName} size="md" />
        <div className="flex-1">
          <h3 className="font-medium text-white">{participantName}</h3>
          <p className="text-xs text-gray-400">
            {isConnected ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                En línea
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Desconectado
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.isOwnMessage ? "justify-end" : "justify-start"
              )}
            >
              {!message.isOwnMessage && (
                <Avatar name={participantName} size="sm" />
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2",
                  message.isOwnMessage
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-dark-700 text-white rounded-bl-sm"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    message.isOwnMessage ? "text-purple-200" : "text-gray-500"
                  )}
                >
                  {formatTime(message.sentAt)}
                </p>
              </div>
              {message.isOwnMessage && (
                <Avatar name={user?.fullName} size="sm" />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-dark-700 p-4">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
            <Smile className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="w-full rounded-full border border-dark-600 bg-dark-800 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
