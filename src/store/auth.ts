import { auth } from '@/lib/firebase';
import type { User } from '@/types';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        loading: true,
        initialized: false,
        isAuthenticated: false,
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
            loading: false,
          }),
        setLoading: (loading) => set({ loading }),
        setInitialized: (initialized) => set({ initialized }),
        signOut: async () => {
          try {
            set({ loading: true });
            await firebaseSignOut(auth);
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
            });
          } catch (error) {
            console.error('Sign out error:', error);
            set({ loading: false });
            throw error;
          }
        },
        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated,
          initialized: state.initialized 
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
