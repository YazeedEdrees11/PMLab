"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { getUser, resultsApi, appointmentsApi } from "@/lib/api";
import {
  Activity,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Plus,
  User,
  TrendingUp,
  Loader2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
} as const;

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = getUser();
        setUser(userData);

        if (userData) {
          const [resultsData, bookingsData] = await Promise.all([
            resultsApi.getMine().catch(() => []),
            appointmentsApi.getMine().catch(() => [])
          ]);
          
          const sortedResults = (resultsData || []).sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const sortedBookings = (bookingsData || []).sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setResults(sortedResults);
          setBookings(sortedBookings);

          const readyResults = (resultsData || []).filter((r: any) => r.status === 'READY');
          if (readyResults.length > 0 && !sessionStorage.getItem('resultsToastShown')) {
            toast.success(isRtl ? `لديك ${readyResults.length} نتيجة جاهزة!` : `You have ${readyResults.length} results ready!`);
            sessionStorage.setItem('resultsToastShown', 'true');
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isRtl]);

  const totalTestsCount = bookings.reduce((acc, b) => acc + (b.testItems?.length || 0), 0);
  const completedTestsCount = bookings.reduce((acc, b) => {
    if (b.status === "COMPLETED") return acc + (b.testItems?.length || 0);
    return acc;
  }, 0);
  const cancelledTestsCount = bookings.reduce((acc, b) => {
    if (b.status === "CANCELLED") return acc + (b.testItems?.length || 0);
    return acc;
  }, 0);

  const pendingTestsCount = totalTestsCount - completedTestsCount - cancelledTestsCount;
  const upcomingBookingsCount = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;

  const stats = [
    { label: t("stat_total"), value: totalTestsCount.toString(), icon: Activity, color: "bg-blue-500", bgLight: "bg-blue-50", textColor: "text-blue-600" },
    { label: t("stat_completed"), value: completedTestsCount.toString(), icon: CheckCircle2, color: "bg-green-500", bgLight: "bg-green-50", textColor: "text-green-600" },
    { label: isRtl ? "قيد الانتظار" : "Pending", value: (pendingTestsCount > 0 ? pendingTestsCount : 0).toString(), icon: Clock, color: "bg-amber-500", bgLight: "bg-amber-50", textColor: "text-amber-600" },
    { label: isRtl ? "ملغي" : "Cancelled", value: cancelledTestsCount.toString(), icon: X, color: "bg-red-500", bgLight: "bg-red-50", textColor: "text-red-600" },
    { label: t("stat_upcoming"), value: upcomingBookingsCount.toString(), icon: Calendar, color: "bg-purple-500", bgLight: "bg-purple-50", textColor: "text-purple-600" },
  ];

  const quickActions = [
    { label: t("book_new_test"), icon: Plus, href: `/${locale}/dashboard/bookings/new`, color: "bg-primary text-white shadow-lg shadow-primary/20" },
    { label: t("view_results"), icon: FileText, href: `/${locale}/dashboard/results`, color: "bg-white text-slate-700 border border-slate-200" },
    { label: t("edit_profile"), icon: User, href: `/${locale}/dashboard/profile`, color: "bg-white text-slate-700 border border-slate-200" },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {t("welcome")}, <span className="text-primary">{user?.name?.split(' ')[0] || "Guest"}</span> 👋
            </h1>
          </div>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
            {isRtl ? "إليك ملخص حالتك الصحية" : "Here's your health summary"}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/bookings/new`}>
          <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Plus className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
            {t("book_new_test")}
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 overflow-hidden relative">
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl ${stat.bgLight} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tighter">{stat.value}</p>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider mt-1">{stat.label}</p>
              </CardContent>
              {/* Subtle background glow */}
              <div className={`absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity ${stat.color}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <motion.h2 variants={itemVariants} className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-primary" />
          {t("quick_actions")}
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href={action.href} className="block h-full">
                <Card className={`${action.color} rounded-2xl border-0 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full overflow-hidden relative group`}>
                  <CardContent className="p-6 flex items-center gap-4 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <action.icon className="h-5 w-5 shrink-0" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wide">{action.label}</span>
                    <ArrowIcon className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRtl ? "mr-auto group-hover:-translate-x-1" : "ml-auto"}`} />
                  </CardContent>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Results */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="h-1 w-4 rounded-full bg-emerald-500" />
              {t("recent_results")}
            </h2>
            <Link href={`/${locale}/dashboard/results`} className="text-primary text-[11px] font-black uppercase tracking-wider hover:underline">
              {t("view_all")}
            </Link>
          </div>
          <Card className="border-0 bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100/50">
            <CardContent className="p-0">
              {results.length > 0 ? results.slice(0, 4).map((result, i) => (
                <div
                  key={result.id}
                  className={`flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors ${
                    i !== Math.min(results.length, 4) - 1 ? "border-b border-slate-50" : ""
                  }`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${result.status === "READY" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    {result.status === "READY" ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">
                      {isRtl ? result.test?.nameAr || result.test?.name : result.test?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      {new Date(result.createdAt).toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${result.status === "READY" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      <div className={`h-1 w-1 rounded-full ${result.status === "READY" ? "bg-green-600" : "bg-amber-600"}`} />
                      {result.status === "READY" ? t("status_ready") : t("status_pending")}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-400">
                  <FileText className="h-10 w-10 mx-auto opacity-10 mb-3" />
                  <p className="text-sm font-bold">{isRtl ? "لا توجد نتائج حديثة" : "No recent results found"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="h-1 w-4 rounded-full bg-blue-500" />
              {t("upcoming_appointments")}
            </h2>
            <Link href={`/${locale}/dashboard/bookings`} className="text-primary text-[11px] font-black uppercase tracking-wider hover:underline">
              {t("view_all")}
            </Link>
          </div>
          <div className="space-y-4">
            {bookings.length > 0 ? bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED').slice(0, 3).map((booking) => (
              <Card key={booking.id} className="border-0 bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-slate-100/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0 border border-primary/5">
                      <span className="text-xl font-black leading-none">{new Date(booking.date).getDate()}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest mt-1">{new Date(booking.date).toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate">
                        {isRtl 
                          ? (booking.testItems?.[0]?.test?.nameAr || booking.testItems?.[0]?.test?.name) 
                          : (booking.testItems?.[0]?.test?.name || booking.testItems?.[0]?.test?.nameAr) || (isRtl ? "فحص طبي" : "Medical Test")}
                        {booking.testItems?.length > 1 && <span className="text-primary ml-1">+{booking.testItems.length - 1}</span>}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.time || "TBD"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.homeVisit ? (isRtl ? "زيارة منزلية" : "Home Visit") : (isRtl ? (booking.branch?.nameAr || booking.branch?.name) : (booking.branch?.name || booking.branch?.nameAr))}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      booking.status === "CONFIRMED" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {booking.status === "CONFIRMED" ? (isRtl ? "مؤكد" : "Confirmed") : (isRtl ? "قيد الانتظار" : "Pending")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
               <div className="bg-white p-12 rounded-3xl text-center text-slate-400 border border-dashed border-slate-200">
                 <Calendar className="h-10 w-10 mx-auto opacity-10 mb-3" />
                 <p className="text-sm font-bold">{isRtl ? "لا توجد مواعيد قادمة" : "No upcoming appointments"}</p>
               </div>
            )}
            
            <Link href={`/${locale}/dashboard/bookings/new`} className="block">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Card className="border-2 border-dashed border-slate-200 rounded-3xl bg-transparent hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                  <CardContent className="p-6 flex items-center justify-center gap-3 text-slate-400 group-hover:text-primary">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">{t("book_new_test")}</span>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
