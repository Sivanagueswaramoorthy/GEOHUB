import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  UserX,
  Shield,
  Calendar,
  MapPin,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AnimatedNumber, ConfirmDialog, SearchField, EmptyState } from '../../../components/shared';
import { EventModel } from '../../../types';

export interface AttendeeRosterRecord {
  uid: string;
  name: string;
  rollNo: string;
  squad: string;
  eventId: string;
  eventName: string;
  status: 'present' | 'absent';
  checkInTime?: string;
}

export interface AttendanceDeskScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

const DEFAULT_EVENTS: EventModel[] = [
  {
    id: 'evt_geomatics_2026',
    title: 'Annual Geomatics Symposium 2026',
    description: 'Keynote sessions on remote sensing, spatial mapping & photogrammetry.',
    category: 'Academic',
    venue: 'Civil Auditorium A',
    startDate: '2026-11-25T09:00:00Z',
    endDate: '2026-11-25T17:00:00Z',
    status: 'live',
    capacity: 120,
    budget: 0,
    createdBy: 'admin',
    registeredUserIds: ['usr_01', 'usr_02', 'usr_03', 'usr_04', 'usr_05', 'usr_06'],
    volunteerIds: [],
  },
  {
    id: 'evt_drone_survey',
    title: 'Smart Campus Drone Survey',
    description: 'Autonomous UAV flight missions for campus thermal & topographic modeling.',
    category: 'Field Work',
    venue: 'Main Sports Complex',
    startDate: '2026-11-28T08:30:00Z',
    endDate: '2026-11-28T14:00:00Z',
    status: 'approved',
    capacity: 60,
    budget: 0,
    createdBy: 'admin',
    registeredUserIds: ['usr_02', 'usr_04', 'usr_06', 'usr_07', 'usr_08'],
    volunteerIds: [],
  },
  {
    id: 'evt_gis_hackathon',
    title: 'GIS Spatial Analytics Hackathon',
    description: '24-hour spatial data modeling, QGIS automation, and flood risk analysis.',
    category: 'Workshop',
    venue: 'Geoinformatics CAD Lab',
    startDate: '2026-12-05T10:00:00Z',
    endDate: '2026-12-06T10:00:00Z',
    status: 'approved',
    capacity: 80,
    budget: 0,
    createdBy: 'admin',
    registeredUserIds: ['usr_01', 'usr_03', 'usr_05', 'usr_07', 'usr_09'],
    volunteerIds: [],
  },
  {
    id: 'evt_eco_census',
    title: 'Eco-Preservation Tree Census',
    description: 'Mobile GPS tagging and biodiversity cataloging of 450+ campus native flora.',
    category: 'Community',
    venue: 'Botanical Garden & North Lawn',
    startDate: '2026-12-12T07:30:00Z',
    endDate: '2026-12-12T12:30:00Z',
    status: 'approved',
    capacity: 100,
    budget: 0,
    createdBy: 'admin',
    registeredUserIds: ['usr_01', 'usr_02', 'usr_08', 'usr_09', 'usr_10'],
    volunteerIds: [],
  },
];

const DEFAULT_SCHOLARS = [
  { uid: 'usr_01', name: 'Kavya Sharma', rollNo: '24GEO055', squad: 'Alpha Squad' },
  { uid: 'usr_02', name: 'Arjun Patel', rollNo: '24GEO012', squad: 'Beta Squad' },
  { uid: 'usr_03', name: 'Sneha Reddy', rollNo: '24GEO088', squad: 'Gamma Squad' },
  { uid: 'usr_04', name: 'Rohan Verma', rollNo: '23GEO034', squad: 'Alpha Squad' },
  { uid: 'usr_05', name: 'Divya Krishnan', rollNo: '23GEO067', squad: 'Delta Squad' },
  { uid: 'usr_06', name: 'Manoj Kumar', rollNo: '24GEO029', squad: 'Beta Squad' },
  { uid: 'usr_07', name: 'Pooja Iyer', rollNo: '22GEO041', squad: 'Gamma Squad' },
  { uid: 'usr_08', name: 'Siddharth Nair', rollNo: '24GEO073', squad: 'Delta Squad' },
  { uid: 'usr_09', name: 'Ananya Deshmukh', rollNo: '23GEO019', squad: 'Alpha Squad' },
  { uid: 'usr_10', name: 'Vikramaditya Rao', rollNo: '21GEO005', squad: 'Beta Squad' },
];

export const AttendanceDeskScreen: React.FC<AttendanceDeskScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser: propUser,
}) => {
  const {
    events: contextEvents,
    users: contextUsers,
    attendance: contextAttendance,
    currentUser: contextUser,
    selectedEventId,
    setSelectedEventId,
  } = useApp();

  const currentUser = propUser || contextUser;

  // Available Events list: Merge Context events with fallback defaults
  const eventsList = useMemo<EventModel[]>(() => {
    if (contextEvents && contextEvents.length > 0) {
      return contextEvents;
    }
    return DEFAULT_EVENTS;
  }, [contextEvents]);

  // Event filter selection ('all' or specific event ID)
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>(() => {
    if (selectedEventId && eventsList.some((e) => e.id === selectedEventId)) {
      return selectedEventId;
    }
    const live = eventsList.find((e) => e.status === 'live');
    return live?.id || eventsList[0]?.id || 'all';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  // Manual Override dialog state
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [selectedStudentForOverride, setSelectedStudentForOverride] = useState<AttendeeRosterRecord | null>(null);
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);

  // Initialize roster populated across events
  const [roster, setRoster] = useState<AttendeeRosterRecord[]>(() => {
    const list: AttendeeRosterRecord[] = [];

    eventsList.forEach((ev, evIdx) => {
      // Determine which scholars belong to this event
      const scholarPool =
        contextUsers && contextUsers.length > 0
          ? contextUsers.filter((u) => u.role === 'student')
          : DEFAULT_SCHOLARS;

      // Match registered user IDs or distribute scholars
      const eventScholars = scholarPool.filter((scholar, scholarIdx) => {
        if (ev.registeredUserIds && ev.registeredUserIds.length > 0) {
          return ev.registeredUserIds.includes(scholar.uid);
        }
        // Fallback: distribute scholars across events
        return (scholarIdx + evIdx) % 2 === 0;
      });

      const assignedScholars = eventScholars.length > 0 ? eventScholars : scholarPool.slice(0, 5);

      assignedScholars.forEach((scholar, idx) => {
        // Initial status: mark some present as demo realistic check-ins
        const isPresent = idx % 2 === 0;
        const checkInTime = isPresent ? `09:${15 + idx * 5} AM` : undefined;

        list.push({
          uid: `${ev.id}_${scholar.uid}`,
          name: scholar.name,
          rollNo: scholar.rollNo || `24GEO00${idx + 1}`,
          squad: (scholar as any).squad || (scholar as any).team || 'General Squad',
          eventId: ev.id,
          eventName: ev.title,
          status: isPresent ? 'present' : 'absent',
          checkInTime,
        });
      });
    });

    return list;
  });

  // Active event object for metadata display
  const activeEvent = useMemo(() => {
    if (selectedEventFilter === 'all') return null;
    return eventsList.find((e) => e.id === selectedEventFilter) || null;
  }, [eventsList, selectedEventFilter]);

  // Roster filtered by chosen event
  const eventRoster = useMemo(() => {
    if (selectedEventFilter === 'all') {
      return roster;
    }
    return roster.filter((r) => r.eventId === selectedEventFilter);
  }, [roster, selectedEventFilter]);

  // Event-wise counts (Present and Absent only)
  const totalPresent = useMemo(
    () => eventRoster.filter((r) => r.status === 'present').length,
    [eventRoster]
  );
  const totalAbsent = useMemo(
    () => eventRoster.filter((r) => r.status === 'absent').length,
    [eventRoster]
  );

  // Filtered Roster by Search Query and Status Filter
  const filteredRoster = useMemo(() => {
    return eventRoster.filter((att) => {
      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Present' && att.status !== 'present') return false;
        if (statusFilter === 'Absent' && att.status !== 'absent') return false;
      }

      // Search query (student name, roll number, squad, or event name)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        att.name.toLowerCase().includes(q) ||
        att.rollNo.toLowerCase().includes(q) ||
        att.squad.toLowerCase().includes(q) ||
        att.eventName.toLowerCase().includes(q)
      );
    });
  }, [eventRoster, statusFilter, searchQuery]);

  const handleUpdateStatus = (recordUid: string, newStatus: 'present' | 'absent') => {
    if (readOnly) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRoster((prev) =>
      prev.map((att) =>
        att.uid === recordUid
          ? {
              ...att,
              status: newStatus,
              checkInTime: newStatus === 'present' ? att.checkInTime || nowTime : undefined,
            }
          : att
      )
    );

    const student = roster.find((a) => a.uid === recordUid);
    if (student) {
      onLogAudit(
        'Attendance Desk',
        `Updated attendance for ${student.name} (${student.rollNo}) to ${newStatus.toUpperCase()} for "${student.eventName}"`
      );
    }
  };

  const handleOverrideConfirm = (reason?: string) => {
    if (!selectedStudentForOverride || !reason?.trim()) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRoster((prev) =>
      prev.map((att) =>
        att.uid === selectedStudentForOverride.uid
          ? { ...att, status: 'present', checkInTime: nowTime }
          : att
      )
    );

    onLogAudit(
      'Attendance Desk',
      `Manual turnstile override for ${selectedStudentForOverride.name} (${selectedStudentForOverride.rollNo}) at "${selectedStudentForOverride.eventName}". Mandatory reason: "${reason}"`
    );

    setOverrideNotice(`Manual override recorded: ${selectedStudentForOverride.name} marked Present.`);
    setShowOverrideDialog(false);
    setSelectedStudentForOverride(null);
    setTimeout(() => setOverrideNotice(null), 3500);
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventFilter(eventId);
    if (setSelectedEventId && eventId !== 'all') {
      setSelectedEventId(eventId);
    }
  };

  return (
    <div className="space-y-3.5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Event Selector / Event Filter Header Card */}
      <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-[#DAF1DE] shadow-[0_2px_10px_rgba(5,31,32,0.03)] space-y-2 w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
              <Calendar size={13} strokeWidth={2.4} />
            </div>
            <span className="text-xs font-bold text-[#051F20] uppercase tracking-wider truncate">
              Filter by Event Name
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] shrink-0">
            {eventsList.length} Events
          </span>
        </div>

        {/* Custom Event Selection Dropdown */}
        <div className="relative w-full">
          <select
            data-testid="event-filter-select"
            value={selectedEventFilter}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full h-11 pl-3.5 pr-9 bg-[#F6FBF7] border border-[#DAF1DE] focus:border-[#163832] focus:bg-white rounded-xl text-xs sm:text-sm font-bold text-[#051F20] outline-none appearance-none cursor-pointer transition-all shadow-2xs"
            aria-label="Filter attendance by event name"
          >
            <option value="all">All Events (Consolidated Overview)</option>
            {eventsList.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} {ev.status === 'live' ? '• [LIVE NOW]' : ''}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            strokeWidth={2.4}
            className="text-[#235347] absolute right-3 top-3.5 pointer-events-none"
          />
        </div>

        {/* Selected Event Details Banner */}
        {activeEvent && (
          <div className="pt-1 flex items-center justify-between gap-2 text-xs text-[#235347] border-t border-[#DAF1DE]/60">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={12} className="text-[#163832] shrink-0" />
              <span className="truncate">{activeEvent.venue}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md font-semibold bg-[#F6FBF7] border border-[#DAF1DE] text-[#051F20] shrink-0">
              {activeEvent.category}
            </span>
          </div>
        )}
      </div>

      {/* 2. Event-Wise Metric Summary Strip: PRESENT & ABSENT (Late Removed) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
        {/* Present Metric Card */}
        <div
          data-testid="metric-present"
          className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.03)] flex flex-col justify-between min-w-0 transition-all hover:border-[#8EB69B]"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#163832] uppercase tracking-wide truncate">
              Present
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 shadow-2xs">
              <CheckCircle2 size={13} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-black text-[#051F20] leading-tight">
            <AnimatedNumber value={totalPresent} />
          </div>
          <span className="text-xs text-[#235347] font-semibold mt-0.5 truncate">
            {Math.round((totalPresent / (eventRoster.length || 1)) * 100)}% Verified
          </span>
        </div>

        {/* Absent Metric Card */}
        <div
          data-testid="metric-absent"
          className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.03)] flex flex-col justify-between min-w-0 transition-all hover:border-[#D9534F]/40"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#D9534F] uppercase tracking-wide truncate">
              Absent
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#D9534F]/10 flex items-center justify-center text-[#D9534F] shrink-0 shadow-2xs">
              <UserX size={13} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-black text-[#D9534F] leading-tight">
            <AnimatedNumber value={totalAbsent} />
          </div>
          <span className="text-xs text-[#8EB69B] font-semibold mt-0.5 truncate">
            {totalAbsent} Unmarked
          </span>
        </div>
      </div>

      {/* Override Success Notice Banner */}
      {overrideNotice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2 shadow-2xs animate-fadeIn w-full">
          <CheckCircle2 size={16} className="text-[#163832] shrink-0" />
          <span className="truncate">{overrideNotice}</span>
        </div>
      )}

      {/* 3. Attendee Roster Card */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_20px_rgba(5,31,32,0.04)] space-y-3 w-full max-w-full overflow-hidden">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#DAF1DE]/70 w-full">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-[#051F20] text-sm sm:text-base">
                Squad Leads Attendance Desk
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20]">
                {eventRoster.length}
              </span>
            </div>
            <p className="text-xs text-[#235347] mt-0.5">
              {activeEvent ? `Event: ${activeEvent.title}` : 'Showing scholars across all registered campus events.'}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search scholar name or roll no..."
            />
          </div>
        </div>

        {/* Status Filter Chips: All, Present, Absent (Late removed) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
          {[
            { label: 'All' as const, count: eventRoster.length, testId: 'filter-all' },
            { label: 'Present' as const, count: totalPresent, testId: 'filter-present' },
            { label: 'Absent' as const, count: totalAbsent, testId: 'filter-absent' },
          ].map(({ label, count, testId }) => {
            const isSelected = statusFilter === label;
            return (
              <button
                key={label}
                data-testid={testId}
                type="button"
                onClick={() => setStatusFilter(label)}
                className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 touch-target-44 ${
                  isSelected
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#DAF1DE] text-[#051F20]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Roster Cards List */}
        <div className="space-y-2.5 pt-1 w-full">
          {filteredRoster.map((att) => (
            <div
              key={att.uid}
              className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#DAF1DE] hover:border-[#8EB69B] shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2.5 w-full max-w-full overflow-hidden"
            >
              {/* Scholar Header Row */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="font-heading font-bold text-[#051F20] text-sm truncate">
                    {att.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#F6FBF7] border border-[#DAF1DE] text-[#235347]">
                    {att.rollNo}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40">
                    {att.squad}
                  </span>
                  {/* Event Name Tag */}
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-[#163832] border border-emerald-200 truncate max-w-[190px]">
                    {att.eventName}
                  </span>
                </div>

                <div className="shrink-0">
                  {att.status === 'present' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#163832]">
                      <CheckCircle2 size={13} className="text-[#163832]" />
                      Checked in: {att.checkInTime || '09:00 AM'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D9534F]">
                      <UserX size={13} className="text-[#D9534F]" />
                      Not marked
                    </span>
                  )}
                </div>
              </div>

              {/* Status Switcher & Manual Override Action: 2-State (Present / Absent) */}
              {!readOnly && (
                <div className="flex items-center gap-2 w-full pt-0.5">
                  {/* Segmented 2-State Pill Selector: Present & Absent */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex-1 min-w-0">
                    <button
                      type="button"
                      data-testid={`btn-mark-present-${att.uid}`}
                      aria-label={`Mark ${att.name} as present`}
                      onClick={() => handleUpdateStatus(att.uid, 'present')}
                      className={`h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate flex items-center justify-center gap-1 ${
                        att.status === 'present'
                          ? 'bg-[#163832] text-white shadow-2xs'
                          : 'text-[#235347] hover:bg-white/60'
                      }`}
                    >
                      <CheckCircle2 size={12} strokeWidth={att.status === 'present' ? 2.6 : 2} />
                      <span>Present</span>
                    </button>
                    <button
                      type="button"
                      data-testid={`btn-mark-absent-${att.uid}`}
                      aria-label={`Mark ${att.name} as absent`}
                      onClick={() => handleUpdateStatus(att.uid, 'absent')}
                      className={`h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate flex items-center justify-center gap-1 ${
                        att.status === 'absent'
                          ? 'bg-[#D9534F] text-white shadow-2xs'
                          : 'text-[#235347] hover:bg-white/60'
                      }`}
                    >
                      <UserX size={12} strokeWidth={att.status === 'absent' ? 2.6 : 2} />
                      <span>Absent</span>
                    </button>
                  </div>

                  {/* Manual Override Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForOverride(att);
                      setShowOverrideDialog(true);
                    }}
                    className="h-9 px-3 rounded-xl bg-white border border-[#DAF1DE] hover:border-[#163832] text-[#163832] text-xs font-bold hover:bg-[#F6FBF7] transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 touch-target-44 shadow-2xs"
                    title="Clear turnstile with institutional justification"
                  >
                    <Shield size={13} strokeWidth={2.2} />
                    <span>Override</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredRoster.length === 0 && (
            <EmptyState
              mascot="leaf"
              title="No Scholars Enrolled"
              description={
                searchQuery
                  ? `No scholars found matching "${searchQuery}".`
                  : activeEvent
                  ? `No scholars are enrolled in attendance roster for "${activeEvent.title}" yet.`
                  : 'No scholars found in attendance roster.'
              }
            />
          )}
        </div>
      </div>

      {/* Manual Override Dialog */}
      <ConfirmDialog
        isOpen={Boolean(showOverrideDialog && selectedStudentForOverride)}
        requireReason={true}
        onClose={() => {
          setShowOverrideDialog(false);
          setSelectedStudentForOverride(null);
        }}
        onConfirm={handleOverrideConfirm}
        title="Manual Attendance Override"
        message={`Authorize manual turnstile clearance for ${selectedStudentForOverride?.name} (${selectedStudentForOverride?.rollNo}) for "${selectedStudentForOverride?.eventName}"? A mandatory institutional reason is logged for audit compliance.`}
        reasonPlaceholder="Mandatory justification (e.g. Physical ID card verified at Gate 1)"
      />
    </div>
  );
};

export default AttendanceDeskScreen;
