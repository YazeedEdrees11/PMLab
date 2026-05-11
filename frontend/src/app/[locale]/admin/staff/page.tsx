"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, Mail, Trash2, Edit, Loader2, ShieldCheck, Building2, 
  CheckCircle2, Search, Users, Shield, X, Save, KeyRound
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } }
};

interface Branch { id: string; name: string; nameAr: string; }
interface StaffUser {
  id: string; email: string; name?: string; role: string;
  branchId: string | null; branch?: Branch; createdAt: string;
}

export default function StaffPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("ADMIN");
  const [newBranch, setNewBranch] = useState<string>("super_admin");
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  const fetchData = async () => {
    try {
      const [usersData, branchesData] = await Promise.all([
        apiFetch("/users"), apiFetch("/branches")
      ]);
      setStaff(usersData.filter((u: any) => u.role === 'ADMIN' || u.role === 'STAFF'));
      setBranches(branchesData);
    } catch { toast.error(isRtl ? "فشل تحميل البيانات" : "Failed to load data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddStaff = async () => {
    if (!newEmail || !newPassword) {
      toast.error(isRtl ? "يرجى ملء البريد وكلمة المرور" : "Email and password required");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          email: newEmail, password: newPassword, name: newName || undefined,
          role: newRole, branchId: newBranch === "super_admin" ? null : newBranch
        })
      });
      toast.success(isRtl ? "تم إضافة الموظف بنجاح" : "Staff added successfully");
      setIsAddOpen(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("ADMIN"); setNewBranch("super_admin");
      fetchData();
    } catch { toast.error(isRtl ? "فشل في إضافة الموظف" : "Failed to add staff"); }
    finally { setSubmitting(false); }
  };

  const openEdit = (user: StaffUser) => {
    setEditUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email);
    setEditBranch(user.branchId || "super_admin");
    setEditRole(user.role);
    setEditPassword("");
  };

  const handleEditStaff = async () => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      const payload: any = { name: editName, email: editEmail, role: editRole, branchId: editBranch === "super_admin" ? null : editBranch };
      if (editPassword) payload.password = editPassword;
      await apiFetch(`/users/${editUser.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      toast.success(isRtl ? "تم تحديث البيانات" : "Staff updated");
      setEditUser(null);
      fetchData();
    } catch { toast.error(isRtl ? "فشل التحديث" : "Update failed"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/users/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(isRtl ? "تم الحذف بنجاح" : "Deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch { toast.error(isRtl ? "فشل في الحذف" : "Failed to delete"); }
  };

  const filtered = staff.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const superAdmins = staff.filter(u => !u.branchId);
  const branchAdmins = staff.filter(u => u.branchId);

  if (loading) {
    return (<div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>);
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10 pb-20">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? "إدارة الطاقم" : "Staff Management"}</h1>
          </div>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
            {isRtl ? "إضافة وتعديل وحذف حسابات الموظفين وتحديد صلاحياتهم لكل فرع" : "Manage staff accounts, roles, and branch assignments"}
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 gap-3 hover:scale-105 active:scale-95 transition-all bg-primary hover:bg-primary/90">
              <UserPlus className="h-5 w-5" />{isRtl ? "موظف جديد" : "New Staff"}
            </Button>
          } />
          <DialogContent className="sm:max-w-[450px] rounded-[32px] border-0 shadow-2xl p-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-black">{isRtl ? "إضافة موظف جديد" : "Create Staff Account"}</DialogTitle>
              <DialogDescription className="font-bold text-slate-400">{isRtl ? "أدخل بيانات الموظف لإنشاء حساب جديد" : "Enter staff details"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "الاسم الكامل" : "Full Name"}</label>
                <Input className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" placeholder={isRtl ? "أدخل الاسم" : "Staff name"} value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "البريد الإلكتروني" : "Email"}</label>
                <Input className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" placeholder="name@pmlab.jo" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "كلمة المرور" : "Password"}</label>
                <Input type="password" className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "الدور" : "Role"}</label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ADMIN" className="font-bold">{isRtl ? "مدير" : "Admin"}</SelectItem>
                      <SelectItem value="STAFF" className="font-bold">{isRtl ? "موظف" : "Staff"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "الفرع" : "Branch"}</label>
                  <Select value={newBranch} onValueChange={setNewBranch}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="super_admin" className="font-bold">{isRtl ? "كل الفروع" : "All Branches"}</SelectItem>
                      {branches.map(b => <SelectItem key={b.id} value={b.id} className="font-medium">{isRtl ? b.nameAr : b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddStaff} disabled={submitting} className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (isRtl ? "تأكيد الإضافة" : "Create Account")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: isRtl ? "إجمالي الطاقم" : "Total Staff", value: staff.length, icon: Users, color: "primary" },
          { label: isRtl ? "سوبر أدمن" : "Super Admins", value: superAdmins.length, icon: Shield, color: "slate-900" },
          { label: isRtl ? "مدراء فروع" : "Branch Managers", value: branchAdmins.length, icon: Building2, color: "emerald-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
        <Input
          className="h-14 pl-12 rounded-2xl bg-white border-slate-100 font-bold text-base shadow-sm"
          placeholder={isRtl ? "ابحث بالاسم أو البريد..." : "Search by name or email..."}
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((user) => (
          <motion.div key={user.id} variants={itemVariants} whileHover={{ y: -8 }} transition={{ duration: 0.4 }}>
            <Card className="border-0 bg-white rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
              <CardContent className="p-0">
                <div className={`h-24 w-full relative ${user.branchId ? 'bg-gradient-to-r from-primary/10 to-primary/5' : 'bg-gradient-to-r from-slate-900/10 to-slate-900/5'}`}>
                  <div className="absolute top-6 right-6">
                    <div className={`h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${user.branchId ? 'text-primary' : 'text-slate-900'}`}>
                      {user.branchId ? <Building2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    </div>
                  </div>
                  <div className="absolute top-6 left-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'ADMIN' ? (isRtl ? 'مدير' : 'Admin') : (isRtl ? 'موظف' : 'Staff')}
                    </span>
                  </div>
                </div>
                <div className="px-8 pb-8 -mt-10">
                  <div className="mb-6">
                    <div className="relative inline-block">
                      <div className="h-24 w-24 rounded-[32px] bg-white p-1.5 shadow-xl">
                        <div className={`h-full w-full rounded-[26px] flex items-center justify-center text-3xl font-black ${user.branchId ? 'bg-primary/10 text-primary' : 'bg-slate-900/10 text-slate-900'}`}>
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white p-1 shadow-md">
                        <div className="h-full w-full rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900 text-xl truncate">{user.name || user.email.split('@')[0]}</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="h-3 w-3" />{user.email}
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "موقع العمل" : "Branch"}</span>
                        <span className="text-xs font-bold text-slate-600">
                          {user.branchId ? (isRtl ? user.branch?.nameAr : user.branch?.name) : (isRtl ? "إدارة النظام" : "System HQ")}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{isRtl ? "تاريخ الانضمام" : "Joined"}</span>
                        <span className="text-xs font-bold text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString(isRtl ? 'ar-JO' : 'en-US', { year: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button variant="ghost" onClick={() => openEdit(user)} className="h-12 px-6 bg-slate-50 hover:bg-primary hover:text-white text-slate-600 font-black text-[10px] uppercase tracking-[0.15em] rounded-2xl flex-1 transition-all">
                        <Edit className="h-4 w-4 mr-2 ml-2" />{isRtl ? "تعديل" : "Edit"}
                      </Button>
                      <Button variant="ghost" onClick={() => setDeleteTarget(user)} className="h-12 w-12 p-0 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">{isRtl ? "لا يوجد موظفين مطابقين للبحث" : "No staff found"}</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px] border-0 shadow-2xl p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-black">{isRtl ? "تعديل بيانات الموظف" : "Edit Staff"}</DialogTitle>
            <DialogDescription className="font-bold text-slate-400">{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "الاسم" : "Name"}</label>
              <Input className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "البريد" : "Email"}</label>
              <Input className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "الدور" : "Role"}</label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ADMIN" className="font-bold">{isRtl ? "مدير" : "Admin"}</SelectItem>
                    <SelectItem value="STAFF" className="font-bold">{isRtl ? "موظف" : "Staff"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? "الفرع" : "Branch"}</label>
                <Select value={editBranch} onValueChange={setEditBranch}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="super_admin" className="font-bold">{isRtl ? "كل الفروع" : "All"}</SelectItem>
                    {branches.map(b => <SelectItem key={b.id} value={b.id} className="font-medium">{isRtl ? b.nameAr : b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <KeyRound className="h-3 w-3" />{isRtl ? "كلمة مرور جديدة (اختياري)" : "New Password (optional)"}
              </label>
              <Input type="password" className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" placeholder="••••••••" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setEditUser(null)} className="h-12 rounded-2xl font-bold">{isRtl ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleEditStaff} disabled={submitting} className="h-12 rounded-2xl font-black flex-1 gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />{isRtl ? "حفظ التغييرات" : "Save"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] p-8 max-w-sm w-full mx-4 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{isRtl ? "تأكيد الحذف" : "Confirm Delete"}</h3>
                <p className="text-sm text-slate-500 font-medium mb-1">{isRtl ? "هل أنت متأكد من حذف حساب" : "Delete account for"}</p>
                <p className="text-sm font-black text-slate-900 mb-6">{deleteTarget.name || deleteTarget.email}</p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 h-12 rounded-2xl font-bold">{isRtl ? "تراجع" : "Cancel"}</Button>
                  <Button onClick={handleDeleteStaff} className="flex-1 h-12 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white">{isRtl ? "نعم، احذف" : "Delete"}</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
