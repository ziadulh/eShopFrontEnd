"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import {
  Loader2,
  ShoppingCart,
  ArrowLeft,
  Layers,
  Wand2,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.184:8080";

  useEffect(() => {
    if (!id) return;
    apiClient
      .get(`/public/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Product not found");
        router.push("/");
      });
  }, [id, router]);

  if (loading)
    return (
      <div className="flex h-[70vh] items-center justify-center flex-col gap-4 text-slate-900 dark:text-slate-100">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">
          Loading Details...
        </p>
      </div>
    );

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/placeholder-furniture.png"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 sm:mb-8 font-semibold text-sm transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Collections
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          {/* Main Image Container */}
          <div className="w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex items-center justify-center">
            <img
              src={`${BASE_URL}${images[selectedImage]}`}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-lg hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 bg-white dark:bg-slate-900 p-1.5 sm:p-2 transition-all duration-300 ${
                    selectedImage === index
                      ? "border-blue-600 shadow-lg scale-105"
                      : "border-slate-100 dark:border-slate-800 hover:border-blue-300"
                  }`}
                >
                  <img
                    src={`${BASE_URL}${img}`}
                    alt="thumbnail"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="space-y-6 lg:space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] sm:text-[11px] font-black text-blue-600 uppercase tracking-widest">
              {product.material || "Premium Build"}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-slate-200/50 dark:border-slate-700">
                <Layers size={10} />{" "}
                {product.category?.name || "General Furniture"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                  product.stock > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/50"
                    : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200/50"
                }`}
              >
                <Wand2 size={10} />{" "}
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Pricing & Add to Cart Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  Special Price
                </p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    ৳{product.offeredPrice?.toLocaleString()}
                  </p>
                  {product.price > product.offeredPrice && (
                    <p className="text-xs sm:text-sm text-slate-400 font-medium line-through">
                      ৳{product.price?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={18} />
                <span className="truncate">
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> Product Description
            </h4>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                "No description available for this magnificent piece of furniture."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
