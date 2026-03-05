"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  Tag,
  Info,
  DollarSign,
  Database,
  ChevronDown,
  Percent,
  Activity,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: 0, // Regular Price
    offeredPrice: 0, // Sale Price
    stock: 0,
    categoryId: "",
    description: "",
    material: "",
    status: "active", // Default status
  });

  useEffect(() => {
    apiClient
      .get("/public/categories")
      .then((res) => setCategories(res.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error("Category selection required");

    setIsSubmitting(true);
    try {
      await apiClient.post("/admin/products", {
        ...formData,
        price: Number(formData.price),
        offeredPrice: Number(formData.offeredPrice),
        stock: Number(formData.stock),
      });
      toast.success("Added!", {
        description: "Furniture added to collection.",
      });
      router.push("/admin/products");
    } catch (err: any) {
      toast.error("Failed", {
        description: err.response?.data?.error || "Error saving product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 px-2">
        <Link
          href="/admin/products"
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Add Furniture
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Configure pricing, discounts, and inventory.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Package size={14} /> Product Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Minimalist Velvet Sofa"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Info size={14} /> Description
              </label>
              <textarea
                rows={5}
                placeholder="Describe the comfort, style, and quality..."
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium resize-none"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-6">
            {/* Status Field */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Activity size={14} /> Visibility Status
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
                <ChevronDown
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Category Field */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Tag size={14} /> Category
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Pricing Logic */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                  <DollarSign size={14} /> Regular Price
                </label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 5000"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium text-slate-400 line-through"
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                  <Percent size={14} /> Offered Price
                </label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 4200"
                  className="w-full px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black text-blue-600"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offeredPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Database size={14} /> Stock Available
              </label>
              <input
                required
                type="number"
                placeholder="0"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold"
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Publish Furniture"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
