"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GradientButton } from "@/components/ui/gradient-button";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Send, Paperclip, Phone, Video, MoreVertical, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth.store";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);

  // Mock initial messages
  useEffect(() => {
    // In real app, fetch messages API
    const loadMessages = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setMessages([
        { id: "1", senderId: "other", text: "Hello! How are you feeling today?", timestamp: new Date(Date.now() - 100000), status: 'read' },
        { id: "2", senderId: user?.id || "me", text: "I'm doing better, thanks for asking.", timestamp: new Date(Date.now() - 80000), status: 'read' },
      ]);
    };
    loadMessages();
  }, [conversationId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // If triggered by form submit
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || "me",
      text: inputValue,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate backend response
    setTimeout(() => {
       setMessages(prev => [...prev, {
         id: Date.now().toString(),
         senderId: "other",
         text: "That's good to hear. Have you been practicing the exercises?",
         timestamp: new Date(),
         status: 'sent'
       }]);
    }, 2000);

    // Call SignalR
    // await chatService.sendMessage(conversationId, inputValue);
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
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
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
        {messages.map((msg) => {
          const isMe = msg.senderId === (user?.id || "me");
          return (
            <motion.div
              key={msg.id}
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
                <p>{msg.text}</p>
                <div className={cn(
                  "text-[10px] mt-1 flex items-center gap-1 opacity-70",
                  isMe ? "justify-end text-blue-100" : "text-muted-foreground"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}
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
                   onChange={(e) => setInputValue(e.target.value)}
                   placeholder="Type your message..."
                   className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
            disabled={!inputValue.trim()}
          >
            <Send size={18} className={inputValue.trim() ? "translate-x-0.5" : ""} />
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
