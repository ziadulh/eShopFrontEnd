"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Layers,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/public/products");
      setProducts(res.data || []);
    } catch (err) {
      toast.error("Error", { description: "Failed to load products." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiClient.delete(`/admin/products/${id}`);
      toast.success("Deleted", {
        description: "Product removed successfully.",
      });
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Furniture Stock
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage your inventory and product pricing.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-500/25"
        >
          <Plus size={20} />
          <span>New Product</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-32 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">
              Updating Inventory...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                    Item Details
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                    Category
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                    Stock Status
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                    Price (Unit)
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {products.map((product) => (
                  <tr
                    key={product._id || product.id}
                    className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                          <ImageIcon size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {product.material || "Premium Quality"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase">
                        <Layers size={12} />{" "}
                        {product.category?.name || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold">
                      <span
                        className={
                          product.stock < 10
                            ? "text-orange-500"
                            : "text-slate-600"
                        }
                      >
                        {product.stock} Units
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-blue-600 dark:text-blue-400 text-sm">
                      ৳{product.offeredPrice?.toLocaleString()}
                      <span className="ml-2 text-[10px] text-slate-400 line-through">
                        ৳{product.price?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product._id || product.id}`}
                          className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(product._id || product.id)
                          }
                          className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
