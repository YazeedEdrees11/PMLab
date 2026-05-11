"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { authApi, settingsApi, getUser, setUser } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Building2, 
  Globe, 
  Bell, 
  Save, 
  Loader2, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare,
  LayoutTemplate,
  UserCircle,
  Shield,
  KeyRound,
  Camera
} from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real settings state
  const [settings, setSettings] = useState<any>({
    labName: "",
    email: "",
    phone: "",
    address: "",
    heroTitle: "",
    heroSubtitle: "",
    enableSms: true,
    enableEmail: true,
  });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const loadData = async (isInitial = true) => {
      try {
        if (isInitial) setLoading(true);
        const sysSettings = await settingsApi.getSettings();
        setSettings(sysSettings);
        
        const currentUser = getUser();
        if (currentUser) {
          setProfileData(prev => ({
            ...prev,
            name: currentUser.name || "Admin",
            email: currentUser.email || "",
          }));
          setAvatarUrl(currentUser.avatarUrl || null);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "profile") {
        // Build payload
        const payload: any = {};
        if (profileData.name) payload.name = profileData.name;
        if (profileData.email) payload.email = profileData.email;
        if (profileData.newPassword) {
          payload.currentPassword = profileData.currentPassword;
          payload.newPassword = profileData.newPassword;
        }

        const updatedUser = await authApi.updateProfile(payload);
        
        // Update local storage user object
        const current = getUser();
        setUser({ ...current, ...updatedUser });
        
        // Notify layout/header to refresh user info
        window.dispatchEvent(new Event('user-profile-updated'));
        
        // Reset password fields
        setProfileData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
        
        toast.success(isRtl ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!");
      } else {
        // Save System Settings
        await settingsApi.updateSettings(settings);
        toast.success(isRtl ? "تم حفظ الإعدادات بنجاح!" : "Settings saved successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || (isRtl ? "حدث خطأ أثناء الحفظ" : "Failed to save changes"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `admin_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await authApi.updateAvatar(publicUrl);

      setAvatarUrl(publicUrl);
      const current = getUser();
      if (current) {
        setUser({ ...current, avatarUrl: publicUrl });
        // Notify layout/header to refresh user info
        window.dispatchEvent(new Event('user-profile-updated'));
      }

      toast.success(isRtl ? "تم تحديث الصورة بنجاح" : "Avatar updated successfully");
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      toast.error(error.message || (isRtl ? "فشل رفع الصورة" : "Failed to upload avatar"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tabs = [
    { id: "profile", label: isRtl ? "الملف الشخصي" : "My Profile", icon: UserCircle },
    { id: "general", label: isRtl ? "عام" : "General", icon: Building2 },
    { id: "website", label: isRtl ? "الموقع الإلكتروني" : "Website", icon: Globe },
    { id: "notifications", label: isRtl ? "الإشعارات" : "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? "الإعدادات" : "Settings"}</h1>
        </div>
        <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
          {isRtl ? "إدارة إعدادات النظام والموقع الإلكتروني للمختبر" : "Manage system and website configurations"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200"
                }`}
              >
                <tab.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card className="border-0 bg-white rounded-2xl shadow-sm">
            <CardHeader className="p-8 border-b border-slate-100">
              <CardTitle className="text-xl font-black text-slate-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium mt-1">
                {activeTab === "profile" && (isRtl ? "إدارة معلومات حسابك الشخصي وكلمة المرور" : "Manage your personal account details and password")}
                {activeTab === "general" && (isRtl ? "المعلومات الأساسية للمختبر وطرق التواصل" : "Basic lab information and contact details")}
                {activeTab === "website" && (isRtl ? "محتوى الصفحة الرئيسية والموقع العام" : "Public website content and appearance")}
                {activeTab === "notifications" && (isRtl ? "تفضيلات إرسال التنبيهات للمرضى" : "Patient notification preferences")}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {activeTab === "profile" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-4xl shrink-0 overflow-hidden shadow-inner border border-primary/20">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          profileData.name?.[0]?.toUpperCase() || "A"
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute -bottom-2 -right-2 h-9 w-9 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary hover:scale-110 transition-all disabled:opacity-50"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{profileData.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{profileData.email}</p>
                      <p className="text-xs text-primary font-bold mt-1">{isRtl ? "اضغط على الأيقونة لتغيير الصورة" : "Click the icon to change your photo"}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-primary" />
                      {isRtl ? "المعلومات الشخصية" : "Personal Information"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">{isRtl ? "الاسم" : "Name"}</Label>
                        <div className="relative">
                          <UserCircle className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                          <Input 
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">{isRtl ? "البريد الإلكتروني" : "Email Address"}</Label>
                        <div className="relative">
                          <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                          <Input 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      {isRtl ? "الأمان وكلمة المرور" : "Security & Password"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">{isRtl ? "كلمة المرور الحالية" : "Current Password"}</Label>
                        <div className="relative">
                          <KeyRound className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                          <Input 
                            type="password"
                            value={profileData.currentPassword}
                            onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                            placeholder="********"
                            className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">{isRtl ? "كلمة المرور الجديدة" : "New Password"}</Label>
                        <div className="relative">
                          <KeyRound className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                          <Input 
                            type="password"
                            value={profileData.newPassword}
                            onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                            placeholder="********"
                            className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "general" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">{isRtl ? "اسم المختبر" : "Lab Name"}</Label>
                      <div className="relative">
                        <Building2 className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                        <Input 
                          value={settings.labName}
                          onChange={(e) => setSettings({...settings, labName: e.target.value})}
                          className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">{isRtl ? "البريد الإلكتروني" : "Email Address"}</Label>
                      <div className="relative">
                        <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                        <Input 
                          value={settings.email}
                          onChange={(e) => setSettings({...settings, email: e.target.value})}
                          className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">{isRtl ? "رقم الهاتف" : "Phone Number"}</Label>
                      <div className="relative">
                        <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                        <Input 
                          value={settings.phone}
                          onChange={(e) => setSettings({...settings, phone: e.target.value})}
                          className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">{isRtl ? "العنوان" : "Address"}</Label>
                      <div className="relative">
                        <MapPin className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                        <Input 
                          value={settings.address}
                          onChange={(e) => setSettings({...settings, address: e.target.value})}
                          className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "website" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">{isRtl ? "العنوان الرئيسي (Hero Title)" : "Hero Title"}</Label>
                    <div className="relative">
                      <LayoutTemplate className={`absolute top-4 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                      <Input 
                        value={settings.heroTitle}
                        onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                        className={`h-11 rounded-xl ${isRtl ? "pr-10" : "pl-10"}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">{isRtl ? "النص الفرعي (Hero Subtitle)" : "Hero Subtitle"}</Label>
                    <div className="relative">
                      <MessageSquare className={`absolute top-4 h-4 w-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                      <Textarea 
                        value={settings.heroSubtitle}
                        onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                        className={`min-h-[100px] rounded-xl pt-3 ${isRtl ? "pr-10" : "pl-10"}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{isRtl ? "إشعارات البريد الإلكتروني" : "Email Notifications"}</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {isRtl ? "إرسال رسالة للمريض عند صدور النتيجة" : "Send email to patient when results are ready"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.enableEmail}
                        onChange={(e) => setSettings({...settings, enableEmail: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{isRtl ? "رسائل SMS" : "SMS Notifications"}</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {isRtl ? "إرسال رسالة نصية للمريض لتأكيد الحجز" : "Send SMS to patient to confirm booking"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.enableSms}
                        onChange={(e) => setSettings({...settings, enableSms: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  {saving ? (
                    <Loader2 className={`h-5 w-5 animate-spin ${isRtl ? "ml-2" : "mr-2"}`} />
                  ) : (
                    <Save className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
                  )}
                  {isRtl ? "حفظ التغييرات" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
