"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Phone,
  CalendarCheck
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface BranchStats {
  daily: { revenue: number; count: number };
  weekly: { revenue: number; count: number };
  monthly: { revenue: number; count: number; trend?: number };
  allTime: { revenue: number; count: number };
}

interface Branch {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  mapUrl: string;
}

export default function BranchDetailsPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { id } = useParams();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMapUrl, setEditMapUrl] = useState("");

  const fetchData = async () => {
    try {
      const [branchData, statsData, bookingsData] = await Promise.all([
        apiFetch(`/branches/${id}`),
        apiFetch(`/stats/finance?branchId=${id}`),
        apiFetch(`/appointments?branchId=${id}`)
      ]);
      setBranch(branchData);
      setEditName(branchData.name);
      setEditNameAr(branchData.nameAr);
      setEditPhone(branchData.phone);
      setEditMapUrl(branchData.mapUrl);
      setStats(statsData);
      setBookings(bookingsData.slice(0, 10)); // Top 10 recent
    } catch (error) {
      console.error("Error fetching branch details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateBranch = async () => {
    try {
      await apiFetch(`/branches/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          nameAr: editNameAr,
          phone: editPhone,
          mapUrl: editMapUrl
        })
      });
      toast.success(isRtl ? "تم تحديث بيانات الفرع بنجاح" : "Branch updated successfully");
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      toast.error(isRtl ? "فشل في تحديث بيانات الفرع" : "Failed to update branch");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) return <div className="text-center py-20">{isRtl ? "الفرع غير موجود" : "Branch not found"}</div>;

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4">
        <Link href={`/${locale}/admin/branches`}>
          <Button variant="ghost" className="w-fit text-slate-500 font-bold gap-2 hover:bg-white hover:text-primary transition-colors">
            <BackIcon className="h-4 w-4" />
            {isRtl ? "العودة لقائمة الفروع" : "Back to Branches List"}
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl shadow-xl shadow-primary/20">
              <Building2 className="h-10 w-10" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
                <h1 className="text-3xl font-black text-slate-900">{isRtl ? branch.nameAr : branch.name}</h1>
              </div>
              <div className="flex items-center gap-4 mt-1 text-slate-500 font-medium text-sm">
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {branch.phone}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {branch.id}</span>
              </div>
            </div>
          </div>
          
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger 
              render={
                <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
                  {isRtl ? "تعديل بيانات الفرع" : "Edit Branch Info"}
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">{isRtl ? "تعديل بيانات الفرع" : "Edit Branch Info"}</DialogTitle>
                <DialogDescription>
                  {isRtl ? "قم بتحديث معلومات الفرع الأساسية" : "Update the branch's essential information"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{isRtl ? "الاسم (EN)" : "Name (EN)"}</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{isRtl ? "الاسم (AR)" : "Name (AR)"}</label>
                    <Input value={editNameAr} onChange={(e) => setEditNameAr(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "رابط الخريطة" : "Google Maps URL"}</label>
                  <Input value={editMapUrl} onChange={(e) => setEditMapUrl(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateBranch} className="w-full h-11 font-bold">
                  {isRtl ? "حفظ التعديلات" : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-slate-900 text-white rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden group col-span-1 md:col-span-2">
          <DollarSign className="absolute -bottom-8 -right-8 h-48 w-48 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <CardContent className="p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">{isRtl ? "إجمالي إيرادات الفرع" : "Total Branch Revenue"}</p>
                <h2 className="text-5xl font-black mt-3 flex items-baseline gap-3">
                  {(stats?.allTime?.revenue || 0).toLocaleString()} 
                  <span className="text-xl font-bold text-slate-500">{isRtl ? "د.أ" : "JOD"}</span>
                </h2>
              </div>
              <div className="flex gap-4">
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRtl ? "اليوم" : "Today"}</p>
                  <p className="text-xl font-black text-green-400">{(stats?.daily?.revenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRtl ? "الشهر" : "Month"}</p>
                  <p className="text-xl font-black text-blue-400">{(stats?.monthly?.revenue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-3xl shadow-sm border-b-4 border-primary relative overflow-hidden group">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <div className="text-right">
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{isRtl ? "إجمالي الحجوزات" : "Total Bookings"}</p>
                 <h2 className="text-3xl font-black text-slate-900 mt-1">{stats?.allTime?.count || 0}</h2>
              </div>
            </div>
            <div className="space-y-3">
               <div className="flex items-center justify-between text-sm">
                 <span className="font-bold text-slate-500">{isRtl ? "هذا الأسبوع" : "This Week"}</span>
                 <span className="font-black text-slate-900">{stats?.weekly?.count || 0}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-3xl shadow-sm border-b-4 border-emerald-500 relative overflow-hidden group">
          <CardContent className="p-8">
             <div className="flex justify-between items-start mb-6">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div className="text-right">
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{isRtl ? "معدل النمو" : "Growth Rate"}</p>
                 <h2 className="text-3xl font-black text-emerald-600 mt-1">+{stats?.monthly?.trend || 0}%</h2>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500">
              {isRtl ? "بالمقارنة مع الشهر الماضي" : "Compared to last month"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <Card className="lg:col-span-2 border-0 bg-white rounded-2xl shadow-sm">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900">{isRtl ? "أحدث الحجوزات في هذا الفرع" : "Recent Branch Bookings"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-50">
               {bookings.map((apt) => (
                 <div key={apt.id} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors group">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {apt.patient?.name?.[0] || "P"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{apt.patient?.name}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1">{new Date(apt.date).toLocaleDateString(locale)} • {apt.time}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-slate-900">{apt.totalPrice} <span className="text-xs font-bold text-slate-400">{isRtl ? "د.أ" : "JOD"}</span></p>
                       <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                         {apt.status}
                       </span>
                    </div>
                 </div>
               ))}
               {bookings.length === 0 && (
                 <div className="p-20 text-center text-slate-400 font-medium">{isRtl ? "لا توجد حجوزات لهذا الفرع" : "No bookings for this branch"}</div>
               )}
             </div>
             <div className="p-6 border-t border-slate-50">
                <Button variant="ghost" className="w-full text-primary font-bold">{isRtl ? "عرض جميع حجوزات الفرع" : "View All Branch Bookings"}</Button>
             </div>
          </CardContent>
        </Card>

        {/* Small Analytics Card */}
        <Card className="lg:col-span-1 border-0 bg-white rounded-2xl shadow-sm">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900">{isRtl ? "توزيع الفحوصات" : "Test Distribution"}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'CBC', val: 400 }, { name: 'Lipid', val: 300 }, { name: 'Vit D', val: 200 }, { name: 'Thy', val: 150 }]}>
                    <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-6 space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-600">{isRtl ? "أكثر فحص طلباً" : "Top Test"}</span>
                 <span className="text-sm font-black text-primary">CBC (42%)</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-600">{isRtl ? "ساعات الذروة" : "Peak Hours"}</span>
                 <span className="text-sm font-black text-slate-900">09:00 - 11:00</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
