"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/store";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-dark-700 bg-dark-900/80 backdrop-blur-sm px-6">
      {/* Left side - Mobile menu & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg p-2 text-gray-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-dark-600 bg-dark-800 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Right side - Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-dark-800 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-purple-500"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">
              {user?.fullName || "Usuario"}
            </p>
            <p className="text-xs text-gray-400">
              {user?.role === "Psychologist" ? "Psicólogo" : "Paciente"}
            </p>
          </div>
          <Avatar name={user?.fullName} size="md" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
