"use client";

import { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Search, UserPlus, X, Shield, MessageSquare, Send, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import Link from "next/link";

export default function UserTable({ initialUsers }: { initialUsers: any[] }) {
  const [search, setSearch] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState("");

  // আপডেট করা হুক কল (loadMore, hasMore, isLoadingMore সহ)
  const { messages, sendMessage, loadMore, hasMore, isLoadingMore } = useChat(activeChatUser?.id, currentUser?.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPermissions(parsed.permissions || []);
      setCurrentUser(parsed);
    }
  }, []);

  // অটো-স্ক্রল লজিক: শুধুমাত্র প্রথমবার চ্যাট খুললে বা নতুন মেসেজ আসলে নিচে যাবে
  useEffect(() => {
    if (scrollRef.current && messages.length <= 10) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeChatUser]);

  // স্ক্রল ইভেন্ট হ্যান্ডলার (উপরে স্ক্রল করলে পুরনো মেসেজ লোড হবে)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    
    // যদি একদম উপরে (scrollTop === 0) থাকে এবং আরও মেসেজ থাকে
    if (scrollTop === 0 && hasMore && !isLoadingMore) {
      const currentScrollHeight = scrollHeight;
      
      loadMore(); // হুক থেকে পরবর্তী ১০টি মেসেজ লোড করবে

      // নতুন মেসেজ লোড হওয়ার পর স্ক্রল পজিশন ঠিক রাখা (Jump prevent করা)
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight - currentScrollHeight;
        }
      }, 100);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatUser || !currentUser) return;
    sendMessage(inputMessage, currentUser.id, activeChatUser.id);
    setInputMessage("");
  };

  const hasPerm = (p: string) => permissions.includes(p);

  const filteredUsers = initialUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Search & Add Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {hasPerm("users.store") && (
          <Link href="/admin/users/create" className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg">
            <UserPlus size={18} /> Add New User
          </Link>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Identity</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Access Role</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                      {user.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Shield size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">{user.role || 'User'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {currentUser?.id !== user.id && (
                      <button 
                        onClick={() => setActiveChatUser(user)}
                        className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                      >
                        <MessageSquare size={16} />
                      </button>
                    )}
                    {hasPerm("users.update") && (
                      <Link href={`/admin/users/edit/${user.id}`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                        <Edit size={16} />
                      </Link>
                    )}
                    {hasPerm("users.destroy") && (
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Chat Box with Pagination Support */}
      {activeChatUser && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase">{activeChatUser.name.charAt(0)}</div>
              <span className="font-bold text-sm">{activeChatUser.name}</span>
            </div>
            <button onClick={() => setActiveChatUser(null)} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
          </div>

          <div 
            ref={scrollRef} 
            onScroll={handleScroll} // স্ক্রল লিসেনার যোগ করা হয়েছে
            className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 scroll-smooth"
          >
            {/* আরও মেসেজ লোড হওয়ার ইন্ডিকেটর */}
            {hasMore && (
              <div className="flex justify-center py-2">
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Scroll up to see history</span>
                )}
              </div>
            )}

            {messages.length === 0 && !isLoadingMore && (
              <div className="text-center text-[10px] text-slate-400 mt-20">No messages yet.</div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-[13px] shadow-sm ${
                  msg.sender_id === currentUser?.id 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none text-slate-700 dark:text-slate-200"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}