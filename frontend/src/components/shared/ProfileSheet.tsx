import React, { useState } from 'react';
import { User, Bell, Repeat, Smartphone, Monitor, LogOut, Settings, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserModel } from '../../types';
import { BottomSheet } from './BottomSheet';
import { ListRow } from './ListRow';
import { ConfirmDialog } from './ConfirmDialog';
import { APP_VERSION } from '../../config/version';

export interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const getRoleBadgeLabel = (currentUser: UserModel): string => {
  if (currentUser.post && currentUser.post.trim()) {
    return currentUser.post.toUpperCase();
  }
  switch (currentUser.role) {
    case 'faculty':
    case 'super_admin':
      return 'FACULTY ADVISOR';
    case 'coordinator':
    case 'admin':
      return 'CLUB PRESIDENT';
    case 'treasurer':
      return 'TREASURER';
    case 'documentation':
      return 'DOCUMENTATION LEAD';
    case 'promotion':
    case 'social_media':
      return 'PROMOTION LEAD';
    case 'student':
    case 'member':
    default:
      return currentUser.team ? `${currentUser.team.toUpperCase()} SQUAD` : 'STUDENT MEMBER';
  }
};

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    notifications,
    setActiveTab,
    isPhoneFrame,
    setIsPhoneFrame,
    setIsRoleSwitcherOpen,
    logout,
    updateInfo,
    syncStatus,
    setIsServerModalOpen,
  } = useApp();

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;
  const badgeLabel = getRoleBadgeLabel(currentUser);

  const canSwitchRole =
    currentUser.role === 'faculty' ||
    currentUser.role === 'super_admin' ||
    Boolean(import.meta.env?.DEV);

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Account & Profile"
      >
        <div className="flex flex-col select-none">
          {/* Header Section: Avatar, name, role chip (12px, uppercase, Mint 100 bg, Pine 800 text), roll number */}
          <div className="flex flex-col items-center justify-center pt-2 pb-4 px-4 text-center border-b border-[#DAF1DE]">
            <div className="relative w-14 h-14 rounded-full bg-[#DAF1DE] border-2 border-[#8EB69B] flex items-center justify-center overflow-hidden mb-2.5 shadow-sm">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xl font-extrabold text-[#163832]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G'}
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-[#051F20] leading-tight">
              {currentUser.name}
            </h2>

            {/* Role Chip: 12px, uppercase, Mint 100 background (#DAF1DE), Pine 800 text (#163832) */}
            <div className="mt-1.5 inline-flex items-center px-3 py-0.5 rounded-full bg-[#DAF1DE] border border-[#8EB69B]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#163832]">
                {badgeLabel}
              </span>
            </div>

            {/* Roll number or Email */}
            <p className="text-xs font-medium text-[#235347] mt-1.5">
              {currentUser.rollNo ? `Roll No: ${currentUser.rollNo}` : currentUser.email}
            </p>
          </div>

          {/* Action rows with icons */}
          <div className="flex flex-col gap-2.5 py-4 px-1">
            {/* 1. Profile */}
            <ListRow
              icon={<User size={20} strokeWidth={1.75} className="lucide text-[#163832]" />}
              title="Profile"
              subtitle="View scholar credentials & personal details"
              onClick={() => {
                onClose();
                setActiveTab('profile');
              }}
            />

            {/* 2. Notifications (with unread badge) */}
            <ListRow
              icon={<Bell size={20} strokeWidth={1.75} className="lucide text-[#163832]" />}
              title="Notifications"
              subtitle="Official announcements and club bulletins"
              meta={
                unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D9534F] text-white">
                    {unreadCount} New
                  </span>
                ) : undefined
              }
              onClick={() => {
                onClose();
                setActiveTab('notifications');
              }}
            />

            {/* 3. Settings & App Updates */}
            <ListRow
              icon={<Settings size={20} strokeWidth={1.75} className="lucide text-[#163832]" />}
              title="Settings & Updates"
              subtitle={`GeoHub v${APP_VERSION} • Software updates`}
              meta={
                updateInfo ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347] border border-[#8EB69B] animate-pulse">
                    UPDATE
                  </span>
                ) : undefined
              }
              onClick={() => {
                onClose();
                setActiveTab('profile');
                if (typeof window !== 'undefined') {
                  window.location.hash = '#profile?tab=settings';
                }
              }}
            />

            {/* Server Connection & Live Multi-Device Sync */}
            <ListRow
              icon={<Radio size={20} strokeWidth={1.75} className="lucide text-[#163832]" />}
              title="Server & Device Sync"
              subtitle={
                syncStatus === 'connected'
                  ? 'Real-Time Sync Connected'
                  : syncStatus === 'syncing'
                  ? 'Synchronizing data...'
                  : 'Cloud Disconnected • Tap to configure'
              }
              meta={
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    syncStatus === 'connected'
                      ? 'bg-emerald-500'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-500 animate-spin'
                      : 'bg-rose-500'
                  }`}
                />
              }
              onClick={() => {
                onClose();
                setIsServerModalOpen(true);
              }}
            />

            {/* 4. Switch role (faculty and dev mode only) */}
            {canSwitchRole && (
              <ListRow
                icon={<Repeat size={20} strokeWidth={1.75} className="lucide text-[#163832]" />}
                title="Switch Role"
                subtitle={`Current preview: ${badgeLabel}`}
                onClick={() => {
                  onClose();
                  setIsRoleSwitcherOpen(true);
                }}
              />
            )}

            {/* 4. Phone frame / Fullscreen toggle (visible only on screens >= 768px) */}
            <div className="hidden md:block">
              <ListRow
                icon={
                  isPhoneFrame ? (
                    <Monitor size={20} strokeWidth={1.75} className="lucide text-[#163832]" />
                  ) : (
                    <Smartphone size={20} strokeWidth={1.75} className="lucide text-[#163832]" />
                  )
                }
                title={isPhoneFrame ? 'Fullscreen Mode' : 'Phone Frame Mode'}
                subtitle={
                  isPhoneFrame
                    ? 'Expand canvas to full desktop width'
                    : 'Constrain canvas to 480px mobile preview frame'
                }
                chevron={false}
                onClick={() => {
                  setIsPhoneFrame(!isPhoneFrame);
                }}
              />
            </div>

            {/* 5. Log out (danger color, with ConfirmDialog) */}
            <ListRow
              icon={<LogOut size={20} strokeWidth={1.75} className="lucide text-[#D9534F]" />}
              title="Log Out"
              subtitle="End current session and sign out"
              onClick={() => {
                setIsLogoutConfirmOpen(true);
              }}
            />
          </div>
        </div>
      </BottomSheet>

      {/* Confirmation Dialog before logout */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          onClose();
          logout();
        }}
        title="Log out of GeoHub?"
        message="Are you sure you want to end your current session? You will need to log in again to access club features."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        isDanger={true}
      />
    </>
  );
};

export default ProfileSheet;

