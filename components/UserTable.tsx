"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Search,
  UserPlus,
  MessageSquare,
  Plus,
  CheckCircle2,
  Loader2,
  X,
  Shield,
} from "lucide-react";
import Cookies from "js-cookie";

export default function UserTable({ initialUsers }: { initialUsers: any[] }) {
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  // গ্রুপ তৈরির স্টেটস
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentUser(parsed);
      setPermissions(parsed.permissions || []);
    }
  }, []);

  const hasPerm = (p: string) => permissions.includes(p);
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.184:8080";

  // ১. ডাইরেক্ট চ্যাট শুরু করা
  const handleStartChat = async (targetUser: any) => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(
        baseURL+`/chat/conversation?target_id=${targetUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const conv = await res.json();
      if (conv.id) {
        // গ্লোবাল চ্যাট বক্স ওপেন করার ইভেন্ট
        window.dispatchEvent(
          new CustomEvent("openChat", {
            detail: { convId: conv.id, title: targetUser.name },
          }),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ২. গ্রুপ তৈরি করা
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0)
      return alert("Please provide details");
    setIsCreating(true);
    const token = Cookies.get("token");
    try {
      const res = await fetch(baseURL+"/chat/groups", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: groupName, members: selectedUsers }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowGroupModal(false);
        setGroupName("");
        setSelectedUsers([]);
        window.dispatchEvent(
          new CustomEvent("openChat", {
            detail: { convId: data.id, title: data.name },
          }),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = initialUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md"
          >
            <Plus size={18} /> Create Group
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Identity
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Access Role
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-500">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Shield size={14} />
                    <span className="text-xs font-bold uppercase">
                      {user.role || "User"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {currentUser?.id !== user.id && (
                      <button
                        onClick={() => handleStartChat(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <MessageSquare size={18} />
                      </button>
                    )}
                    {hasPerm("users.update") && (
                      <button className="p-2 text-slate-400 hover:text-blue-500 rounded-lg">
                        <Edit size={18} />
                      </button>
                    )}
                    {hasPerm("users.destroy") && (
                      <button className="p-2 text-slate-400 hover:text-red-500 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Create Group Modal --- */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-[420px] shadow-2xl border dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-6 pb-0 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">
                Create New Group
              </h2>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-2 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-sm dark:text-white"
              />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Select Members
                </p>
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                  {initialUsers.map(
                    (u) =>
                      u.id !== currentUser?.id && (
                        <div
                          key={u.id}
                          onClick={() =>
                            setSelectedUsers((prev) =>
                              prev.includes(u.id)
                                ? prev.filter((id) => id !== u.id)
                                : [...prev, u.id],
                            )
                          }
                          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border-2 transition-all ${selectedUsers.includes(u.id) ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-slate-50 dark:bg-slate-800"}`}
                        >
                          <span className="text-sm font-medium dark:text-slate-200">
                            {u.name}
                          </span>
                          {selectedUsers.includes(u.id) && (
                            <CheckCircle2 size={18} className="text-blue-600" />
                          )}
                        </div>
                      ),
                  )}
                </div>
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={isCreating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Create Group"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
