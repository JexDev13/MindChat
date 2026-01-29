"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useAuthContext } from "@/store";
import { authService } from "@/services";
import { RegisterPatientRequest, RegisterPsychologistRequest } from "@/types";

export function useAuthService() {
  const router = useRouter();
  const auth = useAuthContext();

  const loginAndRedirect = useCallback(
    async (email: string, password: string) => {
      const result = await auth.login(email, password);
      if (result.success) {
        if (result.role === "Psychologist") {
          router.push("/dashboard/psychologist");
        } else {
          router.push("/dashboard/patient");
        }
      }
      return result;
    },
    [auth, router]
  );

  const registerPatient = useCallback(
    async (data: RegisterPatientRequest) => {
      const result = await authService.registerPatient(data);
      if (result.success) {
        router.push("/login");
      }
      return result;
    },
    [router]
  );

  const registerPsychologist = useCallback(
    async (data: RegisterPsychologistRequest) => {
      const result = await authService.registerPsychologist(data);
      if (result.success) {
        router.push("/login");
      }
      return result;
    },
    [router]
  );

  const logoutAndRedirect = useCallback(() => {
    auth.logout();
    router.push("/login");
  }, [auth, router]);

  return {
    ...auth,
    loginAndRedirect,
    registerPatient,
    registerPsychologist,
    logoutAndRedirect,
  };
}

export default useAuthService;
