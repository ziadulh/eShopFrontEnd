"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, MessageSquare, Send, Loader2, Users, Plus, Hash, CheckCircle2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import Link from "next/link";
import Cookies from "js-cookie";

export default function UserTable({ initialUsers }: { initialUsers: any[] }) {
  // ১. স্টেটস
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [myConversations, setMyConversations] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  
  // গ্রুপ তৈরির স্টেটস
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ২. চ্যাট হুক কল
  const { messages, sendMessage, loadMore, hasMore, isLoadingMore } = useChat(activeConvId || undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // চ্যাট লিস্ট (Conversations) ফেচ করা
  const fetchMyConversations = async () => {
    const token = Cookies.get("token");
    try {
      const res = await fetch("http://localhost:8080/chat/my-conversations", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMyConversations(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (currentUser) fetchMyConversations();
  }, [currentUser, activeConvId]);

  // অটো-স্ক্রল লজিক
  useEffect(() => {
    if (scrollRef.current && messages.length <= 10) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeConvId]);

  // ৩. পার্সোনাল চ্যাট শুরু (DM)
  const handleStartChat = async (targetUser: any) => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(`http://localhost:8080/chat/conversation?target_id=${targetUser.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const conv = await res.json();
      if (conv.id) {
        setActiveConvId(conv.id);
        setActiveChatUser(targetUser);
      }
    } catch (err) { console.error("Chat start error", err); }
  };

  // ৪. গ্রুপ তৈরি
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return alert("Fill all fields");
    setIsCreating(true);
    const token = Cookies.get("token");
    try {
      const res = await fetch("http://localhost:8080/chat/groups", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, members: selectedUsers })
      });
      const data = await res.json();
      if (res.ok) {
        setShowGroupModal(false);
        setGroupName("");
        setSelectedUsers([]);
        setActiveConvId(data.id);
        setActiveChatUser({ name: data.name });
        fetchMyConversations();
      }
    } catch (err) { console.error(err); }
    finally { setIsCreating(false); }
  };

  const onSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentUser || !activeConvId) return;
    sendMessage(inputMessage, currentUser.id);
    setInputMessage("");
  };

  return (
    <div className="relative p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      
      {/* --- সাইডবার/Horizontal Chat List --- */}
      <div className="mb-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Active Channels</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <button 
            onClick={() => setShowGroupModal(true)}
            className="flex-shrink-0 w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all group"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
          
          {myConversations.map((conv) => (
            <button 
              key={conv.id}
              onClick={() => {
                setActiveConvId(conv.id);
                setActiveChatUser({ name: conv.name || "Private Chat" });
              }}
              className={`flex-shrink-0 px-5 h-14 rounded-2xl border flex items-center gap-3 transition-all ${
                activeConvId === conv.id 
                ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/40" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${activeConvId === conv.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-blue-600"}`}>
                {conv.type === "group" ? <Hash size={14} /> : <MessageSquare size={14} />}
              </div>
              <span className="text-sm font-bold whitespace-nowrap">{conv.name || "User Chat"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- ইউজার টেবিল --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-8 py-5 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Directory</th>
              <th className="px-8 py-5 text-right text-[11px] font-bold uppercase text-slate-400 tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                <td className="px-8 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 uppercase">{user.name.charAt(0)}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  {currentUser?.id !== user.id && (
                    <button onClick={() => handleStartChat(user)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all">
                      <MessageSquare size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ফ্লোটিং চ্যাট বক্স --- */}
      {activeConvId && (
        <div className="fixed bottom-6 right-6 w-80 md:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[100] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase">{activeChatUser?.name?.charAt(0)}</div>
              <span className="font-bold text-sm tracking-tight">{activeChatUser?.name}</span>
            </div>
            <button onClick={() => { setActiveConvId(null); setActiveChatUser(null); }} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20} /></button>
          </div>
          
          <div 
            ref={scrollRef} 
            onScroll={(e) => e.currentTarget.scrollTop === 0 && hasMore && loadMore()}
            className="h-96 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-950/40 scroll-smooth"
          >
            {hasMore && (
              <div className="text-center py-2">
                {isLoadingMore ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" /> : <span className="text-[10px] text-slate-400 italic">Load history</span>}
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] shadow-sm leading-relaxed ${
                  msg.sender_id === currentUser?.id 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={onSendMessage} className="p-4 flex gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <input 
              value={inputMessage} 
              onChange={(e) => setInputMessage(e.target.value)} 
              placeholder="Message..." 
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-3 text-sm outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all" 
            />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30">
              <Send size={20} />
            </button>
          </form>
        </div>
      )}

      {/* --- গ্রুপ তৈরি করার মোডাল --- */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-[440px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="p-8 pb-0 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">New Group</h2>
              <button onClick={() => setShowGroupModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20" 
              />

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Add Members</p>
                <div className="max-h-52 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {initialUsers.map(u => u.id !== currentUser?.id && (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUsers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                      className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border-2 transition-all ${selectedUsers.includes(u.id) ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-slate-50 dark:bg-slate-800"}`}
                    >
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{u.name}</span>
                      {selectedUsers.includes(u.id) && <CheckCircle2 size={20} className="text-blue-600" />}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCreateGroup}
                disabled={isCreating}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 transition-all uppercase text-xs tracking-widest"
              >
                {isCreating ? <Loader2 className="animate-spin mx-auto" /> : "Create Channel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}