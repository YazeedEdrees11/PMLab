"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { authApi, setToken, setUser, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.push(`/${locale}/admin`);
    }
  }, [locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      
      if (data.user.role !== "ADMIN") {
        toast.error(isRtl ? "عذراً، هذا الحساب ليس لديه صلاحيات مدير" : "Sorry, this account does not have admin privileges");
        setLoading(false);
        return;
      }

      setToken(data.access_token);
      setUser(data.user);
      
      toast.success(isRtl ? "تم تسجيل دخول المدير بنجاح" : "Admin login successful");
      router.push(`/${locale}/admin`);
    } catch (error: any) {
      toast.error(isRtl ? "خطأ في البريد أو كلمة المرور" : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block mb-6">
            <Image src="/LogoWhite.png" alt="PMLab" width={160} height={40} className="object-contain" />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isRtl ? "بوابة الإدارة" : "Staff Portal"}
            </h1>
          </div>
          <p className="text-slate-400 font-medium">
            {isRtl ? "قم بتسجيل الدخول لإدارة المختبر" : "Sign in to manage the laboratory"}
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">
                  {isRtl ? "البريد الإلكتروني" : "Admin Email"}
                </label>
                <div className="relative group">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors ${isRtl ? "right-4" : "left-4"}`} />
                  <Input
                    type="email"
                    required
                    placeholder="admin@pmlab.jo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl focus:ring-primary/20 ${isRtl ? "pr-12 text-right" : "pl-12"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">
                  {isRtl ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative group">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors ${isRtl ? "right-4" : "left-4"}`} />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl focus:ring-primary/20 ${isRtl ? "pr-12 text-right" : "pl-12"}`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-base shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 mt-4"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isRtl ? "دخول المسؤول" : "Admin Access"}
                    <ArrowIcon className={`h-5 w-5 ${isRtl ? "mr-2" : "ml-2"}`} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href={`/${locale}/login`} className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">
            {isRtl ? "العودة لتسجيل دخول المرضى" : "Back to Patient Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
