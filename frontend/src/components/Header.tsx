"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Globe, Phone, ArrowRight, ArrowLeft, Moon, Sun, Menu, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/Providers";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLocale = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    router.replace(pathname, { locale: nextLocale });
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Dynamic Styles
  const headerBg = isScrolled || isMobileMenuOpen 
    ? "bg-white dark:bg-slate-950 shadow-md dark:shadow-primary/5 py-2 rounded-b-3xl" 
    : "bg-transparent py-4 rounded-b-none";
    
  // Logo logic: In dark mode, always use white logo when background is dark.
  // In light mode, use black when scrolled, white when transparent.
  const logoSrc = theme === 'dark' 
    ? "/LogoWhite.png" 
    : (isScrolled || isMobileMenuOpen ? "/LogoBlack.png" : "/LogoWhite.png");
  
  // In dark mode, if scrolled/menu open, use white text for logo/links if needed, 
  // but let's keep it simple: text-foreground handles light/dark correctly
  const textColor = isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white";
  
  const pillBg = isScrolled 
    ? "bg-secondary/50 dark:bg-slate-900 border border-border dark:border-slate-800" 
    : "bg-white/10";
    
  const linkHover = isScrolled ? "hover:bg-background dark:hover:bg-slate-800" : "hover:bg-white/20";
  const linkActive = isScrolled ? "bg-primary text-white" : "bg-white text-slate-950";
  const iconBg = isScrolled ? "bg-secondary dark:bg-slate-800" : "bg-white/20";
  const toggleBtn = isScrolled || isMobileMenuOpen 
    ? "bg-secondary dark:bg-slate-900 text-foreground hover:bg-primary hover:text-white" 
    : "bg-white/10 text-white hover:bg-white hover:text-foreground";

  const navLinks = [
    { href: "/", label: t("Nav.home"), active: pathname === "/" },
    { href: "/#services", label: t("Nav.services") },
    { href: "/#about", label: t("Nav.about") },
    { href: "/#branches", label: t("Nav.branches") },
    { href: "/login", label: t("Nav.portal") },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container flex items-center justify-between px-6 max-w-7xl mx-auto">
        {/* 1. Logo */}
        <Link href="/" className="flex items-center z-50">
          <Image 
            src={logoSrc} 
            alt="PMLab Logo" 
            width={120} 
            height={32} 
            className="object-contain transition-all duration-300 sm:w-[130px]" 
            priority
          />
        </Link>

        {/* 2. Center Pill Nav (Desktop) */}
        <nav className={`hidden lg:flex items-center gap-1 backdrop-blur-md p-1 rounded-md font-bold text-[11px] uppercase tracking-wider transition-all duration-300 ${pillBg}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`px-4 py-2 rounded-md transition-colors ${link.active ? linkActive : `${textColor} ${linkHover}`}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 3. Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Phone (Desktop Only) */}
          <div className={`hidden xl:flex items-center gap-2 transition-colors duration-300 ${textColor}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${iconBg}`}>
              <Phone className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-[10px] font-bold leading-tight">
              <span className="opacity-70 font-medium">{t("Header.callAnytime")}</span>
              <span className="text-xs tracking-wide" dir="ltr">{t("Header.phone")}</span>
            </div>
          </div>

          {/* Book Button (Responsive) */}
          <Link href="/book" className="hidden sm:block">
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white pl-5 pr-1.5 py-0 h-10 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform">
              {t("Header.bookTest")}
              <div className="bg-white text-[#e33935] h-7 w-7 rounded-lg flex items-center justify-center">
                <ArrowIcon className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            </Button>
          </Link>

          {/* Theme Toggle (Hidden on extra small) */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors duration-300 ${toggleBtn}`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* Locale Toggle */}
          <button 
            onClick={toggleLocale} 
            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors duration-300 ${toggleBtn}`}
          >
            <Globe className="h-4 w-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={`lg:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors duration-300 z-50 ${toggleBtn}`}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden shadow-xl rounded-b-3xl"
          >
            <div className="container px-6 py-8 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-lg font-bold py-2 border-b border-slate-50 ${pathname === link.href ? 'text-primary' : 'text-slate-900'}`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link href="/book" onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
                <Button className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl flex items-center justify-center gap-3">
                  {t("Header.bookTest")}
                  <ArrowIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
