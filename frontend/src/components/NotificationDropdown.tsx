"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, Clock, AlertCircle, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useNotificationStore, type Notification } from "@/store/useNotificationStore";

export function NotificationDropdown() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    // Fetch notifications from backend
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const { apiFetch } = await import('@/lib/api');
      const data = await apiFetch('/notifications/my');
      if (Array.isArray(data)) {
        // Map backend notifications to store format
        const mapped: Notification[] = data.map((n: any) => ({
          id: n.id,
          title: "New Notification",
          titleAr: "إشعار جديد",
          message: n.message,
          messageAr: n.message,
          type: (n.type as any) || "INFO",
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(n.createdAt).toISOString().split('T')[0],
          read: n.isRead,
        }));
        useNotificationStore.setState({ notifications: mapped });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-10 w-10 lg:h-11 lg:w-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-400 border border-slate-200 hover:border-primary/30 hover:bg-slate-50"
        }`}
      >
        <Bell className="h-5 w-5 lg:h-5.5 lg:w-5.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-white rounded-full text-[10px] font-black text-white flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-full mt-3 w-[320px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] ${
              isRtl ? "left-0 sm:-left-4 origin-top-left" : "right-0 sm:-right-4 origin-top-right"
            }`}
          >
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  {isRtl ? "الإشعارات" : "Notifications"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {isRtl ? `لديك ${unreadCount} إشعارات غير مقروءة` : `You have ${unreadCount} unread messages`}
                </p>
              </div>
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-black text-primary hover:text-primary-dark uppercase tracking-widest transition-colors"
              >
                {isRtl ? "تحديد الكل كمقروء" : "Mark all as read"}
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notification.read ? "bg-primary/5" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${
                        notification.type === "SUCCESS" ? "bg-emerald-50 text-emerald-500" :
                        notification.type === "WARNING" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                      }`}>
                        {notification.type === "SUCCESS" ? <CheckCircle2 className="h-5 w-5" /> :
                         notification.type === "WARNING" ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-black text-slate-900 truncate pr-4">
                            {isRtl ? notification.titleAr : notification.title}
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2">
                          {isRtl ? notification.messageAr : notification.message}
                        </p>
                      </div>

                      <button 
                        onClick={(e) => handleRemove(notification.id, e)}
                        className="absolute right-2 top-2 h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 border border-slate-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-xs font-bold text-slate-400">{isRtl ? "لا توجد إشعارات جديدة" : "No new notifications"}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-50 bg-slate-50/30">
              <Link 
                href={`/${locale}/dashboard/notifications`}
                onClick={() => setIsOpen(false)}
                className="w-full h-11 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                {isRtl ? "عرض جميع الإشعارات" : "View All Notifications"}
                <ChevronRight className={`h-3 w-3 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
