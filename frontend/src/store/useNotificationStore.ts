import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: "SUCCESS" | "INFO" | "WARNING";
  time: string;
  date: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time' | 'date'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Result Ready",
    titleAr: "النتيجة جاهزة",
    message: "Your Vitamin D test results are now available for download.",
    messageAr: "نتائج فحص فيتامين د جاهزة الآن للتحميل والعرض.",
    type: "SUCCESS",
    time: "10:30 AM",
    date: new Date().toISOString().split('T')[0],
    read: false,
  },
  {
    id: "2",
    title: "Appointment Confirmed",
    titleAr: "تأكيد الموعد",
    message: "Your home visit for CBC test has been confirmed for tomorrow at 9:00 AM.",
    messageAr: "تم تأكيد موعد الزيارة المنزلية لفحص CBC ليوم غد الساعة 9:00 صباحاً.",
    type: "INFO",
    time: "09:15 AM",
    date: new Date().toISOString().split('T')[0],
    read: false,
  },
  {
    id: "3",
    title: "Booking Received",
    titleAr: "تم استلام الطلب",
    message: "We have received your booking request and it is under review by our medical team.",
    messageAr: "لقد استلمنا طلب الحجز الخاص بك وهو قيد المراجعة من قبل طاقمنا الطبي.",
    type: "INFO",
    time: "Yesterday",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    read: true,
  },
  {
    id: "admin-1",
    title: "New Booking Request",
    titleAr: "طلب حجز جديد",
    message: "A new booking has been made by Yazeed Edrees. Please review and confirm.",
    messageAr: "تم إجراء حجز جديد بواسطة يزيد إدريس. يرجى المراجعة والتأكيد.",
    type: "WARNING",
    time: "Just now",
    date: new Date().toISOString().split('T')[0],
    read: false,
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      
      addNotification: (n) => set((state) => ({
        notifications: [
          {
            ...n,
            id: Math.random().toString(36).substring(7),
            read: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0],
          },
          ...state.notifications
        ]
      })),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'pmlab-notifications',
    }
  )
);
