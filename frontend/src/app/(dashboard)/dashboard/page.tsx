"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store";
import { LoadingScreen } from "@/components/ui";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role === "Psychologist") {
        router.push("/dashboard/psychologist");
      } else {
        router.push("/dashboard/patient");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <LoadingScreen message="Redirigiendo..." />;
}
