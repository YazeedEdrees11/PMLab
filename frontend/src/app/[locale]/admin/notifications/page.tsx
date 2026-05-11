"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Bell, 
  Send, 
  Users, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Megaphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notificationsApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast.error(isRtl ? "يرجى كتابة رسالة أولاً" : "Please type a message first");
      return;
    }

    setIsSending(true);
    try {
      await notificationsApi.broadcast(message);
      toast.success(isRtl ? "تم إرسال الإشعار لجميع المرضى بنجاح" : "Notification broadcasted to all patients successfully");
      setMessage("");
      setPreviewOpen(false);
    } catch (error) {
      console.error("Broadcast error:", error);
      toast.error(isRtl ? "فشل إرسال الإشعار" : "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-3 w-10 rounded-full bg-primary" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {isRtl ? "مركز الإشعارات العام" : "Broadcast Notification Center"}
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-lg">
            {isRtl 
              ? "أرسل تنبيهات فورية لجميع المرضى المسجلين في النظام" 
              : "Send instant push notifications to all registered patients in the system"}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
           <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? "الوصول" : "REACH"}</p>
              <p className="text-xl font-black text-slate-900">{isRtl ? "جميع المرضى" : "All Patients"}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Megaphone className="h-5 w-5" />
                </div>
                {isRtl ? "كتابة إشعار جديد" : "Compose New Broadcast"}
              </CardTitle>
              <CardDescription className="text-slate-400 font-bold">
                {isRtl ? "سيتم إرسال هذا النص كإشعار فوري وتخزينه في صندوق الوارد للمرضى" : "This text will be sent as a push notification and stored in patients' inbox"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 block px-2">
                  {isRtl ? "محتوى الرسالة" : "Message Content"}
                </label>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isRtl ? "اكتب هنا... (مثال: خصم 20% على باقة تحاليل الشتاء)" : "Type here... (e.g. 20% discount on winter test packages)"}
                    className={cn(
                      "w-full min-h-[200px] p-8 rounded-[32px] bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none text-lg font-bold text-slate-800 placeholder:text-slate-300 resize-none",
                      isRtl ? "text-right" : "text-left"
                    )}
                  />
                  <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {message.length} characters
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="flex-1 h-16 rounded-2xl bg-slate-100 text-slate-600 font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
                >
                  <Info className="h-5 w-5" />
                  {isRtl ? "معاينة الشكل" : "Preview Appearance"}
                </button>
                <button
                  disabled={isSending || !message.trim()}
                  onClick={handleBroadcast}
                  className={cn(
                    "flex-[2] h-16 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100",
                    isSending ? "animate-pulse" : ""
                  )}
                >
                  <Send className={cn("h-5 w-5", isSending ? "animate-bounce" : "")} />
                  {isSending 
                    ? (isRtl ? "جاري الإرسال..." : "Sending...") 
                    : (isRtl ? "إرسال للجميع الآن" : "Broadcast Now")}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900 mb-1">{isRtl ? "تنبيه أمان" : "Safety Note"}</p>
              <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
                {isRtl 
                  ? "يرجى مراجعة النص جيداً قبل الإرسال. لا يمكن التراجع عن الإرسال بعد الضغط على الزر، وسيصل الإشعار لجميع المستخدمين في نفس اللحظة." 
                  : "Please review the text carefully before sending. Broadcasts cannot be undone once sent, and the notification will reach all users instantly."}
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
           <div className="sticky top-10 space-y-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                {isRtl ? "معاينة على هاتف المريض" : "Patient Phone Preview"}
              </p>
              
              <div className="relative mx-auto w-[300px] h-[600px] bg-slate-900 rounded-[50px] border-[8px] border-slate-800 shadow-2xl overflow-hidden p-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10" />
                
                {/* Wallpaper simulation */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
                
                <div className="relative mt-20 space-y-4">
                  {/* Lock screen notification */}
                  <AnimatePresence mode="wait">
                    {message.trim() && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-full bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-md bg-primary flex items-center justify-center text-[8px] text-white font-black">PM</div>
                              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">PMLab App</span>
                           </div>
                           <span className="text-[9px] font-bold text-slate-400">{isRtl ? "الآن" : "Now"}</span>
                        </div>
                        <p className={cn(
                          "text-xs font-bold text-slate-800 line-clamp-3 leading-relaxed",
                          isRtl ? "text-right" : "text-left"
                        )}>
                          {message}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Empty state simulation */}
                  {!message.trim() && (
                    <div className="w-full h-20 rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{isRtl ? "لا يوجد نص" : "No text yet"}</p>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-10">
                   <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                      <div className="h-5 w-5 border-2 border-white rounded-full opacity-50" />
                   </div>
                   <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                      <div className="h-5 w-5 border-2 border-white rounded-full opacity-50" />
                   </div>
                </div>
              </div>

              {/* Status Section */}
              <Card className="border-0 bg-slate-50 rounded-3xl p-6">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-600">{isRtl ? "الإرسال عبر الويب متاح" : "Web Push Enabled"}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-600">{isRtl ? "الإرسال للموبايل متاح" : "Mobile Push Enabled"}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-600">{isRtl ? "تجنب الإرسال المتكرر" : "Avoid spamming users"}</span>
                   </div>
                </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
