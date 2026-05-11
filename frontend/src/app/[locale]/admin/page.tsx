"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  DollarSign,
  Activity,
  PlusCircle,
  FileBarChart,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

export default function AdminOverview() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patientsCount, setPatientsCount] = useState(0);
  const [financeStats, setFinanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [aptData, patientsData, financeData] = await Promise.all([
          apiFetch("/appointments"),
          apiFetch("/patients"),
          apiFetch("/stats/finance")
        ]);
        setAppointments(aptData || []);
        setPatientsCount(patientsData?.length || 0);
        setFinanceStats(financeData);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === "PENDING" || a.status === "CONFIRMED").length;
  const completedAppointments = appointments.filter(a => a.status === "COMPLETED").length;

  const stats = [
    { 
      label: isRtl ? "إيرادات الشهر" : "MONTHLY REVENUE", 
      value: financeStats?.monthly?.revenue || 0, 
      icon: DollarSign, 
      color: "from-blue-600 to-blue-700", 
      bgLight: "bg-blue-50/50", 
      textColor: "text-blue-600",
      percentage: `${financeStats?.monthly?.trend > 0 ? '+' : ''}${financeStats?.monthly?.trend || 0}%`,
      isCurrency: true
    },
    { 
      label: isRtl ? "صافي الربح" : "NET PROFIT", 
      value: financeStats?.monthly?.profit || 0, 
      icon: Activity, 
      color: "from-emerald-500 to-emerald-600", 
      bgLight: "bg-emerald-50/50", 
      textColor: "text-emerald-600",
      percentage: "Profit",
      isCurrency: true
    },
    { 
      label: isRtl ? "الحجوزات المعلقة" : "PENDING BOOKINGS", 
      value: pendingAppointments, 
      icon: Clock, 
      color: "from-amber-500 to-amber-600", 
      bgLight: "bg-amber-50/50", 
      textColor: "text-amber-600",
      percentage: totalAppointments > 0 ? `${((pendingAppointments / totalAppointments) * 100).toFixed(0)}%` : "0%"
    },
    { 
      label: isRtl ? "إجمالي المرضى" : "TOTAL PATIENTS", 
      value: patientsCount, 
      icon: Users, 
      color: "from-slate-800 to-slate-900", 
      bgLight: "bg-slate-50/50", 
      textColor: "text-slate-900",
      percentage: "Growth"
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      <motion.div variants={itemVariants} className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isRtl ? "لوحة تحكم الإدارة" : "Dashboard Overview"}
          </h1>
        </div>
        <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
          {isRtl ? "ملخص لجميع الحجوزات ونشاطات النظام" : "Real-time summary of your laboratory operations"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Card className="group border-0 bg-white rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative">
              {/* Premium Background Pattern */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                <stat.icon size={120} className={stat.textColor} />
              </div>

              {/* Animated Gradient Border Bottom */}
              <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`h-16 w-16 rounded-2xl ${stat.bgLight} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white shadow-inner`}>
                    <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
                    {stat.label}
                  </p>
                  <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                      {loading ? (
                        <div className="h-10 w-20 bg-slate-100 animate-pulse rounded-xl mt-2" />
                      ) : (
                        <>
                          {stat.isCurrency && <span className="text-xl mr-1 opacity-40 font-bold">$</span>}
                          {stat.value.toLocaleString()}
                        </>
                      )}
                    </h3>
                    {!loading && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100 shadow-sm h-fit self-end mb-1">
                        <span className="text-[10px] font-black tracking-widest uppercase">{stat.percentage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { title: isRtl ? "حجز موعد جديد" : "New Appointment", desc: isRtl ? "إضافة حجز لمريض جديد أو مسجل" : "Create a new booking entry", icon: PlusCircle, link: "/admin/bookings/new", color: "text-blue-500" },
            { title: isRtl ? "إدارة الفحوصات" : "Manage Tests", desc: isRtl ? "تحديث قائمة الفحوصات والأسعار" : "Edit lab tests and catalog", icon: CheckCircle2, link: "/admin/tests", color: "text-emerald-500" },
            { title: isRtl ? "التقارير المالية" : "Financial Center", desc: isRtl ? "مراجعة الأرباح والنمو المالي" : "Deep dive into financial health", icon: FileBarChart, link: "/admin/finance", color: "text-indigo-500" },
         ].map((action, idx) => (
            <Link key={idx} href={`/${locale}${action.link}`}>
               <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm rounded-3xl hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all cursor-pointer group">
                  <CardContent className="p-6 flex items-center gap-5">
                     <div className={`h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-7 w-7" />
                     </div>
                     <div>
                        <h4 className="font-black text-slate-900 text-sm">{action.title}</h4>
                        <p className="text-xs text-slate-400 font-bold">{action.desc}</p>
                     </div>
                     <ArrowUpRight className="h-4 w-4 text-slate-200 ml-auto group-hover:text-primary transition-colors" />
                  </CardContent>
               </Card>
            </Link>
         ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="h-2 w-8 rounded-full bg-primary" />
             <h2 className="text-2xl font-black text-slate-900">{isRtl ? "أحدث الحجوزات" : "Recent Activity"}</h2>
          </div>
          <Link href={`/${locale}/admin/bookings`}>
            <Button variant="ghost" className="text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 rounded-xl px-4">
              {isRtl ? "عرض السجل بالكامل" : "View Full History"}
            </Button>
          </Link>
        </div>
        
        <Card className="border-0 bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Gathering Data...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-7 hover:bg-slate-50/80 transition-all group cursor-pointer relative overflow-hidden">
                    {/* Hover Indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                    
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-[20px] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-200/50 group-hover:scale-105 transition-all duration-500">
                        <Users className="h-7 w-7 text-slate-400 group-hover:text-primary transition-colors duration-500" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg tracking-tight">
                          {apt.patient?.name || (isRtl ? "مريض غير معروف" : "Anonymous Patient")}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {new Date(apt.date).toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                            <CalendarCheck className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                              {apt.testItems?.length} {isRtl ? "فحوصات" : "Tests"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                       <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm ${
                         apt.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                         apt.status === 'CANCELLED' ? 'bg-red-50 border-red-100 text-red-600' :
                         'bg-amber-50 border-amber-100 text-amber-600'
                       }`}>
                         {apt.status}
                       </div>
                       <Link href={`/${locale}/admin/bookings`}>
                          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500 border border-slate-100">
                             <ArrowRight className="h-5 w-5" />
                          </Button>
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-400">
                 <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarCheck className="h-10 w-10 opacity-20" />
                 </div>
                 <p className="text-lg font-bold text-slate-300 uppercase tracking-[0.2em]">{isRtl ? "لا توجد حجوزات" : "No Records Found"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
