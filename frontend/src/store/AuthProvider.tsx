"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, AuthState, AuthResponse } from "@/types";
import { authService } from "@/services";
import { decodeJwt } from "jose";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for authentication persistence
// Note: These are storage keys, not cryptographic secrets
const STORAGE_KEYS = {
  TOKEN: "mindchat_auth_token",
  USER: "mindchat_auth_user",
  COOKIE: "mindchat_auth_token",
} as const;

// Cookie helper functions for middleware compatibility
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

/**
 * Decode JWT and extract user info for UI purposes.
 * 
 * SECURITY NOTE: This decoding without cryptographic verification is intentional
 * for client-side use only. The JWT is verified server-side on every API request.
 * Client-side decoding is safe here because:
 * 1. All API endpoints validate the JWT signature server-side
 * 2. This is only used for UI rendering (user display, role-based navigation)
 * 3. Actual authorization is enforced by the backend
 */
const decodeToken = (token: string): User | null => {
  try {
    // Client-side JWT decoding for UI purposes only
    // Server validates signature on all authenticated API calls
    const payload = decodeJwt(token);
    return {
      id: payload.sub as string,
      email: (payload.email as string) || "",
      fullName: (payload.name as string) || "",
      role: (payload.role as "Patient" | "Psychologist") || "Patient",
      profileId: payload.profileId as string | undefined,
    };
  } catch {
    return null;
  }
};

/**
 * Check if token is expired based on the exp claim.
 * See decodeToken for security notes on client-side JWT handling.
 */
const isTokenExpired = (token: string): boolean => {
  try {
    // Client-side expiration check for UX only
    const payload = decodeJwt(token);
    const exp = payload.exp as number;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userJson = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && !isTokenExpired(token)) {
          const user = userJson ? JSON.parse(userJson) : decodeToken(token);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Clear expired token
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const response = await authService.login({ email, password });

        if (response.success && response.token) {
          const user: User = {
            id: response.userId || "",
            email: response.email || email,
            fullName: response.fullName || "",
            role: (response.role as "Patient" | "Psychologist") || "Patient",
            profileId: response.profileId,
          };

          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          // Set cookie for middleware (server-side) access
          setCookie(STORAGE_KEYS.COOKIE, response.token);

          setAuthState({
            user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        }

        return response;
      } catch (error) {
        const errorResponse: AuthResponse = {
          success: false,
          errors: ["Error al iniciar sesión. Por favor, intenta de nuevo."],
        };
        return errorResponse;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    deleteCookie(STORAGE_KEYS.COOKIE);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = "/login";
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setAuthState((prev) => ({
      ...prev,
      user,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
