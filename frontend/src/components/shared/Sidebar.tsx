"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store";
import { Avatar } from "@/components/ui";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  User,
  LogOut,
  Settings,
  Users,
  FileText,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const patientNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/patient",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Chat",
    href: "/dashboard/patient/chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "Appointments",
    href: "/dashboard/patient/appointments",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/dashboard/patient/profile",
    icon: <User className="h-5 w-5" />,
  },
];

const psychologistNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/psychologist",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Chat",
    href: "/dashboard/psychologist/chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "Appointments",
    href: "/dashboard/psychologist/appointments",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Patients",
    href: "/dashboard/psychologist/patients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Session Requests",
    href: "/dashboard/psychologist/requests",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/dashboard/psychologist/profile",
    icon: <User className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems =
    user?.role === "Psychologist" ? psychologistNavItems : patientNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-dark-700 bg-dark-900">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-dark-700 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              MindChat
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-600/20 text-purple-400"
                    : "text-gray-400 hover:bg-dark-800 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-dark-700 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-dark-800 p-3">
            <Avatar name={user?.fullName} size="sm" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || "Usuario"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-dark-800 px-3 py-2 text-sm text-gray-400 hover:bg-dark-700 hover:text-white transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={logout}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-dark-800 px-3 py-2 text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
