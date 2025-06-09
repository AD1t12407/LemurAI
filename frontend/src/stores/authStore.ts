import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';
import { AuthService } from '../services/auth';

// Extended User interface to match backend
interface ExtendedUser extends User {
  created_at?: string;
  google_calendar_connected?: boolean;
}

export const useAuthStore = create<AuthState & {
  login: (user: ExtendedUser, token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (user: ExtendedUser) => void;
}>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user: ExtendedUser, token: string) => {
        // Convert extended user to regular user format
        const regularUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user',
          avatar: undefined
        };

        set({
          user: regularUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      },

      logout: () => {
        AuthService.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      initializeAuth: async () => {
        set({ isLoading: true });

        const token = AuthService.getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        try {
          const user = await AuthService.getCurrentUser();
          const regularUser: User = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'user',
            avatar: undefined
          };

          set({
            user: regularUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          // Token is invalid, clear auth
          AuthService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      updateUser: (user: ExtendedUser) => {
        const regularUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user',
          avatar: undefined
        };

        set({ user: regularUser });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        // Don't persist user data - it will be refreshed from token
      }),
    }
  )
);