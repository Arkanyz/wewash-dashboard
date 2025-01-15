import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  enabled: boolean;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  toggleNotifications: (enabled: boolean) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: 1,
    title: "Nouvelle mise à jour",
    message: "Une nouvelle version de l'application est disponible",
    time: "Il y a 5 minutes",
    unread: true
  },
  {
    id: 2,
    title: "Maintenance prévue",
    message: "Une maintenance est prévue ce soir à 22h",
    time: "Il y a 1 heure",
    unread: true
  },
  {
    id: 3,
    title: "Nouveau message",
    message: "Vous avez reçu un nouveau message de support",
    time: "Il y a 2 heures",
    unread: false
  }
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: defaultNotifications,
      enabled: true,
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            { ...notification, id: Date.now() },
            ...state.notifications,
          ],
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, unread: false } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, unread: false })),
        })),
      clearNotifications: () => set({ notifications: [] }),
      toggleNotifications: (enabled) => set({ enabled }),
    }),
    {
      name: 'notifications-storage',
    }
  )
);
