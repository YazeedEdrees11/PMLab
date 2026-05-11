"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { 
  testsApi 
} from "@/lib/api";
import { 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Loader2, 
  Activity, 
  ChevronRight,
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
} as const;

export default function TestsManagementPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    price: "",
    cost: ""
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await testsApi.getAll();
      setTests(data || []);
    } catch (error) {
      toast.error(isRtl ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (test: any = null) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        name: test.name || "",
        nameAr: test.nameAr || "",
        description: test.description || "",
        price: test.price?.toString() || "",
        cost: test.cost?.toString() || ""
      });
    } else {
      setEditingTest(null);
      setFormData({
        name: "",
        nameAr: "",
        description: "",
        price: "",
        cost: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost)
      };

      if (editingTest) {
        await testsApi.update(editingTest.id, payload);
        toast.success(isRtl ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await testsApi.create(payload);
        toast.success(isRtl ? "تمت الإضافة بنجاح" : "Added successfully");
      }
      setIsModalOpen(false);
      fetchTests();
    } catch (error) {
      toast.error(isRtl ? "فشل الحفظ" : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) return;
    try {
      await testsApi.delete(id);
      toast.success(isRtl ? "تم الحذف بنجاح" : "Deleted successfully");
      fetchTests();
    } catch (error) {
      toast.error(isRtl ? "فشل الحذف" : "Delete failed");
    }
  };

  const filteredTests = tests.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.nameAr?.includes(searchQuery)
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isRtl ? "إدارة الفحوصات" : "Tests Catalog"}
            </h1>
          </div>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
            {isRtl ? "إدارة قائمة الفحوصات الطبية، الأسعار، والتكاليف" : "Manage your medical tests library, pricing, and operational costs"}
          </p>
        </div>
        
        <Button 
          onClick={() => handleOpenModal()}
          className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 gap-2"
        >
          <Plus className="h-5 w-5" />
          {isRtl ? "إضافة فحص جديد" : "Add New Test"}
        </Button>
      </motion.div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: isRtl ? "إجمالي الفحوصات" : "Total Tests", value: tests.length, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
           { label: isRtl ? "متوسط السعر" : "Avg Price", value: `${(tests.reduce((acc, t) => acc + (t.price || 0), 0) / (tests.length || 1)).toFixed(1)} JOD`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
           { label: isRtl ? "متوسط الربح" : "Avg Margin", value: `${(tests.reduce((acc, t) => acc + ((t.price || 0) - (t.cost || 0)), 0) / (tests.length || 1)).toFixed(1)} JOD`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
         ].map((stat, i) => (
           <motion.div key={i} variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden group">
                 <CardContent className="p-6 flex items-center gap-5">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner", stat.bg, stat.color)}>
                       <stat.icon className="h-7 w-7" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                       <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                 </CardContent>
              </Card>
           </motion.div>
         ))}
      </div>

      {/* Filter & Search */}
      <motion.div variants={itemVariants}>
        <div className="relative group max-w-md">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <Input 
            placeholder={isRtl ? "البحث عن فحص..." : "Search for a test..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-14 pr-6 rounded-2xl border-0 bg-white shadow-xl shadow-slate-200/40 text-sm font-bold focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-slate-300"
          />
        </div>
      </motion.div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-[32px] bg-slate-100 animate-pulse" />
            ))
          ) : filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <motion.div 
                key={test.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-0 bg-white rounded-[32px] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                       <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                          <Activity className="h-7 w-7" />
                       </div>
                       <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/50">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-[10px] font-black">Active</span>
                       </div>
                    </div>

                    <div className="space-y-1 mb-8">
                       <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                          {isRtl ? (test.nameAr || test.name) : (test.name || test.nameAr)}
                       </h3>
                       <p className="text-xs text-slate-400 font-bold line-clamp-2 min-h-[2.5rem]">
                          {test.description || (isRtl ? "لا يوجد وصف متوفر" : "No description available")}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRtl ? "سعر البيع" : "Retail Price"}</p>
                          <p className="text-lg font-black text-slate-900">{test.price || 0} <span className="text-xs">JOD</span></p>
                       </div>
                       <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{isRtl ? "التكلفة" : "Lab Cost"}</p>
                          <p className="text-lg font-black text-blue-600">{test.cost || 0} <span className="text-xs">JOD</span></p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => handleOpenModal(test)}
                         className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white font-bold transition-all gap-2"
                       >
                          <Edit3 className="h-4 w-4" />
                          {isRtl ? "تعديل" : "Edit"}
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => handleDelete(test.id)}
                         className="h-12 w-12 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                       >
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="h-10 w-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-black text-slate-900">{isRtl ? "لا يوجد فحوصات" : "No Tests Found"}</h3>
               <p className="text-slate-400 font-bold mt-2">{isRtl ? "جرب البحث بكلمة مختلفة" : "Try searching with a different term"}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                      {editingTest ? <Edit3 size={28} /> : <Plus size={28} />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {editingTest ? (isRtl ? "تعديل الفحص" : "Edit Test") : (isRtl ? "إضافة فحص جديد" : "Add New Test")}
                      </h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {editingTest ? "Update test parameters" : "Configure new test entry"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-50">
                    <X size={24} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "الاسم (English)" : "Name (English)"}</label>
                      <Input 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-14 px-6 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "الاسم (العربية)" : "Name (Arabic)"}</label>
                      <Input 
                        required 
                        value={formData.nameAr}
                        onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                        className="h-14 px-6 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" 
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "الوصف" : "Description"}</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full min-h-[120px] p-6 rounded-[2rem] bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-sm resize-none" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "سعر البيع (JOD)" : "Retail Price (JOD)"}</label>
                      <div className="relative">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input 
                          type="number"
                          step="0.01"
                          required 
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-black text-lg" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRtl ? "التكلفة المخبرية (JOD)" : "Lab Cost (JOD)"}</label>
                      <div className="relative">
                        <AlertCircle className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input 
                          type="number"
                          step="0.01"
                          required 
                          value={formData.cost}
                          onChange={(e) => setFormData({...formData, cost: e.target.value})}
                          className="h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-black text-lg text-blue-600" 
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full h-16 rounded-[2rem] bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 mt-6 gap-3"
                  >
                    {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                    {editingTest ? (isRtl ? "حفظ التغييرات" : "Save Changes") : (isRtl ? "إضافة الفحص" : "Create Test")}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
