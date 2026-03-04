"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, UserPlus, Shield, Mail, Lock, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

interface Role { id: string; name: string; }

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // ঐচ্ছিক, ফাঁকা রাখলে আপডেট হবে না
    roleId: "",
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        // ১. রোলস ফেচ করা
        const rolesRes = await apiClient.get("/roles");
        setRoles(rolesRes.data.roles || rolesRes.data);

        // ২. ইউজারের বর্তমান ডাটা ফেচ করা
        const userRes = await apiClient.get(`/users/${id}`);
        const u = userRes.data;
        setFormData({
          name: u.name,
          email: u.email,
          password: "",
          roleId: u.roleId || "",
        });
      } catch (err) {
        toast.error("Error", { description: "Failed to load user data." });
        router.push("/admin/users");
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ব্যাকএন্ডের Update কন্ট্রোলার অনুযায়ী ডাটা পাঠানো
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // পাসওয়ার্ড না দিলে সেটা বাদ দেওয়া

      await apiClient.put(`/users/${id}`, payload);
      toast.success("Updated!", { description: "User profile has been updated." });
      router.push("/admin/users");
      router.refresh();
    } catch (err: any) {
      toast.error("Update Failed", { description: err.response?.data?.error || "Error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Edit User Account</h1>
          <p className="text-sm text-slate-500">Update account info and permissions.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 text-slate-400" size={18} />
              <input required type="text" value={formData.name} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input required type="email" value={formData.email} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Update Password (Optional)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="password" placeholder="Leave blank to keep current" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">System Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-slate-400" size={18} />
              <select value={formData.roleId} className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none appearance-none" onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t dark:border-slate-800 mt-4">
            <Link href="/admin/users" className="px-6 py-2.5 text-sm font-bold text-slate-500">Cancel</Link>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}