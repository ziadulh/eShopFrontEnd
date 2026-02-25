"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black flex overflow-x-hidden transition-colors">
      <Sidebar isOpen={isOpen} />

      <div
        className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out 
        ${isOpen ? "lg:pl-64" : "lg:pl-20"}`}
      >
        <Header toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-4 lg:p-8 flex-1 w-full max-w-full">
          {/* Content Entrance Animation */}
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        <footer className="p-4 text-center text-xs font-medium text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black transition-colors">
          © 2026 Admin Panel • Go-Gin Backend
        </footer>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
