"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  Tag,
  Info,
  DollarSign,
  Database,
  ChevronDown,
  Activity,
  Percent,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    offeredPrice: 0,
    stock: 0,
    categoryId: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [permsRes, productRes] = await Promise.all([
          apiClient.get("/public/categories"),
          apiClient.get(`/admin/products/${id}`),
        ]);

        setCategories(permsRes.data || []);

        if (productRes.data) {
          const p = productRes.data;
          setFormData({
            name: p.name || "",
            price: p.price || 0,
            offeredPrice: p.offeredPrice || 0,
            stock: p.stock || 0,
            categoryId: p.categoryId || "",
            description: p.description || "",
            status: p.status || "active",
          });
        }
      } catch (err: any) {
        console.error("Error:", err);
        toast.error("Error", { description: "Failed to load product data." });
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/products/${id}`, {
        ...formData,
        price: Number(formData.price),
        offeredPrice: Number(formData.offeredPrice),
        stock: Number(formData.stock),
      });
      toast.success("Updated!", {
        description: "Furniture updated successfully.",
      });
      router.push("/admin/products");
    } catch (err: any) {
      toast.error("Update failed", {
        description: err.response?.data?.error || "Error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm text-slate-500 font-bold animate-pulse uppercase">
            Fetching Data...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 px-2 mt-4">
        <Link
          href="/admin/products"
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Edit Furniture
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Update inventory details for{" "}
            <span className="text-blue-600 font-bold">{formData.name}</span>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Package size={14} /> Product Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
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
                rows={6}
                value={formData.description}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium resize-none"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <Activity size={14} /> Visibility
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none appearance-none font-bold text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
                <ChevronDown
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <Tag size={14} /> Category
              </label>
              <div className="relative">
                <select
                  value={formData.categoryId}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none appearance-none font-bold text-sm"
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
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <DollarSign size={14} /> Regular Price
              </label>
              <input
                required
                type="number"
                value={formData.price}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-400 line-through font-bold text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-blue-600 uppercase tracking-[2px] flex items-center gap-2">
                <Percent size={14} /> Offered Price
              </label>
              <input
                required
                type="number"
                value={formData.offeredPrice}
                className="w-full px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 rounded-2xl outline-none font-black text-blue-600 text-sm"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    offeredPrice: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <Database size={14} /> Stock
              </label>
              <input
                required
                type="number"
                value={formData.stock}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold"
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Update Furniture"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
