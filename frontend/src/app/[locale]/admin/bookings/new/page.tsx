"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Home,
  Building2,
  ChevronRight,
  ChevronLeft,
  Users,
  User,
  Phone,
  CreditCard,
  Plus,
  ArrowLeftCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, appointmentsApi, patientsApi, testsApi, branchesApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { CustomTimePicker } from "@/components/ui/custom-time-picker";

export default function AdminNewBookingPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Data State
  const [patients, setPatients] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  
  // Search States
  const [patientSearch, setPatientSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  
  // Selection State
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    email: "",
    gender: "MALE",
    birthDate: ""
  });

  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [bookingType, setBookingType] = useState<"BRANCH" | "HOME">("BRANCH");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, testsData, branchesData] = await Promise.all([
          patientsApi.getAll(),
          testsApi.getAll(),
          branchesApi.getAll()
        ]);
        setPatients(patientsData);
        setTests(testsData);
        setBranches(branchesData);

        // Auto-select patient if ID is provided in query
        if (patientIdFromQuery) {
          const patient = patientsData.find((p: any) => p.id === patientIdFromQuery);
          if (patient) {
            setSelectedPatient(patient);
            setStep(2); // Jump to test selection
          }
        }
      } catch (error) {
        toast.error(isRtl ? "فشل تحميل البيانات" : "Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [isRtl, patientIdFromQuery]);

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone?.includes(patientSearch) ||
    p.nationalId?.includes(patientSearch)
  );

  const filteredTests = tests.filter(test => 
    (isRtl ? (test.nameAr || test.name) : test.name).toLowerCase().includes(testSearch.toLowerCase())
  );

  const toggleTest = (test: any) => {
    if (selectedTests.find(t => t.id === test.id)) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const totalPrice = selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);

  const handleBooking = async () => {
    if (!isNewPatient && !selectedPatient) {
      toast.error(isRtl ? "يرجى اختيار مريض" : "Please select a patient");
      setStep(1);
      return;
    }
    if (isNewPatient && (!newPatientData.name || !newPatientData.phone)) {
      toast.error(isRtl ? "يرجى إكمال بيانات المريض الجديد" : "Please complete new patient details");
      setStep(1);
      return;
    }
    if (!date || !time) {
      toast.error(isRtl ? "يرجى اختيار الموعد والوقت" : "Please select date and time");
      return;
    }

    setLoading(true);
    try {
      let patientId = selectedPatient?.id;

      // Create patient first if it's a new patient
      if (isNewPatient) {
        const createdPatient = await patientsApi.create(newPatientData);
        patientId = createdPatient.id;
      }

      await appointmentsApi.create({
        patientId,
        testIds: selectedTests.map(t => t.id),
        branchId: bookingType === "BRANCH" ? selectedBranchId : null,
        date,
        time,
        homeVisit: bookingType === "HOME",
        address: bookingType === "HOME" ? address : null,
      });
      
      toast.success(isRtl ? "تم الحجز بنجاح" : "Booking confirmed successfully!");
      setStep(5); 
    } catch (error) {
      toast.error(isRtl ? "فشل الحجز، يرجى المحاولة لاحقاً" : "Booking failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const BackButton = () => (
    <button 
      onClick={() => router.push(`/${locale}/admin/bookings`)}
      className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest mb-4 group"
    >
      {isRtl ? <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /> : <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />}
      {isRtl ? "العودة للمواعيد" : "Back to Bookings"}
    </button>
  );

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <AnimatePresence mode="wait">
        {step < 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BackButton />
            <div className="mb-10 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {isRtl ? "إنشاء حجز جديد (أدمن)" : "Create New Booking (Admin)"}
                </h1>
              </div>
              <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
                {isRtl ? "قم بإنشاء حجز لمريض مسجل أو جديد" : "Create a booking for a registered or new patient"}
              </p>
            </div>

            {/* Steps Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-between gap-4 max-w-3xl">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black transition-all ${
                      step === s ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : 
                      step > s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                    </div>
                    {s < 4 && <div className={`flex-1 h-1.5 rounded-full ${step > s ? "bg-primary" : "bg-slate-100"}`} />}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 1: SELECT PATIENT */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative group flex-1 w-full">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/10 transition-all duration-500" />
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    className="h-16 pl-14 rounded-2xl border-white bg-white shadow-sm font-bold text-lg focus:ring-primary focus:border-primary transition-all"
                    placeholder={isRtl ? "ابحث عن مريض مسجل..." : "Search registered patient..."}
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      if (isNewPatient) setIsNewPatient(false);
                    }}
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setIsNewPatient(!isNewPatient);
                  setSelectedPatient(null);
                }}
                variant={isNewPatient ? "default" : "outline"}
                className={`h-16 px-8 rounded-2xl font-black gap-3 transition-all ${isNewPatient ? "shadow-xl shadow-primary/30" : "bg-white border-white shadow-sm hover:border-primary/20"}`}
              >
                <Plus className="h-5 w-5" />
                {isRtl ? "مريض جديد" : "New Patient"}
              </Button>
            </div>

            {isNewPatient ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 pb-32 rounded-[40px] border border-slate-100 shadow-sm relative"
              >
                <div className="col-span-full mb-2 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{isRtl ? "بيانات المريض الجديد" : "New Patient Details"}</h3>
                    <p className="text-sm font-bold text-slate-400">{isRtl ? "يرجى إدخال البيانات الأساسية لفتح ملف مريض جديد" : "Please enter basic details to create a new patient profile"}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsNewPatient(false)}
                    className="text-primary font-black text-xs uppercase tracking-widest gap-2 hover:bg-primary/5 rounded-xl"
                  >
                    <ArrowLeftCircle className="h-4 w-4" />
                    {isRtl ? "العودة للبحث" : "Back to Search"}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "الاسم الكامل" : "Full Name"}</label>
                  <Input 
                    className="h-14 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all font-bold"
                    value={newPatientData.name}
                    onChange={(e) => setNewPatientData({...newPatientData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
                  <Input 
                    className="h-14 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all font-bold"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData({...newPatientData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "الرقم الوطني" : "National ID"}</label>
                  <Input 
                    className="h-14 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all font-bold"
                    value={newPatientData.nationalId}
                    onChange={(e) => setNewPatientData({...newPatientData, nationalId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "تاريخ الميلاد" : "Birth Date"}</label>
                  <CustomDatePicker 
                    value={newPatientData.birthDate}
                    onChange={(val) => setNewPatientData({...newPatientData, birthDate: val})}
                    isRtl={isRtl}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "الجنس" : "Gender"}</label>
                  <select 
                    className="w-full h-14 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all font-bold px-4 outline-none appearance-none"
                    value={newPatientData.gender}
                    onChange={(e) => setNewPatientData({...newPatientData, gender: e.target.value})}
                  >
                    <option value="MALE">{isRtl ? "ذكر" : "Male"}</option>
                    <option value="FEMALE">{isRtl ? "أنثى" : "Female"}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}</label>
                  <Input 
                    type="email"
                    className="h-14 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all font-bold"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData({...newPatientData, email: e.target.value})}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.slice(0, 10).map((patient) => (
                  <Card 
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsNewPatient(false);
                    }}
                    className={`cursor-pointer border-2 transition-all duration-300 rounded-[28px] overflow-hidden group/card ${
                      selectedPatient?.id === patient.id ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-white bg-white hover:border-slate-100 shadow-sm"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${selectedPatient?.id === patient.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover/card:bg-primary/10 group-hover/card:text-primary"}`}>
                          <User className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-slate-900 text-lg leading-tight">{patient.name}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Phone className="h-3 w-3" /> {patient.phone}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <CreditCard className="h-3 w-3" /> {patient.nationalId || "---"}
                            </div>
                          </div>
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Selection Footer - At the end of content */}
            <div className="mt-12 mb-8 p-8 bg-white rounded-[40px] border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex justify-end">
               <Button 
                disabled={
                  (!isNewPatient && !selectedPatient) || 
                  (isNewPatient && (!newPatientData.name || !newPatientData.phone || !newPatientData.nationalId || !newPatientData.birthDate))
                }
                onClick={nextStep}
                className="h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isRtl ? "المتابعة لاختيار الفحوصات" : "Continue to Tests"}
                 {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
               </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SELECT TESTS */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/10 transition-all duration-500" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  className="h-16 pl-14 rounded-2xl border-white bg-white shadow-sm font-bold text-lg focus:ring-primary focus:border-primary transition-all"
                  placeholder={isRtl ? "ابحث عن الفحص (مثلاً: فيتامين د، CBC)..." : "Search for a test (e.g. CBC, Vitamin D)..."}
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => {
                const isSelected = selectedTests.find(t => t.id === test.id);
                return (
                  <Card 
                    key={test.id} 
                    onClick={() => toggleTest(test)}
                    className={`cursor-pointer border-2 transition-all duration-300 rounded-[32px] overflow-hidden group/card ${
                      isSelected ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-white bg-white hover:border-slate-100 shadow-sm"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover/card:bg-primary/10 group-hover/card:text-primary"}`}>
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p className={`font-black text-lg ${isSelected ? "text-primary" : "text-slate-900"}`}>{test.price} JOD</p>
                      </div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight group-hover/card:text-primary transition-colors">
                        {isRtl ? (test.nameAr || test.name) : (test.name || test.nameAr)}
                      </h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Certified Medical Test</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Selection Footer - At the end of content */}
            <div className="mt-12 mb-8 p-8 bg-white rounded-[40px] border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-slate-900/20">
                    {selectedTests.length}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isRtl ? "المجموع التقديري" : "Estimated Total"}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">{totalPrice}</span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isRtl ? "دينار" : "JOD"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button 
                    variant="ghost"
                    onClick={prevStep}
                    className="flex-1 md:flex-none h-16 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                  >
                    {isRtl ? "رجوع" : "Back"}
                  </Button>
                  <Button 
                    disabled={selectedTests.length === 0}
                    onClick={nextStep}
                    className="flex-1 md:flex-none h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 shadow-xl shadow-primary/30"
                  >
                    {isRtl ? "المتابعة" : "Continue"}
                    {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SELECT VISIT TYPE & BRANCH */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card 
                onClick={() => setBookingType("BRANCH")}
                className={`cursor-pointer border-2 p-10 rounded-[40px] transition-all duration-300 group/type ${bookingType === "BRANCH" ? "border-primary bg-primary/5 shadow-xl" : "border-white bg-white hover:border-slate-100 shadow-sm"}`}
               >
                 <div className={`h-20 w-20 rounded-[24px] flex items-center justify-center mb-6 transition-all ${bookingType === "BRANCH" ? "bg-primary text-white shadow-2xl shadow-primary/40" : "bg-slate-50 text-slate-400 group-hover/type:bg-primary/10 group-hover/type:text-primary"}`}>
                   <Building2 className="h-10 w-10" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900">{isRtl ? "زيارة الفرع" : "Lab Visit"}</h3>
                 <p className="text-slate-500 font-bold mt-3 leading-relaxed">{isRtl ? "زيارة أحد فروعنا الرسمية" : "Visit one of our official lab branches"}</p>
               </Card>

               <Card 
                onClick={() => setBookingType("HOME")}
                className={`cursor-pointer border-2 p-10 rounded-[40px] transition-all duration-300 group/type ${bookingType === "HOME" ? "border-primary bg-primary/5 shadow-xl" : "border-white bg-white hover:border-slate-100 shadow-sm"}`}
               >
                 <div className={`h-20 w-20 rounded-[24px] flex items-center justify-center mb-6 transition-all ${bookingType === "HOME" ? "bg-primary text-white shadow-2xl shadow-primary/40" : "bg-slate-50 text-slate-400 group-hover/type:bg-primary/10 group-hover/type:text-primary"}`}>
                   <Home className="h-10 w-10" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900">{isRtl ? "زيارة منزلية" : "Home Visit"}</h3>
                 <p className="text-slate-500 font-bold mt-3 leading-relaxed">{isRtl ? "زيارة منزلية لسحب العينة" : "Professional home sample collection"}</p>
               </Card>
            </div>

            {bookingType === "BRANCH" ? (
              <div className="space-y-6 pt-6">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{isRtl ? "اختر فرع المختبر" : "Select Laboratory Branch"}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branches.map((branch) => (
                    <div 
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`p-6 rounded-[28px] border-2 cursor-pointer transition-all ${selectedBranchId === branch.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-white bg-white hover:border-slate-100 shadow-sm"}`}
                    >
                      <p className="font-black text-slate-900 text-lg">{isRtl ? (branch.nameAr || branch.name) : (branch.name || branch.nameAr)}</p>
                      <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {isRtl ? (branch.addressAr || branch.address) : branch.address}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-6">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{isRtl ? "عنوان السكن بالتفصيل" : "Home Address Details"}</label>
                <textarea 
                  className="w-full h-40 p-6 rounded-[32px] border-2 border-white bg-white shadow-sm font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                  placeholder={isRtl ? "يرجى كتابة العنوان بالتفصيل..." : "Please enter detailed address..."}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            )}

            {/* Selection Footer - At the end of content */}
            <div className="mt-12 mb-8 p-8 bg-white rounded-[40px] border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex justify-between items-center">
               <Button variant="ghost" onClick={prevStep} className="h-16 px-10 rounded-2xl font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs">
                  {isRtl ? "رجوع" : "Back"}
               </Button>
               <Button 
                disabled={bookingType === "BRANCH" ? !selectedBranchId : !address}
                onClick={nextStep}
                className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30"
               >
                 {isRtl ? "الاستمرار" : "Continue"}
               </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: DATE/TIME & SUMMARY */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <CalendarIcon className="h-4 w-4 text-primary" /> {isRtl ? "تاريخ الموعد" : "Appointment Date"}
                    </label>
                    <CustomDatePicker 
                      value={date}
                      onChange={(val) => setDate(val)}
                      isRtl={isRtl}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Clock className="h-4 w-4 text-primary" /> {isRtl ? "الوقت المفضل" : "Preferred Time"}
                    </label>
                    <CustomTimePicker 
                      value={time}
                      onChange={(val) => setTime(val)}
                      isRtl={isRtl}
                    />
                  </div>

                  {/* Selected Patient Mini Summary */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{isRtl ? "المريض المختار" : "Selected Patient"}</p>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{isNewPatient ? newPatientData.name : selectedPatient?.name}</p>
                        <p className="text-xs font-bold text-slate-500">{isNewPatient ? newPatientData.phone : selectedPatient?.phone}</p>
                      </div>
                    </div>
                  </div>
               </div>

               <Card className="border-0 bg-slate-900 text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                       </div>
                       {isRtl ? "ملخص الحجز" : "Booking Summary"}
                    </h3>
                    <div className="space-y-5">
                       <div className="flex justify-between border-b border-white/10 pb-5">
                          <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{isRtl ? "عدد الفحوصات" : "Selected Tests"}</span>
                          <span className="font-black text-xl">{selectedTests.length}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/10 pb-5">
                          <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{isRtl ? "نوع الزيارة" : "Visit Type"}</span>
                          <span className="font-black text-xl">{bookingType === "HOME" ? (isRtl ? "منزلية" : "Home") : (isRtl ? "في المختبر" : "Laboratory")}</span>
                       </div>
                    </div>
                  </div>
                  <div className="relative z-10 pt-10">
                     <p className="text-[11px] text-primary font-black uppercase tracking-[0.3em] mb-1">Total Estimated Cost</p>
                     <p className="text-6xl font-black">{totalPrice} <span className="text-2xl text-slate-500 font-bold">JOD</span></p>
                  </div>
               </Card>
            </div>

            {/* Selection Footer - At the end of content */}
            <div className="mt-12 mb-8 p-8 bg-white rounded-[40px] border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex justify-between items-center">
               <Button variant="ghost" onClick={prevStep} className="h-16 px-10 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs">
                  {isRtl ? "رجوع" : "Back"}
               </Button>
               <Button 
                loading={loading}
                onClick={handleBooking}
                className="h-16 px-16 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-200"
               >
                 {isRtl ? "تأكيد الحجز النهائي" : "Confirm Booking"}
                 <ArrowRight className="h-5 w-5" />
               </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 5 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 space-y-8"
          >
            <div className="h-32 w-32 bg-emerald-50 text-emerald-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-50 transform rotate-12">
               <CheckCircle2 className="h-16 w-16" />
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
               {isRtl ? "تم استلام حجزك!" : "Booking Received!"}
            </h2>
            <p className="text-slate-500 font-bold text-xl max-w-lg mx-auto leading-relaxed">
               {isRtl ? "لقد تم إرسال حجزك بنجاح. سنقوم بمراجعة الطلب وتأكيده قريباً." : "Your request has been sent successfully. Our team will review and confirm your appointment shortly."}
            </p>
            <div className="pt-12">
               <Button onClick={() => router.push(`/${locale}/admin/bookings`)} className="h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                  {isRtl ? "العودة لقائمة المواعيد" : "Back to Appointments"}
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
