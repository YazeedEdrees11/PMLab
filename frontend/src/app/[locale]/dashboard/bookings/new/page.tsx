"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
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
  ArrowLeftCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, appointmentsApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { CustomTimePicker } from "@/components/ui/custom-time-picker";

export default function NewBookingPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selection State
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [bookingType, setBookingType] = useState<"BRANCH" | "HOME">("BRANCH");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>("self");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, branchesData, familyData] = await Promise.all([
          apiFetch("/tests"),
          apiFetch("/branches"),
          apiFetch("/family").catch(() => []) // Optional: might fail if not patient
        ]);
        setTests(testsData);
        setBranches(branchesData);
        setFamilyMembers(familyData);
      } catch (error) {
        toast.error(isRtl ? "فشل تحميل البيانات" : "Failed to load data");
      }
    };
    fetchData();
  }, [isRtl]);

  const filteredTests = tests.filter(test => 
    (isRtl ? (test.nameAr || test.name) : test.name).toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!date || !time) {
      toast.error(isRtl ? "يرجى اختيار الموعد والوقت" : "Please select date and time");
      return;
    }

    const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('pmlab_user') || '{}') : null;

    setLoading(true);
    try {
      await appointmentsApi.create({
        patientId: userData?.patient?.id,
        familyMemberId: selectedFamilyMemberId === "self" ? null : selectedFamilyMemberId,
        testIds: selectedTests.map(t => t.id),
        branchId: bookingType === "BRANCH" ? selectedBranchId : null,
        date,
        time,
        homeVisit: bookingType === "HOME",
        address: bookingType === "HOME" ? address : null,
      });
      
      toast.success(isRtl ? "تم الحجز بنجاح" : "Booking confirmed successfully!");
      setStep(4); 
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
      onClick={() => router.push(`/${locale}/dashboard/bookings`)}
      className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest mb-4 group"
    >
      {isRtl ? <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /> : <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />}
      {isRtl ? "العودة للمواعيد" : "Back to Bookings"}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <AnimatePresence mode="wait">
        {step < 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BackButton />
            <div className="mb-10 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {isRtl ? "حجز فحص جديد" : "Book New Medical Test"}
                </h1>
              </div>
              <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
                {isRtl ? "عملية حجز سريعة وبسيطة في خطوات معدودة" : "Fast and simple booking process in just a few steps"}
              </p>
              <div className="flex items-center gap-4 mt-8 max-w-xs">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${
                      step >= s ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-400"
                    }`}>
                      {s}
                    </div>
                    {s < 3 && <div className={`flex-1 h-1.5 rounded-full ${step > s ? "bg-primary" : "bg-slate-100"}`} />}
                  </div>
                ))}
              </div>

              {/* Family Selection */}
              {familyMembers.length > 0 && step < 4 && (
                <div className="mt-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-2">
                    {isRtl ? "لمن هذا الحجز؟" : "Who is this booking for?"}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setSelectedFamilyMemberId("self")}
                      className={cn(
                        "px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2",
                        selectedFamilyMemberId === "self" 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-white text-slate-600 border-white hover:border-slate-200"
                      )}
                    >
                      {isRtl ? "لنفسي" : "For Myself"}
                    </button>
                    {familyMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedFamilyMemberId(member.id)}
                        className={cn(
                          "px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2",
                          selectedFamilyMemberId === member.id 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                            : "bg-white text-slate-600 border-white hover:border-slate-200"
                        )}
                      >
                        {member.name} ({member.relation})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      isSelected ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-white bg-white hover:border-slate-100 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover/card:bg-primary/10 group-hover/card:text-primary"}`}>
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p className={`font-black text-lg ${isSelected ? "text-primary" : "text-slate-900"}`}>{test.price} JOD</p>
                      </div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight group-hover/card:text-primary transition-colors">{isRtl ? (test.nameAr || test.name) : test.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Certified Medical Test</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Selection Footer */}
            <div className="flex justify-between items-center pt-8 sticky bottom-8 bg-white/80 backdrop-blur-xl p-6 rounded-[40px] border border-white shadow-2xl z-50">
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                     {selectedTests.length}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isRtl ? "الإجمالي التقديري" : "Estimated Total"}</p>
                    <p className="text-3xl font-black text-slate-900">{totalPrice} <span className="text-lg font-bold text-slate-400">JOD</span></p>
                  </div>
               </div>
               <Button 
                disabled={selectedTests.length === 0}
                onClick={nextStep}
                className="h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 shadow-xl shadow-primary/30"
               >
                 {isRtl ? "المتابعة" : "Continue"}
                 {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
               </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
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
                 <p className="text-slate-500 font-bold mt-3 leading-relaxed">{isRtl ? "قم بزيارة أحد فروعنا الرسمية في الوقت الذي يناسبك" : "Visit one of our official lab branches at your preferred scheduled time"}</p>
               </Card>

               <Card 
                onClick={() => setBookingType("HOME")}
                className={`cursor-pointer border-2 p-10 rounded-[40px] transition-all duration-300 group/type ${bookingType === "HOME" ? "border-primary bg-primary/5 shadow-xl" : "border-white bg-white hover:border-slate-100 shadow-sm"}`}
               >
                 <div className={`h-20 w-20 rounded-[24px] flex items-center justify-center mb-6 transition-all ${bookingType === "HOME" ? "bg-primary text-white shadow-2xl shadow-primary/40" : "bg-slate-50 text-slate-400 group-hover/type:bg-primary/10 group-hover/type:text-primary"}`}>
                   <Home className="h-10 w-10" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900">{isRtl ? "زيارة منزلية" : "Home Visit"}</h3>
                 <p className="text-slate-500 font-bold mt-3 leading-relaxed">{isRtl ? "سوف يقوم طاقمنا الطبي بزيارتك لسحب العينة في منزلك" : "Our professional medical staff will visit your home for sample collection"}</p>
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
                      <p className="font-black text-slate-900 text-lg">{isRtl ? (branch.nameAr || branch.name) : branch.name}</p>
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
                  placeholder={isRtl ? "يرجى كتابة المحافظة، الحي، والشارع بالتفصيل..." : "Please enter your governorate, area, and street details..."}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-between pt-10">
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

        {step === 3 && (
          <motion.div
            key="step3"
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
                      onChange={setDate}
                      placeholder={isRtl ? "اختر التاريخ..." : "Choose date..."}
                      minDate={new Date()}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Clock className="h-4 w-4 text-primary" /> {isRtl ? "الوقت المفضل" : "Preferred Time"}
                    </label>
                    <CustomTimePicker 
                      value={time}
                      onChange={setTime}
                      placeholder={isRtl ? "اختر الوقت..." : "Choose time..."}
                    />
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

            <div className="flex justify-between pt-10">
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

        {step === 4 && (
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
               <Button onClick={() => router.push(`/${locale}/dashboard/bookings`)} className="h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                  {isRtl ? "العودة لقائمة المواعيد" : "Back to My Appointments"}
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
