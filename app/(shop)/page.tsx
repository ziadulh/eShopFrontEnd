"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import ProductCard from "@/components/shop/ProductCard";
import { Layers, Sparkles } from "lucide-react";

export default function ShopHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          apiClient.get("/public/products"),
          apiClient.get("/public/categories"),
        ]);
        setProducts(pRes.data || []);
        setCategories(cRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (p) =>
            p.categoryId === activeCategory ||
            p.category?.id === activeCategory,
        );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      {/* Hero Section */}
      <header className="relative py-20 px-6 rounded-[40px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 overflow-hidden text-center space-y-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-full text-[10px] font-black uppercase tracking-[2px] text-blue-600">
          <Sparkles size={14} /> New Season Collection
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
          Design Your <br /> <span className="text-blue-600">Dream Space.</span>
        </h1>

        <p className="max-w-lg mx-auto text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
          Discover handcrafted furniture that combines timeless elegance with
          modern comfort.
        </p>
      </header>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === "all" ? "bg-slate-900 text-white shadow-xl" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500"}`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat._id}
            onClick={() => setActiveCategory(cat.id || cat._id)}
            className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === (cat.id || cat._id) ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-[32px]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold uppercase tracking-widest">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
