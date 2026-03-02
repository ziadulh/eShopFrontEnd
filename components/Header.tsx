"use client";

import Cookies from "js-cookie";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  UserCircle,
  LogOut,
  User,
  MessageSquare,
  Hash,
  Users,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  role: string;
  email?: string;
}

// আপনার আগের নোটিফিকেশন স্যাম্পল ডাটা
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
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "User",
    role: "Staff",
    email: "",
  });
  const [myConversations, setMyConversations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.184:8080";
  const webSocketURL =
    process.env.NEXT_PUBLIC_WEB_SOCKET_URL || "ws://192.168.100.184:8080/ws";

  // সকেট কানেকশন - রিফাইন্ড এবং স্টেবল লজিক
  useEffect(() => {
    const token = Cookies.get("token");
    // ইউজার আইডি না থাকলে কানেক্ট করার দরকার নেই
    if (!token || !userData.id) return;

    let ws: WebSocket | null = null;
    let timeoutId: NodeJS.Timeout;
    let isMounted = true; // মেমরি লিক এবং মাল্টিপল কানেকশন রোধে

    const connect = () => {
      // যদি আগে থেকেই সকেট ওপেন থাকে তবে নতুন করে কানেক্ট করার দরকার নেই
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      console.log("📡 Attempting WebSocket Connection...");
      ws = new WebSocket(`${webSocketURL}?token=${token}`);

      ws.onopen = () => {
        if (isMounted) console.log("✅ WebSocket Connected Successfully");
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          // নিজের পাঠানো মেসেজ বাদ দিয়ে অন্যদের মেসেজ কাউন্ট করা
          if (msg.sender_id !== userData.id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1,
            }));
            fetchData();
          }
        } catch (err) {
          console.error("❌ Message parsing error:", err);
        }
      };

      ws.onclose = (e) => {
        if (isMounted) {
          console.log(
            `⚠️ WebSocket Closed (Code: ${e.code}). Retrying in 3s...`,
          );
          // ৩ সেকেন্ড পর রিকানেক্ট লজিক
          timeoutId = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        // এরর হলে সকেট অটো ক্লোজ হয়, যা onclose ট্রিমার করবে
        if (isMounted) console.error("❌ WebSocket Error Observed");
      };
    };

    connect();

    // Cleanup Function: কম্পোনেন্ট আনমাউন্ট হলে কানেকশন প্রপারলি বন্ধ করা
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (ws) {
        ws.onclose = null; // রিকানেক্ট লুপ বন্ধ করতে
        ws.close();
      }
    };
  }, [userData.id, webSocketURL]); // শুধুমাত্র ইউজার আইডি বা URL চেঞ্জ হলে রান হবে

  const fetchData = async () => {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const convRes = await fetch(baseURL + "/chat/my-conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convData = await convRes.json();
      if (Array.isArray(convData)) setMyConversations(convData);

      const userRes = await fetch(baseURL + "/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userDataRes = await userRes.json();
      if (Array.isArray(userDataRes)) setAllUsers(userDataRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUserData(JSON.parse(savedUser));
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node))
        setIsChatPanelOpen(false);
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openGlobalChat = (convId: string, title: string) => {
    window.dispatchEvent(
      new CustomEvent("openChat", { detail: { convId, title } }),
    );

    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[convId];
      return newCounts;
    });

    setIsChatPanelOpen(false);
  };

  const startNewPrivateChat = async (targetId: string, name: string) => {
    const token = Cookies.get("token");
    const res = await fetch(
      baseURL + `/chat/conversation?target_id=${targetId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const conv = await res.json();
    openGlobalChat(conv.id, name);
  };

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <header className="h-16 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
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
        {/* --- CHAT ICON & PANEL --- */}
        <div className="relative" ref={chatRef}>
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
                    {myConversations.length === 0 && (
                      <p className="text-[10px] text-center text-slate-400 mt-10">
                        No active chats
                      </p>
                    )}
                    {myConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() =>
                          openGlobalChat(conv.id, conv.name || "Private Chat")
                        }
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                            {conv.type === "group" ? (
                              <Hash size={14} />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {conv.name || "Direct Message"}
                          </span>
                        </div>
                        {unreadCounts[conv.id] > 0 && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {unreadCounts[conv.id]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-1/2 flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
                  <div className="p-3 border-b bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} /> Start New
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {allUsers
                      .filter((u) => u.id !== userData.id)
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

        {/* --- NOTIFICATIONS DROPDOWN --- */}
        <div className="relative" ref={notifyRef}>
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

        {/* --- USER DROPDOWN --- */}
        <div className="relative" ref={dropdownRef}>
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
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                {userData.role}
              </p>
            </div>
            <UserCircle
              size={34}
              className="text-slate-400 dark:text-slate-600"
            />
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-2 border-b dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Signed in as
                </p>
                <p className="text-sm font-bold truncate dark:text-white">
                  {userData.email || "No Email"}
                </p>
              </div>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <User size={18} /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-t dark:border-slate-800 mt-2 pt-2 font-bold transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
