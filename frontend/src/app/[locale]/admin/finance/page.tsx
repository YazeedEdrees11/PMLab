"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  MapPin,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { getFinancialStats, getBranches } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

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

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface BranchRevenue {
  id: string;
  name: string;
  nameAr: string;
  revenue: number;
  bookings: number;
}

export default function FinancePage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [stats, setStats] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, branchesData] = await Promise.all([
          getFinancialStats(selectedBranch === "all" ? undefined : selectedBranch),
          getBranches()
        ]);
        setStats(statsData);
        setBranches(branchesData);
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedBranch]);

  const timeCards = [
    { 
      label: isRtl ? "إيرادات اليوم" : "Today's Revenue", 
      value: stats?.daily?.revenue, 
      count: stats?.daily?.count,
      gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accent: "bg-emerald-500",
      icon: DollarSign,
      trend: `${stats?.daily?.trend > 0 ? "+" : ""}${stats?.daily?.trend || 0}%`
    },
    { 
      label: isRtl ? "إيرادات الأسبوع" : "Weekly Revenue", 
      value: stats?.weekly?.revenue, 
      count: stats?.weekly?.count,
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      accent: "bg-blue-600",
      icon: Calendar,
      trend: `${stats?.weekly?.trend > 0 ? "+" : ""}${stats?.weekly?.trend || 0}%`
    },
    { 
      label: isRtl ? "إيرادات الشهر" : "Monthly Revenue", 
      value: stats?.monthly?.revenue, 
      count: stats?.monthly?.count,
      gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      accent: "bg-indigo-600",
      icon: BarChart3,
      trend: `${stats?.monthly?.trend > 0 ? "+" : ""}${stats?.monthly?.trend || 0}%`
    },
    { 
      label: isRtl ? "صافي الأرباح (الشهر)" : "Net Profit (Month)", 
      value: stats?.monthly?.profit, 
      count: stats?.monthly?.count,
      gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
      accent: "bg-amber-500",
      icon: Activity,
      trend: `${stats?.monthly?.trend > 0 ? "+" : ""}${stats?.monthly?.trend || 0}%`,
      isProfit: true
    },
    { 
      label: isRtl ? "إيرادات السنة" : "Yearly Revenue", 
      value: stats?.yearly?.revenue, 
      count: stats?.yearly?.count,
      gradient: "from-slate-800/20 via-slate-800/5 to-transparent",
      accent: "bg-slate-900",
      icon: TrendingUp,
      trend: `${stats?.yearly?.trend > 0 ? "+" : ""}${stats?.yearly?.trend || 0}%`
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Header & Filter */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? "التقارير المالية" : "Financial Reports"}</h1>
          </div>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
            {isRtl ? "تحليل شامل للدخل والنمو المالي" : "Comprehensive income and financial growth analysis"}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[280px]">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{isRtl ? "تصفية حسب الفرع" : "Filter by Branch"}</label>
          
          <Select value={selectedBranch} onValueChange={(val) => setSelectedBranch(val || "all")} modal={false}>
            <SelectTrigger 
              className={cn(
                "w-full h-14 rounded-[20px] bg-white border-2 border-slate-100 font-black text-slate-700 shadow-sm hover:border-slate-200 transition-all outline-none",
                isRtl ? "flex-row-reverse" : ""
              )}
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <SelectValue placeholder={isRtl ? "اختر الفرع" : "Select Branch"} />
              </div>
            </SelectTrigger>
            <SelectContent 
              alignItemWithTrigger={false} 
              side="bottom" 
              sideOffset={8}
              className="z-[40] rounded-2xl border-slate-100 shadow-2xl p-2 bg-white/95 backdrop-blur-xl"
            >
              <SelectItem value="all" className="rounded-xl font-bold py-3 focus:bg-primary/5 focus:text-primary">
                {isRtl ? "جميع الفروع" : "All Branches"}
              </SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id} className="rounded-xl font-bold py-3 focus:bg-primary/5 focus:text-primary">
                  {isRtl ? branch.nameAr : branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {timeCards.map((card, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="group relative border-0 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] rounded-[32px] overflow-hidden bg-white h-full transition-shadow hover:shadow-2xl hover:shadow-primary/5">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
              
              <CardContent className="p-8 relative">
                <div className="flex justify-between items-start">
                  <div className={`h-14 w-14 rounded-2xl ${card.accent} flex items-center justify-center text-white shadow-lg shadow-current/30 group-hover:rotate-12 transition-transform duration-500`}>
                    <card.icon className="h-7 w-7" />
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-100/50">
                    <TrendingUp className="h-3 w-3" />
                    <span>{card.trend}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">{card.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                      {card.value?.toLocaleString() || 0}
                    </h2>
                    <span className="text-xs font-black text-slate-300">{isRtl ? "د.أ" : "JOD"}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isRtl ? "العمليات" : "Bookings"}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{card.count || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Growth Overview Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-white rounded-[32px] shadow-xl shadow-slate-200/40 overflow-hidden">
          <CardHeader className="p-8 pb-0 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                      <Activity className="h-5 w-5" />
                    </div>
                    {isRtl ? "نظرة عامة على النمو" : "Growth Overview"}
                  </CardTitle>
                  <p className="text-xs font-bold text-slate-400 mt-1 ml-13">{isRtl ? "مقارنة الإيرادات مقابل صافي الربح (آخر 6 أشهر)" : "Revenue vs Net Profit trend (Last 6 Months)"}</p>
               </div>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-4 rounded-full bg-primary" />
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isRtl ? "الإيرادات" : "Revenue"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-4 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isRtl ? "الأرباح" : "Profit"}</span>
                  </div>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.history || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-white rounded-[32px] shadow-xl shadow-slate-200/40 overflow-hidden">
            <CardHeader className="p-8 pb-0 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  {isRtl ? "تحليل الدخل حسب الفرع" : "Revenue Analysis by Branch"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.branches || []}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey={isRtl ? "nameAr" : "name"} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#barGradient)" 
                    radius={[10, 10, 0, 0]} 
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-white rounded-[32px] shadow-xl shadow-slate-200/40 overflow-hidden">
            <CardHeader className="p-8 pb-0 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  <PieIcon className="h-5 w-5" />
                </div>
                {isRtl ? "حصة الفروع من الحجوزات" : "Branch Booking Share"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.branches || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={8}
                    dataKey="bookings"
                    nameKey={isRtl ? "nameAr" : "name"}
                  >
                    {(stats?.branches || []).map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-600 font-black text-[11px] uppercase tracking-wider">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Tests Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
           <Card className="border-0 bg-slate-900 text-white rounded-[32px] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)]" />
              <CardHeader className="p-10 pb-0 relative">
                 <CardTitle className="text-2xl font-black flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                       <Activity className="h-6 w-6" />
                    </div>
                    {isRtl ? "الفحوصات الأكثر طلباً وتحقيقاً للربح" : "Top Performing Tests"}
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 relative">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={stats?.topTests || []}>
                             <XAxis type="number" hide />
                             <YAxis 
                                type="category" 
                                dataKey={isRtl ? "nameAr" : "name"} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                width={100}
                             />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '15px' }}
                                itemStyle={{ color: '#fff' }}
                             />
                             <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={30} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="space-y-6">
                       {(stats?.topTests || []).map((test: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                                   {idx + 1}
                                </div>
                                <div>
                                   <p className="font-bold text-sm">{isRtl ? test.nameAr : test.name}</p>
                                   <p className="text-xs text-slate-400">{test.count} {isRtl ? "طلب" : "Bookings"}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-blue-400">{test.revenue.toLocaleString()} <span className="text-[10px] text-slate-500">JOD</span></p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </motion.div>
      </div>

      {/* Recent Transactions Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-white rounded-[32px] shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">{isRtl ? "سجل المعاملات المالية" : "Financial Transactions Log"}</CardTitle>
              <p className="text-xs font-bold text-slate-400 mt-1">{isRtl ? "أحدث 50 عملية دفع مكتملة" : "Latest 50 completed payments"}</p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-black hover:bg-slate-100 transition-colors">CSV</button>
               <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors">PDF Export</button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? "المريض" : "Patient"}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? "الفرع" : "Branch"}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? "التاريخ" : "Date"}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{isRtl ? "المبلغ" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {stats?.recentTransactions?.map((tx: any) => (
                     <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <p className="font-black text-slate-900 text-sm">{tx.patient?.name}</p>
                           <p className="text-[10px] font-bold text-slate-400">ID: {tx.id.split('-')[0]}</p>
                        </td>
                        <td className="px-8 py-5">
                           <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                             {isRtl ? tx.branch?.nameAr : tx.branch?.name}
                           </span>
                        </td>
                        <td className="px-8 py-5">
                           <p className="text-sm font-bold text-slate-600">{new Date(tx.date).toLocaleDateString(locale)}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <p className="font-black text-slate-900">{tx.totalPrice} <span className="text-[10px] text-slate-400">JOD</span></p>
                        </td>
                     </tr>
                   ))}
                   {(!stats?.recentTransactions || stats?.recentTransactions.length === 0) && (
                     <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">
                           {isRtl ? "لا توجد معاملات مالية لعرضها" : "No financial transactions to display"}
                        </td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
