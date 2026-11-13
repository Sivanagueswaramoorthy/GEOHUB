import React, { useState } from 'react';
import {
  FileText,
  UserPlus,
  Calendar,
  ClipboardList,
  Users,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  History,
  Lock,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
  BottomSheet,
  OperationCard,
} from '../../../components/shared';

export const CoordinatorOperationsView: React.FC = () => {
  const {
    setActiveTab,
    events,
    auditLogs,
    attendance,
    tasks,
    users,
    expenses,
    teams,
    showToast,
  } = useApp();

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  interface GrantItem {
    squad: string;
    leadName: string;
    permission: 'read' | 'write';
  }

  const initialGrants: GrantItem[] = React.useMemo(() => {
    return ['Management', 'Promotion', 'Documentation', 'Treasurer'].map((squad) => {
      const lead = users.find(
        (u) =>
          u.team === squad &&
          (u.post?.toLowerCase().includes('lead') ||
            u.squadMemberships?.some((m) => m.isLead))
      );
      return {
        squad,
        leadName: lead?.name || 'Assigned Officer',
        permission: 'write',
      };
    });
  }, [users]);

  const [eventGrants, setEventGrants] = useState<GrantItem[]>(initialGrants);

  const handleTogglePermission = (idx: number) => {
    setEventGrants((prev) =>
      prev.map((g, i) => {
        if (i !== idx) return g;
        const newPerm = g.permission === 'write' ? 'read' : 'write';
        const eventTitle = selectedEvent ? selectedEvent.title : 'Event';
        showToast(`Updated ${g.squad} squad access for "${eventTitle}" to ${newPerm.toUpperCase()}`);
        return { ...g, permission: newPerm };
      })
    );
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-24">
      {/* 1) Top Header: Title, Subtitle & Mascot */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Operations Hub
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Chapter coordination and executive workflows
          </p>
        </div>

        <Mascot name="clipboard" size="sm" />
      </div>

      {/* 2) Bento Cards Modular Stack (matches user spec exactly) */}
      <div className="flex flex-col gap-4">
        {/* 1. Squads */}
        <OperationCard
          mascot="clipboard"
          title="Squads"
          meta={<span className="text-xs font-bold text-[#235347]">{teams.length} Squads</span>}
          description="Track committee leadership, appointment sanctions, and deliverable quotas"
          actionLabel="Review"
          onClick={() => setActiveTab('teams')}
        />

        {/* 2. Members Directory & Admissions */}
        <OperationCard
          mascot="notebook"
          title="Members Directory"
          meta={<span className="text-xs font-bold text-[#235347]">{users.length} Scholars</span>}
          description="Scholar roster, executive post assignments, and single or bulk roll-number student onboarding"
          actionLabel="Directory"
          onClick={() => setActiveTab('members')}
        />

        {/* 3. Attendance Desk */}
        <OperationCard
          mascot="qr-code"
          title="Attendance Desk"
          meta={<span className="text-xs font-bold text-[#235347]">{attendance.length} Logs</span>}
          description="Live turnstile verification, check-in history, and CSV export"
          actionLabel="Open Desk"
          onClick={() => setActiveTab('attendance')}
        />

        {/* 4. Volunteer Duties */}
        <OperationCard
          mascot="tree"
          title="Duties & Stations"
          meta={<span className="text-xs font-bold text-[#235347]">{tasks.length} Active</span>}
          description="Station assignments, signage, food delivery, and volunteer badges"
          actionLabel="Assign"
          onClick={() => setActiveTab('tasks')}
        />

        {/* 5. Lead Activity Review */}
        <OperationCard
          mascot="shield"
          title="Lead Activity Review"
          meta={<StatusChip status="live" label="Audit Trail" />}
          description="Immutable audit log of leadership actions across Promotion, Documentation, Treasurer, and Management"
          actionLabel="Review"
          onClick={() => setIsAuditOpen(true)}
        />

        {/* 6. Event Permissions */}
        <OperationCard
          mascot="lock"
          title="Event Permissions"
          meta={<span className="text-xs font-bold text-[#235347]">Per-Event Grants</span>}
          description="Toggle Management squad write/update permissions and inspect role-based event access"
          actionLabel="Permissions"
          onClick={() => setIsPermissionsOpen(true)}
        />

        {/* 7. Treasury Overview (View only) */}
        <OperationCard
          mascot="coin"
          title="Treasury"
          meta={<StatusChip status="draft" label="View only" />}
          description={`Expenditure ledger oversight • Total Spent: ₹${totalSpent.toLocaleString()} • Budget approval belongs to Faculty`}
          actionLabel="Inspect Ledger"
          onClick={() => setActiveTab('finance')}
        />
      </div>

      {/* Lead Activity Review BottomSheet */}
      <BottomSheet
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        title="Lead Activity Review"
        subtitle="Immutable leadership audit feed"
      >
        <div className="flex flex-col gap-3 pt-2">
          {auditLogs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between gap-3 select-none"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    {log.action}
                  </span>
                  <span className="text-[12px] font-semibold text-[#235347] bg-[#DAF1DE] px-2 py-0.5 rounded-full">
                    {log.actorRole}
                  </span>
                </div>
                <span className="text-xs text-[#235347] mt-0.5">
                  {log.actorName} • {log.targetName || log.targetId}
                </span>
              </div>
              <span className="text-[12px] text-[#235347] font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <PillButton variant="secondary" fullWidth onClick={() => setIsAuditOpen(false)}>
            Close Review
          </PillButton>
        </div>
      </BottomSheet>

      {/* Event Permissions BottomSheet */}
      <BottomSheet
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        title="Event Permissions"
        subtitle="Squad read/write permission grants"
      >
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[#051F20] block mb-1">
              Select Event
            </label>
            {events.length > 0 ? (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-[#DAF1DE] px-3 text-xs bg-white text-[#051F20] outline-none"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'Upcoming'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-semibold text-[#235347]">
                No active events available to configure
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#051F20]">
              Squad Access Controls
            </span>
            {eventGrants.map((grant, idx) => (
              <div
                key={grant.squad}
                className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#051F20] block">
                    {grant.squad} Squad
                  </span>
                  <span className="text-[12px] text-[#235347]">
                    Lead: {grant.leadName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleTogglePermission(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    grant.permission === 'write'
                      ? 'bg-[#163832] text-white'
                      : 'bg-[#DAF1DE] text-[#163832]'
                  }`}
                >
                  {grant.permission === 'write' ? 'Write Access' : 'Read Only'}
                </button>
              </div>
            ))}
          </div>

          <PillButton variant="primary" fullWidth onClick={() => setIsPermissionsOpen(false)}>
            Save Permissions
          </PillButton>
        </div>
      </BottomSheet>
    </div>
  );
};

export default CoordinatorOperationsView;
