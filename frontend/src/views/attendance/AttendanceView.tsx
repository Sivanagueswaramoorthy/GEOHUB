import React, { useState, useEffect } from 'react';
import {
  Download,
  Search,
  CheckCircle2,
  Users,
  Calendar,
  KeyRound,
  ShieldCheck,
  Edit3,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { AttendanceStatus } from '../../types';
import {
  PillButton,
  StatusChip,
  ProgressRing,
  Avatar,
  Mascot,
  SearchField,
  BottomSheet,
  PeoplePicker,
} from '../../components/shared';

type StatusFilter = 'All' | 'Completed' | 'Entered' | 'Incomplete' | 'Not marked';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    events,
    attendance,
    users,
    selectedEventId,
    setSelectedEventId,
    overrideAttendance,
    assignEventScanners,
    showToast,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const isFacultyOrCoordinator = perms.canOverrideAttendance;
  const isManagementOrHigher =
    currentUser.role === 'management' ||
    currentUser.role === 'coordinator' ||
    currentUser.role === 'faculty' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'super_admin';

  const [activeEventId, setActiveEventId] = useState<string>(
    selectedEventId || events[0]?.id || 'event_01'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  // Scanner Assignment Modal
  const [isAssignPickerOpen, setIsAssignPickerOpen] = useState(false);

  // Live OTP Countdown
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(60);

  // Manual Override State
  const [overrideRecord, setOverrideRecord] = useState<{
    id: string;
    studentName: string;
    currentStatus: AttendanceStatus;
  } | null>(null);
  const [targetStatus, setTargetStatus] = useState<AttendanceStatus>('Completed');
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    if (selectedEventId) {
      setActiveEventId(selectedEventId);
    }
  }, [selectedEventId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpSecondsLeft((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedEvent = events.find((e) => e.id === activeEventId) || events[0];
  const isExternal = selectedEvent?.eventType === 'external';
  const assignedScanners = selectedEvent?.assignedScannerUserIds || [];

  const records = attendance.filter((a) => a.eventId === activeEventId);

  const filteredRecords = records.filter((rec) => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Completed' && rec.status !== 'Completed' && rec.status !== 'verified') {
        return false;
      }
      if (statusFilter !== 'Completed' && rec.status !== statusFilter) {
        return false;
      }
    }
    if (
      searchQuery &&
      !rec.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !rec.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const percentVerified =
    selectedEvent && selectedEvent.capacity > 0
      ? Math.min(100, Math.round((records.length / selectedEvent.capacity) * 100))
      : 0;

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showToast('No records to export for this filter.', 'info');
      return;
    }

    const headers = [
      'Record ID',
      'Event Title',
      'Student Name',
      'College Email',
      'Team',
      'Check-In Timestamp',
      'Scanned By',
      'Status',
      'Override Reason',
      'Overridden By',
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.eventTitle}"`,
      `"${r.userName}"`,
      r.userEmail,
      r.team || 'General Member',
      r.checkInTime,
      `"${r.scannedByVolunteerName}"`,
      r.status,
      `"${r.overrideReason || ''}"`,
      `"${r.overriddenBy || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoHub_Attendance_${selectedEvent.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveOverride = () => {
    if (!overrideRecord) return;
    if (overrideReason.trim().length < 5) {
      showToast('A reason of at least 5 characters is required.', 'error');
      return;
    }

    const res = overrideAttendance(overrideRecord.id, targetStatus, overrideReason.trim());
    if (res.success) {
      setOverrideRecord(null);
      setOverrideReason('');
    }
  };

  const handleSaveScanners = (newScannerIds: string[]) => {
    assignEventScanners(selectedEvent.id, newScannerIds);
    showToast(`✓ Updated ${newScannerIds.length} scanners for this event.`);
    setIsAssignPickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-16">
      {/* 1) Header: 1 headline, 1 subtitle, CSV Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Attendance
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Live gate roster & verification
          </p>
        </div>

        <PillButton
          icon={<Download size={16} strokeWidth={1.75} />}
          variant="primary"
          onClick={handleExportCSV}
        >
          Export CSV
        </PillButton>
      </div>

      {/* 2) Target Event Selector & Progress Ring */}
      <div
        className="p-5 bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.08)] flex flex-col gap-4"
        style={{ borderRadius: '24px' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-bold text-[#235347] block mb-1">
              Target Event
            </label>
            <select
              value={activeEventId}
              onChange={(e) => {
                setActiveEventId(e.target.value);
                setSelectedEventId(e.target.value);
              }}
              className="w-full h-11 px-3 text-xs font-bold text-[#051F20] bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.registeredUserIds.length} Registered • {ev.eventType === 'external' ? 'External' : 'Internal'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <ProgressRing
              progress={percentVerified}
              size={56}
              strokeWidth={5}
              label={`${records.length}`}
            />
            <span className="text-xs font-bold text-[#235347] mt-1">
              Check-ins
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#DAF1DE] text-center">
          <div>
            <div className="text-xs text-[#235347] font-semibold">Total Verified</div>
            <div className="text-lg font-bold text-[#163832]">{records.length}</div>
          </div>
          <div>
            <div className="text-xs text-[#235347] font-semibold">Registered</div>
            <div className="text-lg font-bold text-[#051F20]">
              {selectedEvent ? selectedEvent.registeredUserIds.length : 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#235347] font-semibold">Capacity</div>
            <div className="text-lg font-bold text-[#235347]">
              {selectedEvent ? selectedEvent.capacity : 0}
            </div>
          </div>
        </div>
      </div>

      {/* 3) Management Operations Section: Attendance Scanners & Live OTP Panel */}
      {isManagementOrHigher && (
        <div
          className="p-5 bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] flex flex-col gap-4"
          style={{ borderRadius: '24px' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={18} strokeWidth={1.75} className="text-[#163832]" />
              <h2 className="text-sm font-bold text-[#051F20]">
                Event Scanners & Live OTP
              </h2>
            </div>
            <PillButton
              variant="secondary"
              size="sm"
              onClick={() => setIsAssignPickerOpen(true)}
            >
              Assign Scanners ({assignedScanners.length})
            </PillButton>
          </div>

          {/* Live OTP Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Entry OTP Panel */}
            <div className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#235347]">
                  {isExternal ? 'Phase 1: Entry OTP' : 'Live Gate Pass OTP'}
                </span>
                <span className="text-2xl font-bold tracking-widest text-[#051F20]">
                  {selectedEvent.entryOtp || '482910'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20]">
                  {otpSecondsLeft}s
                </span>
              </div>
            </div>

            {/* Exit OTP Panel (External Events Only) */}
            {isExternal && (
              <div className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#235347]">
                    Phase 2: Exit OTP
                  </span>
                  <span className="text-2xl font-bold tracking-widest text-[#051F20]">
                    {selectedEvent.exitOtp || '918273'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20]">
                    {otpSecondsLeft}s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4) Status Filter Chips */}
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
        {(['All', 'Completed', 'Entered', 'Incomplete', 'Not marked'] as StatusFilter[]).map((status) => {
          const isSelected = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
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
              {status}
            </button>
          );
        })}
      </div>

      {/* 5) Search Field */}
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Filter attendees by scholar name or email..."
      />

      {/* 6) Attendance Sheet List */}
      <div className="flex flex-col gap-2.5">
        {filteredRecords.length === 0 ? (
          <div
            className="p-8 bg-white border border-[#DAF1DE] text-center shadow-[0_10px_30px_rgba(5,31,32,0.06)] flex flex-col items-center"
            style={{ borderRadius: '24px' }}
          >
            <Mascot name="clipboard" size="md" />
            <h3 className="text-sm font-bold text-[#051F20] mt-2 mb-1">
              No check-in records
            </h3>
            <p className="text-xs text-[#235347]">
              Attendee scans matching &quot;{statusFilter}&quot; will appear here
            </p>
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const statusKey =
              rec.status === 'Completed' || rec.status === 'verified'
                ? 'done'
                : rec.status === 'Entered'
                ? 'live'
                : rec.status === 'Incomplete'
                ? 'cancelled'
                : 'draft';

            return (
              <div
                key={rec.id}
                className="p-4 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex items-center justify-between gap-3"
                style={{ borderRadius: '20px' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={rec.userName} size={40} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#051F20]">
                        {rec.userName}
                      </span>
                      {rec.team && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                          {rec.team}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#235347] truncate">
                      {rec.userEmail}
                    </div>
                    {rec.overrideReason && (
                      <div className="text-xs text-[#235347] italic mt-0.5">
                        Override: {rec.overrideReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <StatusChip status={statusKey} label={rec.status} />
                    <div className="text-xs font-medium text-[#235347] mt-1">
                      {new Date(rec.checkInTime || rec.entryTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Manual Override Button (Faculty / Coordinator only) */}
                  {isFacultyOrCoordinator && (
                    <button
                      type="button"
                      onClick={() => {
                        setOverrideRecord({
                          id: rec.id,
                          studentName: rec.userName,
                          currentStatus: rec.status as AttendanceStatus,
                        });
                        setTargetStatus(rec.status as AttendanceStatus);
                        setOverrideReason(rec.overrideReason || '');
                      }}
                      className="p-2 rounded-full border border-[#DAF1DE] bg-[#F6FBF7] text-[#163832] hover:bg-[#DAF1DE] transition-colors cursor-pointer touch-target-44 flex items-center justify-center"
                      title="Override Attendance"
                      aria-label="Override Attendance"
                    >
                      <Edit3 size={16} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Override Sheet (Faculty and Coordinator only) */}
      <BottomSheet
        isOpen={Boolean(overrideRecord)}
        onClose={() => setOverrideRecord(null)}
        title="Manual Attendance Override"
        subtitle={overrideRecord ? `Updating status for ${overrideRecord.studentName}` : undefined}
      >
        <div className="flex flex-col gap-4 py-2 select-none">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#051F20]">Status Override</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Completed', 'Entered', 'Incomplete', 'Not marked'] as AttendanceStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTargetStatus(st)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border touch-target-44 ${
                    targetStatus === st
                      ? 'bg-[#163832] text-white border-[#163832]'
                      : 'bg-white text-[#235347] border-[#DAF1DE]'
                  }`}
                  style={{ borderRadius: '16px' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#051F20]">
              Mandatory Override Reason (min 5 characters)
            </label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Turnstile scanner optical read failure confirmed by faculty"
              className="w-full h-24 p-3 rounded-2xl border border-[#DAF1DE] bg-[#F6FBF7] text-xs font-medium text-[#051F20] outline-none focus:border-[#163832]"
            />
            <span className="text-xs text-[#235347]">
              {overrideReason.trim().length}/5 characters minimum
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <PillButton
              variant="ghost"
              onClick={() => setOverrideRecord(null)}
            >
              Cancel
            </PillButton>
            <PillButton
              variant="primary"
              fullWidth
              disabled={overrideReason.trim().length < 5}
              onClick={handleSaveOverride}
            >
              Save Override
            </PillButton>
          </div>
        </div>
      </BottomSheet>

      {/* Scanner Assignment PeoplePicker */}
      {isAssignPickerOpen && (
        <PeoplePicker
          isOpen={isAssignPickerOpen}
          onClose={() => setIsAssignPickerOpen(false)}
          title="Assign Gate Scanners"
          people={users.map((u) => ({ id: u.uid, name: u.name, role: u.post || u.role }))}
          selectedIds={assignedScanners}
          onConfirm={handleSaveScanners}
        />
      )}
    </div>
  );
};

export default AttendanceView;
