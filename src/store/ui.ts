import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type Language = 'en' | 'si';

interface UIState {
  sidebarOpen: boolean;
  language: Language;
  theme: 'light' | 'dark';
  darkMode: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDarkMode: (darkMode: boolean) => void;
  addNotification: (notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      sidebarOpen: true,
      language: 'en',
      theme: 'light',
      darkMode: false,
      notifications: [],
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme, darkMode: theme === 'dark' }),
      setDarkMode: (darkMode) => set({ darkMode, theme: darkMode ? 'dark' : 'light' }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              id: Date.now().toString(),
              ...notification,
              timestamp: new Date(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50), // Keep only last 50 notifications
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-store',
    }
  )
);
