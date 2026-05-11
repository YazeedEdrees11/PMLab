"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, MapPin, Phone, Home, TestTube, ArrowRight, ArrowLeft, CheckCircle2, Beaker, Dna, Microscope } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const branches = [
    { name: "الجاردنز (Gardens)", map: "https://goo.gl/maps/asvFww5e4cCyeooA7", phone: "http://wa.me/962770780788" },
    { name: "الشميساني 1 (Shmeisani 1)", map: "https://www.google.com/maps?q=31.9797644,35.900452", phone: "http://wa.me/962799130409" },
    { name: "الشميساني 2 (Shmeisani 2)", map: "https://www.google.com/maps?q=31.9797644,35.900452", phone: "http://wa.me/962799127570" },
    { name: "الخالدي 1 (Khaldi 1)", map: "https://g.page/PMLab?share", phone: "http://wa.me/962795107110" },
    { name: "الخالدي 2 (Khaldi 2)", map: "https://goo.gl/maps/7NhukpUaH6YWnuQG6", phone: "http://wa.me/962796155090" },
    { name: "الفحيص (Fuheis)", map: "https://g.page/PmlabFuhais?share", phone: "http://wa.me/962798400449" },
    { name: "الكرك (Karak)", map: "https://goo.gl/maps/QqRENVYTJbn4eNDD8", phone: "http://wa.me/962776696669" },
    { name: "جرش (Jerash)", map: "https://goo.gl/maps/JerashLocationLink", phone: "http://wa.me/962791112223" },
  ];

  const year = new Date().getFullYear().toString();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-32 pb-16 overflow-hidden bg-slate-900 rounded-b-[20px]">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

        <div className="container relative z-10 max-w-7xl mx-auto px-6 flex-1 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl space-y-6 mt-8"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
                {t("Hero.badge1")}
              </div>
              <span className="text-white/80 text-sm font-bold tracking-[0.2em] uppercase">
                {t("Hero.badge2")}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] md:leading-[1.05]"
            >
              {t("Hero.title1")} <br />
              {t("Hero.title2")} <span className="font-serif italic text-primary">{t("Hero.title3")}</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base sm:text-lg text-white/80 max-w-xl leading-relaxed"
            >
              {t("Hero.description")}
            </motion.p>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 pt-4 max-w-md"
            >
              <Button size="lg" className="h-12 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-between gap-4 text-xs font-bold transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 shadow-md shadow-primary/20 w-full sm:w-auto sm:min-w-[180px]">
                <span className="flex-1 text-center">{t("Hero.buttonExplore")}</span>
                <div className="bg-white text-primary h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
                  <ArrowIcon className="h-3.5 w-3.5" />
                </div>
              </Button>
              <Button size="lg" className="h-12 px-4 bg-white hover:bg-white/90 text-slate-900 rounded-xl flex items-center justify-between gap-4 text-xs font-bold transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 shadow-md shadow-black/5 w-full sm:w-auto sm:min-w-[180px]">
                <span className="flex-1 text-center">{t("Hero.buttonApp")}</span>
                <div className="bg-primary text-white h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
                  <ArrowIcon className="h-3.5 w-3.5 rotate-90" />
                </div>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex items-center gap-8 pt-8"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white">{t("Hero.stat1_val")}</span>
                <span className="text-white/60 text-xs font-medium tracking-wide mt-1">{t("Hero.stat1_lbl")}</span>
              </div>
              <div className="flex flex-col border-s border-white/20 ps-8">
                <span className="text-2xl font-extrabold text-white">{t("Hero.stat2_val")}</span>
                <span className="text-white/60 text-xs font-medium tracking-wide mt-1">{t("Hero.stat2_lbl")}</span>
              </div>
              <div className="flex flex-col border-s border-white/20 ps-8">
                <span className="text-2xl font-extrabold text-white">{t("Hero.stat3_val")}</span>
                <span className="text-white/60 text-xs font-medium tracking-wide mt-1">{t("Hero.stat3_lbl")}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Features Section */}
      <section className="relative z-20 py-24 bg-white dark:bg-slate-950 transition-colors duration-500">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16 flex flex-col items-center">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">{t("QuickFeatures.section_subtitle")}</span>
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {t("QuickFeatures.section_title_1")} <span className="font-serif italic text-primary font-normal">{t("QuickFeatures.section_title_2")}</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Microscope, key: "f1", bg: "bg-white dark:bg-slate-900", text: "text-slate-900 dark:text-white" },
              { icon: TestTube, key: "f2", bg: "bg-primary", text: "text-primary-foreground" },
              { icon: Dna, key: "f3", bg: "bg-white dark:bg-slate-900", text: "text-slate-900 dark:text-white" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
              >
                <Card className={`${feature.bg} ${feature.text} rounded-[20px] border-0 shadow-xl shadow-black/5 dark:shadow-primary/5 hover:-translate-y-2 transition-all duration-300 group cursor-pointer`}>
                  <CardContent className="p-8 space-y-4">
                    <div className={`h-14 w-14 rounded-2xl ${feature.bg === 'bg-primary' ? 'bg-white/20' : 'bg-primary/10 dark:bg-primary/20'} flex items-center justify-center ${feature.bg === 'bg-primary' ? 'text-white' : 'text-primary'} mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold">{t(`QuickFeatures.${feature.key}_title` as any)}</h3>
                    <p className={feature.bg === 'bg-primary' ? 'text-primary-foreground/80' : 'text-muted-foreground dark:text-slate-400'}>
                      {t(`QuickFeatures.${feature.key}_desc` as any)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-500">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:flex-1 relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 max-w-lg mx-auto lg:max-w-none">
                <div className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[4/5] relative">
                   <Image src="/about-image.png" alt="PMLab Medical Team" fill className="object-cover" />
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:flex-1 space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">{t("About.subtitle")}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {t("About.title_1")} <span className="font-serif italic text-primary font-normal">{t("About.title_2")}</span>
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground dark:text-slate-400">{t("About.desc")}</p>
              </div>
              
              <ul className="space-y-4">
                {[1, 2, 3, 4].map((num) => (
                  <motion.li 
                    key={num} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (num * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground dark:text-slate-200 font-medium">{t(`About.point${num}` as any)}</span>
                  </motion.li>
                ))}
              </ul>
              <Button size="lg" className="h-14 px-8 mt-4 hover:scale-105 transition-transform bg-primary text-white">
                {t("Nav.about")}
                <ArrowIcon className={`h-5 w-5 ${isRtl ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-secondary/30 dark:bg-slate-900/50 transition-colors duration-500">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col items-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">{t("Services.subtitle")}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
              {t("Services.title_1")} <span className="font-serif italic text-primary font-normal">{t("Services.title_2")}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Activity, key: "s1" },
              { icon: Microscope, key: "s2" },
              { icon: Beaker, key: "s3" },
              { icon: Dna, key: "s4" }
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="bg-white dark:bg-slate-950 border-0 shadow-lg shadow-black/5 dark:shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 group cursor-pointer h-full">
                  <CardContent className="p-8">
                    <div className="h-16 w-16 rounded-full bg-secondary dark:bg-slate-900 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <service.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 dark:text-white">{t(`Services.${service.key}` as any)}</h3>
                    <p className="text-muted-foreground dark:text-slate-400 mb-6 line-clamp-3">{t(`Services.${service.key}_desc` as any)}</p>
                    <div className="inline-flex items-center text-primary font-bold hover:gap-3 transition-all">
                      {isRtl ? "اقرأ المزيد" : "Read More"}
                      <ArrowIcon className={`h-4 w-4 ${isRtl ? 'mr-2' : 'ml-2'}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-white dark:bg-slate-950 border-t border-border/50 dark:border-slate-800 transition-colors duration-500">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[1, 2, 3].map((step) => (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step * 0.2 }}
                className="space-y-6 relative group"
              >
                <div className="mx-auto h-24 w-24 rounded-full bg-secondary dark:bg-slate-900 flex items-center justify-center text-3xl font-extrabold text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 relative z-10 shadow-lg dark:shadow-primary/10">
                  {step}
                </div>
                {/* Connecting Line (Hidden on Mobile) */}
                {step !== 3 && (
                  <div className={`hidden md:block absolute top-12 ${isRtl ? 'right-1/2 left-[-50%]' : 'left-1/2 right-[-50%]'} h-[2px] bg-border dark:bg-slate-800 border-dashed z-0`}></div>
                )}
                <div>
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">{t(`Workflow.step${step}` as any)}</h3>
                  <p className="text-muted-foreground dark:text-slate-400 leading-relaxed">{t(`Workflow.step${step}_desc` as any)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col items-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">{t("Branches.subtitle")}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
              {t("Branches.title_1")} <span className="font-serif italic text-primary font-normal">{t("Branches.title_2")}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">{t("Branches.description")}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
              >
                <Card className="bg-white dark:bg-slate-950 border-0 border-t-4 border-primary/20 hover:border-primary rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                        {branch.name}
                      </h3>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <a href={branch.phone} target="_blank" rel="noreferrer" className="w-full">
                        <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2 font-bold shadow-md shadow-primary/20 transition-transform active:scale-95">
                          <Phone className="h-4 w-4" />
                          {t("Branches.whatsapp")}
                        </Button>
                      </a>
                      <a href={branch.map} target="_blank" rel="noreferrer" className="w-full">
                        <Button variant="outline" className="w-full h-12 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg flex items-center justify-center gap-2 font-bold transition-transform active:scale-95">
                          <MapPin className="h-4 w-4" />
                          {t("Branches.map")}
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0e14] text-white pt-20 pb-10">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* About Column */}
            <div className="space-y-6">
              <Image src="/LogoWhite.png" alt="PMLab" width={160} height={40} className="object-contain" />
              <p className="text-white/50 leading-relaxed text-sm">
                {t("Footer.about_desc")}
              </p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/PMLab.Jo" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://www.instagram.com/pmlab.jo/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-8 relative inline-block">
                {t("Footer.links_title")}
                <span className="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"></span>
              </h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-white/50 hover:text-primary transition-colors text-sm">{t("Nav.home")}</a></li>
                <li><a href="#about" className="text-white/50 hover:text-primary transition-colors text-sm">{t("Nav.about")}</a></li>
                <li><a href="#services" className="text-white/50 hover:text-primary transition-colors text-sm">{t("Nav.services")}</a></li>
                <li><a href="#branches" className="text-white/50 hover:text-primary transition-colors text-sm">{t("Nav.branches")}</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-8 relative inline-block">
                {t("Footer.services_title")}
                <span className="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"></span>
              </h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li className="hover:text-primary cursor-pointer transition-colors">{t("QuickFeatures.f1_title")}</li>
                <li className="hover:text-primary cursor-pointer transition-colors">{t("QuickFeatures.f2_title")}</li>
                <li className="hover:text-primary cursor-pointer transition-colors">{t("QuickFeatures.f3_title")}</li>
                <li className="hover:text-primary cursor-pointer transition-colors">{t("Services.s3")}</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-8 relative inline-block">
                {t("Footer.contact_title")}
                <span className="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"></span>
              </h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-3 text-sm text-white/50">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span>{t("Header.phone")}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/50">
                  <Activity className="h-5 w-5 text-primary shrink-0" />
                  <span>{t("TopBar.email")}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/50">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <span>{t("TopBar.address")}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/30">
              {t("Footer.copyright", { year })}
            </p>
            <div className="flex gap-8 text-xs text-white/20">
              <a href="#" className="hover:text-white transition-colors">{isRtl ? "سياسة الخصوصية" : "Privacy Policy"}</a>
              <a href="#" className="hover:text-white transition-colors">{isRtl ? "الشروط والأحكام" : "Terms & Conditions"}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
