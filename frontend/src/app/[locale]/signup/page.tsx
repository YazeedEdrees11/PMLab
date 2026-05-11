"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, UserPlus, Mail, Lock, User, Phone, CreditCard, Loader2 } from "lucide-react";
import { authApi, setToken, setUser } from "@/lib/api";
import { toast } from "sonner";

export default function SignupPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", nationalId: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.register(form);
      setToken(data.access_token);
      setUser(data.user);
      
      toast.success(isRtl ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
      
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(isRtl ? "هذا البريد مسجل مسبقاً أو البيانات غير صحيحة" : "Email already registered or invalid data");
      toast.error(isRtl ? "فشل التسجيل" : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <Image src="/hero-bg.png" alt="PMLab Laboratory" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <Link href={`/${locale}`}>
            <Image src="/LogoWhite.png" alt="PMLab" width={160} height={40} className="object-contain" />
          </Link>

          <div className="space-y-6 max-w-lg">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary backdrop-blur-xl border border-primary/20">
              <UserPlus className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              {isRtl ? "ابدأ رحلتك " : "Start your "}
              <span className="font-serif italic text-primary font-normal">
                {isRtl ? "الصحية معنا" : "health journey with us"}
              </span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              {isRtl 
                ? "أنشئ حساباً اليوم لتتمكن من حجز الفحوصات المنزلية، متابعة نتائجك، والحصول على تنبيهات فورية لتقاريرك." 
                : "Create an account today to book home tests, track your results, and get instant notifications for your reports."}
            </p>
          </div>

          <p className="text-white/40 text-sm italic">
            © {new Date().getFullYear()} Precision Medical Lab (PMLab).
          </p>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative overflow-y-auto">
        <div className="lg:hidden absolute top-8 left-8">
          <Link href={`/${locale}`}>
             <Image src="/Logo.png" alt="PMLab" width={120} height={30} className="object-contain" />
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-10 py-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900">{t("signup_title")}</h2>
            <p className="text-slate-500 font-medium">{t("signup_subtitle")}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullname" className="text-slate-700 font-bold ml-1">{t("fullname")}</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <Input id="fullname" value={form.name} onChange={(e) => update("name", e.target.value)} required className="pl-12" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="text-slate-700 font-bold ml-1">{t("email")}</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="pl-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-bold ml-1">{t("phone")}</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="pl-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="national_id" className="text-slate-700 font-bold ml-1">{t("national_id")}</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <CreditCard className="h-5 w-5" />
                </div>
                <Input id="national_id" value={form.nationalId} onChange={(e) => update("nationalId", e.target.value)} className="pl-12" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password" className="text-slate-700 font-bold ml-1">{t("password")}</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required className="pl-12" />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t("btn_signup")}
                    {isRtl ? <ArrowLeft className="mr-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-slate-500 font-medium">
              {t("has_account")}{" "}
              <Link href={`/${locale}/login`} className="text-primary font-bold hover:underline">
                {t("login_now")}
              </Link>
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100">
             <Link href={`/${locale}`} className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors text-sm font-bold">
               {isRtl ? <ArrowRight className="ml-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
               {t("back_home")}
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
