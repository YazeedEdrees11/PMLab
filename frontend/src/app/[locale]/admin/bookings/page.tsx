"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Search,
  Upload,
  FileText,
  Loader2,
  X,
  Home,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { appointmentsApi, resultsApi, branchesApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBookings() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);
  const [uploadingAptId, setUploadingAptId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const [deleteAptId, setDeleteAptId] = useState<string | null>(null);
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, branchFilter]);

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getAll();
      setBranches(data || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getAll({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        branchId: branchFilter === "ALL" ? undefined : branchFilter
      });
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (aptId: string, testId: string) => {
    setUploadingAptId(aptId);
    setUploadingTestId(testId);
    setFile(null);
  };

  const handleCancelUpload = () => {
    setUploadingAptId(null);
    setUploadingTestId(null);
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file || !uploadingAptId || !uploadingTestId) return;

    const apt = appointments.find(a => a.id === uploadingAptId);
    if (!apt) return;

    setUploadLoading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${apt.patientId}-${uploadingTestId}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('results')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('results')
        .getPublicUrl(fileName);

      // 3. Create Result record in backend
      await resultsApi.create({
        patientId: apt.patientId,
        testId: uploadingTestId,
        appointmentId: uploadingAptId,
        fileUrl: publicUrl,
        status: "READY"
      });

      // 4. Update Appointment status if needed (e.g. mark as COMPLETED)
      // If we want to mark the appointment as completed when all tests are uploaded, we can do it here.
      // For simplicity, let's just mark it COMPLETED if any result is uploaded.
      await appointmentsApi.update(uploadingAptId, { status: "COMPLETED" });

      toast.success(isRtl ? "تم رفع النتيجة بنجاح!" : "Result uploaded successfully!");
      handleCancelUpload();
      fetchAppointments();
    } catch (error) {
      console.error("Error uploading result:", error);
      toast.error(isRtl ? "فشل الرفع" : "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteResult = (resultId: string) => {
    setDeleteResultId(resultId);
  };

  const confirmDeleteResult = async () => {
    if (!deleteResultId) return;
    try {
      await resultsApi.delete(deleteResultId);
      toast.success(isRtl ? "تم حذف النتيجة بنجاح" : "Result deleted successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting result:", error);
      toast.error(isRtl ? "فشل حذف النتيجة" : "Failed to delete result");
    } finally {
      setDeleteResultId(null);
    }
  };

  const handleStatusUpdate = async (aptId: string, newStatus: string) => {
    try {
      await appointmentsApi.update(aptId, { status: newStatus });
      toast.success(isRtl ? "تم تحديث حالة الحجز" : "Booking status updated");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(isRtl ? "فشل التحديث" : "Update failed");
    }
  };

  const handleDelete = (aptId: string) => {
    setDeleteAptId(aptId);
  };

  const confirmDelete = async () => {
    if (!deleteAptId) return;
    try {
      await appointmentsApi.delete(deleteAptId);
      toast.success(isRtl ? "تم حذف الحجز بنجاح" : "Booking deleted successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error(isRtl ? "فشل حذف الحجز" : "Failed to delete booking");
    } finally {
      setDeleteAptId(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const q = searchQuery.toLowerCase();
    const patientName = apt.patient?.name?.toLowerCase() || "";
    return patientName.includes(q);
  });

  return (
    <div className="space-y-10">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-3 w-10 rounded-full bg-primary shadow-lg shadow-primary/20" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{isRtl ? "إدارة المواعيد" : "Bookings Control"}</h1>
          </div>
          <p className="text-slate-500 font-bold text-lg">{isRtl ? "متابعة وإدارة سير العمل اليومي للمختبر" : "Monitor and manage the lab's daily workflow"}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group flex-1 min-w-[300px]">
             <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-primary ${isRtl ? "right-4" : "left-4"}`} />
             <Input
               placeholder={isRtl ? "البحث باسم المريض..." : "Search patient name..."}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className={`h-14 rounded-2xl border-2 border-slate-100 bg-white/50 backdrop-blur-sm focus:border-primary/30 transition-all font-bold ${isRtl ? "pr-12" : "pl-12"}`}
             />
          </div>
          <Link href={`/${locale}/admin/bookings/new`}>
            <Button className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all bg-primary">
              <Plus className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
              {isRtl ? "حجز جديد" : "New Booking"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: isRtl ? "إجمالي مواعيد اليوم" : "Today's Bookings", val: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length, icon: CalendarCheck, color: "bg-blue-500" },
          { label: isRtl ? "بانتظار التأكيد" : "Pending Confirmation", val: appointments.filter(a => a.status === 'PENDING').length, icon: Clock, color: "bg-amber-500" },
          { label: isRtl ? "بانتظار النتائج" : "Awaiting Results", val: appointments.filter(a => a.status === 'CONFIRMED').length, icon: Upload, color: "bg-indigo-500" },
          { label: isRtl ? "مكتملة اليوم" : "Completed Today", val: appointments.filter(a => a.status === 'COMPLETED').length, icon: CheckCircle2, color: "bg-emerald-500" }
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`h-14 w-14 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:rotate-6 transition-transform`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.val}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200/50">
        <div className="flex items-center gap-1 p-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap",
                statusFilter === status 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {isRtl ? (status === "ALL" ? "الكل" : status) : status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 w-full md:w-auto">
          <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />
          <div className="flex items-center gap-2 text-slate-400">
             <MapPin className="h-4 w-4" />
             <select 
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-600 appearance-none"
             >
                <option value="ALL">{isRtl ? "جميع الفروع" : "All Branches"}</option>
                {branches.map(b => (
                   <option key={b.id} value={b.id}>{isRtl ? b.nameAr : b.name}</option>
                ))}
             </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-slate-100">
           <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-slate-400 font-black text-sm uppercase tracking-widest animate-pulse">
                 {isRtl ? "جاري تحميل البيانات..." : "Fetching Data..."}
              </p>
           </div>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-8">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="border-0 bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                   {/* Left Side: Patient & Details */}
                   <div className="flex-1 p-8 border-b lg:border-b-0 lg:border-e border-slate-50">
                      <div className="flex items-start justify-between mb-8">
                         <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-xl shadow-slate-900/10">
                               {apt.patient?.name?.[0]?.toUpperCase() || "P"}
                            </div>
                            <div>
                               <h3 className="text-xl font-black text-slate-900">{apt.patient?.name || "Unknown Patient"}</h3>
                               <p className="text-slate-400 font-bold text-sm mt-0.5">{apt.patient?.phone} · {apt.patient?.nationalId}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <Link href={`/${locale}/admin/bookings/${apt.id}`}>
                               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5">
                                  <ArrowUpRight className="h-5 w-5" />
                               </Button>
                            </Link>
                            <Button 
                               variant="ghost" 
                               size="icon" 
                               onClick={() => handleDelete(apt.id)}
                               className="h-12 w-12 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                            >
                               <Trash2 className="h-5 w-5" />
                            </Button>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "التاريخ والوقت" : "Schedule"}</p>
                            <div className="flex items-center gap-2 text-slate-700 font-black text-sm">
                               <CalendarCheck className="h-4 w-4 text-primary" />
                               <span>{new Date(apt.date).toLocaleDateString(locale)}</span>
                               <span className="text-slate-300 mx-1">•</span>
                               <Clock className="h-4 w-4 text-primary" />
                               <span>{apt.time}</span>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "الحالة" : "Status"}</p>
                            <select 
                              value={apt.status}
                              onChange={(e) => handleStatusUpdate(apt.id, e.target.value)}
                              className={cn(
                                "text-xs font-black rounded-xl border-2 px-4 py-2 cursor-pointer outline-none transition-all",
                                apt.status === "COMPLETED" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                                apt.status === "CANCELLED" ? "bg-rose-50 border-rose-100 text-rose-600" :
                                apt.status === "CONFIRMED" ? "bg-blue-50 border-blue-100 text-blue-600" :
                                "bg-amber-50 border-amber-100 text-amber-600"
                              )}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "الموقع" : "Location"}</p>
                            <div className="flex items-center gap-2 text-slate-700 font-black text-sm">
                               {apt.homeVisit ? (
                                  <><Home className="h-4 w-4 text-purple-500" /> <span>Home Visit</span></>
                               ) : (
                                  <><MapPin className="h-4 w-4 text-indigo-500" /> <span>{isRtl ? (apt.branch?.nameAr || "المختبر") : (apt.branch?.name || "Lab")}</span></>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Right Side: Tests & Results */}
                   <div className="w-full lg:w-[400px] bg-slate-50/50 p-8">
                      <div className="flex items-center justify-between mb-6">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">{isRtl ? "الفحوصات والنتائج" : "Tests & Results"}</h4>
                         <span className="h-6 w-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400">
                            {apt.testItems?.length || 0}
                         </span>
                      </div>
                      
                      <div className="space-y-3">
                         {apt.testItems?.map((item: any) => {
                            const latestResult = apt.results?.find((r: any) => r.testId === item.testId);
                            return (
                               <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group/test">
                                  <div className="flex items-center justify-between mb-3">
                                     <span className="text-xs font-black text-slate-700">{isRtl ? item.test?.nameAr : item.test?.name}</span>
                                     {latestResult && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                  </div>

                                  {uploadingAptId === apt.id && uploadingTestId === item.testId ? (
                                     <div className="flex flex-col gap-3">
                                        <div className="relative">
                                           <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="h-10 text-[10px] rounded-xl pr-10" />
                                           <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="flex gap-2">
                                           <Button size="sm" onClick={handleUploadSubmit} disabled={!file || uploadLoading} className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest">
                                              {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRtl ? "رفع" : "Upload")}
                                           </Button>
                                           <Button size="sm" variant="ghost" onClick={handleCancelUpload} className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500">
                                              <X className="h-5 w-5" />
                                           </Button>
                                        </div>
                                     </div>
                                  ) : latestResult ? (
                                     <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => window.open(latestResult.fileUrl, '_blank')} className="flex-1 h-9 rounded-xl border-emerald-100 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50">
                                           {isRtl ? "فتح النتيجة" : "Open Result"}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteResult(latestResult.id)} className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50">
                                           <Trash2 className="h-4 w-4" />
                                        </Button>
                                     </div>
                                  ) : (
                                     <Button variant="outline" size="sm" onClick={() => handleUploadClick(apt.id, item.testId)} className="w-full h-9 rounded-xl border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-primary hover:border-primary/20 transition-all">
                                        <Upload className="h-3.5 w-3.5 mr-2" />
                                        {isRtl ? "إرفاق النتيجة" : "Attach Result"}
                                     </Button>
                                  )}
                               </div>
                            );
                         })}
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 bg-white/50 backdrop-blur-sm rounded-[3rem] border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center h-80 text-center space-y-6">
            <div className="h-24 w-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
               <CalendarCheck className="h-12 w-12" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-900">{isRtl ? "لا توجد حجوزات" : "No Bookings Found"}</h3>
               <p className="text-slate-400 font-bold">{isRtl ? "لم نجد أي حجوزات تطابق خيارات البحث الخاصة بك" : "We couldn't find any bookings matching your search criteria"}</p>
            </div>
            <Button variant="outline" onClick={() => { setStatusFilter("ALL"); setBranchFilter("ALL"); setSearchQuery(""); }} className="rounded-2xl h-12 px-8 font-black border-slate-200 hover:bg-white transition-all">
               {isRtl ? "إعادة ضبط الفلاتر" : "Reset All Filters"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal (Reusable for both) */}
      <AnimatePresence>
        {(deleteAptId || deleteResultId) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setDeleteAptId(null); setDeleteResultId(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />
              
              <div className="p-8 pt-10">
                <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 mb-6 mx-auto rotate-12 group hover:rotate-0 transition-transform duration-500">
                  <AlertCircle className="h-10 w-10 text-red-500 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                
                <h3 className="text-2xl font-black text-center text-slate-900 mb-3 tracking-tight">
                  {isRtl ? "تأكيد الحذف" : "Confirm Deletion"}
                </h3>
                
                <p className="text-center text-slate-500 font-medium mb-8 leading-relaxed">
                  {deleteAptId 
                    ? (isRtl 
                        ? "هل أنت متأكد من رغبتك في حذف هذا الحجز نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
                        : "Are you sure you want to permanently delete this booking? This action cannot be undone.")
                    : (isRtl
                        ? "هل أنت متأكد من رغبتك في حذف نتيجة هذا الفحص؟ سيتم إزالة الملف نهائياً."
                        : "Are you sure you want to delete this test result? The file will be permanently removed.")
                  }
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-14 rounded-2xl font-black text-slate-400 hover:bg-slate-100 uppercase tracking-widest text-[10px]"
                    onClick={() => { setDeleteAptId(null); setDeleteResultId(null); }}
                  >
                    {isRtl ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button 
                    className="h-14 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95"
                    onClick={deleteAptId ? confirmDelete : confirmDeleteResult}
                  >
                    {isRtl ? "نعم، احذف" : "Yes, Delete"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
