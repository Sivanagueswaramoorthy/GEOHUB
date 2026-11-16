import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, Megaphone, User, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProfileSheet } from '../shared/ProfileSheet';
import astafineWordmarkFull from '../../assets/astafine-wordmark-full.png';

interface Props {
  onRefresh?: () => void;
  loading?: boolean;
  dbLatencyMs?: number;
  onOpenBroadcast?: () => void;
}

export const SuperAdminTopNav: React.FC<Props> = ({
  onRefresh,
  loading = false,
  dbLatencyMs = 24,
  onOpenBroadcast,
}) => {
  const { currentUser, setIsRoleSwitcherOpen, setActiveTab, notifications } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 select-none ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(5,31,32,0.06)] border-b border-[#DAF1DE]'
            : 'bg-white/80 backdrop-blur-xs border-b border-transparent'
        }`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          {/* Left Brand & Master Authority Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#051F20] text-[#DAF1DE] flex items-center justify-center font-black text-sm border border-[#163832] shrink-0 shadow-xs">
              SA
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-[#051F20] tracking-tight">GeoHub Cockpit</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-[#DAF1DE] text-[#051F20]">
                  Root Authority
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#235347]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono font-semibold">TiDB:3306</span>
                <span className="font-mono text-[#8EB69B]">({dbLatencyMs}ms)</span>
              </div>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenBroadcast && (
              <button
                type="button"
                onClick={onOpenBroadcast}
                className="px-2.5 py-1.5 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#163832] text-xs font-bold border border-[#DAF1DE] transition flex items-center gap-1 cursor-pointer touch-target-44"
                title="Dispatch Campus Broadcast"
                aria-label="Dispatch campus push alert"
              >
                <Megaphone size={13} />
                <span className="hidden sm:inline">Alert</span>
              </button>
            )}

            {/* Act as Role / Role Switcher Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsRoleSwitcherOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#DAF1DE] hover:bg-[#8EB69B]/40 text-[#163832] text-xs font-bold transition flex items-center gap-1 cursor-pointer touch-target-44 border border-[#8EB69B]/40"
              title="Switch user role or test live preview"
              aria-label="Switch Role or Preview"
            >
              <span>Act as Role</span>
              <ChevronDown size={12} />
            </button>

            {/* Notifications Trigger */}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl text-[#235347] hover:bg-[#F6FBF7] transition cursor-pointer touch-target-44"
              title="Notifications"
              aria-label="Open notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Profile Avatar Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileSheetOpen(true)}
              className="w-8 h-8 rounded-full bg-[#163832] text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#8EB69B] transition touch-target-44"
              title="SuperAdmin profile & options"
              aria-label="Open SuperAdmin profile"
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
            </button>
          </div>
        </div>
      </header>

      {/* Profile & Options Sheet */}
      <ProfileSheet
        isOpen={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
      />
    </>
  );
};

export default SuperAdminTopNav;
