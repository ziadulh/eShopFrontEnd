"use client";

import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.184:8080";

  const displayImage =
    product.images && product.images.length > 0
      ? `${BASE_URL}${product.images[0]}`
      : "/placeholder-furniture.png";

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/3] p-4 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Discount Badge */}
        {product.price > product.offeredPrice && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-sm">
            -
            {Math.round(
              ((product.price - product.offeredPrice) / product.price) * 100,
            )}
            %
          </span>
        )}

        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        <Link
          href={`/product/${product.id || product._id}`}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        >
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white">
            <Eye size={20} />
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            {product.material || "Premium Wood"}
          </p>
          <Link href={`/product/${product.id || product._id}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-black text-slate-900 dark:text-white">
              ৳{product.offeredPrice.toLocaleString()}
            </span>
            {product.price > product.offeredPrice && (
              <span className="text-xs text-slate-400 line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => addToCart(product)}
          className="w-full h-11 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-600 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          disabled={product.stock <= 0}
        >
          <ShoppingCart size={16} />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
