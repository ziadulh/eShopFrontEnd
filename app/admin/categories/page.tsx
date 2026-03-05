"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Tag,
  Loader2,
  Trash2,
  FolderPlus,
  Activity,
  ChevronDown,
} from "lucide-react";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string; // নতুন ফিল্ড
  createdAt: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [status, setStatus] = useState("active"); // ডিফল্ট স্ট্যাটাস

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/public/categories");
      setCategories(res.data || []);
    } catch (err) {
      toast.error("Error", { description: "Failed to load categories." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat) return;
    setIsSubmitting(true);
    try {
      const slug = newCat
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      // name, slug এবং status পাঠানো হচ্ছে
      await apiClient.post("/admin/categories", {
        name: newCat,
        slug,
        status,
      });

      toast.success("Success", { description: "Category created." });
      setNewCat("");
      setStatus("active");
      fetchCategories();
    } catch (err: any) {
      toast.error("Failed", {
        description: err.response?.data?.error || "Error creating category.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Furniture Categories
          </h1>
          <p className="text-sm text-slate-500">
            Manage your shop item categories and their visibility status.
          </p>
        </div>
      </div>

      {/* Quick Add Form with Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form
          onSubmit={handleCreate}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Tag
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              required
              type="text"
              placeholder="Enter category name"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
          </div>

          {/* Status Select Field */}
          <div className="relative min-w-[140px]">
            <Activity
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm appearance-none cursor-pointer font-medium"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <FolderPlus size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {cat.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        cat.status === "active"
                          ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      }`}
                    >
                      {cat.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-400 text-sm"
                  >
                    No categories found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
