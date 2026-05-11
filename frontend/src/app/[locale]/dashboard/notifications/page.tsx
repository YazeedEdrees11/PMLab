"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Search,
  Filter,
  Trash2,
  CheckCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
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

import { useNotificationStore } from "@/store/useNotificationStore";

export default function NotificationsPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [search, setSearch] = useState("");
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore();

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === "ALL" || !n.read;
    const matchesSearch = (isRtl ? n.titleAr : n.title).toLowerCase().includes(search.toLowerCase()) ||
                          (isRtl ? n.messageAr : n.message).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const deleteNotification = (id: string) => {
    removeNotification(id);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isRtl ? "مركز الإشعارات" : "Notification Center"}
            </h1>
          </div>
          <p className="text-slate-500 font-bold">
            {isRtl ? "تابع آخر التحديثات والنتائج والمواعيد الخاصة بك" : "Stay updated with your latest results, appointments and activities"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="rounded-xl font-bold gap-2 border-slate-200 hover:bg-slate-50 transition-all"
          >
            <CheckCheck className="h-4 w-4 text-primary" />
            {isRtl ? "تحديد الكل كمقروء" : "Mark all as read"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={clearAll}
            className="rounded-xl font-bold gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            {isRtl ? "مسح الكل" : "Clear All"}
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="border-0 bg-white rounded-3xl shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
              <button
                onClick={() => setFilter("ALL")}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  filter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {isRtl ? "الكل" : "All"}
              </button>
              <button
                onClick={() => setFilter("UNREAD")}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  filter === "UNREAD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {isRtl ? "غير مقروء" : "Unread"}
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </div>

            <div className="relative flex-1 w-full">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
              <Input 
                placeholder={isRtl ? "البحث في الإشعارات..." : "Search notifications..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`h-11 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all ${isRtl ? "pr-10" : "pl-10"}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-0 transition-all duration-300 group rounded-[32px] overflow-hidden ${
                  !notification.read ? "bg-white shadow-md ring-1 ring-primary/10" : "bg-white/60 shadow-sm opacity-80 hover:opacity-100"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${
                        notification.type === "SUCCESS" ? "bg-emerald-50 text-emerald-500" :
                        notification.type === "WARNING" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                      }`}>
                        {notification.type === "SUCCESS" ? <CheckCircle2 className="h-7 w-7" /> :
                         notification.type === "WARNING" ? <AlertCircle className="h-7 w-7" /> : <Bell className="h-7 w-7" />}
                      </div>

                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-black text-slate-900 text-lg leading-tight">
                              {isRtl ? notification.titleAr : notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge className="bg-primary text-white border-0 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                                {isRtl ? "جديد" : "New"}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{notification.date}</p>
                             <p className="text-xs font-bold text-slate-500 mt-0.5">{notification.time}</p>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                          {isRtl ? notification.messageAr : notification.message}
                        </p>

                        <div className="flex items-center gap-4 mt-6">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all"
                            >
                              {isRtl ? "تمت القراءة" : "Mark as read"}
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notification.id)}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="h-3 w-3" />
                            {isRtl ? "حذف" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-6"
            >
              <div className="h-24 w-24 bg-slate-100 rounded-[40px] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                <Bell className="h-12 w-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  {isRtl ? "لا توجد إشعارات" : "No Notifications"}
                </h3>
                <p className="text-slate-400 font-bold max-w-xs mx-auto">
                  {isRtl ? "لا توجد إشعارات تطابق بحثك حالياً" : "There are no notifications matching your search at the moment"}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {setSearch(""); setFilter("ALL")}}
                className="rounded-xl font-bold border-slate-200"
              >
                {isRtl ? "عرض الكل" : "View All"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
