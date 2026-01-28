"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { PatientWidgets } from "@/components/dashboard/PatientWidgets";
import { PsychologistWidgets } from "@/components/dashboard/PsychologistWidgets";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) return null;

  // Fallback for dev/demo if user state is empty but token exists (or middleware skipped)
  // In a real app, we fetch user profile on load if store is empty.
  // For now, if no user, I show patient view as default demo
  const userType = user?.userType || 'patient';
  const firstName = user?.firstName || 'Guest';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s your daily overview.
        </p>
      </div>
      
      {userType === 'psychologist' ? (
        <PsychologistWidgets />
      ) : (
        <PatientWidgets />
      )}
    </div>
  );
}
