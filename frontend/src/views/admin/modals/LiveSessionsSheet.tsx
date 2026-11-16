import React from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { OnlineSessionUser } from '../types';
import { RelativeTime } from '../ui/RelativeTime';

export interface LiveSessionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onlineUsers: OnlineSessionUser[];
  onForceLogout?: (userId: string, name: string) => void;
}

export const LiveSessionsSheet: React.FC<LiveSessionsSheetProps> = ({
  isOpen,
  onClose,
  onlineUsers,
  onForceLogout,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Active Live Sessions">
      <div className="space-y-3 py-1">
        <p className="text-xs text-[#235347] font-medium">
          Scholars and administrators authenticated within the last 5 minutes.
        </p>

        <div className="space-y-2">
          {onlineUsers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 font-medium">
              No other active sessions detected.
            </div>
          ) : (
            onlineUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-100" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#051F20] truncate">
                      {user.name}{' '}
                      <span className="text-xs font-mono font-normal text-slate-500">
                        ({user.roll_no})
                      </span>
                    </div>
                    <div className="text-xs text-[#235347] flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize">{user.role}</span>
                      <span>•</span>
                      <span>{user.platform || 'Android'}</span>
                      <span>•</span>
                      <RelativeTime date={user.last_seen_at} />
                    </div>
                  </div>
                </div>

                {user.role !== 'super_admin' && onForceLogout && (
                  <button
                    type="button"
                    onClick={() => onForceLogout(user.id, user.name)}
                    className="min-h-[36px] px-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer shrink-0"
                  >
                    Logout
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

export default LiveSessionsSheet;
