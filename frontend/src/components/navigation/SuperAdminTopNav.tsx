import React, { useState } from 'react';
import { Bell, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActAsRoleSheet } from '../../views/admin/modals/ActAsRoleSheet';

export interface SuperAdminTopNavProps {
  latencyMs?: number;
  onOpenNotifications?: () => void;
}

export const SuperAdminTopNav: React.FC<SuperAdminTopNavProps> = ({
  latencyMs = 24,
  onOpenNotifications,
}) => {
  const { setActiveTab, notifications } = useApp();
  const [isActAsRoleOpen, setIsActAsRoleOpen] = useState(false);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E3EEE6] transition-all select-none"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          minHeight: 'calc(56px + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Left: 36px "SA" avatar + "GeoHub" (bold) + "Root" chip */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-[#051F20] text-[#DAF1DE] flex items-center justify-center font-black text-sm tracking-tight border border-[#163832] shrink-0 shadow-xs">
              SA
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-bold text-[#051F20] tracking-tight">GeoHub</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#DAF1DE] text-[#051F20] leading-none">
                  Root
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#235347] font-medium mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono">● {latencyMs}ms</span>
              </div>
            </div>
          </div>

          {/* Right: Bell icon (44px) + Act as Role icon button (44px) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Act as Role button (opens BottomSheet) */}
            <button
              type="button"
              onClick={() => setIsActAsRoleOpen(true)}
              className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-[#F0F5F2] hover:bg-[#E3EEE6] text-[#051F20] text-xs font-bold transition flex items-center gap-1.5 border border-[#E3EEE6] cursor-pointer"
              title="Act as Role (Persona switcher)"
              aria-label="Act as Role"
            >
              <UserCheck size={16} className="text-[#235347]" />
              <span className="hidden sm:inline">Act as Role</span>
            </button>

            {/* Notifications Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                } else {
                  setActiveTab('notifications');
                }
              }}
              className="min-w-[44px] min-h-[44px] w-11 h-11 relative rounded-xl text-[#235347] hover:bg-[#F0F5F2] flex items-center justify-center transition cursor-pointer"
              title="Notifications"
              aria-label="Open notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Act as Role BottomSheet */}
      <ActAsRoleSheet
        isOpen={isActAsRoleOpen}
        onClose={() => setIsActAsRoleOpen(false)}
      />
    </>
  );
};

export default SuperAdminTopNav;

