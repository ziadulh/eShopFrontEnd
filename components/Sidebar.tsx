"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  UserPlus,
  List,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    name: "User",
    icon: Users,
    href: "/admin/users",
    children: [
      { name: "List", href: "/admin/users", icon: List },
      { name: "Create", href: "/admin/users/create", icon: UserPlus },
    ],
  },
  { name: "Roles", icon: ShieldCheck, href: "/admin/roles" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => pathname === child.href)) {
        setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
      }
    });
  }, [pathname]);

  const toggleSubmenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-slate-900 dark:bg-black text-white transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800
      ${isOpen ? "w-64" : "w-20"} ${!isOpen ? "max-lg:-translate-x-full" : "max-lg:w-64 translate-x-0"}`}
    >
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0 overflow-hidden">
        <div className="min-w-[32px] flex justify-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-blue-500/20">
            G
          </div>
        </div>
        <span
          className={`ml-4 font-bold text-xl tracking-tight whitespace-nowrap transition-opacity duration-300 ${!isOpen && "opacity-0"}`}
        >
          Go<span className="text-blue-400">Admin</span>
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4 scrollbar-hide">
        {menuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isChildActive = item.children?.some(
            (child) => pathname === child.href,
          );
          const isParentActive = pathname === item.href || isChildActive;
          const isSubMenuOpen = openMenus[item.name];

          return (
            <div key={item.name} className="space-y-1">
              {hasChildren ? (
                <button
                  onClick={() => isOpen && toggleSubmenu(item.name)}
                  className={`flex items-center w-full h-11 rounded-lg transition-all relative group ${
                    isParentActive
                      ? "text-blue-400 bg-blue-400/5"
                      : "text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="min-w-[52px] flex items-center justify-center shrink-0">
                    <item.icon
                      size={20}
                      className={
                        isParentActive
                          ? "text-blue-400"
                          : "text-slate-400 group-hover:text-white"
                      }
                    />
                  </div>
                  <span
                    className={`flex-1 text-left font-semibold text-[13px] tracking-wide transition-all duration-300 ${!isOpen ? "opacity-0 invisible" : "opacity-100 visible"}`}
                  >
                    {item.name}
                  </span>
                  {isOpen && (
                    <div className="pr-4">
                      {isSubMenuOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center h-11 rounded-lg transition-all relative group ${
                    pathname === item.href
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="min-w-[52px] flex items-center justify-center shrink-0">
                    <item.icon
                      size={20}
                      className={
                        pathname === item.href
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }
                    />
                  </div>
                  <span
                    className={`font-semibold text-[13px] tracking-wide transition-all duration-300 ${!isOpen ? "opacity-0 invisible" : "opacity-100 visible"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}

              {/* Children Items */}
              {hasChildren && isSubMenuOpen && isOpen && (
                <div className="ml-9 border-l border-slate-800 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                  {item.children?.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`flex items-center gap-3 h-9 px-4 rounded-r-lg text-[13px] transition-all border-l-2 ${
                        pathname === child.href
                          ? "text-blue-400 border-blue-500 bg-blue-400/5 font-bold"
                          : "text-slate-500 border-transparent hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-700"
                      }`}
                    >
                      <child.icon size={14} />
                      <span className="tracking-wide">{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
