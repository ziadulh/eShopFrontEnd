"use client";

import { useState, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PermissionGuard from "@/components/PermissionGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-x-hidden transition-colors">
      <Suspense fallback={null}>
        <PermissionGuard />
      </Suspense>

      <Sidebar isOpen={isOpen} />

      {/* h-screen এবং overflow-y-auto যোগ করা হয়েছে যাতে বডি স্ক্রল করলেও হেডার আটকে থাকে */}
      <div
        className={`flex-1 flex flex-col h-screen w-full transition-all duration-300 ease-in-out overflow-y-auto
        ${isOpen ? "lg:pl-64" : "lg:pl-20"}`}
      >
        {/* হেডার কম্পোনেন্ট */}
        <Header toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-4 lg:p-8 flex-1 w-full max-w-full">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        <footer className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          © 2026 Admin Panel • Go-Gin Backend
        </footer>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
