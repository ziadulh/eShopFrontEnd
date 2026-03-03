"use client";

import { Plus, X, CheckCircle2, Loader2 } from "lucide-react";

interface CreateGroupModalProps {
  showGroupModal: boolean;
  setShowGroupModal: (val: boolean) => void;
  groupName: string;
  setGroupName: (val: string) => void;
  selectedUsers: string[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  allUsers: any[];
  currentUserId: string;
  handleCreateGroup: () => Promise<void>;
  isCreating: boolean;
}

export default function CreateGroupModal({
  showGroupModal, setShowGroupModal, groupName, setGroupName,
  selectedUsers, setSelectedUsers, allUsers, currentUserId,
  handleCreateGroup, isCreating
}: CreateGroupModalProps) {
  if (!showGroupModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGroupModal(false)}></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-[420px] shadow-2xl border dark:border-slate-800 p-8 space-y-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Plus size={20} /></div>
            <h2 className="text-xl font-bold dark:text-white">New Group</h2>
          </div>
          <button onClick={() => setShowGroupModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Group Identity</label>
            <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Enter group name..." className="w-full mt-1 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-sm dark:text-white focus:ring-2 ring-blue-500/20" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Add Members ({selectedUsers.length})</label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar mt-2">
              {allUsers.filter(u => u.id !== currentUserId).map(u => {
                const isSelected = selectedUsers.includes(u.id);
                return (
                  <div key={u.id} onClick={() => setSelectedUsers(prev => isSelected ? prev.filter(i => i !== u.id) : [...prev, u.id])} className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border-2 transition-all ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-slate-50 dark:bg-slate-800"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold uppercase">{u.name.charAt(0)}</div>
                      <span className="text-sm font-medium dark:text-slate-200">{u.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={18} className="text-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <button onClick={handleCreateGroup} disabled={isCreating || !groupName.trim() || selectedUsers.length === 0} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2">
          {isCreating ? <Loader2 className="animate-spin" size={20} /> : "Assemble Group"}
        </button>
      </div>
    </div>
  );
}