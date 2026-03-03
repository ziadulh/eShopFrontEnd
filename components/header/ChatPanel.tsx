"use client";

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
}

export default function ChatPanel({
  isChatPanelOpen,
  setIsChatPanelOpen,
  setIsNotifyOpen,
  setIsDropdownOpen,
  totalUnread,
  myConversations,
  unreadCounts,
  openGlobalChat,
  allUsers,
  currentUserId,
  startNewPrivateChat,
  setShowGroupModal,
}: ChatPanelProps) {
  // --- স্মার্ট নাম ডিসপ্লে লজিক ---
  const getDisplayName = (conv: any) => {
    // ১. যদি এটি গ্রুপ চ্যাট হয়
    if (conv.type === "group") {
      return conv.name || "Unnamed Group";
    }

    // ২. যদি প্রাইভেট চ্যাট হয়
    // চেক করা হচ্ছে participants আছে কি না এবং তা একটি অ্যারে কি না
    if (conv.participants && Array.isArray(conv.participants)) {
      // নিজের আইডি বাদে অন্য পার্টিসিপ্যান্টের আইডি বের করা
      const otherUserId = conv.participants.find(
        (id: string) => id !== currentUserId,
      );

      // allUsers লিস্ট থেকে ওই ইউজার অবজেক্ট খুঁজে বের করা
      const otherUser = allUsers.find((u) => u.id === otherUserId);

      if (otherUser) {
        return otherUser.name;
      }
    }

    // ৩. যদি উপরের কোনোটিই কাজ না করে তবে ব্যাকআপ হিসেবে conv.name বা Default string
    return conv.name || "Private Message";
  };

  return (
    <div className="relative">
      {/* ... আপনার মেসেজ আইকন বাটন কোড ... */}
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
            {/* বাম পাশ: Active Chats */}
            <div className="w-1/2 border-r border-slate-100 dark:border-slate-800 flex flex-col">
              <div className="p-3 border-b bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={12} /> Active Chats
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {myConversations.length === 0 && (
                  <p className="text-[10px] text-center text-slate-400 mt-10">
                    No active chats
                  </p>
                )}
                {myConversations.map((conv) => {
                  const title = getDisplayName(conv); // এখানে নাম জেনারেট হচ্ছে
                  return (
                    <div
                      key={conv.id}
                      onClick={() => openGlobalChat(conv.id, title)}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-50 dark:border-slate-800/50"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                          {conv.type === "group" ? (
                            <Hash size={14} />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {title}
                          </span>
                        </div>
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

            {/* ডান পাশ: Start New (ডিরেক্টরি) */}
            <div className="w-1/2 flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
              <div className="p-3 border-b bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={12} /> Start New
                </div>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="p-1 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {allUsers
                  .filter((u) => u.id !== currentUserId)
                  .map((u) => (
                    <div
                      key={u.id}
                      onClick={() => startNewPrivateChat(u.id, u.name)}
                      className="p-3 hover:bg-white dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 uppercase flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {u.name}
                      </span>
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
