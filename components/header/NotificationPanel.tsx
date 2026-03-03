"use client";

import { Bell } from "lucide-react";

export default function NotificationPanel({ isNotifyOpen, setIsNotifyOpen, setIsChatPanelOpen, setIsDropdownOpen, notifications }) {
  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsNotifyOpen(!isNotifyOpen);
          setIsChatPanelOpen(false);
          setIsDropdownOpen(false);
        }}
        className={`p-2 rounded-full relative transition-colors ${isNotifyOpen ? "bg-slate-100 dark:bg-slate-900 text-blue-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
      >
        <Bell size={20} />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
      </button>

      {isNotifyOpen && (
        <div className="fixed top-16 right-4 left-4 lg:absolute lg:top-auto lg:right-0 lg:left-auto lg:mt-2 lg:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100">Notifications</div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex gap-3 transition-colors">
                <div className={`p-2 rounded-lg h-fit ${n.bg}`}><n.icon size={18} className={n.color} /></div>
                <div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-tight">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}