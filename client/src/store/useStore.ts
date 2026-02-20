import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@atomecom/shared';

// Define the shape of the store
interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

// Create the store with DevTools and Persist middleware
export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // UI Initial State
        sidebarOpen: true,
        theme: 'system',

        // Auth Initial State
        user: null,
        isAuthenticated: false,
        hasHydrated: false,

        // Actions
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        logout: () => set({ user: null, isAuthenticated: false }),
        setHasHydrated: (state) => set({ hasHydrated: state }),
      }),
      {
        name: 'app-storage',
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
  ),
);
