import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'time'> & { id?: string; read?: boolean; time?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Frost Warning Tonight',
    message: 'Temperatures expected to drop to 2°C. Protect sensitive crops.',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Optimal Spraying Conditions',
    message: 'Wind speed is below 5km/h for the next 4 hours.',
    time: '3h ago',
    timestamp: Date.now() - 10800000,
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Harvest Completed',
    message: 'Tomato Field A harvest task was marked as completed.',
    time: '1d ago',
    timestamp: Date.now() - 86400000,
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter(n => !n.read).length,

  addNotification: (notif) => {
    const newNotification: AppNotification = {
      id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: notif.type || 'info',
      title: notif.title,
      message: notif.message,
      time: notif.time || 'Just now',
      timestamp: Date.now(),
      read: notif.read ?? false,
      data: notif.data,
    };

    set((state) => {
      const updated = [newNotification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));
