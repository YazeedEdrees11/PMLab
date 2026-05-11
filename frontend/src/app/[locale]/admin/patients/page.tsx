"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  User, 
  Phone, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Mail,
  Lock,
  MapPin,
  Filter,
  ArrowUpRight,
  UserPlus,
  Activity,
  History
} from "lucide-react";
import { apiFetch, authApi, patientsApi } from "@/lib/api";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  createdAt: string;
  user?: {
    email: string;
    avatarUrl: string | null;
  };
  _count?: {
    appointments: number;
  };
}

export default function PatientsListPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Add Patient State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newPatient, setNewPatient] = useState({ email: "", password: "", name: "", phone: "", nationalId: "", address: "", gender: "MALE", birthDate: "" });

  // Delete Patient State
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  // Statistics
  const stats = {
    total: patients.length,
    newToday: patients.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length,
    withAppointments: patients.filter(p => (p._count?.appointments || 0) > 0).length,
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await apiFetch("/patients");
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.nationalId?.includes(search)
  );

  const handleAddPatient = async () => {
    if (!newPatient.email || !newPatient.password || !newPatient.name) {
      toast.error(isRtl ? "الرجاء تعبئة جميع الحقول الإلزامية" : "Please fill in all required fields");
      return;
    }
    
    setAddLoading(true);
    try {
      await authApi.register(newPatient);
      toast.success(isRtl ? "تم إضافة المريض بنجاح" : "Patient added successfully");
      setShowAddModal(false);
      setNewPatient({ email: "", password: "", name: "", phone: "", nationalId: "", address: "", gender: "MALE", birthDate: "" });
      const data = await apiFetch("/patients");
      setPatients(data);
    } catch (error: any) {
      console.error("Error adding patient:", error);
      toast.error(error?.message || (isRtl ? "حدث خطأ أثناء الإضافة" : "Error adding patient"));
    } finally {
      setAddLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletePatientId) return;
    try {
      await patientsApi.delete(deletePatientId);
      toast.success(isRtl ? "تم حذف المريض بنجاح" : "Patient deleted successfully");
      const data = await apiFetch("/patients");
      setPatients(data);
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error(isRtl ? "فشل حذف المريض" : "Failed to delete patient");
    } finally {
      setDeletePatientId(null);
    }
  };

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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? "إدارة المرضى" : "Patients Management"}</h1>
          </div>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
            {isRtl ? "عرض وإدارة سجلات المرضى والملفات الشخصية" : "View and manage patient records and profiles"}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
            <Input 
              placeholder={isRtl ? "بحث بالاسم، الهاتف..." : "Search by name, phone..."} 
              className={`h-11 bg-white border-slate-200 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="h-11 px-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform shrink-0"
          >
            <Plus className={`h-5 w-5 ${isRtl ? "ml-1" : "mr-1"}`} />
            <span className="hidden sm:inline">{isRtl ? "إضافة مريض" : "Add Patient"}</span>
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-white rounded-3xl shadow-sm border-b-4 border-primary relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Users className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{isRtl ? "إجمالي المرضى" : "Total Patients"}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
                <span className="text-emerald-500 text-xs font-bold flex items-center">
                  <ArrowUpRight className="h-3 w-3" /> +12%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-3xl shadow-sm border-b-4 border-emerald-500 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <UserPlus className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{isRtl ? "مرضى جدد (اليوم)" : "New Patients (Today)"}</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.newToday}</h3>
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
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{isRtl ? "مرضى نشطون" : "Active Patients"}</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.withAppointments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="border-0 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border-s-4 border-transparent hover:border-primary">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center gap-6 p-8">
                  {/* Patient Avatar/Initial */}
                  <div className="relative group/avatar">
                    <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 text-2xl font-black uppercase overflow-hidden shrink-0 shadow-inner">
                      {patient.user?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={patient.user.avatarUrl} alt={patient.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        patient.name?.[0] || "P"
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {/* Patient Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h3 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-primary transition-colors">
                        {patient.name || "Unknown Patient"}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        ID: {patient.nationalId?.slice(-4) || "0000"}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm font-bold">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100/50">
                        <Phone className="h-4 w-4 text-primary/60" />
                        {patient.phone || "---"}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100/50">
                        <CreditCard className="h-4 w-4 text-primary/60" />
                        {patient.nationalId || "---"}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100/50">
                        <History className="h-4 w-4 text-primary/60" />
                        {isRtl ? "منذ: " : "Since: "} {new Date(patient.createdAt).toLocaleDateString(locale)}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex flex-row md:flex-row items-center gap-6 md:ps-8 md:border-s border-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRtl ? "الحجوزات" : "Bookings"}</p>
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/5 text-primary text-xl font-black">
                        {patient._count?.appointments || 0}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link href={`/${locale}/admin/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="h-12 w-12 p-0 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm">
                          <ChevronIcon className="h-6 w-6" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          setDeletePatientId(patient.id);
                        }}
                        className="h-12 w-12 p-0 rounded-2xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-100">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{isRtl ? "لم يتم العثور على مرضى" : "No patients found"}</h3>
            <p className="text-slate-400 font-medium">{isRtl ? "حاول تغيير كلمة البحث أو إضافة مريض جديد" : "Try changing the search term or add a new patient"}</p>
          </div>
        )}
      </div>


      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {isRtl ? "إضافة مريض جديد" : "Add New Patient"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-8 w-8 p-0 rounded-full">
                <X className="h-5 w-5 text-slate-400" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "الاسم الكامل" : "Full Name"} *</label>
                  <Input 
                    value={newPatient.name} 
                    onChange={e => setNewPatient({...newPatient, name: e.target.value})} 
                    placeholder={isRtl ? "أحمد محمد..." : "Ahmad Mohammad..."}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "الرقم الوطني" : "National ID"}</label>
                  <Input 
                    value={newPatient.nationalId} 
                    onChange={e => setNewPatient({...newPatient, nationalId: e.target.value})} 
                    placeholder="2000..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
                  <Input 
                    value={newPatient.phone} 
                    onChange={e => setNewPatient({...newPatient, phone: e.target.value})} 
                    placeholder="079..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "العنوان" : "Address"}</label>
                  <Input 
                    value={newPatient.address} 
                    onChange={e => setNewPatient({...newPatient, address: e.target.value})} 
                    placeholder={isRtl ? "عمان، الأردن..." : "Amman, Jordan..."}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "الجنس" : "Gender"}</label>
                  <select 
                    value={newPatient.gender}
                    onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="MALE">{isRtl ? "ذكر" : "Male"}</option>
                    <option value="FEMALE">{isRtl ? "أنثى" : "Female"}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{isRtl ? "تاريخ الميلاد" : "Birth Date"}</label>
                  <Input 
                    type="date"
                    value={newPatient.birthDate} 
                    onChange={e => setNewPatient({...newPatient, birthDate: e.target.value})} 
                    className="h-10"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-500">{isRtl ? "معلومات الحساب" : "Account Information"}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{isRtl ? "البريد الإلكتروني" : "Email"} *</label>
                    <Input 
                      type="email"
                      value={newPatient.email} 
                      onChange={e => setNewPatient({...newPatient, email: e.target.value})} 
                      placeholder="patient@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{isRtl ? "كلمة المرور" : "Password"} *</label>
                    <Input 
                      type="password"
                      value={newPatient.password} 
                      onChange={e => setNewPatient({...newPatient, password: e.target.value})} 
                      placeholder="********"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold">
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleAddPatient} disabled={addLoading} className="rounded-xl font-bold px-8">
                {addLoading && <Loader2 className={`h-4 w-4 animate-spin ${isRtl ? "ml-2" : "mr-2"}`} />}
                {isRtl ? "حفظ المريض" : "Save Patient"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
                {isRtl ? "تأكيد الحذف" : "Confirm Deletion"}
              </h3>
              <p className="text-center text-slate-500 mb-6">
                {isRtl 
                  ? "هل أنت متأكد من رغبتك في حذف هذا المريض وكل ما يتعلق به نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
                  : "Are you sure you want to permanently delete this patient and all related records? This action cannot be undone."}
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:flex-1 h-12 rounded-xl font-bold"
                  onClick={() => setDeletePatientId(null)}
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full sm:flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                >
                  {isRtl ? "نعم، احذف" : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
