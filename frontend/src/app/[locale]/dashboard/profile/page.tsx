"use client";
import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations, useLocale } from "next-intl";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Save,
  Shield,
  Loader2,
  CheckCircle2,
  Camera
} from "lucide-react";
import { authApi, patientsApi, setUser, getUser } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ProfilePage() {
  const t = useTranslations("Dashboard");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [patientData, setPatientData] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await authApi.getProfile();
        setUserEmail(user.email);
        setAvatarUrl(user.avatarUrl);
        // The API returns the full patient object inside `user.patient`
        if (user.patient) {
          setPatientData(user.patient);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = patientData?.name || "Patient User";
  const displayInitials = displayName.charAt(0).toUpperCase();

  const handleUpdateField = (field: string, value: string) => {
    setPatientData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase 'avatars' bucket (make sure this bucket exists and is public)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Call backend to save
      await authApi.updateAvatar(publicUrl);
      
      // Update local state
      setAvatarUrl(publicUrl);
      
      // Update local storage user data to reflect the new avatar
      const currentUser = getUser();
      if (currentUser) {
        setUser({ ...currentUser, avatarUrl: publicUrl });
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

  const handleSave = async () => {
    if (!patientData?.id) return;
    setSaving(true);
    try {
      await patientsApi.update(patientData.id, {
        name: patientData.name,
        phone: patientData.phone,
        nationalId: patientData.nationalId,
        address: patientData.address,
      });

      // Update local state and storage for immediate UI update
      const currentUser = getUser();
      if (currentUser) {
        setUser({ ...currentUser, name: patientData.name });
        // Notify layout/header to refresh user info
        window.dispatchEvent(new Event('user-profile-updated'));
      }

      toast.success(isRtl ? "تم حفظ التغييرات بنجاح!" : "Changes saved successfully!");
    } catch (error) {
      console.error("Update failed", error);
      toast.error(isRtl ? "فشل حفظ التغييرات" : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("profile")}</h1>
        </div>
        <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
          {isRtl ? "قم بتعديل بياناتك الشخصية" : "Manage your personal information"}
        </p>
      </div>

      {/* Avatar Section */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-4xl shrink-0 overflow-hidden shadow-inner border border-primary/20">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                displayInitials
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-primary hover:scale-110 transition-all disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Camera className="h-5 w-5" />
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
            <h2 className="text-xl font-extrabold text-slate-900">{displayName}</h2>
            <p className="text-slate-400 font-medium text-sm mt-1">{userEmail}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-bold">
              <Shield className="h-3.5 w-3.5" />
              {isRtl ? "حساب موثق" : "Verified Account"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            {isRtl ? "المعلومات الشخصية" : "Personal Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">{tAuth("fullname")}</Label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  value={patientData?.name || ""}
                  onChange={(e) => handleUpdateField("name", e.target.value)}
                  className={`h-12 rounded-xl border-slate-200 ${isRtl ? "pr-11" : "pl-11"}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">{tAuth("email")}</Label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  value={userEmail}
                  type="email"
                  disabled
                  className={`h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed ${isRtl ? "pr-11" : "pl-11"}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">{tAuth("phone")}</Label>
              <div className="relative">
                <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  value={patientData?.phone || ""}
                  onChange={(e) => handleUpdateField("phone", e.target.value)}
                  className={`h-12 rounded-xl border-slate-200 ${isRtl ? "pr-11" : "pl-11"}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">{tAuth("national_id")}</Label>
              <div className="relative">
                <CreditCard className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  value={patientData?.nationalId || ""}
                  onChange={(e) => handleUpdateField("nationalId", e.target.value)}
                  className={`h-12 rounded-xl border-slate-200 ${isRtl ? "pr-11" : "pl-11"}`}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-700 font-bold text-sm">{isRtl ? "العنوان" : "Address"}</Label>
              <div className="relative">
                <MapPin className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                <Input
                  value={patientData?.address || ""}
                  onChange={(e) => handleUpdateField("address", e.target.value)}
                  className={`h-12 rounded-xl border-slate-200 ${isRtl ? "pr-11" : "pl-11"}`}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className={`h-5 w-5 animate-spin ${isRtl ? "ml-2" : "mr-2"}`} />
              ) : (
                <Save className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
              )}
              {isRtl ? (saving ? "جاري الحفظ..." : "حفظ التغييرات") : (saving ? "Saving..." : "Save Changes")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            {isRtl ? "الأمان" : "Security"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">
                {isRtl ? "كلمة المرور الحالية" : "Current Password"}
              </Label>
              <Input type="password" className="h-12 rounded-xl border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">
                {isRtl ? "كلمة المرور الجديدة" : "New Password"}
              </Label>
              <Input type="password" className="h-12 rounded-xl border-slate-200" />
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-slate-200">
              <Shield className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
              {isRtl ? "تحديث كلمة المرور" : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
