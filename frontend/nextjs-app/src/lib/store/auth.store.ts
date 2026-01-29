import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'patient' | 'psychologist';
  profileId?: string;
  profilePictureUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => 
        set({ user, token, isAuthenticated: true }),
      logout: () => {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          // Clear cookie
          document.cookie = 'authToken=; path=/; max-age=0';
        }
        // Clear zustand state
        set({ user: null, token: null, isAuthenticated: false });
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
    }),
    { name: 'auth-storage' }
  )
);
