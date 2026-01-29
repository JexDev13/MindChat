"use client";

import { ReactNode, useState } from "react";
import { Sidebar, Navbar } from "@/components/shared";
import { useAuth } from "@/store";
import { LoadingScreen } from "@/components/ui";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return <LoadingScreen message="Cargando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Sidebar - Hidden on mobile */}
      <div
        className={`lg:block ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
