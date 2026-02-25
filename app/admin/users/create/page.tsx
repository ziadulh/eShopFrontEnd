"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Shield,
  Mail,
  Lock,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
}

export default function CreateUserPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiClient.get("/roles");
        const rolesData = response.data.roles || response.data;

        if (Array.isArray(rolesData)) {
          setRoles(rolesData);
          if (rolesData.length > 0) {
            setFormData((prev) => ({ ...prev, role: rolesData[0].name }));
          }
        }
      } catch (err: any) {
        toast.error("Roles Loading Failed", {
          description: "Could not fetch roles from the backend server.",
        });
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) {
      toast.error("Required Field", {
        description: "Please select a user role.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/users", formData);
      toast.success("Success!", {
        description: `${formData.name} has been created as a ${formData.role}.`,
      });

      router.push("/admin/users");
      router.refresh();
    } catch (err: any) {
      toast.error("Creation Failed", {
        description:
          err.response?.data?.message ||
          "An error occurred while saving the user.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create User Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Setup identity and access permissions.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Full Name
            </label>
            <div className="relative">
              <UserPlus
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                required
                type="text"
                placeholder="e.g. Ziadul Haque"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                required
                type="email"
                placeholder="ziadul@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Temporary Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Role Selection (Dynamic) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              System Role
            </label>
            <div className="relative">
              <Shield
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <select
                disabled={isLoadingRoles}
                value={formData.role}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm transition-all appearance-none cursor-pointer disabled:opacity-50"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                {isLoadingRoles ? (
                  <option>Loading roles...</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown
                className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Link
              href="/admin/users"
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingRoles}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                "Save User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
