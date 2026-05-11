"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/Providers";
import { getToken, getUser, removeToken, removeUser, setUser, authApi } from "@/lib/api";
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Users
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { NotificationDropdown } from "@/components/NotificationDropdown";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const refreshUser = () => {
    setUserState(getUser());
  };

  useEffect(() => {
    setMounted(true);
    refreshUser();

    window.addEventListener('user-profile-updated', refreshUser);

    if (!getToken()) {
      router.push(`/${locale}/login`);
    } else {
      // Fetch latest profile to sync changes (e.g. from mobile app)
      authApi.getProfile().then(data => {
        if (data) {
          const currentUser = getUser() || {};
          const updatedUser = { 
            ...currentUser, 
            name: data.name || data.patient?.name || currentUser.name,
            avatarUrl: data.avatarUrl || currentUser.avatarUrl
          };
          setUser(updatedUser);
          setUserState(updatedUser);
        }
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('user-profile-updated', refreshUser);
    };
  }, [locale, router]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    router.push(`/${locale}/login`);
  };

  const navItems = [
    { href: `/${locale}/dashboard`, label: isRtl ? "نظرة عامة" : "Overview", icon: LayoutDashboard },
    { href: `/${locale}/dashboard/results`, label: isRtl ? "نتائجي" : "Results", icon: FileText },
    { href: `/${locale}/dashboard/bookings`, label: isRtl ? "مواعيدي" : "Bookings", icon: CalendarCheck },
    { href: `/${locale}/dashboard/family`, label: isRtl ? "العائلة" : "Family", icon: Users },
    { href: `/${locale}/dashboard/profile`, label: isRtl ? "حسابي" : "Profile", icon: User },
  ];

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="h-screen bg-slate-50 font-sans flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 border-e border-slate-800 fixed inset-y-0 z-50">
        <div className="p-6 border-b border-slate-800">
          <Link href={`/${locale}`}>
            <Image src="/LogoWhite.png" alt="PMLab" width={130} height={32} className="object-contain" />
          </Link>
          <div className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
            Patient Portal
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronIcon className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100" : ""}`} />
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden lg:ms-72">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-10 shadow-sm">
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Mobile Logo */}
            <Link href={`/${locale}`} className="lg:hidden">
              <Image src="/logo.png" alt="Logo" width={90} height={24} className="object-contain" />
            </Link>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200/50">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {isRtl ? "بوابة المرضى" : "Patient Portal"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            {/* Notifications */}
            <NotificationDropdown />
            
            <div className="h-6 w-px bg-slate-200 hidden xs:block" />

            {/* Language Switcher */}
            <button
              onClick={() => {
                const newLocale = locale === 'ar' ? 'en' : 'ar';
                window.location.href = `/${newLocale}${pathname.substring(3)}`;
              }}
              className="h-10 w-10 lg:h-11 lg:w-11 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white border border-slate-200 shadow-sm hover:border-primary/30 hover:bg-slate-50 transition-all"
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>

            <div className="h-6 w-px bg-slate-200 hidden xs:block" />

            {/* User Profile */}
            <div className="flex items-center gap-3 ps-2 rounded-2xl cursor-pointer group">
              <div className="relative">
                <div className="h-9 w-9 lg:h-11 lg:w-11 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-black border border-slate-200 overflow-hidden shadow-sm group-hover:border-primary/30 transition-all">
                  {mounted && user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{mounted ? (user?.name?.[0]?.toUpperCase() || "P") : "P"}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-slate-900 truncate max-w-[120px] leading-tight">{mounted ? (user?.name || "Patient") : "..."}</p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-wider mt-0.5">{isRtl ? "مريض" : "Patient"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-10 pb-28 lg:pb-10 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-lg border border-white/10 z-50 flex items-center justify-around py-2.5 px-2 rounded-3xl shadow-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
                  isActive ? "text-white bg-primary shadow-lg shadow-primary/40 scale-105" : "text-slate-400"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              </Link>
            );
          })}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">{isRtl ? "خروج" : "Logout"}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
