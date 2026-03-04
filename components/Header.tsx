"use client";

import Cookies from "js-cookie";
import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, User, CheckCircle2, AlertCircle } from "lucide-react";

import ChatPanel from "./header/ChatPanel";
import NotificationPanel from "./header/NotificationPanel";
import UserDropdown from "./header/UserDropdown";
import CreateGroupModal from "./header/CreateGroupModal";

interface UserData {
  id: string;
  name: string;
  role: string;
  email?: string;
}

const notifications = [
  { id: 1, title: "New User Registered", time: "2 min ago", icon: User, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: 2, title: "Server Update Successful", time: "1 hour ago", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  { id: 3, title: "High Memory Usage Alert", time: "3 hours ago", icon: AlertCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
];

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [userData, setUserData] = useState<UserData>({ id: "", name: "User", role: "Staff", email: "" });
  const [myConversations, setMyConversations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.184:8080";
  const webSocketURL = process.env.NEXT_PUBLIC_WEB_SOCKET_URL || "ws://192.168.100.184:8080/ws";
  // Track which conversation is currently open in the chat box
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const convRes = await fetch(baseURL + "/chat/my-conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convData = await convRes.json();
      if (Array.isArray(convData)) {
        setMyConversations(convData);
        const counts: Record<string, number> = {};
        convData.forEach((c: any) => { counts[c.id] = c.unread_count || 0; });
        setUnreadCounts(counts);
      }
      const userRes = await fetch(baseURL + "/users", { headers: { Authorization: `Bearer ${token}` } });
      const userDataRes = await userRes.json();
      if (Array.isArray(userDataRes)) setAllUsers(userDataRes);
    } catch (err) { console.error(err); }
  }, [baseURL]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUserData(JSON.parse(savedUser));
    fetchData();

    // Listen for when the chat box closes to clear active conversation tracking
    const handleCloseChat = (event: any) => {
      setActiveConversationId(null);
    };

    window.addEventListener("closeChat", handleCloseChat);
    return () => window.removeEventListener("closeChat", handleCloseChat);
  }, [fetchData]);

  // ✅ WebSocket Logic with Stale Closure Protection
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token || !userData.id) return;

    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(`${webSocketURL}?token=${token}`);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        // Normalize types: convert sender_id to string to match userData.id from localStorage
        if (String(msg.sender_id) !== userData.id) {
          
          // Don't increment badge if this conversation is currently open in the chat box
          if (msg.conversation_id === activeConversationId) {
            return;
          }
          
          // রিয়েল-টাইম ব্যাজ আপডেট (Functional Update pattern)
          setUnreadCounts((prev) => {
            const newCounts = { ...prev };
            newCounts[msg.conversation_id] = (newCounts[msg.conversation_id] || 0) + 1;
            return newCounts;
          });

          // লিস্টের পজিশন আপডেট
          setMyConversations((prev) => {
            const filtered = prev.filter(c => c.id !== msg.conversation_id);
            const target = prev.find(c => c.id === msg.conversation_id);
            if (target) {
              return [{ ...target, updated_at: new Date().toISOString() }, ...filtered];
            }
            fetchData();
            return prev;
          });
        }
      };

      ws.onclose = () => { reconnectTimeout = setTimeout(connect, 3000); };
    };

    connect();
    return () => {
      if (ws) { ws.onclose = null; ws.close(); }
      clearTimeout(reconnectTimeout);
    };
  }, [userData.id, webSocketURL, fetchData, activeConversationId]);

  // ✅ Open chat and track active conversation
  const openGlobalChat = (convId: string, title: string) => {
    setActiveConversationId(convId);
    window.dispatchEvent(new CustomEvent("openChat", { detail: { convId, title } }));
    setIsChatPanelOpen(false);
  };

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const startNewPrivateChat = async (targetId: string, name: string) => {
    const token = Cookies.get("token");
    const res = await fetch(baseURL + `/chat/conversation?target_id=${targetId}`, { headers: { Authorization: `Bearer ${token}` } });
    const conv = await res.json();
    openGlobalChat(conv.id, name);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    setIsCreating(true);
    const token = Cookies.get("token");
    try {
      const res = await fetch(baseURL + "/chat/groups", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, members: selectedUsers }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowGroupModal(false); setGroupName(""); setSelectedUsers([]);
        openGlobalChat(data.id, data.name);
        fetchData();
      }
    } catch (err) { console.error(err); } finally { setIsCreating(false); }
  };

  return (
    <>
      <header className="h-16 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 dark:text-slate-400">
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 hidden sm:block">Dashboard</h2>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <ChatPanel
            isChatPanelOpen={isChatPanelOpen}
            setIsChatPanelOpen={setIsChatPanelOpen}
            setIsNotifyOpen={setIsNotifyOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            totalUnread={Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
            myConversations={myConversations}
            unreadCounts={unreadCounts}
            setUnreadCounts={setUnreadCounts}
            openGlobalChat={openGlobalChat}
            allUsers={allUsers}
            currentUserId={userData.id}
            startNewPrivateChat={startNewPrivateChat}
            setShowGroupModal={setShowGroupModal}
            baseURL={baseURL}
            fetchData={fetchData}
          />
          <NotificationPanel isNotifyOpen={isNotifyOpen} setIsNotifyOpen={setIsNotifyOpen} setIsChatPanelOpen={setIsChatPanelOpen} setIsDropdownOpen={setIsDropdownOpen} notifications={notifications} />
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
          <UserDropdown isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} setIsNotifyOpen={setIsNotifyOpen} setIsChatPanelOpen={setIsChatPanelOpen} userData={userData} handleLogout={handleLogout} />
        </div>
      </header>
      <CreateGroupModal showGroupModal={showGroupModal} setShowGroupModal={setShowGroupModal} groupName={groupName} setGroupName={setGroupName} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} allUsers={allUsers} currentUserId={userData.id} handleCreateGroup={handleCreateGroup} isCreating={isCreating} />
    </>
  );
}