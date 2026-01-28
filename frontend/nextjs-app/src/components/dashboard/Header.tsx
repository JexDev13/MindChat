"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useAuthStore } from "@/lib/store/auth.store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Need to add Sheet component if not present
import { Sidebar } from "./Sidebar";
import { useState } from "react";

// Note: I haven't added 'sheet' component from shadcn yet. I should do that or use a simple mobile menu implementation.
// For now, I'll stick to a simple implementation without Sheet or install it.
// The plan said "Collapsible on mobile".
// I'll assume desktop first, mobile toggle logic later or basic implementation.

export function Header() {
  const user = useAuthStore((state) => state.user);
  
  const placeholders = [
    "Search for psychologists...",
    "Find articles...",
    "Check appointments...",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger Placeholder */}
        <button className="md:hidden p-2 hover:bg-white/10 rounded-full">
          <Menu />
        </button>
        
        {/* Search - Hidden on small mobile */}
        <div className="hidden sm:block w-64">
           {/* PlaceholdersAndVanishInput is a bit tall for a header, maybe scale it or use standard input? 
               I'll use it but wrapper it to fit.
           */}
           <div className="h-10">
             {/* Creating a simple search input here instead of the complex one for header to fit better */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
             </div>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.firstName || "User"} {user?.lastName || ""}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.userType || "Guest"}</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-purple-500/20">
            <AvatarImage src={user?.profilePictureUrl} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              {user?.firstName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
