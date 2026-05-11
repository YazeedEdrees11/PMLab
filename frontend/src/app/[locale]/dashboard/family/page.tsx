"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  Calendar, 
  Fingerprint, 
  Heart,
  Baby,
  User,
  MoreVertical,
  X,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { familyApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const relations = [
  { value: "Son", label: "ابن", labelEn: "Son", icon: Baby },
  { value: "Daughter", label: "ابنة", labelEn: "Daughter", icon: Baby },
  { value: "Spouse", label: "زوج/زوجة", labelEn: "Spouse", icon: Heart },
  { value: "Parent", label: "أب/أم", labelEn: "Parent", icon: User },
  { value: "Other", label: "آخر", labelEn: "Other", icon: Users },
];

export default function FamilyPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [family, setFamily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    relation: "Son",
    nationalId: "",
    dob: "",
    gender: "Male"
  });

  const fetchFamily = async () => {
    try {
      const data = await familyApi.getAll();
      setFamily(data);
    } catch (error) {
      toast.error(isRtl ? "فشل تحميل قائمة العائلة" : "Failed to load family list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      await familyApi.create(formData);
      toast.success(isRtl ? "تم إضافة فرد العائلة بنجاح" : "Family member added successfully");
      setIsAdding(false);
      setFormData({ name: "", relation: "Son", nationalId: "", dob: "", gender: "Male" });
      fetchFamily();
    } catch (error) {
      toast.error(isRtl ? "فشل إضافة الفرد" : "Failed to add member");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await familyApi.delete(id);
      toast.success(isRtl ? "تم الحذف بنجاح" : "Deleted successfully");
      fetchFamily();
    } catch (error) {
      toast.error(isRtl ? "فشل الحذف" : "Deletion failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-3 w-10 rounded-full bg-primary" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {isRtl ? "أفراد العائلة" : "Family Members"}
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-lg">
            {isRtl ? "أضف أفراد عائلتك لتتمكن من الحجز لهم ومتابعة نتائجهم" : "Add your family members to book for them and track their results"}
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="h-14 px-8 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20"
        >
          <Plus className="h-5 w-5" />
          {isRtl ? "إضافة فرد جديد" : "Add New Member"}
        </Button>
      </div>

      {/* Add Form Modal/Section */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
              <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-3 text-primary">
                    <UserPlus className="h-6 w-6" />
                    {isRtl ? "بيانات فرد العائلة" : "Family Member Details"}
                  </CardTitle>
                </div>
                <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{isRtl ? "الاسم الكامل" : "Full Name"}</label>
                    <Input 
                      required
                      placeholder={isRtl ? "مثال: أحمد محمد..." : "e.g. Ahmed Mohamed..."}
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold text-lg focus:bg-white"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{isRtl ? "الصلة" : "Relation"}</label>
                    <div className="flex flex-wrap gap-2">
                       {relations.map(rel => (
                         <button
                          key={rel.value}
                          type="button"
                          onClick={() => setFormData({...formData, relation: rel.value})}
                          className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border-2",
                            formData.relation === rel.value 
                              ? "bg-primary/5 text-primary border-primary" 
                              : "bg-slate-50 text-slate-500 border-transparent hover:border-slate-100"
                          )}
                         >
                           <rel.icon className="h-4 w-4" />
                           {isRtl ? rel.label : rel.labelEn}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{isRtl ? "الرقم الوطني (اختياري)" : "National ID (Optional)"}</label>
                    <Input 
                      placeholder="99XXXXXXXX"
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold text-lg focus:bg-white"
                      value={formData.nationalId}
                      onChange={e => setFormData({...formData, nationalId: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{isRtl ? "تاريخ الميلاد" : "Date of Birth"}</label>
                    <Input 
                      type="date"
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold text-lg focus:bg-white"
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                     <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="h-14 px-8 rounded-xl font-black text-slate-400 hover:text-slate-600">
                        {isRtl ? "إلغاء" : "Cancel"}
                     </Button>
                     <Button type="submit" className="h-14 px-12 rounded-xl font-black shadow-xl shadow-primary/20">
                        {isRtl ? "حفظ البيانات" : "Save Member"}
                     </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {family.map((member) => (
          <motion.div
            key={member.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-lg shadow-slate-100 rounded-[32px] overflow-hidden bg-white group hover:shadow-2xl hover:shadow-primary/5 transition-all">
               <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="h-16 w-16 rounded-[22px] bg-primary/5 text-primary flex items-center justify-center shadow-inner">
                        <User className="h-8 w-8" />
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="h-10 w-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                  </div>

                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{member.name}</h3>
                     <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                           {isRtl ? relations.find(r => r.value === member.relation)?.label : member.relation}
                        </span>
                        {member.dob && (
                          <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                             <Calendar className="h-3 w-3" />
                             {new Date(member.dob).toLocaleDateString(locale)}
                          </span>
                        )}
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "الرقم الوطني" : "National ID"}</p>
                        <p className="text-sm font-black text-slate-600">{member.nationalId || "---"}</p>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5" />
                     </div>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}

        {family.length === 0 && !loading && !isAdding && (
          <div className="col-span-full py-32 text-center space-y-6">
             <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Users className="h-12 w-12" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900">{isRtl ? "لا يوجد أفراد عائلة حالياً" : "No family members added yet"}</h3>
                <p className="text-slate-400 font-bold mt-2">{isRtl ? "ابدأ بإضافة أفراد عائلتك لتسهيل عملية الحجز" : "Start adding your family members to simplify the booking process"}</p>
             </div>
             <Button onClick={() => setIsAdding(true)} variant="outline" className="h-14 px-8 rounded-xl border-2 font-black">
                {isRtl ? "إضافة أول فرد الآن" : "Add Your First Member Now"}
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
