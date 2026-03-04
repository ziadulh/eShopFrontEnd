"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Check,
  CheckSquare,
  Square,
  ChevronDown,
  Activity,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

export default function CreateRolePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPerms, setIsLoadingPerms] = useState(true);

  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    [],
  );
  const [formData, setFormData] = useState({
    name: "",
    status: "active", // Default status
    permissions: [] as string[],
  });

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const res = await apiClient.get("/permissions");
        setAvailablePermissions(res.data.permissions || []);
      } catch (err) {
        toast.error("Error", {
          description: "Failed to load permissions from server.",
        });
      } finally {
        setIsLoadingPerms(false);
      }
    };
    fetchPerms();
  }, []);

  const categories = Array.from(
    new Set(availablePermissions.map((p) => p.split(".")[0])),
  );

  const togglePermission = (perm: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleCategory = (cat: string) => {
    const catPerms = availablePermissions.filter((p) => p.startsWith(cat));
    const allSelected = catPerms.every((p) => formData.permissions.includes(p));

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !p.startsWith(cat)),
      }));
    } else {
      const otherPerms = formData.permissions.filter((p) => !p.startsWith(cat));
      setFormData((prev) => ({
        ...prev,
        permissions: [...otherPerms, ...catPerms],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Role name is required");

    setIsSubmitting(true);
    try {
      await apiClient.post("/roles", formData);
      toast.success("Created!", {
        description: "New role has been added successfully.",
      });
      router.push("/admin/roles");
    } catch (err: any) {
      toast.error("Failed", {
        description: err.response?.data?.error || "Error creating role.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 px-1">
        <Link
          href="/admin/roles"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create New Role
          </h1>
          <p className="text-sm text-slate-500">
            Define role name, status and select system permissions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
          {/* Role Name Input Field */}
          <div className="space-y-3 w-full">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              Role Name
            </label>
            <div className="relative w-full">
              <input
                required
                type="text"
                value={formData.name}
                placeholder="e.g. System Administrator"
                className="w-full pl-12 pr-6 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status Field */}
          <div className="space-y-3 w-full">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              Account Status
            </label>
            <div className="relative w-full">
              <select
                value={formData.status}
                className="w-full pl-12 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base transition-all appearance-none cursor-pointer"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Categories */}
        {isLoadingPerms ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm text-slate-400">Loading permissions...</p>
          </div>
        ) : (
          categories.map((cat) => {
            const catPerms = availablePermissions.filter((p) =>
              p.startsWith(cat),
            );
            const isAllSelected = catPerms.every((p) =>
              formData.permissions.includes(p),
            );

            return (
              <div key={cat} className="space-y-4 mt-10 first:mt-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 ml-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                    {cat} Permissions
                  </h3>
                  {/* ✅ Select All Button */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors"
                  >
                    {isAllSelected ? (
                      <>
                        <CheckSquare size={14} /> Deselect All
                      </>
                    ) : (
                      <>
                        <Square size={14} /> Select All
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catPerms.map((perm) => (
                    <div
                      key={perm}
                      onClick={() => togglePermission(perm)}
                      className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        formData.permissions.includes(perm)
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {perm.split(".")[1].toUpperCase()}
                        </p>
                        <p className="text-[10px] text-slate-400">{perm}</p>
                      </div>
                      {formData.permissions.includes(perm) && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/admin/roles"
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingPerms}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
