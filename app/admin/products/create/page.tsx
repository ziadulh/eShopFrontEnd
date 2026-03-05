"use client";

import { useState, useEffect, useRef } from "react";
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
  Image as ImageIcon,
  Wand2,
  X,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    offeredPrice: 0,
    stock: 0,
    categoryId: "",
    description: "",
    material: "",
    status: "active",
  });

  useEffect(() => {
    apiClient
      .get("/public/categories")
      .then((res) => setCategories(res.data || []));
  }, []);

  // ইমেজ হ্যান্ডলিং
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error("Category selection required");
    if (selectedFiles.length === 0)
      return toast.error("At least one product image is required");

    setIsSubmitting(true);

    // ✅ Multipart/Form-Data তৈরির জন্য FormData ব্যবহার
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("material", formData.material);
    data.append("price", String(formData.price));
    data.append("offeredPrice", String(formData.offeredPrice));
    data.append("stock", String(formData.stock));
    data.append("categoryId", formData.categoryId);
    data.append("status", formData.status);

    // ফাইলগুলো যোগ করা
    selectedFiles.forEach((file) => {
      data.append("images", file);
    });

    try {
      await apiClient.post("/admin/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
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
            Configure images, pricing, and material.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <ImageIcon size={14} /> Product Gallery
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} />
                </div>
                <p className="text-sm font-bold">
                  Click to upload product images
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-black">
                  PNG, JPG or WebP (Max 5MB)
                </p>
                <input
                  type="file"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              {/* Preview Grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 animate-in zoom-in-95 duration-300">
                  {previews.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group"
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Package size={14} /> Product Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Minimalist Velvet Sofa"
                className="w-full h-10 px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
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
                rows={4}
                placeholder="Describe the product..."
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium resize-none"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Activity size={14} /> Visibility Status
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full h-10 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none appearance-none font-bold text-sm"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Tag size={14} /> Category
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full h-10 px-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none appearance-none font-bold text-sm"
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

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Wand2 size={14} /> Material
              </label>
              <input
                type="text"
                placeholder="e.g. Teak Wood"
                className="w-full h-10 px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
                onChange={(e) =>
                  setFormData({ ...formData, material: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                  <DollarSign size={14} /> Regular Price
                </label>
                <input
                  required
                  type="number"
                  className="w-full h-10 px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
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
                  className="w-full h-10 px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 rounded-2xl outline-none text-sm font-black text-blue-600"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offeredPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <Database size={14} /> Stock
              </label>
              <input
                required
                type="number"
                className="w-full h-10 px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl outline-none text-sm font-bold"
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
