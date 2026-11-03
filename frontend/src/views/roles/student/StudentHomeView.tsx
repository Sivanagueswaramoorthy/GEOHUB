import React from 'react';
import {
  Calendar,
  QrCode,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  History,
  Award,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  SectionHeader,
  PastelCard,
  Mascot,
} from '../../../components/shared';

export interface StudentHomeViewProps {
  showToast?: (msg: string) => void;
  setSelectedEventId?: (id: string) => void;
  registerForEvent?: (id: string) => void;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({
  showToast,
  setSelectedEventId,
  registerForEvent,
}) => {
  const {
    currentUser,
    events,
    tasks,
    attendance,
    auditLogs,
    setActiveTab,
    setSelectedEventId: setGlobalEventId,
    registerForEvent: globalRegister,
    showToast: globalToast,
  } = useApp();

  const handleToast = showToast || globalToast;
  const handleSelectEvent = setSelectedEventId || setGlobalEventId;
  const handleRegister = registerForEvent || globalRegister;

  // Personal audit activity for member (DEC-04 & AUD-01)
  const myCheckedIns = attendance.filter(
    (a) => a.userId === currentUser.uid || a.userEmail === currentUser.email
  );
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.uid);
  const myAuditLogs = (auditLogs || []).filter(
    (log) => log.actorId === currentUser.uid || log.targetId === currentUser.uid
  ).slice(0, 3);

  const nextEvent = events[0] || {
    id: 'event_01',
    title: 'QGIS Remote Sensing',
    venue: 'Grand Auditorium',
    startDate: new Date().toISOString(),
    category: 'Workshop',
  };

  const isAssignedScanner =
    events.some((ev) => ev.assignedScannerUserIds?.includes(currentUser.uid));

  const upcomingEvents = events.slice(0, 3);

  const formatDateBadge = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: d.getDate(),
      };
    } catch {
      return { month: 'OCT', day: 15 };
    }
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard with floating leaf: "Good morning, {Name}", subtitle "Campus geomatics & eco initiatives", CTA "Join event" */}
      <HeroCard
        variant="mint"
        title={`Good morning, ${currentUser.name.split(' ')[0]}`}
        subtitle="Campus geomatics & eco initiatives"
        mascot="leaf"
        mascotSize="lg"
        chip={<StatusChip status="live" label="Active" />}
        action={
          <PillButton
            variant="primary"
            fullWidth
            onClick={() => {
              handleRegister(nextEvent.id);
              handleToast('✓ Registered! Gate pass active.');
            }}
          >
            Join event
          </PillButton>
        }
      />

      {/* 2) Scanner Assignment Entry Card (if assigned) */}
      {isAssignedScanner && (
        <PastelCard
          variant="sage"
          showArrow
          onClick={() => setActiveTab('scan_qr')}
        >
          <div className="flex items-center gap-3">
            <Mascot name="camera" size="sm" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#235347] uppercase tracking-wider">
                Gate Scanner
              </span>
              <h3 className="font-bold text-sm text-[#051F20] truncate">
                Scan for {nextEvent.title}
              </h3>
            </div>
          </div>
        </PastelCard>
      )}

      {/* 3) 3 StatTiles: Events with count, My QR "Pass", Squads with count */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-[#235347] uppercase tracking-wider pl-1">
          Quick picks
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile
            icon={<Calendar size={18} strokeWidth={2} />}
            value={String(events.length || 3)}
            label="Events"
            tint="mint"
            onClick={() => setActiveTab('events')}
          />
          <StatTile
            icon={<QrCode size={18} strokeWidth={2} />}
            value="Pass"
            label="My QR"
            tint="amber"
            onClick={() => setActiveTab('my_qr')}
          />
          <StatTile
            icon={<Users size={18} strokeWidth={2} />}
            value="4"
            label="Squads"
            tint="sage"
            onClick={() => setActiveTab('teams')}
          />
        </div>
      </div>

      {/* 4) Upcoming list: max 3 compact 24px cards with date badge and "View all" */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Upcoming events"
          actionLabel="View all"
          onAction={() => setActiveTab('events')}
        />

        <div className="flex flex-col gap-3">
          {upcomingEvents.map((ev) => {
            const dateBadge = formatDateBadge(ev.startDate);
            return (
              <div
                key={ev.id}
                onClick={() => {
                  handleSelectEvent(ev.id);
                  setActiveTab('events');
                }}
                className="flex items-center justify-between p-3.5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] hover:border-[#8EB69B] transition-all cursor-pointer pressable"
                style={{
                  borderRadius: '24px',
                  minHeight: '64px',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Compact Date Badge */}
                  <div
                    className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] shrink-0"
                    style={{ borderRadius: '14px' }}
                  >
                    <span className="text-xs font-black leading-none">
                      {dateBadge.day}
                    </span>
                    <span className="text-xs font-bold text-[#235347] leading-none mt-0.5">
                      {dateBadge.month}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#051F20] truncate">
                      {ev.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#235347] truncate mt-0.5">
                      <MapPin size={12} strokeWidth={2} />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  <StatusChip status={ev.status === 'completed' ? 'done' : 'live'} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5) My Activity Feed (DEC-04 & AUD-01: Personal Audit Log) */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="My Activity"
          actionLabel="View all"
          onAction={() => setActiveTab('tasks')}
        />

        <div className="flex flex-col gap-2.5">
          {myCheckedIns.length > 0 ? (
            myCheckedIns.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.04)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} className="text-[#163832]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#051F20] truncate">
                      Attended {rec.eventTitle}
                    </span>
                    <span className="text-[12px] font-medium text-[#235347] truncate">
                      Gate check-in verified • {rec.status}
                    </span>
                  </div>
                </div>
                <StatusChip status="done" label="Verified" />
              </div>
            ))
          ) : myTasks.length > 0 ? (
            myTasks.slice(0, 2).map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.04)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center shrink-0">
                    <Award size={18} className="text-[#163832]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#051F20] truncate">
                      Duty: {t.title}
                    </span>
                    <span className="text-[12px] font-medium text-[#235347] truncate">
                      {t.status === 'done' ? 'Completed' : 'Assigned by Management'}
                    </span>
                  </div>
                </div>
                <StatusChip status={t.status === 'done' ? 'done' : 'live'} />
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] text-center flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-[#051F20]">No recent actions</span>
              <span className="text-xs text-[#235347]">
                Register for events or complete assigned squad duties to see your activity timeline here.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHomeView;
