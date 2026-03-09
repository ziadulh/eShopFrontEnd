"use client";

import Link from "next/link";
import { ShoppingBag, Search, User, Menu } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter text-blue-600"
          >
            FURNI<span className="text-slate-900 dark:text-white">SHOP</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link
              href="/shop"
              className="hover:text-blue-600 transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/about"
              className="hover:text-blue-600 transition-colors"
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <Search size={20} />
            </button>
            <Link
              href="/cart"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[10px] text-white flex items-center justify-center rounded-full font-bold animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Simple Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            © 2026 FurniShop. Crafting Comfort for your Home.
          </p>
        </div>
      </footer>
    </div>
  );
}
