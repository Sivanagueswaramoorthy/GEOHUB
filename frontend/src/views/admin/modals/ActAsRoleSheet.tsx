import React from 'react';
import { ChevronRight, UserCheck } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { CANONICAL_ROLES } from '../hooks/useSuperAdminState';
import { useApp } from '../../../context/AppContext';

export interface ActAsRoleSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActAsRoleSheet: React.FC<ActAsRoleSheetProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, showToast, setActiveTab } = useApp();

  const handleSelectRole = (roleItem: (typeof CANONICAL_ROLES)[0]) => {
    setCurrentUser({
      ...currentUser,
      role: roleItem.role as any,
      name: roleItem.default_name,
      rollNo: roleItem.default_roll,
      email: roleItem.default_email,
      post: roleItem.default_post,
    });
    showToast(`Switched active persona to ${roleItem.badge}`);
    onClose();
    if (roleItem.role !== 'super_admin') {
      setActiveTab('home');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Act as Role (Live Persona)">
      <div className="space-y-2 py-1">
        <p className="text-xs text-slate-500 font-semibold pb-1">
          Select an official chapter role to preview the mobile experience from their authority perspective.
        </p>
        <div className="space-y-2">
          {CANONICAL_ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => handleSelectRole(r)}
              className="w-full min-h-[52px] p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 flex items-center justify-between transition cursor-pointer select-none text-left shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <UserCheck size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{r.badge}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {r.default_roll} · {r.default_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>Switch</span>
                <ChevronRight size={15} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};

export default ActAsRoleSheet;
