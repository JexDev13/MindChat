"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GradientButton } from "@/components/ui/gradient-button";
import { Send, Paperclip, Phone, Video, MoreVertical, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth.store";
import { chatService } from "@/lib/api/chat.service";
import { messagesService } from "@/lib/api/chat-rest.service";
import { toast } from "sonner";

interface Message {
  id?: string;
  chatId: string;
  senderUserId: string;
  message: string;
  sentAt: string;
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Conectar a SignalR y cargar mensajes
  useEffect(() => {
    const initChat = async () => {
      if (!token || !conversationId) return;

      try {
        // Conectar a SignalR
        await chatService.connect(token);
        setIsConnected(true);

        // Unirse al chat
        await chatService.joinChat(conversationId);
        
        // Cargar historial de mensajes
        const history = await messagesService.getByChatId(conversationId);
        setMessages(history);
      } catch (error) {
        console.error("Error al conectar al chat:", error);
        toast.error("No se pudo conectar al chat");
      }
    };

    initChat();

    // Configurar listeners de SignalR
    const handleReceiveMessage = (data: { chatId: string; senderUserId: string; message: string; sentAt: string }) => {
      if (data.chatId === conversationId) {
        setMessages(prev => [...prev, {
          chatId: data.chatId,
          senderUserId: data.senderUserId,
          message: data.message,
          sentAt: data.sentAt
        }]);
      }
    };

    const handleChatHistory = (history: Message[]) => {
      setMessages(history);
    };

    const handleUserTyping = (data: { chatId: string; userId: string; userName: string }) => {
      if (data.chatId === conversationId && data.userId !== user?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    chatService.on("ReceiveMessage", handleReceiveMessage);
    chatService.on("ChatHistory", handleChatHistory);
    chatService.on("UserTyping", handleUserTyping);

    // Cleanup
    return () => {
      chatService.off("ReceiveMessage", handleReceiveMessage);
      chatService.off("ChatHistory", handleChatHistory);
      chatService.off("UserTyping", handleUserTyping);
      chatService.leaveChat(conversationId);
    };
  }, [conversationId, token, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Enviar indicador de "escribiendo..."
    if (e.target.value && chatService.isConnected()) {
      chatService.typing(conversationId);
      
      // Detener indicador después de 1 segundo de inactividad
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => {
        chatService.stopTyping(conversationId);
      }, 1000);
      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatService.isConnected()) return;

    try {
      // Limpiar timeout de typing
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      await chatService.stopTyping(conversationId);

      // Enviar mensaje vía SignalR
      await chatService.sendMessage(conversationId, inputValue);
      setInputValue("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error("No se pudo enviar el mensaje");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-purple-500/30">
            <AvatarImage src="https://i.pravatar.cc/150?u=sarah" />
            <AvatarFallback>SW</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-sm">Dr. Sarah Wilson</h3>
            <span className={cn(
              "text-xs flex items-center gap-1",
              isConnected ? "text-green-500" : "text-gray-500"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isConnected ? "bg-green-500" : "bg-gray-500"
              )}></span> 
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors">
            <Video size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.senderUserId === user?.id;
          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex w-full",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-md",
                  isMe
                    ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tr-none"
                    : "bg-white/10 border border-white/10 text-foreground rounded-tl-none"
                )}
              >
                <p>{msg.message}</p>
                <div className={cn(
                  "text-[10px] mt-1 flex items-center gap-1 opacity-70",
                  isMe ? "justify-end text-blue-100" : "text-muted-foreground"
                )}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-purple-400 transition-colors">
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 relative">
             <form onSubmit={handleSendMessage} className="relative">
                <input 
                   type="text"
                   value={inputValue}
                   onChange={handleInputChange}
                   placeholder="Type your message..."
                   disabled={!isConnected}
                   className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-yellow-400"
                >
                  <Smile size={18} />
                </button>
             </form>
          </div>

          <GradientButton 
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
            onClick={(e) => handleSendMessage(e)}
            disabled={!inputValue.trim() || !isConnected}
          >
            <Send size={18} className={inputValue.trim() ? "translate-x-0.5" : ""} />
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
