import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  MapPin,
  Calendar,
  Check,
  Tag,
  Shield,
  ClipboardCheck,
  Briefcase,
  ChevronDown,
  X,
  UserCheck,
} from 'lucide-react';
import { AnimatedNumber, SearchField, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';
import { DEFAULT_SCHOLARS } from './DutiesStationsScreen';

export interface DutyAssignmentRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  assigneeName: string;
  assigneeRoll: string;
  squad: string;
  task: string;
  station: string;
  status: 'completed' | 'in_progress';
}

export interface DutiesAssignmentScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

const COMMON_DUTIES = [
  'Gate Turnstile Pass Scan',
  'Kit & Sensor Distribution',
  'Crowd Flow & Safety',
  'Field Drone Area Oversight',
  'First Aid & Hydration Desk',
  'Media & Photo Coverage',
];

export const DutiesAssignmentScreen: React.FC<DutiesAssignmentScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const [viewMode, setViewMode] = useState<'by_member' | 'by_event'>('by_member');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { tasks, users } = useApp();
  const [notice, setNotice] = useState<string | null>(null);

  const selectableUsers = useMemo(() => {
    const list = [...(users || [])];
    DEFAULT_SCHOLARS.forEach((s) => {
      if (!list.some((u) => u.rollNo === s.rollNo)) {
        list.push({
          uid: `u-${s.rollNo}`,
          name: s.name,
          rollNo: s.rollNo,
          team: s.team,
          email: `${s.rollNo.toLowerCase()}@geohub.org`,
          role: 'student',
        } as any);
      }
    });
    return list;
  }, [users]);

  // Form states
  const initialUser = (selectableUsers && selectableUsers.find((u) => u.rollNo)) || null;
  const [newRoll, setNewRoll] = useState(initialUser?.rollNo || '24GEO102');
  const [newAssignee, setNewAssignee] = useState(initialUser?.name || 'Maya Patel');
  const [newSquad, setNewSquad] = useState(initialUser?.team || 'Operations');
  const [newEvent, setNewEvent] = useState('Chapter Event');
  const [newTask, setNewTask] = useState('');
  const [newStation, setNewStation] = useState('Gate 1 Turnstile');

  const [duties, setDuties] = useState<DutyAssignmentRecord[]>(() => {
    return (tasks || []).map((t: any) => ({
      id: t.id,
      eventId: t.eventId || 'ev_active',
      eventTitle: t.eventTitle || 'Campus Initiative',
      assigneeName: t.assigneeName || 'Squad Member',
      assigneeRoll: t.assigneeRoll || '21GEO001',
      squad: t.team || 'General',
      task: t.title || t.task || 'Assigned Duty',
      station: t.station || 'Field Station',
      status: t.status === 'done' ? ('completed' as const) : ('in_progress' as const),
    }));
  });

  const totalCompleted = duties.filter((d) => d.status === 'completed').length;

  const handleToggleStatus = (id: string, currentStatus: 'completed' | 'in_progress', taskName: string) => {
    if (readOnly) return;
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    setDuties((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    );
    onLogAudit('Duties Assignment', `Marked duty "${taskName}" as ${nextStatus.toUpperCase()}`);
  };

  const handleCreateDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const newRecord: DutyAssignmentRecord = {
      id: `duty-${Date.now()}`,
      eventId: 'ev-geofest',
      eventTitle: newEvent,
      assigneeName: newAssignee,
      assigneeRoll: newRoll,
      squad: newSquad,
      task: newTask.trim(),
      station: newStation,
      status: 'in_progress',
    };

    setDuties((prev) => [newRecord, ...prev]);
    onLogAudit(newEvent, `Assigned duty "${newRecord.task}" to ${newAssignee} at ${newStation}`);

    setShowAssignModal(false);
    setNewTask('');
    setNotice(`Assigned to ${newAssignee}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const filteredDuties = duties.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      d.assigneeName.toLowerCase().includes(q) ||
      d.assigneeRoll.toLowerCase().includes(q) ||
      d.task.toLowerCase().includes(q) ||
      d.station.toLowerCase().includes(q) ||
      d.eventTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 select-none w-full max-w-full overflow-hidden">
      {/* 1. Minimal Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">Duties</span>
            <ClipboardCheck size={13} className="text-[#163832]" />
          </div>
          <div className="font-extrabold text-[#051F20] text-lg mt-1">
            <AnimatedNumber value={duties.length} /> <span className="text-xs font-semibold text-[#235347]">Total</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">Fulfilled</span>
            <CheckCircle2 size={13} className="text-[#163832]" />
          </div>
          <div className="font-extrabold text-[#163832] text-lg mt-1">
            <AnimatedNumber value={totalCompleted} /> <span className="text-xs font-semibold text-[#235347]">Done</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">Rate</span>
            <Clock size={13} className="text-[#163832]" />
          </div>
          <div className="font-extrabold text-[#051F20] text-lg mt-1">
            {duties.length > 0 ? Math.round((totalCompleted / duties.length) * 100) : 0}%
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B]/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#163832] uppercase tracking-wider">Action</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-assign-duty"
            >
              <Plus size={13} />
              <span>Assign Duty</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-2.5 px-3.5 rounded-xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#163832] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Main Duty Content Card */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.03)] space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#DAF1DE]/60">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Duty Roster
          </h2>

          <div className="w-48 sm:w-60">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search..."
              style={{ height: '34px' }}
            />
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('by_member')}
            className={`h-7 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'by_member'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
            }`}
          >
            By Volunteer
          </button>
          <button
            type="button"
            onClick={() => setViewMode('by_event')}
            className={`h-7 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewMode === 'by_event'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
            }`}
          >
            By Event
          </button>
        </div>

        {/* Duty Cards List */}
        <div className="space-y-2 pt-1">
          {filteredDuties.length > 0 ? (
            filteredDuties.map((duty) => (
              <div
                key={duty.id}
                className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                      {duty.task}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                        duty.status === 'completed'
                          ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                          : 'bg-[rgba(242,184,75,0.18)] text-[#051F20] border border-[rgba(242,184,75,0.4)]'
                      }`}
                    >
                      {duty.status === 'completed' ? 'Done' : 'Active'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-[#235347]">
                    <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-[#DAF1DE] text-[#051F20]">
                      {duty.assigneeRoll}
                    </span>
                    <span className="font-bold text-[#051F20]">{duty.assigneeName}</span>
                    <span>·</span>
                    <span>{duty.station}</span>
                    <span>·</span>
                    <span className="text-[11px]">{duty.squad}</span>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(duty.id, duty.status, duty.task)}
                      className={`h-7 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer touch-target-44 active:scale-95 ${
                        duty.status === 'completed'
                          ? 'bg-white border-[#DAF1DE] text-[#235347] hover:bg-[#DAF1DE]'
                          : 'bg-[#163832] text-white border-transparent hover:bg-[#0B2B26]'
                      }`}
                    >
                      {duty.status === 'completed' ? 'Reopen' : 'Done'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              mascot="calendar"
              title="No Duties"
              description="No active assignments."
            />
          )}
        </div>
      </div>

      {/* 3. Bottom Sheet Modal: Assign Duty */}
      {showAssignModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAssignModal(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-[#DAF1DE] space-y-3.5 max-h-[92vh] sm:max-h-[86vh] overflow-y-auto flex flex-col"
            style={{
              paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
              animation: 'slideUp 260ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Grab Handle */}
            <div
              className="w-full flex justify-center pt-0 pb-1.5 sm:hidden cursor-pointer"
              onClick={() => setShowAssignModal(false)}
            >
              <div className="w-10 h-1 rounded-full bg-[#8EB69B]/40 hover:bg-[#8EB69B] transition-colors" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#DAF1DE]/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
                  <Briefcase size={16} strokeWidth={2.4} />
                </div>
                <h3 className="font-bold text-[#051F20] text-base">
                  Assign Duty
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="w-7 h-7 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateDuty} className="space-y-3">
              {/* Scholar */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider flex items-center gap-1">
                  <UserCheck size={12} />
                  <span>Scholar *</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={newRoll}
                    onChange={(e) => {
                      const roll = e.target.value;
                      setNewRoll(roll);
                      const found = selectableUsers.find((u) => u.rollNo === roll || u.email?.startsWith(roll.toLowerCase()));
                      if (found) {
                        setNewAssignee(found.name);
                        if (found.team) setNewSquad(found.team);
                      }
                    }}
                    className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] appearance-none"
                  >
                    <option value="">Choose Scholar...</option>
                    {selectableUsers
                      .filter((u) => u.rollNo)
                      .map((u) => (
                        <option key={u.uid} value={u.rollNo}>
                          {u.rollNo} — {u.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
                  />
                </div>
              </div>

              {/* Station & Squad */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                    Station *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStation}
                    onChange={(e) => setNewStation(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider">
                    Squad
                  </label>
                  <div className="relative">
                    <select
                      value={newSquad}
                      onChange={(e) => setNewSquad(e.target.value)}
                      className="w-full h-9.5 pl-3 pr-8 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832] appearance-none"
                    >
                      <option value="Management">Management</option>
                      <option value="Promotion">Promotion</option>
                      <option value="Treasury">Treasury</option>
                      <option value="Documentation">Documentation</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#235347] pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Duty Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#235347] uppercase tracking-wider flex items-center gap-1">
                  <Briefcase size={12} />
                  <span>Duty Task *</span>
                </label>

                <div className="flex flex-wrap gap-1">
                  {COMMON_DUTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewTask(d)}
                      className={`h-6.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                        newTask === d
                          ? 'bg-[#163832] text-white border-[#163832]'
                          : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE] hover:border-[#8EB69B]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] outline-none focus:border-[#163832]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DAF1DE]/70">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Deploy Duty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutiesAssignmentScreen;
