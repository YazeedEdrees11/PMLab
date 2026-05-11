"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  CreditCard, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  DollarSign,
  Activity,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  Plus
} from "lucide-react";
import { apiFetch, patientsApi } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  address: string;
  createdAt: string;
  appointments: any[];
  results: any[];
  gender?: string;
  birthDate?: string;
  user?: {
    email: string;
    avatarUrl: string | null;
  };
}

export default function PatientProfilePage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { id } = useParams();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "", nationalId: "", address: "", gender: "MALE", birthDate: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch(`/patients/${id}`);
        setPatient(data);
        setEditData({
          name: data.name || "",
          phone: data.phone || "",
          nationalId: data.nationalId || "",
          address: data.address || "",
          gender: data.gender || "MALE",
          birthDate: data.birthDate || "",
        });
      } catch (error) {
        console.error("Error fetching patient profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleEditSubmit = async () => {
    setEditLoading(true);
    try {
      await patientsApi.update(id as string, editData);
      toast.success(isRtl ? "تم تحديث الملف بنجاح" : "Profile updated successfully");
      
      // Update local state
      setPatient(prev => prev ? { ...prev, ...editData } : null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error(isRtl ? "فشل تحديث الملف" : "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) return <div className="text-center py-20">{isRtl ? "المريض غير موجود" : "Patient not found"}</div>;

  const totalSpent = patient.appointments.reduce((acc, apt) => acc + (apt.totalPrice || 0), 0);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4">
        <Link href={`/${locale}/admin/patients`}>
          <Button variant="ghost" className="w-fit text-slate-500 font-bold gap-2 hover:bg-white hover:text-primary transition-colors">
            <BackIcon className="h-4 w-4" />
            {isRtl ? "العودة لقائمة المرضى" : "Back to Patients List"}
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-primary/20 overflow-hidden">
              {patient.user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={patient.user.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                patient.name?.[0] || "P"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
                <h1 className="text-3xl font-black text-slate-900">{patient.name}</h1>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 font-bold">
                  {isRtl ? "مريض مسجل" : "Registered Patient"}
                </Badge>
                <span className="text-slate-400 text-sm font-medium">
                  {isRtl ? "انضم في" : "Joined"} {new Date(patient.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Link href={`/${locale}/admin/bookings/new?patientId=${patient.id}`}>
               <Button 
                 className="h-12 px-6 rounded-xl font-bold bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200/50 hover:scale-[1.02] transition-all gap-2"
               >
                 <Plus className="h-5 w-5" />
                 {isRtl ? "حجز فحص جديد" : "Book New Test"}
               </Button>
             </Link>
             <Button 
               onClick={() => setShowEditModal(true)}
               variant="outline"
               className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
             >
               {isRtl ? "تعديل الملف" : "Edit Profile"}
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Stats */}
        <div className="lg:col-span-1 space-y-8">
          {/* Contact Info Card */}
          <Card className="border-0 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-0 border-b-0">
              <CardTitle className="text-lg font-black text-slate-900">{isRtl ? "المعلومات الشخصية" : "Personal Information"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "رقم الهاتف" : "Phone Number"}</p>
                  <p className="text-slate-900 font-bold">{patient.phone || "---"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "الرقم الوطني" : "National ID"}</p>
                  <p className="text-slate-900 font-bold">{patient.nationalId || "---"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "العنوان" : "Address"}</p>
                  <p className="text-slate-900 font-bold">{patient.address || "---"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "الجنس" : "Gender"}</p>
                  <p className="text-slate-900 font-bold">{patient.gender === "FEMALE" ? (isRtl ? "أنثى" : "Female") : (isRtl ? "ذكر" : "Male")}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "تاريخ الميلاد" : "Birth Date"}</p>
                  <p className="text-slate-900 font-bold">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString(locale) : "---"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Stats Card */}
          <Card className="border-0 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 relative overflow-hidden group">
            <DollarSign className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform" />
            <CardContent className="p-8 relative z-10">
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">{isRtl ? "إجمالي الإنفاق" : "Total Spent"}</p>
              <h2 className="text-4xl font-black mt-2 flex items-baseline gap-2">
                {totalSpent.toLocaleString()} 
                <span className="text-lg font-bold text-slate-500">{isRtl ? "د.أ" : "JOD"}</span>
              </h2>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">{isRtl ? "عدد الحجوزات" : "Bookings"}</p>
                  <p className="text-xl font-black text-white">{patient.appointments.length}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">{isRtl ? "الفحوصات" : "Tests"}</p>
                  <p className="text-xl font-black text-white">{patient.results.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Appointments */}
          <Card className="border-0 bg-white rounded-2xl shadow-sm">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                {isRtl ? "سجل المواعيد" : "Appointment History"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {patient.appointments.length > 0 ? (
                  patient.appointments.map((apt: any) => (
                    <Link key={apt.id} href={`/${locale}/admin/bookings/${apt.id}`} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors group">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-slate-900">{new Date(apt.date).toLocaleDateString(locale)}</p>
                          <Badge className={`${
                            apt.status === 'COMPLETED' ? 'bg-green-500' : 
                            apt.status === 'CANCELLED' ? 'bg-red-500' : 'bg-amber-500'
                          } text-white border-0`}>
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{apt.branch?.nameAr || apt.branch?.name || "Global"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">{apt.totalPrice} <span className="text-xs font-bold text-slate-400">{isRtl ? "د.أ" : "JOD"}</span></p>
                      </div>
                      <ChevronIcon className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors ml-4" />
                    </Link>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 font-medium">{isRtl ? "لا توجد حجوزات سابقة" : "No previous appointments"}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card className="border-0 bg-white rounded-2xl shadow-sm">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-500" />
                {isRtl ? "سجل النتائج" : "Results History"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {patient.results.length > 0 ? (
                  patient.results.map((result: any) => (
                    <div key={result.id} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors group">
                      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{result.test?.nameAr || result.test?.name}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                          {new Date(result.createdAt).toLocaleDateString(locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 font-bold">
                          {result.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-9 text-primary font-bold hover:bg-primary/10">
                          {isRtl ? "تحميل PDF" : "Download PDF"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 font-medium">{isRtl ? "لا توجد نتائج مسجلة" : "No recorded results"}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {isRtl ? "تعديل ملف المريض" : "Edit Patient Profile"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)} className="h-8 w-8 p-0 rounded-full">
                <X className="h-5 w-5 text-slate-400" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{isRtl ? "الاسم الكامل" : "Full Name"}</label>
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                  <Input 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})} 
                    className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
                <div className="relative">
                  <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                  <Input 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})} 
                    className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{isRtl ? "الرقم الوطني" : "National ID"}</label>
                <div className="relative">
                  <CreditCard className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                  <Input 
                    value={editData.nationalId} 
                    onChange={e => setEditData({...editData, nationalId: e.target.value})} 
                    className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{isRtl ? "العنوان" : "Address"}</label>
                <div className="relative">
                  <MapPin className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                  <Input 
                    value={editData.address} 
                    onChange={e => setEditData({...editData, address: e.target.value})} 
                    className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "الجنس" : "Gender"}</label>
                  <select 
                    value={editData.gender}
                    onChange={e => setEditData({...editData, gender: e.target.value})}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="MALE">{isRtl ? "ذكر" : "Male"}</option>
                    <option value="FEMALE">{isRtl ? "أنثى" : "Female"}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "تاريخ الميلاد" : "Birth Date"}</label>
                  <Input 
                    type="date"
                    value={editData.birthDate?.split('T')[0]} 
                    onChange={e => setEditData({...editData, birthDate: e.target.value})} 
                    className="h-11 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="rounded-xl font-bold h-11 px-6">
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleEditSubmit} disabled={editLoading} className="rounded-xl font-bold h-11 px-8">
                {editLoading ? (
                  <Loader2 className={`h-4 w-4 animate-spin ${isRtl ? "ml-2" : "mr-2"}`} />
                ) : (
                  <Save className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                )}
                {isRtl ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
