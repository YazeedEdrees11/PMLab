"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  Trash2, 
  Edit, 
  Loader2,
  ChevronRight,
  ChevronLeft,
  Search,
  ExternalLink,
  AlertCircle,
  X,
  Users,
  Activity,
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Branch {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  mapUrl: string;
  _count: {
    staff: number;
    appointments: number;
  };
}

export default function BranchesPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteBranchId, setDeleteBranchId] = useState<string | null>(null);

  // Stats
  const stats = {
    total: branches.length,
    totalStaff: branches.reduce((acc, b) => acc + (b._count?.staff || 0), 0),
    totalBookings: branches.reduce((acc, b) => acc + (b._count?.appointments || 0), 0),
  };

  // Form State
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [phone, setPhone] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  const fetchBranches = async () => {
    try {
      const data = await apiFetch("/branches");
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error(isRtl ? "فشل تحميل الفروع" : "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddBranch = async () => {
    if (!name || !nameAr || !phone) {
      toast.error(isRtl ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    try {
      await apiFetch("/branches", {
        method: "POST",
        body: JSON.stringify({
          id: `branch-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          nameAr,
          phone,
          mapUrl
        })
      });
      toast.success(isRtl ? "تم إضافة الفرع بنجاح" : "Branch added successfully");
      setIsAddOpen(false);
      setName("");
      setNameAr("");
      setPhone("");
      setMapUrl("");
      fetchBranches();
    } catch (error) {
      toast.error(isRtl ? "فشل في إضافة الفرع" : "Failed to add branch");
    }
  };

  const handleDeleteBranch = async () => {
    if (!deleteBranchId) return;
    try {
      await apiFetch(`/branches/${deleteBranchId}`, { method: "DELETE" });
      toast.success(isRtl ? "تم الحذف بنجاح" : "Deleted successfully");
      fetchBranches();
    } catch (error) {
      toast.error(isRtl ? "فشل في الحذف" : "Failed to delete");
    } finally {
      setDeleteBranchId(null);
    }
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.nameAr.includes(search)
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? "إدارة الفروع" : "Branches Management"}</h1>
          </div>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
            {isRtl ? "إضافة وتعديل ومراقبة أداء كافة الفروع" : "Add, edit and monitor the performance of all branches"}
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2">
              <Plus className="h-5 w-5" />
              {isRtl ? "إضافة فرع جديد" : "Add New Branch"}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">{isRtl ? "إضافة فرع جديد" : "Add New Branch"}</DialogTitle>
              <DialogDescription>
                {isRtl ? "أدخل بيانات الفرع الجديد ليتم تفعيله في النظام فوراً" : "Enter new branch details to activate it in the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "الاسم (EN)" : "Name (EN)"}</label>
                  <Input placeholder="Gardens" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "الاسم (AR)" : "Name (AR)"}</label>
                  <Input placeholder="الجاردنز" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
                <Input placeholder="+9627XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{isRtl ? "رابط الخريطة" : "Google Maps URL"}</label>
                <Input placeholder="https://goo.gl/maps/..." value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddBranch} className="w-full h-11 font-bold">
                {isRtl ? "إضافة الفرع" : "Create Branch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-white rounded-3xl shadow-sm border-b-4 border-primary relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Building2 className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{isRtl ? "إجمالي الفروع" : "Total Branches"}</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-3xl shadow-sm border-b-4 border-emerald-500 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <UserCheck className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <UserCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{isRtl ? "إجمالي الموظفين" : "Total Staff"}</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.totalStaff}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-3xl shadow-sm border-b-4 border-blue-500 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Activity className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{isRtl ? "إجمالي الحجوزات" : "Total Bookings"}</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.totalBookings}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder={isRtl ? "ابحث عن فرع..." : "Search branches..."} 
            className="pl-10 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBranches.map((branch) => (
          <Card key={branch.id} className="border-0 bg-white rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col h-full border-t-8 border-primary">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteBranchId(branch.id)} className="h-10 w-10 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="font-black text-slate-900 text-2xl tracking-tight group-hover:text-primary transition-colors">
                  {isRtl ? branch.nameAr : branch.name}
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  {branch.id}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRtl ? "الموظفين" : "Staff"}</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary/60" />
                    <span className="text-lg font-black text-slate-900">{branch._count?.staff || 0}</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRtl ? "الحجوزات" : "Bookings"}</p>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500/60" />
                    <span className="text-lg font-black text-slate-900">{branch._count?.appointments || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-slate-600 font-bold">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-sm">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <a href={branch.mapUrl || "#"} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm flex items-center gap-2">
                    {isRtl ? "عرض الموقع الجغرافي" : "View Location on Map"}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="mt-auto">
                <Link href={`/${locale}/admin/branches/${branch.id}`}>
                  <Button variant="default" className="w-full h-14 rounded-2xl font-black bg-slate-900 text-white hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3 border-0 shadow-lg shadow-slate-900/10">
                    {isRtl ? "لوحة تحكم الفرع" : "Branch Dashboard"}
                    <ChevronIcon className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteBranchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
                {isRtl ? "تأكيد حذف الفرع" : "Confirm Branch Deletion"}
              </h3>
              <p className="text-center text-slate-500 mb-6">
                {isRtl 
                  ? "هل أنت متأكد من حذف هذا الفرع؟ سيتم حذف جميع البيانات المرتبطة به نهائياً. لا يمكن التراجع عن هذا الإجراء." 
                  : "Are you sure you want to delete this branch? All associated data will be permanently removed. This action cannot be undone."}
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:flex-1 h-12 rounded-xl font-bold"
                  onClick={() => setDeleteBranchId(null)}
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full sm:flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteBranch}
                >
                  {isRtl ? "نعم، احذف الفرع" : "Yes, Delete Branch"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
