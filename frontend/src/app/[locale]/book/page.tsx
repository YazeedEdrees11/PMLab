"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { testsApi, branchesApi, appointmentsApi, getToken, getUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Home,
  TestTube,
  User,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
];

export default function BookPage() {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isHomeVisit, setIsHomeVisit] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Patient Info State
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    phone: "",
    nationalId: ""
  });

  // Data from API
  const [labTests, setLabTests] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getUser());
    const fetchData = async () => {
      try {
        const [testsRes, branchesRes] = await Promise.all([
          testsApi.getAll(),
          branchesApi.getAll(),
        ]);
        setLabTests(testsRes || []);
        setBranches(branchesRes || []);
      } catch (error) {
        console.error("Failed to load booking data", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [locale, router]);

  const steps = [
    { num: 1, label: isRtl ? "البيانات والموقع" : "Info & Location", icon: User },
    { num: 2, label: isRtl ? "اختيار الفحوصات" : "Select Tests", icon: TestTube },
    { num: 3, label: isRtl ? "الموعد" : "Schedule", icon: Calendar },
    { num: 4, label: isRtl ? "تأكيد" : "Confirm", icon: CheckCircle2 },
  ];

  const ArrowNext = isRtl ? ArrowLeft : ArrowRight;
  const ArrowPrev = isRtl ? ArrowRight : ArrowLeft;
  const ChevronNext = isRtl ? ChevronLeft : ChevronRight;

  const filteredTests = labTests.filter((test) => {
    const q = searchQuery.toLowerCase();
    const name = test.name?.toLowerCase() || "";
    const nameAr = test.nameAr?.toLowerCase() || "";
    return name.includes(q) || nameAr.includes(q);
  });

  const toggleTest = (id: string) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const totalPrice = selectedTests.reduce((sum, id) => {
    const test = labTests.find((t) => t.id === id);
    return sum + (test?.price || 0);
  }, 0);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const canProceed = () => {
    if (currentStep === 1) {
      let infoComplete = false;
      if (currentUser?.patientId) {
        infoComplete = true; // Use logged-in patient
      } else {
        infoComplete = !!(patientInfo.name && patientInfo.phone && (patientInfo as any).email);
      }
      const locationComplete = isHomeVisit || selectedBranch !== null;
      return infoComplete && locationComplete;
    }
    if (currentStep === 2) return selectedTests.length > 0;
    if (currentStep === 3) return selectedDate !== "" && selectedTime !== "";
    return true;
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await appointmentsApi.create({
        branchId: isHomeVisit ? undefined : selectedBranch!,
        date: selectedDate,
        time: selectedTime,
        homeVisit: isHomeVisit,
        testIds: selectedTests,
        patientId: currentUser?.patientId ? currentUser.patientId : undefined,
        patientInfo: currentUser?.patientId ? undefined : patientInfo 
      } as any);
      setIsSuccess(true);
      toast.success(isRtl ? "تم تأكيد الحجز بنجاح!" : "Booking confirmed successfully!");
    } catch (error) {
      console.error("Booking failed", error);
      toast.error(isRtl ? "حدث خطأ أثناء الحجز. حاول مرة أخرى." : "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
         <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans px-6">
        <div className="max-w-lg w-full text-center space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">{t("success_title")}</h1>
          <p className="text-lg text-slate-500 font-medium pb-4">{t("success_desc")}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <Link href={`/${locale}/${currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF' ? 'admin' : (currentUser ? 'dashboard' : 'login')}`} className="w-full sm:w-auto">
              <Button className="w-full h-14 px-8 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                <User className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                {isRtl 
                  ? (currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF' ? "الذهاب للوحة الإدارة" : (currentUser ? "الذهاب للوحة المريض" : "تسجيل الدخول للوحة المريض")) 
                  : (currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF' ? "Admin Dashboard" : (currentUser ? "Patient Dashboard" : "Login to Dashboard"))}
              </Button>
            </Link>
            <Link href={`/${locale}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-14 px-8 rounded-xl text-lg font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
                <Home className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                {isRtl ? "العودة للرئيسية" : "Return to Home"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${locale}`}>
            <Image src="/Logo.png" alt="PMLab" width={120} height={30} className="object-contain" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline font-medium">{isRtl ? "حجز آمن ومشفر" : "Secure Booking"}</span>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">{t("title")}</h1>
          <p className="text-slate-500 font-medium">{t("subtitle")}</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-0 mb-16 max-w-2xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 relative">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    currentStep === step.num
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                      : currentStep > step.num
                      ? "bg-green-100 text-green-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > step.num ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-bold whitespace-nowrap ${
                    currentStep === step.num ? "text-primary" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 mt-[-20px] rounded-full transition-colors ${
                    currentStep > step.num ? "bg-green-300" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Patient Info & Location */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Patient Form OR Current User Info */}
              {!currentUser?.patientId ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{isRtl ? "بيانات المريض" : "Patient Information"}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{isRtl ? "الاسم الكامل" : "Full Name"}</label>
                      <Input 
                        placeholder={isRtl ? "أدخل اسمك الكامل" : "Enter your full name"} 
                        value={patientInfo.name}
                        onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
                      <Input 
                        placeholder="+9627XXXXXXXX" 
                        value={patientInfo.phone}
                        onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{isRtl ? "البريد الإلكتروني" : "Email Address"}</label>
                      <Input 
                        type="email"
                        placeholder="example@mail.com" 
                        value={(patientInfo as any).email || ""}
                        onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value} as any)}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{isRtl ? "الرقم الوطني (اختياري)" : "National ID (Optional)"}</label>
                      <Input 
                        placeholder="99XXXXXXXX" 
                        value={patientInfo.nationalId}
                        onChange={(e) => setPatientInfo({...patientInfo, nationalId: e.target.value})}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{isRtl ? "حجز موعد جديد" : "New Booking"}</h3>
                      <p className="text-slate-600 text-sm">{isRtl ? "هذا الحجز سيتم تسجيله باسم حسابك الحالي." : "This booking will be registered to your current account."}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/${locale}/login`} className="shrink-0">
                    {isRtl ? "لست أنت؟ تسجيل خروج" : "Not you? Log out"}
                  </Button>
                </div>
              )}

              {/* Location Choice */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 px-2">{isRtl ? "أين تود إجراء الفحص؟" : "Where to take the test?"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    onClick={() => {
                      setIsHomeVisit(true);
                      setSelectedBranch(null);
                    }}
                    className={`cursor-pointer transition-all duration-300 rounded-3xl border-2 overflow-hidden ${
                      isHomeVisit
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 -translate-y-1"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${isHomeVisit ? "bg-primary text-white" : "bg-slate-50 text-slate-400"}`}>
                        <Home className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{isRtl ? "سحب منزلي" : "Home Visit"}</h4>
                        <p className="text-slate-500 text-sm mt-1">{isRtl ? "نصلك أينما كنت لسحب العينات" : "We come to you to collect samples"}</p>
                      </div>
                      {isHomeVisit && <div className="h-2 w-full bg-primary absolute bottom-0 left-0" />}
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setIsHomeVisit(false)}
                    className={`cursor-pointer transition-all duration-300 rounded-3xl border-2 overflow-hidden relative ${
                      !isHomeVisit && selectedBranch !== null
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 -translate-y-1"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${!isHomeVisit && selectedBranch !== null ? "bg-primary text-white" : "bg-slate-50 text-slate-400"}`}>
                        <MapPin className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{isRtl ? "زيارة المختبر" : "Lab Visit"}</h4>
                        <p className="text-slate-500 text-sm mt-1">{isRtl ? "تفضل بزيارة أحد فروعنا" : "Visit one of our branches"}</p>
                      </div>
                      {!isHomeVisit && selectedBranch !== null && <div className="h-2 w-full bg-primary absolute bottom-0 left-0" />}
                    </CardContent>
                  </Card>
                </div>

                {/* Branch Selection if Lab Visit is active */}
                {!isHomeVisit && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 animate-in fade-in zoom-in-95 duration-300">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch.id)}
                        className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                          selectedBranch === branch.id
                            ? "border-primary bg-primary text-white"
                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                        }`}
                      >
                        {isRtl ? branch.nameAr || branch.name : branch.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Test Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_test")}
                  className={`h-14 rounded-2xl border-slate-200 text-lg shadow-sm ${isRtl ? "pr-12" : "pl-12"}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTests.map((test) => {
                  const isSelected = selectedTests.includes(test.id);
                  return (
                    <Card
                      key={test.id}
                      onClick={() => toggleTest(test.id)}
                      className={`cursor-pointer transition-all duration-200 rounded-2xl border-2 ${
                         isSelected
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-transparent bg-white hover:border-slate-200 hover:shadow-md"
                      }`}
                    >
                      <CardContent className="p-5 flex items-center gap-4">
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                             isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <TestTube className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                            {isRtl ? test.nameAr || test.name : test.name}
                          </h3>
                          <p className="text-primary font-extrabold text-sm mt-1">{test.price} JOD</p>
                        </div>
                        <div
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                             isSelected ? "border-primary bg-primary" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedTests.length > 0 && (
                <div className="bg-slate-900 rounded-3xl p-6 flex items-center justify-between shadow-xl">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      {isRtl ? "الفحوصات المختارة" : "Selected Tests"}
                    </span>
                    <span className="text-white text-lg font-black mt-1">
                       {selectedTests.length} {isRtl ? "فحوصات" : "tests"}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white">{totalPrice} <span className="text-sm font-bold text-slate-400">JOD</span></div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date & Time */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Date Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t("select_date")}
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {dates.map((date) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const isSelected = selectedDate === dateStr;
                    const dayName = date.toLocaleDateString(isRtl ? "ar-JO" : "en-US", { weekday: "short" });
                    const dayNum = date.getDate();
                    const monthName = date.toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: "short" });
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-100"
                        }`}
                      >
                        <span className={`text-xs font-bold ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                          {dayName}
                        </span>
                        <span className="text-xl font-extrabold">{dayNum}</span>
                        <span className={`text-xs font-medium ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                          {monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t("select_time")}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-100"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="rounded-2xl border-0 bg-white shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Tests Summary */}
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-primary" />
                      {t("step1")}
                    </h3>
                    <div className="space-y-3">
                      {selectedTests.map((id) => {
                        const test = labTests.find((t) => t.id === id);
                        if (!test) return null;
                        return (
                          <div key={id} className="flex items-center justify-between">
                            <span className="text-slate-700 font-medium text-sm">
                              {isRtl ? test.nameAr || test.name : test.name}
                            </span>
                            <span className="text-primary font-extrabold text-sm">{test.price} JOD</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location Summary */}
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {t("step2")}
                    </h3>
                    <p className="text-slate-600 font-medium">
                      {isHomeVisit
                        ? t("home_visit")
                        : (isRtl 
                           ? branches.find((b) => b.id === selectedBranch)?.nameAr || branches.find((b) => b.id === selectedBranch)?.name
                           : branches.find((b) => b.id === selectedBranch)?.name)}
                    </p>
                  </div>

                  {/* Date/Time Summary */}
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {t("step3")}
                    </h3>
                    <p className="text-slate-600 font-medium">
                      {selectedDate && new Date(selectedDate).toLocaleDateString(isRtl ? "ar-JO" : "en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      — {selectedTime}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="p-6 bg-slate-50 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">{isRtl ? "المجموع" : "Total"}</span>
                    <span className="text-3xl font-extrabold text-primary">{totalPrice} JOD</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 gap-4">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="h-14 px-8 rounded-xl font-bold border-slate-200 text-slate-600"
              >
                <ArrowPrev className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                {t("prev")}
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
                className="h-14 px-10 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
              >
                {t("next")}
                <ArrowNext className={`h-5 w-5 ${isRtl ? "mr-2" : "ml-2"}`} />
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={submitting}
                className="h-14 px-10 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 disabled:opacity-70"
              >
                {submitting ? (
                   <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                   <>
                     <CheckCircle2 className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                     {t("confirm_booking")}
                   </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
