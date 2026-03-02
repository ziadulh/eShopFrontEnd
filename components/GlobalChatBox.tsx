"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import Cookies from "js-cookie";

export default function GlobalChatBox() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("Chat");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState("");

  const { messages, sendMessage, loadMore, hasMore, isLoadingMore } = useChat(activeConvId || undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ১. গ্লোবাল ইভেন্ট লিসেনার (অন্য যেকোনো জায়গা থেকে চ্যাট ওপেন করার জন্য)
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setCurrentUser(JSON.parse(saved));

    const handleOpenChat = (event: any) => {
      const { convId, title } = event.detail;
      setActiveConvId(convId);
      setChatTitle(title || "Chat Inbox");
    };

    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  // ২. অটো-স্ক্রল
  useEffect(() => {
    if (scrollRef.current && messages.length <= 10) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeConvId]);

  const onSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentUser || !activeConvId) return;
    sendMessage(inputMessage, currentUser.id);
    setInputMessage("");
  };

  if (!activeConvId) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[100] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase">
            {chatTitle.charAt(0)}
          </div>
          <span className="font-bold text-sm truncate max-w-[150px]">{chatTitle}</span>
        </div>
        <button 
          onClick={() => setActiveConvId(null)} 
          className="hover:bg-white/20 p-1 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        onScroll={(e) => e.currentTarget.scrollTop === 0 && hasMore && loadMore()}
        className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50"
      >
        {hasMore && (
          <div className="text-center py-2">
            {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-blue-500" /> : <span className="text-[10px] text-slate-400 italic">Load history</span>}
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] shadow-sm ${
              msg.sender_id === currentUser?.id 
              ? "bg-blue-600 text-white rounded-tr-none" 
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={onSendMessage} className="p-4 flex gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <input 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          placeholder="Type message..." 
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm outline-none text-slate-700 dark:text-slate-200" 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}