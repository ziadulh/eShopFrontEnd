"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShieldCheck, Settings } from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Users", icon: Users, href: "/admin/users" },
  { name: "Roles", icon: ShieldCheck, href: "/admin/roles" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-slate-900 dark:bg-black text-white transition-all duration-300 ease-in-out flex flex-col
      ${isOpen ? "w-64" : "w-20"} 
      ${!isOpen ? "max-lg:-translate-x-full" : "max-lg:w-64 translate-x-0"}`}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0 overflow-hidden">
        <div className="min-w-[32px] flex justify-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0">
            G
          </div>
        </div>
        <span
          className={`ml-4 font-bold text-xl whitespace-nowrap transition-opacity duration-300 ${!isOpen && "opacity-0"}`}
        >
          Go<span className="text-blue-400">Admin</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden mt-4 scrollbar-hide">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center h-12 rounded-lg transition-colors group relative ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="min-w-[52px] flex items-center justify-center shrink-0">
                <item.icon size={22} />
              </div>
              <span
                className={`font-medium transition-all duration-300 whitespace-nowrap ${!isOpen ? "opacity-0 invisible" : "opacity-100 visible"}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
