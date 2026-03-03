"use client";

import { UserCircle, User, LogOut } from "lucide-react";

export default function UserDropdown({ 
  isDropdownOpen, setIsDropdownOpen, setIsNotifyOpen, setIsChatPanelOpen, 
  userData, handleLogout 
}) {
  return (
    <div className="relative">
      <div
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
          setIsNotifyOpen(false);
          setIsChatPanelOpen(false);
        }}
        className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
      >
        <div className="hidden md:block text-right text-slate-900 dark:text-slate-100">
          <p className="text-sm font-bold leading-none">{userData.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{userData.role}</p>
        </div>
        <UserCircle size={34} className="text-slate-400 dark:text-slate-600" />
      </div>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-2 border-b dark:border-slate-800 mb-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Signed in as</p>
            <p className="text-sm font-bold truncate dark:text-white">{userData.email || "No Email"}</p>
          </div>
          <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <User size={18} /> Profile
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-t dark:border-slate-800 mt-2 pt-2 font-bold transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}