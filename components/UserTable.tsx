"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Search, Shield, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

export default function UserTable({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPermissions(parsed.permissions || []);
    }
    setUsers(initialUsers); // Sync with server data
  }, [initialUsers]);

  const hasPerm = (p: string) => permissions.includes(p);

  // 🗑️ ডিলিট ফাংশন
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setIsDeleting(id);
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Deleted!", { description: `${name} has been removed.` });
    } catch (err: any) {
      toast.error("Delete Failed", { description: "Could not remove user." });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Identity
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Access Role
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-500">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Shield size={14} />
                    <span className="text-xs font-bold uppercase">
                      {user.role || "User"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {hasPerm("users.update") && (
                      <button
                        onClick={() =>
                          router.push(`/admin/users/edit/${user.id}`)
                        }
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {hasPerm("users.destroy") && (
                      <button
                        disabled={isDeleting === user.id}
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                      >
                        {isDeleting === user.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
