"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Search } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const mockConversations: Conversation[] = [
  { id: "1", name: "Dr. Sarah Wilson", avatar: "https://i.pravatar.cc/150?u=sarah", lastMessage: "How are you feeling today?", time: "10:30 AM", unread: 2, online: true },
  { id: "2", name: "Dr. James Carter", avatar: "https://i.pravatar.cc/150?u=james", lastMessage: "Don't forget the breathing exercises.", time: "Yesterday", unread: 0, online: false },
  { id: "3", name: "MindChat Support", avatar: "", lastMessage: "Your appointment is confirmed.", time: "Mon", unread: 0, online: true },
];

export function ConversationList() {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.conversationId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full bg-white/5 border-r border-white/10 w-full md:w-80">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
           {/* Simple search for now to avoid VanishInput complexities in tight spaces */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {mockConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => router.push(`/chat/${conv.id}`)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
              currentId === conv.id
                ? "bg-purple-500/20 border border-purple-500/30"
                : "hover:bg-white/5 border border-transparent"
            )}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={conv.avatar} />
                <AvatarFallback>{conv.name[0]}</AvatarFallback>
              </Avatar>
              {conv.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-sm truncate">{conv.name}</p>
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
        ))}
      </div>
    </div>
  );
}
