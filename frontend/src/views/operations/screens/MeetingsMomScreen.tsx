import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';
import { AnimatedNumber, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: string;
  isDone: boolean;
}

export interface MeetingItem {
  id: string;
  title: string;
  type: 'Pre-Event Briefing' | 'Post-Event Retrospective' | 'Steering Committee';
  dateTime: string;
  venue: string;
  quorum: number;
  agenda: string;
  momNotes?: string;
  actionItems: ActionItem[];
}

export interface MeetingsMomScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const MeetingsMomScreen: React.FC<MeetingsMomScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { meetings: contextMeetings } = useApp();
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
  const [showConveneModal, setShowConveneModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Pre-Event Briefing' | 'Post-Event Retrospective' | 'Steering Committee'>('Pre-Event Briefing');
  const [newVenue, setNewVenue] = useState('Seminar Hall 3B');
  const [newDateTime, setNewDateTime] = useState('2026-11-08 16:30');
  const [newAgenda, setNewAgenda] = useState('');

  const [meetings, setMeetings] = useState<MeetingItem[]>(() => {
    return (contextMeetings || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      type: (m.type || 'Steering Committee') as any,
      dateTime: m.dateTime || m.date || 'Today',
      venue: m.venue || 'Campus Auditorium',
      quorum: m.quorum || 10,
      agenda: m.agenda || 'General chapter coordination',
      momNotes: m.momNotes || '',
      actionItems: (m.actionItems || []).map((a: any, idx: number) => ({
        id: a.id || `act-${idx}`,
        task: a.task || a.title || 'Action item',
        assignedTo: a.assignedTo || 'Squad Lead',
        isDone: Boolean(a.isDone),
      })),
    }));
  });

  const handleToggleAction = (meetingId: string, actionId: string) => {
    if (readOnly) return;
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              actionItems: m.actionItems.map((act) =>
                act.id === actionId ? { ...act, isDone: !act.isDone } : act
              ),
            }
          : m
      )
    );
    const meeting = meetings.find((m) => m.id === meetingId);
    onLogAudit(meeting?.title || 'Meeting MoM', `Toggled action item status in MoM`);
  };

  const handleConveneMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMeeting: MeetingItem = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      dateTime: newDateTime,
      venue: newVenue,
      quorum: 10,
      agenda: newAgenda.trim() || 'General agenda discussion.',
      momNotes: 'Meeting convened. Action items in progress.',
      actionItems: [
        { id: `act-${Date.now()}-1`, task: 'Circulate meeting minutes to squad leads', assignedTo: currentUser?.name || 'Coordinator', isDone: false },
      ],
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    onLogAudit('Meetings & MoM', `Convened new meeting: "${newMeeting.title}" at ${newVenue}`);

    setShowConveneModal(false);
    setNewTitle('');
    setNewAgenda('');
    setSuccessMsg(`Convened meeting: "${newMeeting.title}"`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Sessions</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Calendar size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={meetings.length} /> Convened
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Pending</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            <AnimatedNumber
              value={meetings.reduce(
                (sum, m) => sum + m.actionItems.filter((a) => !a.isDone).length,
                0
              )}
            /> Open
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Quorum</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Users size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-sm sm:text-base mt-1">
            12 Scholars
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Convene</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowConveneModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-convene-meeting"
            >
              <Plus size={14} />
              <span>Convene</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Meetings & MoM List */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Chapter Meetings & Minutes of Meeting (MoM)
          </h2>
          <span className="text-xs font-semibold text-[#235347]">
            Archived Minutes
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {meetings.length > 0 ? (
            meetings.map((meeting) => {
            const isExpanded = expandedMeetingId === meeting.id;
            const completedCount = meeting.actionItems.filter((a) => a.isDone).length;

            return (
              <div
                key={meeting.id}
                className="rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] overflow-hidden hover:border-[#8EB69B] transition-all"
              >
                {/* Meeting Header Row */}
                <div
                  onClick={() => setExpandedMeetingId(isExpanded ? null : meeting.id)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#051F20] text-sm sm:text-base">
                        {meeting.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
                        {meeting.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#235347]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock size={13} /> {meeting.dateTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {meeting.venue}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users size={13} /> Quorum: {meeting.quorum}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-bold text-[#163832] bg-white px-2.5 py-1 rounded-xl border border-[#DAF1DE]">
                      {completedCount}/{meeting.actionItems.length} Actions Done
                    </span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-white border border-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded MoM Details */}
                {isExpanded && (
                  <div className="px-3.5 sm:px-4 pb-4 pt-1 border-t border-[#DAF1DE] space-y-3.5 bg-white/70">
                    <div>
                      <span className="text-xs font-bold text-[#051F20] uppercase tracking-wide block mb-1">
                        Meeting Agenda
                      </span>
                      <p className="text-xs text-[#235347] bg-[#F6FBF7] p-2.5 rounded-xl border border-[#DAF1DE]">
                        {meeting.agenda}
                      </p>
                    </div>

                    {meeting.momNotes && (
                      <div>
                        <span className="text-xs font-bold text-[#051F20] uppercase tracking-wide block mb-1">
                          Official Minutes (MoM)
                        </span>
                        <p className="text-xs text-[#235347] bg-[#F6FBF7] p-2.5 rounded-xl border border-[#DAF1DE] leading-relaxed">
                          {meeting.momNotes}
                        </p>
                      </div>
                    )}

                    {/* Action Items Checklist */}
                    <div>
                      <span className="text-xs font-bold text-[#051F20] uppercase tracking-wide block mb-2">
                        Accountability Checklist & Operational Action Items
                      </span>
                      <div className="space-y-2">
                        {meeting.actionItems.map((act) => (
                          <div
                            key={act.id}
                            onClick={() => handleToggleAction(meeting.id, act.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              act.isDone
                                ? 'bg-[#DAF1DE]/40 border-[#8EB69B] text-[#163832]'
                                : 'bg-white border-[#DAF1DE] text-[#051F20] hover:border-[#8EB69B]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                                  act.isDone
                                    ? 'bg-[#163832] border-[#163832] text-white'
                                    : 'border-[#8EB69B] bg-white'
                                }`}
                              >
                                {act.isDone && <Check size={13} strokeWidth={3} />}
                              </div>
                              <span className={`text-xs font-semibold truncate ${act.isDone ? 'line-through text-[#235347]/70' : ''}`}>
                                {act.task}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-[#163832] shrink-0 bg-white/90 px-2 py-0.5 rounded-md border border-[#DAF1DE]">
                              {act.assignedTo}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyState
            mascot="notebook"
            title="No Meetings Recorded"
            description="Schedule an executive meeting or upload Minutes of the Meeting (MoM)."
          />
        )}
      </div>
      </div>

      {/* Convene Meeting Modal */}
      {showConveneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Convene Chapter Meeting
              </h3>
              <button
                type="button"
                onClick={() => setShowConveneModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConveneMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pre-Event Logistics Briefing & Safety Verification"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Meeting Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  >
                    <option value="Pre-Event Briefing">Pre-Event Briefing</option>
                    <option value="Post-Event Retrospective">Post-Event Retrospective</option>
                    <option value="Steering Committee">Steering Committee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Date & Time
                  </label>
                  <input
                    type="text"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Campus Venue / Location
                </label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Agenda Outline
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail agenda items and expected quorum..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConveneModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Confirm & Convene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsMomScreen;

