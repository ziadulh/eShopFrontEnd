"use client";

import { useCart } from "@/context/CartContext";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const regularTotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const discountedTotal = cart.reduce(
    (acc, item) => acc + Number(item.offeredPrice) * item.quantity,
    0,
  );
  const totalSavings = regularTotal - discountedTotal;

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.184:8080";

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
            <ShoppingCart size={60} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-slate-500 mb-8">
          Looks like you haven't added any furniture yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          <ArrowLeft size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-500">
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 tracking-tighter">
        Shopping Cart{" "}
        <span className="text-lg font-medium text-slate-400">
          ({cart.length} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              {/* Product Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-2 flex-shrink-0">
                <img
                  src={
                    item.image
                      ? `${BASE_URL}${item.image}`
                      : "/placeholder-furniture.png"
                  }
                  alt={item.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-furniture.png";
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base tracking-tight">
                  {item.name}
                </h3>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                  {item.material || "Premium Furniture"}
                </p>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200/50 dark:border-slate-700">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:text-blue-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:text-blue-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-black text-slate-900 dark:text-white text-sm sm:text-lg">
                  ৳
                  {(Number(item.offeredPrice) * item.quantity).toLocaleString()}
                </p>
                {item.price > item.offeredPrice && (
                  <p className="text-[10px] sm:text-xs text-slate-400 line-through">
                    ৳{(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                )}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors mt-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors pt-2"
          >
            Clear All Items
          </button>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl sticky top-24 shadow-xl">
            <h2 className="text-xl font-black mb-6 border-b border-slate-800 pb-4">
              Order Summary
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Regular Total</span>
                <span className="line-through">
                  ৳{regularTotal.toLocaleString()}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-400 text-sm font-bold">
                  <span>Savings</span>
                  <span>- ৳{totalSavings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 text-sm">
                <span>Delivery Charge</span>
                <span className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">
                  Free
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-lg font-bold">Total Payable</span>
                <span className="text-3xl font-black text-blue-400 tracking-tighter">
                  ৳{discountedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20 group active:scale-[0.98]"
            >
              PROCEED TO CHECKOUT
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

            <p className="text-[10px] text-center text-slate-500 mt-6 uppercase tracking-[3px] font-bold">
              Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
