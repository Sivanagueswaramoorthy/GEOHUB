import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  UserX,
  Shield,
} from 'lucide-react';
import { AnimatedNumber, ConfirmDialog, SearchField } from '../../../components/shared';

export interface AttendeeRosterRecord {
  uid: string;
  name: string;
  rollNo: string;
  squad: string;
  status: 'present' | 'late' | 'absent';
  checkInTime?: string;
}

export interface AttendanceDeskScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const AttendanceDeskScreen: React.FC<AttendanceDeskScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Manual Override dialog state
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [selectedStudentForOverride, setSelectedStudentForOverride] = useState<AttendeeRosterRecord | null>(null);
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);

  const [roster, setRoster] = useState<AttendeeRosterRecord[]>([
    { uid: 'att-1', name: 'Kunal Sen', rollNo: '23GEO045', squad: 'Promotion', status: 'present', checkInTime: '09:14 AM' },
    { uid: 'att-2', name: 'Maya Patel', rollNo: '24GEO102', squad: 'Management', status: 'present', checkInTime: '09:22 AM' },
    { uid: 'att-3', name: 'Priya Sharma', rollNo: '22GEO088', squad: 'Treasury', status: 'late', checkInTime: '10:05 AM' },
    { uid: 'att-4', name: 'Rohan Dave', rollNo: '23GEO014', squad: 'Management', status: 'absent' },
    { uid: 'att-5', name: 'David Chen', rollNo: '24GEO055', squad: 'Documentation', status: 'present', checkInTime: '09:08 AM' },
    { uid: 'att-6', name: 'Elena Rostova', rollNo: '22GEO019', squad: 'Management', status: 'absent' },
  ]);

  const totalPresent = roster.filter((r) => r.status === 'present').length;
  const totalLate = roster.filter((r) => r.status === 'late').length;
  const totalAbsent = roster.filter((r) => r.status === 'absent').length;

  const handleUpdateStatus = (uid: string, newStatus: 'present' | 'late' | 'absent') => {
    if (readOnly) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRoster((prev) =>
      prev.map((att) =>
        att.uid === uid
          ? { ...att, status: newStatus, checkInTime: newStatus === 'absent' ? undefined : att.checkInTime || nowTime }
          : att
      )
    );

    const student = roster.find((a) => a.uid === uid);
    if (student) {
      onLogAudit('Attendance Desk', `Updated attendance for ${student.name} (${student.rollNo}) to ${newStatus.toUpperCase()}`);
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
      `Manual turnstile override for ${selectedStudentForOverride.name} (${selectedStudentForOverride.rollNo}). Mandatory reason: "${reason}"`
    );

    setOverrideNotice(`Manual override recorded for ${selectedStudentForOverride.name}.`);
    setShowOverrideDialog(false);
    setSelectedStudentForOverride(null);
    setTimeout(() => setOverrideNotice(null), 3500);
  };

  const filteredRoster = roster.filter((att) => {
    if (statusFilter !== 'All' && att.status !== statusFilter.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      att.name.toLowerCase().includes(q) ||
      att.rollNo.toLowerCase().includes(q) ||
      att.squad.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3.5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Metric Summary Strip (Present, Late, Absent) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
        {/* Present Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.03)] flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide truncate">Present</span>
            <div className="w-5 h-5 rounded-md bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
              <CheckCircle2 size={12} strokeWidth={2.4} />
            </div>
          </div>
          <div className="text-base sm:text-lg font-heading font-black text-[#051F20] leading-tight">
            <AnimatedNumber value={totalPresent} />
          </div>
          <span className="text-xs text-[#8EB69B] font-semibold mt-0.5 truncate">
            {Math.round((totalPresent / (roster.length || 1)) * 100)}% Verified
          </span>
        </div>

        {/* Late Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.03)] flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#051F20] uppercase tracking-wide truncate">Late</span>
            <div className="w-5 h-5 rounded-md bg-[#F2B84B]/20 flex items-center justify-center text-[#051F20] shrink-0">
              <Clock size={12} strokeWidth={2.4} />
            </div>
          </div>
          <div className="text-base sm:text-lg font-heading font-black text-[#051F20] leading-tight">
            <AnimatedNumber value={totalLate} />
          </div>
          <span className="text-xs text-[#8EB69B] font-semibold mt-0.5 truncate">
            Delayed
          </span>
        </div>

        {/* Absent Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.03)] flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#D9534F] uppercase tracking-wide truncate">Absent</span>
            <div className="w-5 h-5 rounded-md bg-[#D9534F]/10 flex items-center justify-center text-[#D9534F] shrink-0">
              <UserX size={12} strokeWidth={2.4} />
            </div>
          </div>
          <div className="text-base sm:text-lg font-heading font-black text-[#D9534F] leading-tight">
            <AnimatedNumber value={totalAbsent} />
          </div>
          <span className="text-xs text-[#8EB69B] font-semibold mt-0.5 truncate">
            Unmarked
          </span>
        </div>
      </div>

      {overrideNotice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2 shadow-2xs animate-fadeIn w-full">
          <CheckCircle2 size={16} className="text-[#163832] shrink-0" />
          <span className="truncate">{overrideNotice}</span>
        </div>
      )}

      {/* 2. Attendee Roster Card */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_20px_rgba(5,31,32,0.04)] space-y-3 w-full max-w-full overflow-hidden">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#DAF1DE]/70 w-full">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-[#051F20] text-sm sm:text-base">
                Squad Leads Attendance Desk
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20]">
                {roster.length}
              </span>
            </div>
            <p className="text-xs text-[#235347] mt-0.5">
              Verify check-in statuses or authorize manual clearances.
            </p>
          </div>

          <div className="w-full sm:w-60">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search scholar or roll no..."
            />
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
          {[
            { label: 'All', count: roster.length },
            { label: 'Present', count: totalPresent },
            { label: 'Late', count: totalLate },
            { label: 'Absent', count: totalAbsent },
          ].map(({ label, count }) => {
            const isSelected = statusFilter === label;
            return (
              <button
                key={label}
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
              {/* Scholar Details Row */}
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
                </div>

                <div className="shrink-0">
                  {att.status === 'present' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#163832]">
                      <CheckCircle2 size={13} className="text-[#163832]" />
                      Checked in: {att.checkInTime || '09:00 AM'}
                    </span>
                  )}
                  {att.status === 'late' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#051F20]">
                      <Clock size={13} className="text-[#F2B84B]" />
                      Late entry: {att.checkInTime || '10:05 AM'}
                    </span>
                  )}
                  {att.status === 'absent' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D9534F]">
                      <UserX size={13} className="text-[#D9534F]" />
                      Not marked
                    </span>
                  )}
                </div>
              </div>

              {/* Status Switcher & Manual Override Action (Fits 100% within card on any screen) */}
              {!readOnly && (
                <div className="flex items-center gap-1.5 w-full pt-0.5">
                  {/* Segmented Status Pill Selector - Perfectly distributed */}
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(att.uid, 'present')}
                      className={`h-7 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate ${
                        att.status === 'present'
                          ? 'bg-[#163832] text-white shadow-2xs'
                          : 'text-[#235347] hover:bg-white/60'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(att.uid, 'late')}
                      className={`h-7 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate ${
                        att.status === 'late'
                          ? 'bg-[#F2B84B] text-[#051F20] shadow-2xs'
                          : 'text-[#235347] hover:bg-white/60'
                      }`}
                    >
                      Late
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(att.uid, 'absent')}
                      className={`h-7 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate ${
                        att.status === 'absent'
                          ? 'bg-[#D9534F] text-white shadow-2xs'
                          : 'text-[#235347] hover:bg-white/60'
                      }`}
                    >
                      Absent
                    </button>
                  </div>

                  {/* Manual Override Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForOverride(att);
                      setShowOverrideDialog(true);
                    }}
                    className="h-9 px-2.5 sm:px-3 rounded-xl bg-white border border-[#DAF1DE] hover:border-[#163832] text-[#163832] text-xs font-bold hover:bg-[#F6FBF7] transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 touch-target-44 shadow-2xs"
                    title="Clear turnstile with institutional justification"
                  >
                    <Shield size={12} strokeWidth={2.2} />
                    <span>Override</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredRoster.length === 0 && (
            <div className="py-8 text-center text-[#235347] text-xs font-medium">
              No scholars found matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* Manual Override Dialog */}
      <ConfirmDialog
        isOpen={Boolean(showOverrideDialog && selectedStudentForOverride)}
        onClose={() => {
          setShowOverrideDialog(false);
          setSelectedStudentForOverride(null);
        }}
        onConfirm={handleOverrideConfirm}
        title="Manual Attendance Override"
        message={`Authorize manual turnstile clearance for ${selectedStudentForOverride?.name} (${selectedStudentForOverride?.rollNo})? A mandatory institutional reason is logged for audit compliance.`}
        reasonPlaceholder="Mandatory justification (e.g. Physical ID card verified at Gate 1)"
      />
    </div>
  );
};

export default AttendanceDeskScreen;
