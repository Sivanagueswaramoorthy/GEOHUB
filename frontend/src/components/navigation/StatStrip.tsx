import React, { useState } from 'react';
import { Layers, GraduationCap, Users, Activity } from 'lucide-react';
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
      <div className="w-full bg-white border-b border-slate-200/90 shadow-xs">
        <div
          className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto select-none"
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
            className="min-h-[44px] px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 flex items-center gap-2 shrink-0 transition cursor-pointer shadow-xs"
            title="Jump to Cockpit Deck"
          >
            <Layers size={15} className="text-emerald-600" />
            <span>{counts.modulesLive}/{counts.modulesTotal} Modules</span>
          </button>

          {/* Faculty Chip -> jumps to #faculty */}
          <button
            type="button"
            onClick={() => onSelectDeck('faculty')}
            className="min-h-[44px] px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 flex items-center gap-2 shrink-0 transition cursor-pointer shadow-xs"
            title="Jump to Faculty Oversight"
          >
            <GraduationCap size={15} className="text-emerald-600" />
            <span>{counts.faculty} Faculty</span>
          </button>

          {/* Students Chip -> jumps to #students */}
          <button
            type="button"
            onClick={() => onSelectDeck('students')}
            className="min-h-[44px] px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 flex items-center gap-2 shrink-0 transition cursor-pointer shadow-xs"
            title="Jump to Student Governance"
          >
            <Users size={15} className="text-emerald-600" />
            <span>{counts.students} Students</span>
          </button>

          {/* Online Sessions Chip -> opens Live Sessions sheet */}
          <button
            type="button"
            onClick={() => setIsLiveSheetOpen(true)}
            className="min-h-[44px] px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-extrabold text-emerald-800 flex items-center gap-2 shrink-0 transition cursor-pointer shadow-xs"
            title="Inspect Live Online Sessions"
          >
            <Activity size={15} className="text-emerald-600 animate-pulse" />
            <span>{counts.online} Online</span>
          </button>
        </div>
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
