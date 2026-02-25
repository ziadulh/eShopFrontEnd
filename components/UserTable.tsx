"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Search, UserPlus, X, Shield } from "lucide-react";
import apiClient from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";

export default function UserTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("user"); // Your login save logic
    if (saved) {
      const { permissions } = JSON.parse(saved);
      setPermissions(permissions || []);
    }
  }, []);

  useEffect(() => {
    if (initialUsers.length === 0) {
      toast.warning("No users found", {
        description:
          "Either the list is empty or your permissions are limited.",
      });
    }
  }, [initialUsers]);

  const hasPerm = (p: string) => permissions.includes(p);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      {/* Search & Add Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {hasPerm("users.store") && (
          <Link
            href="/admin/users/create"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus size={18} /> Add New User
          </Link>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Identity
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Access Role
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                      {user.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {user.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Shield size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {hasPerm("users.update") && (
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                        <Edit size={16} />
                      </button>
                    )}
                    {hasPerm("users.destroy") && (
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer (The Modal) */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-950 z-[70] shadow-2xl border-l border-slate-200 dark:border-slate-800 p-8 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold dark:text-white">Create User</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            {/* Form logic would go here */}
            <p className="text-slate-500 text-sm italic">
              Connect your Go API /users/store here...
            </p>
          </div>
        </>
      )}
    </div>
  );
}
