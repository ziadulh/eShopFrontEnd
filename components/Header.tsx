"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  UserCircle,
  LogOut,
  User,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "New User Registered",
    time: "2 min ago",
    icon: User,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: 2,
    title: "Server Update Successful",
    time: "1 hour ago",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: 3,
    title: "High Memory Usage Alert",
    time: "3 hours ago",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
];

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsDropdownOpen(false);
      if (
        notifyRef.current &&
        !notifyRef.current.contains(event.target as Node)
      )
        setIsNotifyOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 sticky top-0 z-40 transition-all bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 hidden sm:block">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifyRef}>
          <button
            onClick={() => {
              setIsNotifyOpen(!isNotifyOpen);
              setIsDropdownOpen(false);
            }}
            className={`p-2 rounded-full relative transition-colors ${isNotifyOpen ? "bg-slate-100 dark:bg-slate-900 text-blue-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
          </button>

          {isNotifyOpen && (
            <div className="fixed top-16 right-4 left-4 lg:absolute lg:top-auto lg:right-0 lg:left-auto lg:mt-2 lg:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Notifications
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex gap-3 transition-colors"
                  >
                    <div className={`p-2 rounded-lg h-fit ${n.bg}`}>
                      <n.icon size={18} className={n.color} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-tight">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotifyOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
          >
            <div className="hidden md:block text-right text-slate-900 dark:text-slate-100">
              <p className="text-sm font-bold leading-none">Ziadul Haque</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                Super Admin
              </p>
            </div>
            <UserCircle
              size={34}
              className="text-slate-400 dark:text-slate-600"
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Signed in as
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                  ziadul@example.com
                </p>
              </div>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <User size={18} /> Profile
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 font-bold transition-colors">
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
