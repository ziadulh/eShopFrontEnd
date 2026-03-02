"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";

export default function GlobalChatBox() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("Chat");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState("");

  const { messages, sendMessage, loadMore, hasMore, isLoadingMore } = useChat(activeConvId || undefined);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // নতুন মেসেজের জন্য রেফারেন্স

  // ১. গ্লোবাল ইভেন্ট লিসেনার
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

  // ২. অটো-স্ক্রল লজিক (Fixed Scroll Issue)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // যখনই মেসেজ লিস্ট পরিবর্তন হবে, নিচে স্ক্রল করবে
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // ৩. চ্যাট বক্স ওপেন হলে স্ক্রল করা
  useEffect(() => {
    if (activeConvId) {
      // চ্যাট ওপেন হওয়ার সময় সামান্য ডিলে দিয়ে স্ক্রল করা (UI রেন্ডার হওয়ার জন্য)
      setTimeout(scrollToBottom, 100);
    }
  }, [activeConvId]);

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
        onScroll={(e) => {
          // যদি স্ক্রল একদম উপরে থাকে এবং আরও মেসেজ থাকে তবে লোড করবে
          if (e.currentTarget.scrollTop === 0 && hasMore && !isLoadingMore) {
            loadMore();
          }
        }}
        className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 flex flex-col"
      >
        {hasMore && (
          <div className="text-center py-2">
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-blue-500" />
            ) : (
              <span className="text-[10px] text-slate-400 italic">Scroll up to load history</span>
            )}
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
        
        {/* এই ডিভটি সবসময় নিচে থাকবে এবং স্ক্রল করতে সাহায্য করবে */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={onSendMessage} className="p-4 flex gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <input 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          placeholder="Type message..." 
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm outline-none text-slate-700 dark:text-slate-200" 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}