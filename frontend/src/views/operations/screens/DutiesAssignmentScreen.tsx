import React, { useState } from 'react';
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
} from 'lucide-react';
import { AnimatedNumber, SearchField, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

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

export const DutiesAssignmentScreen: React.FC<DutiesAssignmentScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const [viewMode, setViewMode] = useState<'by_member' | 'by_event'>('by_member');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { tasks } = useApp();
  const [notice, setNotice] = useState<string | null>(null);

  // Form states
  const [newAssignee, setNewAssignee] = useState('Maya Patel');
  const [newRoll, setNewRoll] = useState('24GEO102');
  const [newSquad, setNewSquad] = useState('Management');
  const [newEvent, setNewEvent] = useState('Chapter Event');
  const [newTask, setNewTask] = useState('');
  const [newStation, setNewStation] = useState('Gate 2 Registration Counter');

  const [duties, setDuties] = useState<DutyAssignmentRecord[]>(() => {
    return (tasks || []).map((t: any) => ({
      id: t.id,
      eventId: t.eventId || 'ev_active',
      eventTitle: t.eventTitle || 'Campus Initiative',
      assigneeName: t.assigneeName || 'Squad Member',
      assigneeRoll: t.assigneeRoll || '21GEO001',
      squad: t.team || 'Management',
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
    setNotice(`Assigned duty to ${newAssignee}.`);
    setTimeout(() => setNotice(null), 3500);
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
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Duties</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <ClipboardCheck size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={duties.length} /> Total
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Fulfilled</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            <AnimatedNumber value={totalCompleted} /> Done
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Rate</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Clock size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            {Math.round((totalCompleted / duties.length) * 100)}%
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Assignment</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-assign-duty"
            >
              <Plus size={14} />
              <span>Assign Duty</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Main Duty Content Card */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Duties Assignment Roster
          </h2>

          <div className="w-full sm:w-64">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search duties..."
              style={{ height: '36px' }}
            />
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('by_member')}
            className={`h-7 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'by_member'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
            }`}
          >
            Group by Volunteer
          </button>
          <button
            type="button"
            onClick={() => setViewMode('by_event')}
            className={`h-7 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'by_event'
                ? 'bg-[#163832] text-white shadow-xs'
                : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
            }`}
          >
            Group by Event
          </button>
        </div>

        {/* Duty Cards List */}
        <div className="space-y-2.5 pt-1">
          {filteredDuties.length > 0 ? (
            filteredDuties.map((duty) => (
              <div
                key={duty.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                      {duty.task}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        duty.status === 'completed'
                          ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                          : 'bg-[rgba(242,184,75,0.18)] text-[#051F20] border border-[rgba(242,184,75,0.4)]'
                      }`}
                    >
                      {duty.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-[#235347]">
                    <span>Assignee: <strong className="text-[#051F20]">{duty.assigneeName}</strong> ({duty.assigneeRoll})</span>
                    <span>•</span>
                    <span>{duty.station}</span>
                  </div>
                </div>

                {/* Status Toggle Action */}
                <div className="shrink-0 self-end sm:self-center">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(duty.id, duty.status, duty.task)}
                      className={`h-8 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer touch-target-44 active:scale-95 ${
                        duty.status === 'completed'
                          ? 'bg-white border-[#DAF1DE] text-[#235347] hover:bg-[#DAF1DE]'
                          : 'bg-[#163832] text-white border-transparent hover:bg-[#0B2B26]'
                      }`}
                    >
                      {duty.status === 'completed' ? 'Reopen' : 'Mark Done'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              mascot="calendar"
              title="No Duties Assigned"
              description="No squad duties have been dispatched for this session."
            />
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Assign Operational Duty
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDuty} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Assignee Name
                </label>
                <input
                  type="text"
                  required
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoll}
                    onChange={(e) => setNewRoll(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Squad Context
                  </label>
                  <select
                    value={newSquad}
                    onChange={(e) => setNewSquad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  >
                    <option value="Management">Management</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Bound Station
                </label>
                <input
                  type="text"
                  required
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Specific Duty Task Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail exact operational responsibility..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Confirm Duty
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

