import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Users,
  Compass,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Check,
  ChevronRight,
  XCircle,
  FileText,
  ListChecks,
  History,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { EventModel, EventStatus, EventType, EventDutyItem, EventActionLog } from '../../types';
import {
  BentoGrid,
  HeroCard,
  PillButton,
  StatusChip,
  ProgressRing,
  SearchField,
  SectionHeader,
  FormField,
  DatePickerField,
  PeoplePicker,
  BottomSheet,
  Avatar,
  EmptyState,
} from '../../components/shared';

type EventFilter = 'All' | 'Registered' | 'Workshop' | 'Field' | 'Symposium';

export const ClubEventsView: React.FC = () => {
  const {
    currentUser,
    events,
    users,
    selectedEventId,
    setSelectedEventId,
    registerForEvent,
    createEvent,
    cancelEvent,
    setActiveTab,
    showToast,
    refreshCloudData,
    isSyncing,
    syncStatus,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const isCoordinator = currentUser.role === 'coordinator' || currentUser.role === 'admin';
  const isFaculty = currentUser.role === 'faculty' || currentUser.role === 'super_admin';
  const isStudent = currentUser.role === 'student' || currentUser.role === 'member';

  // Faculty, President, and Admin roles do not register for events
  const isFacultyOrAdminOrPresident =
    currentUser.role === 'faculty' ||
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'coordinator' ||
    (currentUser.role as string) === 'president' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('president')) ||
    Boolean(currentUser.teamRole && currentUser.teamRole.toLowerCase().includes('president'));

  // Remaining members (students, volunteers, promotion, documentation, treasurer, etc.) can register
  const canRegister = !isFacultyOrAdminOrPresident;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<EventFilter>('All');
  const [activeEvent, setActiveEvent] = useState<EventModel | null>(null);

  // Cancellation Sheet State
  const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Event Creation Stepper State (Step 1, 2, 3)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

  // Stepper Step 1 Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Workshop' | 'Field' | 'Symposium' | 'Other'>('Workshop');
  const [newType, setNewType] = useState<EventType>('internal');
  const [newVenue, setNewVenue] = useState('Central Campus Auditorium');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('09:30 AM');
  const [newCapacity, setNewCapacity] = useState('150');

  // Stepper Step 2 Duties Roster
  const [rosterAssignments, setRosterAssignments] = useState<{
    promotion: string[];
    documentation: string[];
    treasurer: string[];
    mom: string[];
  }>({
    promotion: [],
    documentation: [],
    treasurer: [],
    mom: [],
  });

  // People Picker Modal State
  const [pickerTarget, setPickerTarget] = useState<'promotion' | 'documentation' | 'treasurer' | 'mom' | null>(null);

  // Sync selectedEventId from context
  useEffect(() => {
    if (selectedEventId) {
      const found = events.find((e) => e.id === selectedEventId);
      if (found) setActiveEvent(found);
    }
  }, [selectedEventId, events]);

  // Filter options: Remaining members get 'Registered' filter chip
  const filterOptions: EventFilter[] = canRegister
    ? ['All', 'Registered', 'Workshop', 'Field', 'Symposium']
    : ['All', 'Workshop', 'Field', 'Symposium'];

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Registered') {
        return ev.registeredUserIds?.includes(currentUser.uid);
      }
      return ev.category && ev.category.toLowerCase().includes(selectedFilter.toLowerCase());
    });
  }, [events, searchQuery, selectedFilter, currentUser.uid]);

  const handleOpenEvent = (ev: EventModel) => {
    setActiveEvent(ev);
    setSelectedEventId(ev.id);
  };

  const handleCloseDetail = () => {
    setActiveEvent(null);
    setSelectedEventId(null);
  };

  const handleRegister = (ev: EventModel) => {
    const capacityNum = ev.capacity || 100;
    const registeredCount = ev.registeredUserIds?.length || 0;
    const isAlreadyRegistered = ev.registeredUserIds?.includes(currentUser.uid);

    if (!isAlreadyRegistered && registeredCount >= capacityNum) {
      showToast('Event capacity is full.', 'error');
      return;
    }

    registerForEvent(ev.id);
    showToast(isAlreadyRegistered ? 'Deregistered from event.' : '✓ Registered! Gate pass active.');
  };

  const handleConfirmCancel = () => {
    if (!activeEvent) return;
    if (cancellationReason.trim().length < 10) {
      showToast('Please provide a reason with at least 10 characters.', 'error');
      return;
    }

    const res = cancelEvent(activeEvent.id, cancellationReason.trim());
    if (res.success) {
      showToast('✓ Event cancelled and notifications logged.');
      setIsCancelSheetOpen(false);
      setCancellationReason('');
      setActiveEvent((prev) => (prev ? { ...prev, status: 'cancelled', cancellationReason: cancellationReason.trim() } : null));
    }
  };

  // Submit new event proposal
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter an event title.', 'error');
      return;
    }

    createEvent({
      title: newTitle.trim(),
      category: newCategory,
      eventType: newType,
      venue: newVenue.trim(),
      startDate: newDate,
      endDate: newDate,
      time: newTime,
      budget: 0,
      createdBy: currentUser?.uid || 'coordinator',
      capacity: parseInt(newCapacity, 10) || 100,
      description: `GeoHub Chapter Event at ${newVenue}. Type: ${newType.toUpperCase()}. Duties assigned across Promotion, Documentation, Treasurer, and MoM.`,
      status: isFaculty ? 'approved' : 'submitted',
      entryOtp: '482910',
      exitOtp: newType === 'external' ? '918273' : undefined,
      duties: [
        {
          squad: 'Promotion',
          assignedToName: users.find((u) => rosterAssignments.promotion.includes(u.uid))?.name || 'Maya Patel',
          workDescription: 'Social creatives, digital banners & stage outreach',
          status: 'pending',
        },
        {
          squad: 'Documentation',
          assignedToName: users.find((u) => rosterAssignments.documentation.includes(u.uid))?.name || 'Kavita Rao',
          workDescription: 'Event transcript, photo coverage & session minutes',
          status: 'pending',
        },
        {
          squad: 'Treasurer',
          assignedToName: users.find((u) => rosterAssignments.treasurer.includes(u.uid))?.name || 'Devon Vance',
          workDescription: 'Budget invoices, refreshments vouchers & reimbursements',
          status: 'pending',
        },
        {
          squad: 'MoM',
          assignedToName: users.find((u) => rosterAssignments.mom.includes(u.uid))?.name || 'Arjun Das',
          workDescription: 'Session minutes of meeting and key decision items',
          status: 'pending',
        },
      ],
      actionLogs: [
        {
          squad: 'Management',
          actorName: currentUser.name,
          action: 'Created event draft with operational roster',
          timestamp: new Date().toISOString(),
        },
      ],
    });

    showToast(isFaculty ? '✓ Event created and approved!' : '✓ Proposal submitted for Faculty sanction!');
    setIsCreateOpen(false);
    setCreateStep(1);
    setNewTitle('');
  };

  // --------------------------------------------------------------------------
  // 1. EVENT DETAIL VIEW
  // --------------------------------------------------------------------------
  if (activeEvent) {
    const isRegistered = activeEvent.registeredUserIds?.includes(currentUser.uid);
    const capacityNum = activeEvent.capacity || 100;
    const registeredCount = activeEvent.registeredUserIds?.length || 0;
    const isFull = registeredCount >= capacityNum;
    const progressPercent = Math.min(100, Math.round((registeredCount / capacityNum) * 100));

    // Duties fallback if not explicitly populated
    const defaultDuties: EventDutyItem[] = activeEvent.duties && activeEvent.duties.length > 0
      ? activeEvent.duties
      : [
          {
            squad: 'Promotion',
            assignedToName: 'Maya Patel',
            workDescription: 'Campaign creatives, social posts & gate banner setup',
            status: 'completed',
          },
          {
            squad: 'Documentation',
            assignedToName: 'Kavita Rao',
            workDescription: 'High-res photography, video archive & session summary',
            status: 'in_progress',
          },
          {
            squad: 'Treasurer',
            assignedToName: 'Devon Vance',
            workDescription: 'Equipment vouchers, refreshments settlement & audit record',
            status: 'completed',
          },
          {
            squad: 'MoM',
            assignedToName: 'Arjun Das',
            workDescription: 'Meeting transcript, attendance roll & action items list',
            status: 'completed',
          },
        ];

    // Action Logs fallback if not explicitly populated
    const defaultActionLogs: EventActionLog[] = activeEvent.actionLogs && activeEvent.actionLogs.length > 0
      ? activeEvent.actionLogs
      : [
          {
            squad: 'Promotion',
            actorName: 'Maya Patel',
            action: 'Published announcement flyer on GeoHub campus channels',
            timestamp: '2 hours ago',
          },
          {
            squad: 'Treasurer',
            actorName: 'Devon Vance',
            action: 'Cleared ₹3,200 voucher for stage equipment and projection',
            timestamp: '4 hours ago',
          },
          {
            squad: 'Documentation',
            actorName: 'Kavita Rao',
            action: 'Configured recording camera presets and MoM shared folder',
            timestamp: 'Yesterday',
          },
        ];

    return (
      <div className="flex flex-col gap-5 select-none animate-fadeIn pb-12">
        {/* Back navigation pill */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCloseDetail}
            className="inline-flex items-center gap-1.5 bg-transparent border-0 p-0 text-sm font-bold text-[#051F20] hover:text-[#163832] cursor-pointer touch-target-44"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span>All events</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
              {activeEvent.eventType === 'external' ? 'External (2-Phase OTP)' : 'Internal (1-OTP)'}
            </span>
            <StatusChip
              status={activeEvent.status === 'completed' ? 'done' : activeEvent.status}
            />
          </div>
        </div>

        {/* 1) Dark Gradient Hero (#051F20 to #163832, 32px) */}
        <div
          className="relative overflow-hidden p-6 select-none"
          style={{
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #051F20 0%, #163832 100%)',
            boxShadow: '0 12px 36px rgba(5, 31, 32, 0.16)',
          }}
        >
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[rgba(218,241,222,0.18)] text-[#DAF1DE] border border-[rgba(218,241,222,0.3)]">
                {activeEvent.category || 'Workshop'}
              </span>
              <span className="text-xs font-semibold text-[#8EB69B]">
                {activeEvent.startDate ? new Date(activeEvent.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming'}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              {activeEvent.title}
            </h1>

            <p className="text-xs text-[#8EB69B] leading-relaxed line-clamp-2 mt-1">
              {activeEvent.description || 'Join fellow earth science & geomatics scholars for this chapter initiative.'}
            </p>

            {activeEvent.status === 'cancelled' && (
              <div className="mt-2 p-3 rounded-2xl bg-[rgba(217,83,79,0.2)] border border-[#D9534F] text-xs font-bold text-white flex items-center gap-2">
                <AlertCircle size={16} strokeWidth={1.75} className="shrink-0 text-[#D9534F]" />
                <span>Cancelled: {activeEvent.cancellationReason || 'Event cancelled by coordinator'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2) Stacked white 24px cards with #DAF1DE border */}
        <div className="flex flex-col gap-4">
          {/* Schedule & Venue Card */}
          <div
            className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-3"
            style={{ borderRadius: '24px' }}
          >
            <div className="flex items-center gap-2">
              <MapPin size={18} strokeWidth={1.75} className="text-[#163832]" />
              <h2 className="text-sm font-bold text-[#051F20]">Schedule & Venue</h2>
            </div>

            <div className="flex flex-col gap-2 pl-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                <Clock size={16} strokeWidth={1.75} className="text-[#8EB69B]" />
                <span>{activeEvent.time || '09:30 AM – 04:30 PM IST'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                <MapPin size={16} strokeWidth={1.75} className="text-[#8EB69B]" />
                <span className="font-semibold text-[#051F20]">{activeEvent.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                <Compass size={16} strokeWidth={1.75} className="text-[#8EB69B]" />
                <span>Geo-coordinates: 13.0102° N, 80.2337° E</span>
              </div>
            </div>
          </div>

          {/* Capacity Card (ProgressRing registered vs limit) */}
          <div
            className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex items-center justify-between gap-4"
            style={{ borderRadius: '24px' }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-[#051F20]">Chapter Capacity</h2>
              <p className="text-xs font-medium text-[#235347]">
                {registeredCount} of {capacityNum} scholars registered
              </p>
              <div className="mt-2 flex items-center gap-2">
                {isFull ? (
                  <StatusChip status="cancelled" label="Full" />
                ) : (
                  <StatusChip
                    status={progressPercent >= 90 ? 'low-stock' : 'live'}
                    label={progressPercent >= 90 ? 'Almost Full' : 'Open Gate'}
                  />
                )}
              </div>
            </div>

            <div className="shrink-0">
              <ProgressRing
                progress={progressPercent}
                size={84}
                strokeWidth={8}
                label={`${progressPercent}%`}
                sublabel={isFull ? 'Full' : 'Filled'}
              />
            </div>
          </div>

          {/* Faculty / Coordinator Section: Duties, Attendance Sheet Link, Action Logs, Cancel */}
          {(isFaculty || isCoordinator) && (
            <>
              {/* Duties Checklist */}
              <div
                className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-3"
                style={{ borderRadius: '24px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks size={18} strokeWidth={1.75} className="text-[#163832]" />
                    <h2 className="text-sm font-bold text-[#051F20]">Duties Checklist</h2>
                  </div>
                  <span className="text-xs font-bold text-[#235347]">4 Key Squads</span>
                </div>

                <div className="flex flex-col gap-2.5 mt-1">
                  {defaultDuties.map((duty, idx) => {
                    const volRoll = users.find((u) => u.name === duty.assignedToName)?.rollNo;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#051F20]">{duty.squad} •</span>
                            {volRoll && (
                              <span className="px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/40">
                                {volRoll}
                              </span>
                            )}
                            <span className="text-xs font-bold text-[#051F20]">{duty.assignedToName}</span>
                          </div>
                          <StatusChip
                            status={duty.status === 'completed' ? 'done' : duty.status === 'in_progress' ? 'live' : 'draft'}
                            label={duty.status}
                          />
                        </div>
                        <p className="text-xs font-medium text-[#235347]">
                          {duty.workDescription}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendance Sheet Link */}
              <div
                className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex items-center justify-between"
                style={{ borderRadius: '24px' }}
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-bold text-[#051F20]">Event Attendance Sheet</h3>
                  <p className="text-xs font-medium text-[#235347]">
                    Live gate roster, check-in records & manual override
                  </p>
                </div>
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedEventId(activeEvent.id);
                    setActiveTab('attendance');
                  }}
                  icon={<Users size={16} strokeWidth={1.75} />}
                >
                  View Sheet
                </PillButton>
              </div>

              {/* Action Log of Promotion, Documentation, and Treasurer */}
              <div
                className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-3"
                style={{ borderRadius: '24px' }}
              >
                <div className="flex items-center gap-2">
                  <History size={18} strokeWidth={1.75} className="text-[#163832]" />
                  <h2 className="text-sm font-bold text-[#051F20]">Squad Action Log</h2>
                </div>

                <div className="flex flex-col gap-2">
                  {defaultActionLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#051F20]">
                          {log.actorName} ({log.squad})
                        </span>
                        <span className="font-medium text-[#235347]">
                          {log.timestamp}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#235347]">
                        {log.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Event Button (Faculty/Coordinator only) */}
              {activeEvent.status !== 'cancelled' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCancelSheetOpen(true)}
                    className="w-full py-3 rounded-full border border-[#D9534F] text-xs font-bold text-[#D9534F] bg-white hover:bg-[rgba(217,83,79,0.06)] transition-all cursor-pointer touch-target-44 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} strokeWidth={1.75} />
                    <span>Cancel Event</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 3) Sticky Bottom Bar for Remaining Members (Hidden for Faculty, President, Admin) */}
        {canRegister && (
          <div
            className="sticky bottom-4 z-30 w-full p-3 bg-white/95 backdrop-blur-md border border-[#DAF1DE] shadow-[0_12px_36px_rgba(5,31,32,0.12)] flex items-center gap-3"
            style={{ borderRadius: '9999px' }}
          >
            <PillButton
              variant="primary"
              fullWidth
              disabled={isFull && !isRegistered}
              onClick={() => handleRegister(activeEvent)}
            >
              {isRegistered ? 'Registered (Click to Leave)' : isFull ? 'Capacity Full' : 'Register for Event'}
            </PillButton>
            {isRegistered && (
              <PillButton
                variant="secondary"
                onClick={() => {
                  setSelectedEventId(activeEvent.id);
                  setActiveTab('my_qr');
                }}
              >
                Pass / OTP
              </PillButton>
            )}
          </div>
        )}

        {/* Mandatory Cancellation Reason Sheet */}
        <BottomSheet
          isOpen={isCancelSheetOpen}
          onClose={() => setIsCancelSheetOpen(false)}
          title="Cancel Chapter Event"
          subtitle="A mandatory cancellation reason is required"
        >
          <div className="flex flex-col gap-4 py-2 select-none">
            <div className="p-3 rounded-2xl bg-[rgba(217,83,79,0.1)] border border-[#D9534F] text-xs font-medium text-[#051F20]">
              Warning: Cancelling this event will notify all registered scholars and lock attendance.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#051F20] pl-1">
                Cancellation Reason (minimum 10 characters)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="State the institutional reason for cancellation..."
                className="w-full h-28 p-3 rounded-2xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none focus:border-[#163832]"
              />
              <span className="text-xs text-[#235347] pl-1">
                {cancellationReason.trim().length}/10 characters minimum
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <PillButton
                variant="ghost"
                onClick={() => setIsCancelSheetOpen(false)}
              >
                Back
              </PillButton>
              <PillButton
                variant="primary"
                fullWidth
                disabled={cancellationReason.trim().length < 10}
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </PillButton>
            </div>
          </div>
        </BottomSheet>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. MAIN BROWSE VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-12">
      {/* 1) Browse Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            What&apos;s happening?
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Explore chapter activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Cloud Multi-Device Sync Pill */}
          <button
            type="button"
            onClick={() => refreshCloudData()}
            disabled={isSyncing}
            className="h-9 px-3 rounded-full flex items-center gap-1.5 bg-[#DAF1DE] hover:bg-[#8EB69B]/40 text-[#163832] transition active:scale-95 disabled:opacity-50 cursor-pointer border border-[#8EB69B]/30 text-xs font-bold"
            title={
              syncStatus === 'connected'
                ? 'Multi-device real-time sync active (SSE) • Tap to refresh'
                : syncStatus === 'syncing'
                ? 'Syncing across devices...'
                : 'Offline cache • Tap to reconnect'
            }
            aria-label="Refresh events from cloud"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'connected'
                  ? 'bg-[#163832] animate-pulse'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-400'
              }`}
            />
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span className="hidden xs:inline text-xs">
              {syncStatus === 'connected' ? 'Live Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Reconnect'}
            </span>
          </button>

          {/* Read-only screens HIDE create buttons */}
          {perms.canCreateEditEvents && (
            <PillButton
              variant="primary"
              size="sm"
              icon={<Plus size={16} strokeWidth={1.75} />}
              onClick={() => setIsCreateOpen(true)}
            >
              New event
            </PillButton>
          )}
        </div>
      </div>

      {/* 2) Filter Chips: All, Registered (if student), Workshop, Field, Symposium */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '2px 0',
          WebkitOverflowScrolling: 'touch',
        }}
        className="no-scrollbar"
      >
        {filterOptions.map((cat) => {
          const isSelected = selectedFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-out',
                backgroundColor: isSelected ? '#163832' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#235347',
                border: isSelected ? '1px solid #163832' : '1px solid #DAF1DE',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(5, 31, 32, 0.18)'
                  : '0 2px 6px rgba(5, 31, 32, 0.04)',
                minHeight: '44px',
                outline: 'none',
              }}
              className="touch-target-44"
            >
              {cat === 'Registered' ? 'Registered events' : cat === 'All' ? 'All events' : cat}
            </button>
          );
        })}
      </div>

      {/* 3) Search Field */}
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search chapter events by name or hall..."
      />

      {/* 4) BentoGrid of EventCards */}
      {filteredEvents.length > 0 ? (
        <BentoGrid>
          {filteredEvents.map((ev) => {
            const capacityNum = ev.capacity || 100;
            const registeredCount = ev.registeredUserIds?.length || 0;
            const isFull = registeredCount >= capacityNum;
            const progressPercent = Math.min(100, Math.round((registeredCount / capacityNum) * 100));
            const isUserRegistered = ev.registeredUserIds?.includes(currentUser.uid);

            return (
              <div
                key={ev.id}
                onClick={() => handleOpenEvent(ev)}
                className="bg-white border border-[#DAF1DE] p-5 shadow-[0_10px_30px_rgba(5,31,32,0.08)] hover:border-[#8EB69B] transition-all cursor-pointer flex flex-col justify-between"
                style={{
                  borderRadius: '24px',
                  minHeight: '230px',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] truncate max-w-[130px]">
                        {ev.category || 'Workshop'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]">
                        {ev.eventType === 'external' ? 'External' : 'Internal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isFull && <StatusChip status="cancelled" label="Full" />}
                      <StatusChip status={ev.status === 'completed' ? 'done' : ev.status} />
                    </div>
                  </div>

                  <h2 className="font-bold text-base text-[#051F20] line-clamp-2 leading-snug">
                    {ev.title}
                  </h2>

                  <div className="flex flex-col gap-1 mt-2 text-xs font-medium text-[#235347]">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} strokeWidth={1.75} className="shrink-0 text-[#8EB69B]" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} strokeWidth={1.75} className="shrink-0 text-[#8EB69B]" />
                      <span>{ev.startDate} • {ev.time || '09:30 AM'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-3 mt-3 border-t border-[#DAF1DE]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#051F20]">
                        {registeredCount}/{capacityNum} Members Registered
                      </span>
                      <span className="text-xs text-[#235347]">
                        {isFull ? 'At maximum capacity' : `${capacityNum - registeredCount} slots open`}
                      </span>
                    </div>

                    <ProgressRing
                      progress={progressPercent}
                      size={44}
                      strokeWidth={5}
                      label={`${progressPercent}%`}
                    />
                  </div>

                  {/* Remaining Members: Register button directly on card (Hidden for Faculty, President, Admin) */}
                  {canRegister && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-1"
                    >
                      <button
                        type="button"
                        disabled={isFull && !isUserRegistered}
                        onClick={() => handleRegister(ev)}
                        className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all touch-target-44 cursor-pointer flex items-center justify-center gap-1.5 ${
                          isUserRegistered
                            ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                            : isFull
                            ? 'bg-[#F6FBF7] text-[#8EB69B] border border-[#DAF1DE] cursor-not-allowed'
                            : 'bg-[#163832] text-white hover:bg-[#235347]'
                        }`}
                      >
                        {isUserRegistered ? (
                          <>
                            <CheckCircle2 size={16} strokeWidth={1.75} />
                            <span>Registered</span>
                          </>
                        ) : isFull ? (
                          <span>Capacity Full</span>
                        ) : (
                          <span>Register</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </BentoGrid>
      ) : (
        <div
          className="bg-white border border-[#DAF1DE] p-6 text-center"
          style={{ borderRadius: '24px' }}
        >
          <EmptyState
            mascot="calendar"
            title="No events found"
            subtitle="Try adjusting search or category filters"
            actionLabel="Reset filters"
            onAction={() => {
              setSelectedFilter('All');
              setSearchQuery('');
            }}
          />
        </div>
      )}

      {/* --------------------------------------------------------------------------
          3. EVENT CREATION STEPPER (FACULTY / COORDINATOR)
          Step 1: Basics (Name, Date, Time, Venue, Capacity, Type toggle)
          Step 2: Duties Roster
          Step 3: Review & Submit
          -------------------------------------------------------------------------- */}
      <BottomSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Event"
        subtitle={`Step ${createStep} of 3: ${
          createStep === 1 ? 'Event Details' : createStep === 2 ? 'Duties Roster' : 'Review & Sanction'
        }`}
        fullScreen
      >
        <div className="flex flex-col gap-4 select-none">
          {/* Step 1: Basics */}
          {createStep === 1 && (
            <div className="flex flex-col gap-3 py-1">
              <FormField
                label="Event Name"
                placeholder="e.g. GIS Spatial Analysis Workshop"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              {/* Type Toggle: Internal vs External */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-[#051F20] pl-1">Event Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['internal', 'external'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border touch-target-44 ${
                        newType === type
                          ? 'bg-[#163832] text-white border-[#163832]'
                          : 'bg-white text-[#235347] border-[#DAF1DE]'
                      }`}
                      style={{ borderRadius: '16px' }}
                    >
                      {type === 'internal' ? 'Internal (1-OTP)' : 'External (Entry & Exit OTP)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-[#051F20] pl-1">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Workshop', 'Field', 'Symposium'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border touch-target-44 ${
                        newCategory === cat
                          ? 'bg-[#163832] text-white border-[#163832]'
                          : 'bg-white text-[#235347] border-[#DAF1DE]'
                      }`}
                      style={{ borderRadius: '16px' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <DatePickerField
                  label="Date"
                  value={newDate}
                  onChange={setNewDate}
                />
                <FormField
                  label="Time"
                  placeholder="09:30 AM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>

              <FormField
                label="Venue & Room"
                placeholder="e.g. Science Block Seminar Hall 3"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
              />

              <FormField
                label="Capacity"
                type="number"
                placeholder="150"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
              />

              <div className="pt-2">
                <PillButton
                  variant="primary"
                  fullWidth
                  disabled={!newTitle.trim()}
                  onClick={() => setCreateStep(2)}
                  icon={<ChevronRight size={16} strokeWidth={1.75} />}
                  iconPosition="right"
                >
                  Next: Duties Roster
                </PillButton>
              </div>
            </div>
          )}

          {/* Step 2: Duties Roster */}
          {createStep === 2 && (
            <div className="flex flex-col gap-3 py-1">
              <p className="text-xs font-medium text-[#235347]">
                Assign volunteers to key event operational squads (Promotion, Documentation, Treasurer, MoM).
              </p>

              {[
                { key: 'promotion' as const, title: 'Promotion Squad' },
                { key: 'documentation' as const, title: 'Documentation Squad' },
                { key: 'treasurer' as const, title: 'Treasurer Squad' },
                { key: 'mom' as const, title: 'Minutes of Meeting (MoM) Squad' },
              ].map((duty) => (
                <div
                  key={duty.key}
                  className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between"
                  style={{ borderRadius: '16px' }}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#051F20]">{duty.title}</span>
                    <span className="text-xs font-medium text-[#235347]">
                      {rosterAssignments[duty.key].length} assigned
                    </span>
                  </div>

                  <PillButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setPickerTarget(duty.key)}
                  >
                    Assign
                  </PillButton>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <PillButton
                  variant="ghost"
                  onClick={() => setCreateStep(1)}
                >
                  Back
                </PillButton>
                <PillButton
                  variant="primary"
                  fullWidth
                  onClick={() => setCreateStep(3)}
                  icon={<ChevronRight size={16} strokeWidth={1.75} />}
                  iconPosition="right"
                >
                  Next: Review & Submit
                </PillButton>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {createStep === 3 && (
            <div className="flex flex-col gap-3 py-1">
              <div
                className="p-4 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-2"
                style={{ borderRadius: '16px' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#8EB69B]">Sanction Proposal</span>
                  <StatusChip
                    status={isFaculty ? 'approved' : 'submitted'}
                    label={isFaculty ? 'Faculty Direct Sanction' : 'Awaiting Faculty Sanction'}
                  />
                </div>
                <h3 className="text-base font-bold text-[#051F20]">{newTitle}</h3>
                <span className="text-xs font-medium text-[#235347]">
                  {newCategory} • {newType.toUpperCase()} • {newVenue}
                </span>
                <span className="text-xs font-semibold text-[#163832]">
                  {newDate} at {newTime} • Capacity: {newCapacity} Scholars
                </span>
              </div>

              {!isFaculty && (
                <div className="p-3 rounded-2xl bg-[rgba(242,184,75,0.14)] border border-[#F2B84B] text-xs font-medium text-[#051F20]">
                  Institutional Governance Rule: Coordinator proposals require Faculty Advisor approval before opening gate registration.
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <PillButton
                  variant="ghost"
                  onClick={() => setCreateStep(2)}
                >
                  Back
                </PillButton>
                <PillButton
                  variant="primary"
                  fullWidth
                  onClick={handleFinalSubmit}
                >
                  {isFaculty ? 'Create & Sanction' : 'Submit for Sanction'}
                </PillButton>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* People Picker for assigning volunteers */}
      {pickerTarget && (
        <PeoplePicker
          isOpen={Boolean(pickerTarget)}
          onClose={() => setPickerTarget(null)}
          title={`Assign ${pickerTarget.toUpperCase()} Squad`}
          people={users.map((u) => ({
            id: u.uid,
            rollNo: u.rollNo || u.email?.split('@')[0]?.toUpperCase(),
            name: u.name,
            role: u.post || u.role,
          }))}
          selectedIds={rosterAssignments[pickerTarget]}
          onConfirm={(selected) => {
            setRosterAssignments((prev) => ({
              ...prev,
              [pickerTarget]: selected,
            }));
          }}
        />
      )}
    </div>
  );
};

export default ClubEventsView;
