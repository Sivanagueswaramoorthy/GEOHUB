import React, { useState } from 'react';
import { OverviewCounts, OnlineSessionUser, DeckKey } from '../../views/admin/types';
import { LiveSessionsSheet } from '../../views/admin/modals/LiveSessionsSheet';

export interface StatStripProps {
  counts: OverviewCounts;
  onlineUsers: OnlineSessionUser[];
  onSelectDeck: (deck: DeckKey) => void;
  onForceLogout?: (userId: string, name: string) => void;
}

export const StatStrip: React.FC<StatStripProps> = ({
  counts,
  onlineUsers,
  onSelectDeck,
  onForceLogout,
}) => {
  const [isLiveSheetOpen, setIsLiveSheetOpen] = useState(false);

  return (
    <>
      <div
        className="w-full bg-white border-b border-[#E3EEE6] px-4 py-2 flex items-center gap-2 overflow-x-auto select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x proximity',
        }}
      >
        {/* 9/9 Modules Chip -> jumps to #hub */}
        <button
          type="button"
          onClick={() => onSelectDeck('hub')}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#E3EEE6] border border-[#E3EEE6] text-xs font-bold text-[#051F20] flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          title="Jump to Cockpit Deck"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{counts.modulesLive}/{counts.modulesTotal} Modules</span>
        </button>

        {/* Faculty Chip -> jumps to #faculty */}
        <button
          type="button"
          onClick={() => onSelectDeck('faculty')}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#E3EEE6] border border-[#E3EEE6] text-xs font-bold text-[#051F20] flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          title="Jump to Faculty Oversight"
        >
          <span>🎓</span>
          <span>{counts.faculty} Faculty</span>
        </button>

        {/* Students Chip -> jumps to #students */}
        <button
          type="button"
          onClick={() => onSelectDeck('students')}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#F7FAF8] hover:bg-[#E3EEE6] border border-[#E3EEE6] text-xs font-bold text-[#051F20] flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          title="Jump to Student Governance"
        >
          <span>👥</span>
          <span>{counts.students} Students</span>
        </button>

        {/* Online Sessions Chip -> opens Live Sessions sheet */}
        <button
          type="button"
          onClick={() => setIsLiveSheetOpen(true)}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#DAF1DE] hover:bg-[#CBE7D1] border border-[#8EB69B]/50 text-xs font-bold text-[#051F20] flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          title="Inspect Live Online Sessions"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>{counts.online} Online</span>
        </button>
      </div>

      {/* Live Sessions Sheet */}
      <LiveSessionsSheet
        isOpen={isLiveSheetOpen}
        onClose={() => setIsLiveSheetOpen(false)}
        onlineUsers={onlineUsers}
        onForceLogout={onForceLogout}
      />
    </>
  );
};

export default StatStrip;
