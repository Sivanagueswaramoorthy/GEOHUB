import React from 'react';
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
        <p className="text-xs text-[#235347] font-medium pb-1">
          Select an official chapter role to preview the mobile experience from their authority perspective.
        </p>
        <div className="space-y-2">
          {CANONICAL_ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => handleSelectRole(r)}
              className="w-full min-h-[52px] p-3 rounded-2xl bg-white border border-[#E3EEE6] hover:border-[#8EB69B] hover:bg-[#F7FAF8] flex items-center justify-between transition cursor-pointer select-none text-left"
            >
              <div>
                <div className="text-sm font-bold text-[#051F20]">{r.badge}</div>
                <div className="text-xs text-[#235347] font-mono">
                  {r.default_roll} · {r.default_name}
                </div>
              </div>
              <span className="text-xs font-bold text-[#235347]">Switch ›</span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};

export default ActAsRoleSheet;
