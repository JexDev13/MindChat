"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Calendar, User, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Different sidebar items for patient vs psychologist
  const sidebarItems = user?.userType === 'psychologist' 
    ? [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: MessageSquare, label: "Chat", href: "/chat" },
        { icon: Calendar, label: "Appointments", href: "/appointments" },
        { icon: Users, label: "My Patients", href: "/patients" },
        { icon: User, label: "Profile", href: "/profile" },
      ]
    : [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Users, label: "Psychologists", href: "/psychologists" },
        { icon: MessageSquare, label: "Chat", href: "/chat" },
        { icon: Calendar, label: "Appointments", href: "/appointments" },
        { icon: User, label: "Profile", href: "/profile" },
      ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 hidden md:flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          MindChat
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative",
                  isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-600 border border-purple-500/10"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
