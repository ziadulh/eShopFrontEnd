"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Search, ShieldCheck, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";

// ✅ নিশ্চিত করুন এখানে 'export default' আছে
export default function RoleListPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      const res = await apiClient.get("/roles");
      // আপনার ব্যাকএন্ড সরাসরি অ্যারে রিটার্ন করলে res.data হবে
      setRoles(Array.isArray(res.data) ? res.data : res.data.roles || []);
    } catch (err) {
      toast.error("Error", { description: "Failed to load roles." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete role "${name}"?`)) return;
    setIsDeleting(id);
    try {
      await apiClient.delete(`/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast.success("Deleted", { description: "Role removed successfully." });
    } catch (err) {
      toast.error("Error", { description: "Failed to delete role." });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Role Management
          </h1>
          <p className="text-sm text-slate-500">
            Define and manage system access levels.
          </p>
        </div>
        <Link
          href="/admin/roles/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} /> Create New Role
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search roles..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-blue-600"
                    size={24}
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Loading roles...
                  </p>
                </td>
              </tr>
            ) : filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <tr
                  key={role.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${role.status === "active" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      {role.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/roles/edit/${role.id}`)
                        }
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        disabled={isDeleting === role.id}
                        onClick={() => handleDelete(role.id, role.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                      >
                        {isDeleting === role.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
