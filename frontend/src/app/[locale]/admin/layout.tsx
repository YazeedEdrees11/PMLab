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
  Users,
  CalendarCheck,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Settings,
  BarChart3,
  UserCog,
  Building2,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationDropdown } from "@/components/NotificationDropdown";

export default function AdminLayout({
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
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const refreshUser = () => {
    setUserState(getUser());
  };

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      refreshUser();
    }
    
    window.addEventListener('user-profile-updated', refreshUser);
    
    const isAdminLoginPage = pathname.endsWith("/admin/login");
    const currentUser = getUser();

    // 1. Auth Check
    if (!getToken()) {
      if (!isAdminLoginPage) {
        router.push(`/${locale}/admin/login`);
        return;
      }
    } else {
      // Sync profile
      authApi.getProfile().then(data => {
        if (data) {
          const updatedUser = { 
            ...currentUser, 
            name: data.name || currentUser?.name,
            avatarUrl: data.avatarUrl || currentUser?.avatarUrl
          };
          setUser(updatedUser);
          setUserState(updatedUser);
        }
      }).catch(() => {});
    }

    // 2. Role Check
    if (currentUser && currentUser.role !== "ADMIN") {
      router.push(`/${locale}/dashboard`);
    }

    // 3. Sidebar management
    setIsSidebarOpen(false);

    return () => {
      window.removeEventListener('user-profile-updated', refreshUser);
    };
  }, [locale, router, pathname]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    router.push(`/${locale}/admin/login`);
  };

  const isSuperAdmin = mounted && user?.role === "ADMIN" && !user?.branchId;

  const navItems = [
    { href: `/${locale}/admin`, label: isRtl ? "نظرة عامة" : "Overview", icon: LayoutDashboard },
    { href: `/${locale}/admin/bookings`, label: isRtl ? "الحجوزات" : "Bookings", icon: CalendarCheck },
    { href: `/${locale}/admin/patients`, label: isRtl ? "المرضى" : "Patients", icon: Users },
    ...(isSuperAdmin ? [
      { href: `/${locale}/admin/branches`, label: isRtl ? "الفروع" : "Branches", icon: Building2 },
      { href: `/${locale}/admin/finance`, label: t("finance"), icon: BarChart3 },
      { href: `/${locale}/admin/staff`, label: t("staff"), icon: UserCog },
    ] : []),
    { href: `/${locale}/admin/settings`, label: isRtl ? "الإعدادات" : "Settings", icon: Settings },
  ];

  const isAdminLoginPage = pathname.endsWith("/admin/login");

  if (!mounted) return null;
  if (!isAdminLoginPage && user?.role !== "ADMIN") return null;
  if (isAdminLoginPage) return <>{children}</>;

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="h-screen bg-slate-50 font-sans flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 z-[120] bg-slate-900 flex flex-col w-72 transition-transform duration-300 border-e border-slate-800
        ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href={`/${locale}`}>
            <Image src="/LogoWhite.png" alt="PMLab" width={120} height={30} className="object-contain" />
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-7 py-2">
           Admin System
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
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

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>{isRtl ? "تسجيل خروج" : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-10 shadow-sm">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
             >
                <Menu className="h-6 w-6" />
             </button>

             <Link href={`/${locale}`} className="lg:hidden">
               <Image src="/logo.png" alt="Logo" width={80} height={20} className="object-contain" />
             </Link>

             <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200/50">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                 {isRtl ? "نظام إدارة المختبر" : "Lab Management System"}
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Notifications */}
            <NotificationDropdown />

            <div className="h-6 w-px bg-slate-200 hidden xs:block" />

            {/* Language Switcher */}
            <button
              onClick={() => {
                const newLocale = locale === 'ar' ? 'en' : 'ar';
                window.location.href = `/${newLocale}${pathname.substring(3)}`;
              }}
              className="h-10 w-10 lg:h-11 lg:w-11 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-slate-50 transition-all"
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>

            <div className="h-6 w-px bg-slate-200 hidden xs:block" />

            {/* User Profile Info */}
            <div className="flex items-center gap-3 ps-2 rounded-2xl cursor-pointer group">
              <div className="relative">
                <div className="h-9 w-9 lg:h-11 lg:w-11 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-black border border-slate-200 overflow-hidden shadow-inner group-hover:border-primary/30 transition-all">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.[0]?.toUpperCase() || "A"}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">{user?.name || "Admin"}</p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-wider mt-0.5">{isRtl ? "مدير النظام" : "Super Admin"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 lg:p-10 pb-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
