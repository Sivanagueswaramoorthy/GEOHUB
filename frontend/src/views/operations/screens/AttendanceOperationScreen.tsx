import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  QrCode,
  X,
  CheckCircle2,
  Clock,
  KeyRound,
  RefreshCw,
  Search,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatusChip, EmptyState } from '../../../components/shared';

export interface AttendanceOperationScreenProps {
  readOnly?: boolean;
  onLogAudit?: (event: string, action: string) => void;
  currentUser?: any;
}

export const AttendanceOperationScreen: React.FC<AttendanceOperationScreenProps> = ({
  readOnly = false,
  onLogAudit,
  currentUser: propUser,
}) => {
  const {
    currentUser: contextUser,
    events,
    users,
    attendance,
    selectedEventId,
    setSelectedEventId,
    markAttendanceWithOtp,
    showToast,
  } = useApp();

  const currentUser = propUser || contextUser;

  // Active event selection
  const [chosenEventId, setChosenEventId] = useState<string>(() => {
    if (selectedEventId) return selectedEventId;
    const live = events?.find((e) => e.status === 'live');
    if (live) return live.id;
    return events?.[0]?.id || 'event_01';
  });

  // Self-verification inputs
  const [otpInput, setOtpInput] = useState('');
  const [exitOtpInput, setExitOtpInput] = useState('');
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  // Dynamic QR Code Modal State
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [tokenSeed, setTokenSeed] = useState(() => Date.now().toString(36));
  const [otp, setOtp] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  // Roster Filter & Search
  const [attendanceTab, setAttendanceTab] = useState<'marked' | 'not_marked'>('marked');
  const [rosterSearch, setRosterSearch] = useState('');

  // Rebuilt Event Selector Dropdown State
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };
    if (isEventDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEventDropdownOpen]);

  const chosenEvent =
    events?.find((e) => e.id === chosenEventId) || events?.[0];

  const isExternalEvent = chosenEvent?.eventType === 'external';

  // 20-second validity countdown timer for QR code
  useEffect(() => {
    if (!isPopupOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTokenSeed(Date.now().toString(36));
          setOtp(Math.floor(100000 + Math.random() * 900000).toString());
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPopupOpen]);

  const handleOpenQrPopup = () => {
    setTokenSeed(Date.now().toString(36));
    setOtp(Math.floor(100000 + Math.random() * 900000).toString());
    setSecondsLeft(20);
    setIsPopupOpen(true);
    onLogAudit?.(chosenEvent.title, `Generated attendance turnstile QR and 6-digit OTP token`);
    showToast?.('OTP Active (20s)', 'success');
  };

  const handleCloseQrPopup = () => {
    setIsPopupOpen(false);
  };

  const handleRefreshToken = () => {
    setTokenSeed(Date.now().toString(36));
    setOtp(Math.floor(100000 + Math.random() * 900000).toString());
    setSecondsLeft(20);
    showToast?.('OTP Refreshed (20s)', 'success');
  };

  const handleEventChange = (newId: string) => {
    setChosenEventId(newId);
    if (setSelectedEventId) {
      setSelectedEventId(newId);
    }
    setRosterSearch('');
    const target = events?.find((e) => e.id === newId);
    showToast?.(target?.title ? `Event: ${target.title}` : 'Event Selected', 'info');
  };

  // Compute registered scholars and attendance for chosen event
  const registeredScholars = useMemo(() => {
    const regIds = new Set<string>(chosenEvent.registeredUserIds || []);

    (attendance || [])
      .filter((a) => a.eventId === chosenEvent.id)
      .forEach((a) => regIds.add(a.userId));

    const finalIds =
      regIds.size > 0
        ? Array.from(regIds)
        : (users || []).slice(1, 9).map((u) => u.uid);

    return finalIds.map((uid) => {
      const user = (users || []).find((u) => u.uid === uid);
      const attRec = (attendance || []).find(
        (a) => a.eventId === chosenEvent.id && a.userId === uid
      );
      const isMarked = Boolean(
        attRec &&
          (attRec.status === 'Completed' ||
            attRec.status === 'Entered' ||
            attRec.status === 'verified')
      );

      return {
        uid,
        name: user?.name || attRec?.userName || 'Scholar Attendee',
        rollNo: user?.rollNo || '21GEO000',
        department: user?.department || 'Geoinformatics',
        team: user?.team || attRec?.team,
        status: isMarked ? (attRec?.status || 'Completed') : 'Not marked',
        isMarked,
        checkInTime: attRec?.checkInTime || attRec?.entryTime,
      };
    });
  }, [chosenEvent, users, attendance]);

  const markedList = useMemo(
    () => registeredScholars.filter((s) => s.isMarked),
    [registeredScholars]
  );

  const unmarkedList = useMemo(
    () => registeredScholars.filter((s) => !s.isMarked),
    [registeredScholars]
  );

  const currentTabList = attendanceTab === 'marked' ? markedList : unmarkedList;

  const filteredRoster = useMemo(() => {
    if (!rosterSearch.trim()) return currentTabList;
    const q = rosterSearch.toLowerCase();
    return currentTabList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }, [currentTabList, rosterSearch]);

  const myAttendance = (attendance || []).find(
    (a) =>
      a.eventId === chosenEvent.id &&
      (a.userId === currentUser?.uid || a.userEmail === currentUser?.email)
  );
  const isFullyMarked =
    myAttendance?.status === 'Completed' || myAttendance?.status === 'verified';
  const isPhase1Marked = myAttendance?.status === 'Entered';

  const handleVerifyOtp = (phase: 'entry' | 'exit' = 'entry') => {
    const code = (phase === 'entry' ? otpInput : exitOtpInput).trim();
    if (code.length < 6) {
      showToast?.('Please enter a valid 6-digit OTP.', 'error');
      return;
    }
    setIsSubmittingOtp(true);
    const res = markAttendanceWithOtp?.({
      eventId: chosenEvent.id,
      studentId: currentUser?.uid || 'user-current',
      otp: code,
      phase,
    });
    setIsSubmittingOtp(false);
    if (res?.valid) {
      if (phase === 'entry') setOtpInput('');
      if (phase === 'exit') setExitOtpInput('');
      onLogAudit?.(chosenEvent.title, `Verified attendance via OTP (${phase})`);
      showToast?.(
        phase === 'exit'
          ? '✓ External event verified! Attendance complete.'
          : isExternalEvent
          ? '✓ Phase 1 check-in verified! Enter Phase 2 at departure.'
          : '✓ Attendance confirmed! Check-in verified.'
      );
    } else {
      showToast?.(res?.error || 'Invalid or expired OTP', 'error');
    }
  };

  if (!events || events.length === 0 || !chosenEvent) {
    return (
      <div className="flex flex-col gap-3.5 pb-24 select-none">
        <EmptyState
          mascot="calendar"
          title="No Active Events"
          description="Create or schedule a chapter event first to enable smart QR passes, OTP check-ins, and turnstile verification."
        />
      </div>
    );
  }

  const dynamicQrPayload = `GEO-PASS:${chosenEvent.id}:${currentUser?.uid || 'u_guest'}:${tokenSeed}:${currentUser?.rollNo || '21GEO001'}:${otp}`;

  return (
    <div className="flex flex-col gap-3.5 pb-24 select-none">
      {/* 1) Event Selector Card: Custom Rebuilt UI */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2EBE5] shadow-[0_4px_20px_rgba(5,31,32,0.03)] flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#051F20] flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] text-[#163832] flex items-center justify-center shrink-0">
              <Calendar size={13} strokeWidth={2.2} />
            </div>
            Choose Event:
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#163832] border border-[#DAF1DE]/60">
            {events?.length || 0} Available
          </span>
        </div>

        {/* Rebuilt Custom Event Filter Dropdown */}
        <div className="relative w-full" ref={eventDropdownRef}>
          <button
            type="button"
            onClick={() => setIsEventDropdownOpen((prev) => !prev)}
            aria-expanded={isEventDropdownOpen}
            aria-haspopup="listbox"
            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
              isEventDropdownOpen
                ? 'bg-[#F2F8F4] border-[#163832] ring-2 ring-[#163832]/10 shadow-sm'
                : 'bg-[#FAFCFA] border-[#DDE7DF] hover:bg-[#F2F7F4] hover:border-[#8EB69B]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#163832] flex items-center justify-center shrink-0">
                <Sparkles size={15} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-[#051F20] truncate">
                  {chosenEvent?.title || 'Select an Event'}
                </span>
                <span className="text-[10.5px] font-medium text-[#235347] truncate flex items-center gap-1.5">
                  <span>
                    {chosenEvent?.startDate || (chosenEvent as any)?.date
                      ? new Date(chosenEvent.startDate || (chosenEvent as any).date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Scheduled'}
                  </span>
                  <span>•</span>
                  <span>{chosenEvent?.venue || (chosenEvent as any)?.location || (isExternalEvent ? 'External' : 'Campus')}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  chosenEvent?.status === 'approved' || chosenEvent?.status === 'live'
                    ? 'bg-[#EAF3EC] text-[#163832] border-[#8EB69B]/60'
                    : chosenEvent?.status === 'cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {(chosenEvent?.status || 'approved').toUpperCase()}
              </span>
              <ChevronDown
                size={16}
                className={`text-[#235347] transition-transform duration-200 ${
                  isEventDropdownOpen ? 'rotate-180 text-[#163832]' : ''
                }`}
              />
            </div>
          </button>

          {/* Hidden native select for test & screen-reader compatibility */}
          <select
            value={chosenEventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            data-testid="event-selector-qr"
          >
            {(events || []).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.status.toUpperCase()})
              </option>
            ))}
          </select>

          {/* Animated Dropdown Menu List */}
          {isEventDropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-[#DAF1DE] shadow-[0_12px_36px_rgba(5,31,32,0.14)] p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto no-scrollbar animate-fadeIn"
              role="listbox"
            >
              {(events || []).map((ev) => {
                const isSelected = ev.id === chosenEventId;
                const isApproved = ev.status === 'approved' || ev.status === 'live';
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      handleEventChange(ev.id);
                      setIsEventDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF3EC] text-[#163832]'
                        : 'hover:bg-[#F7FAF8] text-[#051F20]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#163832] bg-[#163832] text-white'
                            : 'border-[#CBDAD0] bg-white'
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-xs truncate ${
                            isSelected ? 'font-bold text-[#163832]' : 'font-semibold text-[#051F20]'
                          }`}
                        >
                          {ev.title}
                        </span>
                        <span className="text-[10px] text-[#235347] truncate">
                          {ev.startDate || (ev as any).date
                            ? new Date(ev.startDate || (ev as any).date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Scheduled'}{' '}
                          {ev.venue || (ev as any).location ? `• ${ev.venue || (ev as any).location}` : ''}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        isApproved
                          ? 'bg-[#DAF1DE]/70 text-[#163832] border-[#8EB69B]/50'
                          : ev.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {ev.status.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Generate QR Button directly below Choosing Event */}
        <button
          type="button"
          onClick={handleOpenQrPopup}
          className="w-full h-11 px-5 rounded-2xl bg-[#163832] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(22,56,50,0.18)] hover:bg-[#0B2B26] active:scale-[0.98] transition-all cursor-pointer touch-target-44"
          aria-label="Generate QR"
          data-testid="btn-generate-qr"
        >
          <QrCode size={17} strokeWidth={2.2} />
          <span>Generate QR</span>
        </button>
      </div>

      {/* 2) 6-Digit OTP Self-Validation Card */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2EBE5] shadow-[0_4px_20px_rgba(5,31,32,0.03)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EAF3EC] text-[#163832] flex items-center justify-center shrink-0">
              <KeyRound size={13} strokeWidth={2.2} />
            </div>
            <span className="text-xs font-bold text-[#051F20]">Self-Verify via OTP</span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#163832] border border-[#DAF1DE]/60">
            {isExternalEvent ? 'Dual OTP (External)' : '1 OTP (Internal)'}
          </span>
        </div>

        {isFullyMarked ? (
          <div className="p-3 rounded-2xl bg-[#EAF3EC] border border-[#8EB69B]/50 flex items-center gap-2.5 text-[#051F20]">
            <CheckCircle2 size={18} className="text-[#163832] shrink-0" />
            <div className="flex flex-col text-xs">
              <span className="font-bold">Attendance Verified</span>
              <span className="text-[#235347]">You are marked present for this event.</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {/* Phase 1 / Single OTP Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                disabled={isPhase1Marked || readOnly}
                placeholder={isExternalEvent ? 'Phase 1: Entry OTP (6 digits)' : 'Gate OTP (6 digits)'}
                className="flex-1 h-10 px-3.5 rounded-xl border border-[#DDE7DF] bg-[#FAFCFA] text-xs font-bold tracking-widest text-[#051F20] outline-none focus:border-[#163832] disabled:bg-gray-100 disabled:text-gray-400"
              />
              <button
                type="button"
                onClick={() => handleVerifyOtp('entry')}
                disabled={isSubmittingOtp || otpInput.trim().length !== 6 || isPhase1Marked || readOnly}
                className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#0B2B26] transition-all cursor-pointer"
              >
                {isPhase1Marked ? '✓ In' : 'Verify'}
              </button>
            </div>

            {/* Phase 2 OTP Input for External Events */}
            {isExternalEvent && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#EDF3EF]">
                <input
                  type="text"
                  maxLength={6}
                  value={exitOtpInput}
                  onChange={(e) => setExitOtpInput(e.target.value.replace(/\D/g, ''))}
                  disabled={!isPhase1Marked || readOnly}
                  placeholder="Phase 2: Exit OTP (6 digits)"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-[#DDE7DF] bg-[#FAFCFA] text-xs font-bold tracking-widest text-[#051F20] outline-none focus:border-[#163832] disabled:bg-gray-100 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyOtp('exit')}
                  disabled={isSubmittingOtp || exitOtpInput.trim().length !== 6 || !isPhase1Marked || readOnly}
                  className="h-10 px-5 rounded-xl bg-[#235347] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#163832] transition-all cursor-pointer"
                >
                  Verify Phase 2
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3) Event Attendance Roster: Tab Bars for Marked & Not Marked */}
      <div className="bg-white p-4 sm:p-5 flex flex-col border border-[#E2EBE5] shadow-[0_4px_20px_rgba(5,31,32,0.03)] rounded-3xl gap-3">
        {/* Roster Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <h3 className="text-sm font-bold text-[#051F20] truncate">
              Event Attendance
            </h3>
            <span className="text-[11px] font-medium text-[#235347] truncate">
              {chosenEvent.title}
            </span>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EAF3EC] text-[#163832] border border-[#DAF1DE]/60 shrink-0">
            {registeredScholars.length} Registered
          </span>
        </div>

        {/* Segmented Tab Bars */}
        <div className="w-full grid grid-cols-2 p-1 rounded-2xl bg-[#EEF4F0] border border-[#E0EAE2] gap-1">
          <button
            type="button"
            onClick={() => setAttendanceTab('marked')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-target-44 cursor-pointer ${
              attendanceTab === 'marked'
                ? 'bg-[#163832] text-white shadow-[0_2px_8px_rgba(22,56,50,0.25)]'
                : 'text-[#235347] hover:text-[#051F20]'
            }`}
            aria-label={`Marked Attendance (${markedList.length})`}
          >
            <CheckCircle2
              size={14}
              className={attendanceTab === 'marked' ? 'text-[#8EB69B]' : 'text-[#8EB69B]'}
            />
            <span>Marked ({markedList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAttendanceTab('not_marked')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-target-44 cursor-pointer ${
              attendanceTab === 'not_marked'
                ? 'bg-[#163832] text-white shadow-[0_2px_8px_rgba(22,56,50,0.25)]'
                : 'text-[#235347] hover:text-[#051F20]'
            }`}
            aria-label={`Not Marked Attendance (${unmarkedList.length})`}
          >
            <Clock
              size={14}
              className={attendanceTab === 'not_marked' ? 'text-[#8EB69B]' : 'text-[#8EB69B]'}
            />
            <span>Not Marked ({unmarkedList.length})</span>
          </button>
        </div>

        {/* Clean Search Input */}
        <div className="w-full relative">
          <input
            type="text"
            value={rosterSearch}
            onChange={(e) => setRosterSearch(e.target.value)}
            placeholder="Search scholar by name or roll..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#DDE7DF] bg-[#FAFCFA] text-xs font-medium text-[#051F20] outline-none focus:border-[#163832] transition-all"
          />
          <Search size={14} className="absolute left-3 top-3 text-[#8EB69B]" />
        </div>

        {/* Scholar List - Clean cards with NO letter avatar icons */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto no-scrollbar pr-0.5">
          {filteredRoster.length === 0 ? (
            <div className="py-7 px-4 rounded-2xl bg-[#FAFCFA] border border-dashed border-[#DAF1DE] text-center flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#EAF3EC] text-[#163832] flex items-center justify-center shadow-xs">
                {attendanceTab === 'marked' ? (
                  <QrCode size={18} strokeWidth={2} />
                ) : (
                  <CheckCircle2 size={18} strokeWidth={2} />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#051F20]">
                  {attendanceTab === 'marked' ? 'No Check-ins Yet' : 'All Scholars Checked In'}
                </span>
                <span className="text-[11px] text-[#235347] max-w-[220px] leading-relaxed">
                  {attendanceTab === 'marked'
                    ? 'Registered scholars who scan will appear here in real time.'
                    : 'All registered scholars have marked attendance!'}
                </span>
              </div>
            </div>
          ) : (
            filteredRoster.map((scholar) => (
              <div
                key={scholar.uid}
                className="p-3 rounded-2xl bg-[#FAFCFA] border border-[#E4EBE6] flex items-center justify-between gap-3 hover:border-[#8EB69B]/70 transition-all"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    {scholar.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#235347] truncate">
                    <span className="font-semibold text-[#163832]">
                      {scholar.rollNo}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <StatusChip
                    status={scholar.isMarked ? 'done' : 'pending'}
                    label={scholar.isMarked ? (scholar.status === 'Entered' ? 'Entered' : 'Marked') : 'Not Marked'}
                  />
                  <span className="text-xs font-medium text-[#235347]">
                    {scholar.isMarked && scholar.checkInTime
                      ? new Date(scholar.checkInTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : scholar.isMarked
                      ? 'Marked'
                      : 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4) Dynamic QR Code & OTP Modal Popup */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Attendance QR Code and OTP"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2EBE5] shadow-[0_24px_60px_rgba(5,31,32,0.25)] flex flex-col items-center gap-3.5 relative max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#163832] text-white shadow-xs max-w-[240px] truncate">
                <span className="w-2 h-2 rounded-full bg-[#8EB69B] animate-pulse shrink-0" />
                <span className="truncate">{chosenEvent.title}</span>
              </span>

              <button
                type="button"
                onClick={handleCloseQrPopup}
                className="w-8 h-8 rounded-full bg-[#FAFCFA] border border-[#DDE7DF] text-[#163832] flex items-center justify-center hover:bg-[#EAF3EC] active:scale-95 transition-all cursor-pointer touch-target-44"
                aria-label="Close QR Modal"
                data-testid="btn-close-qr-modal"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            {/* Top Center Live Indicator */}
            <div className="w-full flex items-center justify-center -mt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3EC] border border-[#8EB69B]/50 text-[#163832] text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#163832] animate-pulse shrink-0" />
                <span>OTP Active • Refreshes in {secondsLeft}s</span>
              </div>
            </div>

            {/* QR Code Frame */}
            <div className="p-4 rounded-2xl bg-[#FAFCFA] border border-[#E2EBE5] shadow-[0_4px_16px_rgba(5,31,32,0.04)]">
              <QRCodeSVG
                value={dynamicQrPayload}
                size={180}
                level="H"
                fgColor="#051F20"
                bgColor="transparent"
              />
            </div>

            {/* 6-Digit OTP Section */}
            <div className="w-full flex flex-col items-center p-3 rounded-2xl bg-[#FAFCFA] border border-[#E2EBE5] text-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#235347]">
                6-Digit Attendance OTP
              </span>

              <div className="flex items-center justify-center gap-1.5 my-1">
                {otp.split('').map((digit, idx) => (
                  <span
                    key={idx}
                    className="w-9 h-11 rounded-xl bg-white border border-[#DDE7DF] shadow-xs flex items-center justify-center text-lg font-bold text-[#051F20] font-mono"
                  >
                    {digit}
                  </span>
                ))}
              </div>

              <div className="w-full flex items-center justify-between text-xs pt-1 px-1">
                <span className="font-semibold text-[#163832]">
                  Valid: {secondsLeft}s
                </span>
                <button
                  type="button"
                  onClick={handleRefreshToken}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#163832] hover:text-[#051F20] cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Refresh Token</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseQrPopup}
              className="w-full h-11 rounded-full bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-[0.98] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceOperationScreen;
