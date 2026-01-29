"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { useEffect, useState } from "react";
import { PsychologistBrowser } from "@/components/patient/PsychologistBrowser";
import { PendingRequests } from "@/components/psychologist/PendingRequests";
import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import { PsychologistDebug } from "@/components/debug/PsychologistDebug";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Normalize role
  const isPsychologist = user?.role === 'Psychologist' || user?.userType === 'psychologist';
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

      {/* Debug Component - Helping to diagnose issues */}
      {/* <PsychologistDebug /> */}
      
      {isPsychologist ? (
        <div className="space-y-8">
            <PendingRequests />
            <AppointmentsList />
        </div>
      ) : (
        <div className="space-y-8">
            <AppointmentsList />
            <div>
                <h2 className="text-xl font-bold mb-4">Find a Psychologist</h2>
                <PsychologistBrowser />
            </div>
        </div>
      )}
    </div>
  );
}
