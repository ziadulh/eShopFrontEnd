"use client";

import Cookies from "js-cookie";
import { MessageSquare, Hash, User, Users, Plus } from "lucide-react";

interface ChatPanelProps {
  isChatPanelOpen: boolean;
  setIsChatPanelOpen: (val: boolean) => void;
  setIsNotifyOpen: (val: boolean) => void;
  setIsDropdownOpen: (val: boolean) => void;
  totalUnread: number;
  myConversations: any[];
  unreadCounts: Record<string, number>;
  openGlobalChat: (id: string, title: string) => void;
  allUsers: any[];
  currentUserId: string;
  startNewPrivateChat: (id: string, name: string) => Promise<void>;
  setShowGroupModal: (val: boolean) => void;
  setUnreadCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  baseURL: string;
}

export default function ChatPanel({
  isChatPanelOpen,
  setIsChatPanelOpen,
  setIsNotifyOpen,
  setIsDropdownOpen,
  totalUnread,
  myConversations,
  unreadCounts,
  setUnreadCounts,
  openGlobalChat,
  allUsers,
  currentUserId,
  startNewPrivateChat,
  setShowGroupModal,
  baseURL,
}: ChatPanelProps) {

  const handleChatClick = async (convId: string, title: string) => {
    const token = Cookies.get("token");
    // ১. ব্যাকএন্ডে মার্ক-রিড আপডেট
    try {
      await fetch(`${baseURL}/chat/mark-read/${convId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("❌ Mark as read failed", err);
    }
    
    // ২. হেডার থেকে পাঠানো মেইন মেথড কল করা (যা ইভেন্ট ফায়ার এবং ব্যাজ জিরো করে)
    openGlobalChat(convId, title);
  };

  const getDisplayName = (conv: any) => {
    if (conv.type === "group") return conv.name || "Unnamed Group";
    if (conv.participants && Array.isArray(conv.participants)) {
      const otherId = conv.participants.find((id: string) => id !== currentUserId);
      const user = allUsers.find((u) => u.id === otherId);
      return user ? user.name : "Private Message";
    }
    return conv.name || "Private Message";
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsChatPanelOpen(!isChatPanelOpen);
          setIsNotifyOpen(false);
          setIsDropdownOpen(false);
        }}
        className={`p-2 rounded-full relative transition-colors ${isChatPanelOpen ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
      >
        <MessageSquare size={20} />
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950 font-bold">
            {totalUnread}
          </span>
        )}
      </button>

      {isChatPanelOpen && (
        <div className="fixed top-16 right-4 left-4 lg:absolute lg:top-auto lg:right-0 lg:left-auto lg:mt-2 lg:w-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          <div className="flex h-[400px]">
            <div className="w-1/2 border-r border-slate-100 dark:border-slate-800 flex flex-col">
              <div className="p-3 border-b bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={12} /> Active Chats
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {myConversations.length === 0 && <p className="text-[10px] text-center text-slate-400 mt-10">No active chats</p>}
                {myConversations.map((conv) => {
                  const title = getDisplayName(conv);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleChatClick(conv.id, title)}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-50 dark:border-slate-800/50"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                          {conv.type === "group" ? <Hash size={14} /> : <User size={14} />}
                        </div>
                        <span className="text-sm font-medium truncate">{title}</span>
                      </div>
                      {unreadCounts[conv.id] > 0 && (
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {unreadCounts[conv.id]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-1/2 flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
              <div className="p-3 border-b bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2"><Users size={12} /> Start New</div>
                <button onClick={() => setShowGroupModal(true)} className="p-1 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"><Plus size={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {allUsers.filter((u) => u.id !== currentUserId).map((u) => (
                    <div key={u.id} onClick={() => startNewPrivateChat(u.id, u.name)} className="p-3 hover:bg-white dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 uppercase flex-shrink-0">{u.name.charAt(0)}</div>
                      <span className="text-sm font-medium truncate">{u.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}