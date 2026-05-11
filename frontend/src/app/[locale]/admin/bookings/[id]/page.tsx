"use client";

import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { appointmentsApi, resultsApi, apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  CheckCircle2,
  X,
  Loader2,
  Activity,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Trash2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { id } = params;

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async (isInitial = true) => {
    try {
      if (isInitial) setLoading(true);
      const data = await appointmentsApi.getById(id as string);
      setAppointment(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error(isRtl ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await appointmentsApi.update(id as string, { status: newStatus });
      fetchBooking(false); // Fetch in background
      toast.success(isRtl ? "تم تحديث الحالة" : "Status updated");
    } catch (error) {
      toast.error(isRtl ? "فشل التحديث" : "Update failed");
    }
  };

  const handleUploadSubmit = async (testId: string) => {
    if (!file) return;

    setUploadLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${appointment.patientId}-${testId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('results')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('results')
        .getPublicUrl(fileName);

      // Check if a result already exists for this patient and test
      const existingResult = appointment.patient?.results?.find(
        (r: any) => r.testId === testId
      );

      if (existingResult) {
        // Update existing result
        await resultsApi.update(existingResult.id, {
          fileUrl: publicUrl,
          status: "READY"
        });
      } else {
        // Create new result
        await resultsApi.create({
          patientId: appointment.patientId,
          testId: testId,
          fileUrl: publicUrl,
          status: "READY"
        });
      }

      await appointmentsApi.update(id as string, { status: "COMPLETED" });

      toast.success(isRtl ? "تم رفع وتحديث النتيجة" : "Result uploaded and updated");
      setUploadingTestId(null);
      setFile(null);
      fetchBooking(false); // Fetch in background
    } catch (error) {
      console.error(error);
      toast.error(isRtl ? "فشل الرفع" : "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteResult = async () => {
    if (!deleteResultId) return;
    
    try {
      await resultsApi.delete(deleteResultId);
      toast.success(isRtl ? "تم حذف النتيجة" : "Result deleted");
      fetchBooking(false); // Fetch in background
    } catch (error) {
      toast.error(isRtl ? "فشل الحذف" : "Delete failed");
    } finally {
      setDeleteResultId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-500">{isRtl ? "لم يتم العثور على الحجز" : "Booking not found"}</p>
        <Button onClick={() => router.back()} className="mt-4">
          {isRtl ? "عودة" : "Back"}
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500";
      case "CANCELLED": return "bg-red-500";
      case "CONFIRMED": return "bg-blue-500";
      default: return "bg-amber-500";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Top Bar / Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-all" 
            onClick={() => router.back()}
          >
            {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">
                Booking Reference
              </span>
              <span className="text-[10px] font-bold text-primary">#{appointment.id.split('-')[0]}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {isRtl ? "إدارة الحجز" : "Manage Appointment"}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm ${
            appointment.status === "COMPLETED" ? "bg-green-50 border-green-100 text-green-700" :
            appointment.status === "CANCELLED" ? "bg-red-50 border-red-100 text-red-700" :
            "bg-amber-50 border-amber-100 text-amber-700"
          }`}>
             <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${getStatusColor(appointment.status)}`} />
             <span className="text-xs font-black uppercase tracking-wider">{appointment.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Patient Profile (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-800 relative">
               <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="h-20 w-20 rounded-3xl bg-white p-1.5 shadow-lg">
                     <div className="h-full w-full rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-black">
                        {appointment.patient?.name?.[0]?.toUpperCase()}
                     </div>
                  </div>
               </div>
            </div>
            <CardContent className="pt-14 pb-8 px-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-slate-900">{appointment.patient?.name}</h3>
                <div className="flex items-center justify-center gap-1.5 text-slate-400 mt-1">
                   <ShieldCheck className="h-3.5 w-3.5" />
                   <span className="text-xs font-bold uppercase tracking-tighter">Verified Patient</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "رقم الهاتف" : "Phone Number"}</p>
                    <p className="text-sm font-bold text-slate-700">{appointment.patient?.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "الرقم الوطني" : "National ID"}</p>
                    <p className="text-sm font-bold text-slate-700">{appointment.patient?.nationalId || "N/A"}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "العنوان / الموقع" : "Address / Location"}</p>
                    <p className="text-sm font-bold text-slate-700">
                      {appointment.homeVisit ? (isRtl ? "زيارة منزلية" : "Home Visit") : (isRtl ? (appointment.branch?.nameAr || appointment.branch?.name) : (appointment.branch?.name || appointment.branch?.nameAr))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Status Control */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-slate-900 rounded-[2rem] overflow-hidden text-white">
            <CardContent className="p-8">
               <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6">{isRtl ? "تحديث الحالة" : "Control Panel"}</h4>
               <div className="space-y-3">
                  {[
                    { id: "PENDING", label: isRtl ? "قيد الانتظار" : "Pending", color: "amber" },
                    { id: "CONFIRMED", label: isRtl ? "تأكيد الحجز" : "Confirm Booking", color: "blue" },
                    { id: "COMPLETED", label: isRtl ? "اكتمل" : "Mark Completed", color: "green" },
                    { id: "CANCELLED", label: isRtl ? "إلغاء" : "Cancel Request", color: "red" },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleStatusUpdate(btn.id)}
                      className={`w-full h-12 rounded-2xl px-4 flex items-center justify-between font-bold text-sm transition-all ${
                        appointment.status === btn.id 
                          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]" 
                          : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`h-2 w-2 rounded-full ${
                           btn.color === "green" ? "bg-green-500" : 
                           btn.color === "red" ? "bg-red-500" : 
                           btn.color === "blue" ? "bg-blue-500" : "bg-amber-500"
                         }`} />
                         {btn.label}
                      </div>
                      {appointment.status === btn.id && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Tests & Details (8/12) */}
        <div className="lg:col-span-8 space-y-8">
           {/* Summary Stats Bar */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50 flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                    <Calendar className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? "التاريخ" : "Date"}</p>
                    <p className="text-sm font-black text-slate-900">{new Date(appointment.date).toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50 flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                    <Clock className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? "التوقيت" : "Time Slot"}</p>
                    <p className="text-sm font-black text-slate-900">{appointment.time || "TBD"}</p>
                 </div>
              </div>
              <div className="bg-primary p-6 rounded-[1.5rem] shadow-lg shadow-primary/20 flex items-center gap-4 text-white">
                 <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    <DollarSign className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{isRtl ? "الإجمالي" : "Total Price"}</p>
                    <p className="text-xl font-black">{appointment.totalPrice || 0} <span className="text-xs font-bold">{isRtl ? "د.أ" : "JOD"}</span></p>
                 </div>
              </div>
           </div>

           {/* Tests List */}
           <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
             <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                         <Activity className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900">{isRtl ? "الفحوصات المطلوبة" : "Tests Catalog"}</h4>
                   </div>
                   <div className="h-px flex-1 bg-slate-50 mx-6 hidden md:block" />
                   <span className="text-xs font-bold text-slate-400">{appointment.testItems?.length} {isRtl ? "فحوصات" : "Tests"}</span>
                </div>

                <div className="space-y-4">
                   {appointment.testItems?.map((item: any) => (
                     <div key={item.id} className="group p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                 <FileText className="h-7 w-7" />
                              </div>
                              <div>
                                 <h5 className="font-black text-slate-900 group-hover:text-primary transition-colors">
                                    {isRtl ? (item.test?.nameAr || item.test?.name) : (item.test?.name || item.test?.nameAr)}
                                 </h5>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded shadow-sm">
                                       Price: {item.test?.price || 0} JOD
                                    </span>
                                    <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
                                       <CheckCircle2 className="h-3 w-3" />
                                       Lab Ready
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex-shrink-0">
                              {(() => {
                                // Find if there's an existing result for this test in the patient's results
                                const existingResult = appointment.patient?.results?.find(
                                  (r: any) => r.testId === item.testId && r.status === "READY"
                                );

                                if (existingResult) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <a href={existingResult.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-12 px-4 rounded-[1.25rem] border-slate-200 text-primary font-black text-xs hover:bg-primary/5 transition-all shadow-sm gap-2"
                                        >
                                          <Eye className="h-4 w-4" />
                                          {isRtl ? "عرض" : "View"}
                                        </Button>
                                      </a>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => setDeleteResultId(existingResult.id)}
                                        className="h-12 w-12 p-0 rounded-[1.25rem] text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                }

                                if (uploadingTestId === item.testId) {
                                  return (
                                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-100 animate-in fade-in zoom-in duration-300">
                                       <Input
                                         type="file"
                                         accept=".pdf"
                                         onChange={(e) => setFile(e.target.files?.[0] || null)}
                                         className="h-10 text-xs bg-slate-50 border-0 rounded-xl w-full md:w-48"
                                       />
                                       <Button 
                                         size="sm" 
                                         disabled={!file || uploadLoading} 
                                         onClick={() => handleUploadSubmit(item.testId)}
                                         className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black font-bold"
                                       >
                                         {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRtl ? "رفع" : "Upload")}
                                       </Button>
                                       <Button variant="ghost" size="icon" onClick={() => setUploadingTestId(null)} className="h-10 w-10 text-slate-400 hover:text-red-500">
                                         <X className="h-5 w-5" />
                                       </Button>
                                    </div>
                                  );
                                }

                                return (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setUploadingTestId(item.testId)}
                                    className="h-12 px-6 rounded-[1.25rem] border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isRtl ? "إرفاق النتيجة" : "Attach Result"}
                                  </Button>
                                );
                              })()}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>

           {/* Location Extra Info */}
           <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary">
                    <MapPin className="h-7 w-7" />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900">{isRtl ? "تفاصيل الفرع" : "Branch Location"}</h4>
                    <p className="text-sm text-slate-500 font-medium">{appointment.branch?.mapUrl ? (isRtl ? "يتوفر رابط الموقع الجغرافي" : "GPS Link Available") : (isRtl ? "العنوان مسجل في الملف" : "Address on file")}</p>
                 </div>
              </div>
              {appointment.branch?.mapUrl && (
                <a 
                  href={appointment.branch.mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 text-xs font-black text-slate-700 hover:bg-slate-900 hover:text-white transition-all"
                >
                   {isRtl ? "فتح الخريطة" : "Open Google Maps"}
                   <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
           </div>
        </div>
      </div>

      {/* Delete Result Confirmation Modal */}
      {deleteResultId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
                {isRtl ? "حذف نتيجة الفحص" : "Delete Test Result"}
              </h3>
              <p className="text-center text-slate-500 mb-6 font-medium">
                {isRtl 
                  ? "هل أنت متأكد من حذف هذا الملف؟ لن يتمكن المريض من رؤية النتيجة حتى يتم رفع ملف جديد." 
                  : "Are you sure you want to delete this file? The patient won't be able to see the result until a new file is uploaded."}
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:flex-1 h-12 rounded-xl font-bold"
                  onClick={() => setDeleteResultId(null)}
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full sm:flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteResult}
                >
                  {isRtl ? "نعم، احذف الملف" : "Yes, Delete File"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
