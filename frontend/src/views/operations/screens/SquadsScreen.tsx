import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Megaphone,
  Coins,
  FileText,
  Plus,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  CheckSquare,
} from 'lucide-react';
import { AnimatedNumber, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';
import { ScholarRecord } from './MemberDirectoryScreen';

export interface SquadsScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser?: any;
  onSubViewChange?: (title: string | null, onBack: (() => void) | null) => void;
}

export const SquadsScreen: React.FC<SquadsScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
  onSubViewChange,
}) => {
  const { users, tasks } = useApp();
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const initialMembers: ScholarRecord[] = React.useMemo(() => {
    return (users || []).map((u) => {
      const isLead =
        u.squadMemberships?.some((m) => m.isLead) ||
        (u.post && u.post.toLowerCase().includes('lead')) ||
        false;
      const squad = u.team || u.squadMemberships?.[0]?.squad || 'Management';
      return {
        uid: u.uid,
        name: u.name,
        role: u.role,
        squad: squad,
        isLead: !!isLead,
        post: u.post || u.teamRole || 'Scholar Member',
        email: u.email,
        rollNo: u.rollNo,
      };
    });
  }, [users]);

  const [members, setMembers] = useState<ScholarRecord[]>(initialMembers);

  const squadDefinitions = [
    {
      id: 'Management',
      name: 'Management Squad',
      icon: Shield,
    },
    {
      id: 'Promotion',
      name: 'Promotion Squad',
      icon: Megaphone,
    },
    {
      id: 'Treasury',
      name: 'Treasury Squad',
      icon: Coins,
    },
    {
      id: 'Documentation',
      name: 'Documentation Squad',
      icon: FileText,
    },
  ];

  // Inform parent view when drilldown opens or closes so single header handles back
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    if (selectedSquadId) {
      const squadDef = squadDefinitions.find((s) => s.id === selectedSquadId);
      onSubViewChange?.(squadDef ? squadDef.name : null, () => setSelectedSquadId(null));
    } else {
      onSubViewChange?.(null, null);
    }
    return () => {
      onSubViewChange?.(null, null);
    };
  }, [selectedSquadId, onSubViewChange]);

  const handleEnrollMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !selectedSquadId) return;

    const newScholar: ScholarRecord = {
      uid: `u-${Date.now()}`,
      name: newMemberName.trim(),
      role: 'student',
      squad: selectedSquadId,
      isLead: false,
      post: `${selectedSquadId} Associate`,
      rollNo: `24GEO${Math.floor(100 + Math.random() * 900)}`,
      email: `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@geohub.edu`,
    };

    setMembers((prev) => [...prev, newScholar]);
    onLogAudit('Squads', `Enrolled ${newScholar.name} into ${selectedSquadId} squad`);

    setShowAddModal(false);
    setNewMemberName('');
    setNotice(`Enrolled ${newScholar.name} into ${selectedSquadId} squad.`);
    setTimeout(() => setNotice(null), 3500);
  };

  // If a squad is clicked, show its roster drilldown
  if (selectedSquadId) {
    const squadDef = squadDefinitions.find((s) => s.id === selectedSquadId)!;
    const squadMembers = members.filter((m) => m.squad === selectedSquadId);

    return (
      <div className="space-y-3.5 select-none w-full max-w-full overflow-hidden">
        {/* Action Header Row - ZERO duplicate back button when managed by parent */}
        <div className="flex items-center justify-between gap-3">
          {!onSubViewChange && (
            <button
              type="button"
              onClick={() => setSelectedSquadId(null)}
              className="w-10 h-10 bg-transparent border-0 active:scale-95 text-[#051F20] flex items-center justify-center transition-all touch-target-44 cursor-pointer p-0 shrink-0"
              aria-label="Back"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#163832] bg-[#DAF1DE] px-3 py-1 rounded-full border border-[#8EB69B]">
              {squadDef.name} Active Roster
            </span>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="h-10 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs touch-target-44 cursor-pointer ml-auto"
            >
              <Plus size={14} />
              <span>Enroll Member</span>
            </button>
          )}
        </div>

        {notice && (
          <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#163832]" />
            <span>{notice}</span>
          </div>
        )}

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]">
            <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
              Roster Scholars
            </h2>
            <span className="text-xs font-bold text-[#163832] bg-[#DAF1DE] px-2.5 py-0.5 rounded-full border border-[#8EB69B]">
              {squadMembers.length} Scholars
            </span>
          </div>

          {squadMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {squadMembers.map((m) => (
                <div
                  key={m.uid}
                  className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                        {m.name}
                      </span>
                      {m.isLead && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
                          Lead
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#235347] font-semibold block truncate mt-0.5">
                      {m.rollNo} • {m.post}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              mascot="leaf"
              title="No Squad Members Enrolled"
              description={`No scholars are currently assigned to ${squadDef.name}.`}
            />
          )}
        </div>

        {/* Modal: Enroll Member */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#DAF1DE] shadow-xl space-y-4">
              <h3 className="font-bold text-[#051F20] text-base">
                Enroll Member to {squadDef.name}
              </h3>
              <form onSubmit={handleEnrollMember} className="space-y-3">
                <input
                  type="text"
                  placeholder="Scholar full name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-semibold text-[#051F20] outline-none focus:border-[#163832]"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#235347] hover:bg-[#F6FBF7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26]"
                  >
                    Enroll
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const completedTasksCount = (tasks || []).filter((t) => t.status === 'done').length;
  const overallCompletion = tasks && tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
  const totalOfficers = members.filter((m) => m.isLead).length;

  // Primary Squads Overview
  return (
    <div className="space-y-4 select-none w-full max-w-full overflow-hidden">
      {notice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. Metric Strips (Compact 4-column) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Squads</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Shield size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            4 Units
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Strength</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Users size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            <AnimatedNumber value={members.length} /> Scholars
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Completion</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckSquare size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={overallCompletion} />%
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Officers</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <UserCheck size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={totalOfficers} /> Leads
          </div>
        </div>
      </div>

      {/* 2. Squads Bento Grid */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Operational Squads & Workstations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {squadDefinitions.map((squad) => {
            const Icon = squad.icon;
            const squadMembers = members.filter((m) => m.squad === squad.id);
            const lead = squadMembers.find((m) => m.isLead);
            const squadTasks = (tasks || []).filter((t) => t.team === squad.id);
            const tasksTotal = squadTasks.length;
            const tasksDone = squadTasks.filter((t) => t.status === 'done').length;
            const progressPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

            return (
              <div
                key={squad.id}
                onClick={() => setSelectedSquadId(squad.id)}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0 border border-[#8EB69B]/40">
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#051F20] text-sm truncate">
                        {squad.name}
                      </h3>
                      <span className="text-xs font-semibold text-[#235347] truncate block">
                        Lead: {lead?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#163832] border border-[#DAF1DE] shadow-2xs shrink-0">
                    {squadMembers.length} Members
                  </span>
                </div>

                <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between text-xs text-[#235347]">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[#DAF1DE] overflow-hidden">
                      <div
                        className="h-full bg-[#163832] rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="font-semibold text-xs text-[#051F20]">
                      {tasksDone}/{tasksTotal} Tasks
                    </span>
                  </div>
                  <span className="font-bold text-[#163832] inline-flex items-center gap-0.5 hover:underline">
                    <span>Roster</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SquadsScreen;
