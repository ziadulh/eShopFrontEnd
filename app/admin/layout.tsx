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
    // We add overflow-x-hidden here to kill any potential horizontal scroll
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-x-hidden transition-colors">
      {/* 1. Sidebar */}
      <Sidebar isOpen={isOpen} />

      {/* 2. Main Content Area */}
      {/* We use 'w-full' to ensure it doesn't expand beyond 100vw */}
      <div
        className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out 
        ${isOpen ? "lg:pl-64" : "lg:pl-20"}`}
      >
        <Header toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-4 lg:p-8 flex-1 w-full max-w-full">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <footer className="p-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          © 2026 Admin Panel • Go-Gin Backend
        </footer>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
