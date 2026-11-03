import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  FileText,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserPlus,
  History,
  Check,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
  BottomSheet,
  OperationCard,
} from '../../../components/shared';

export const FacultyOperationsView: React.FC = () => {
  const {
    setActiveTab,
    events,
    approvals,
    expenses,
    teams,
    users,
    meetings,
    auditLogs,
    showToast,
  } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [gateSecurityLevel, setGateSecurityLevel] = useState('Standard Gate Pass');

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || 'event_01');
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const [eventGrants, setEventGrants] = useState<{ squad: string; leadName: string; permission: 'read' | 'write' }[]>([
    { squad: 'Management', leadName: 'Vikram Seth', permission: 'write' },
    { squad: 'Promotion', leadName: 'Maya Patel', permission: 'write' },
    { squad: 'Documentation', leadName: 'Kavita Rao', permission: 'write' },
    { squad: 'Treasurer', leadName: 'Devon Vance', permission: 'write' },
  ]);

  const handleTogglePermission = (idx: number) => {
    setEventGrants((prev) =>
      prev.map((g, i) => {
        if (i !== idx) return g;
        const newPerm = g.permission === 'write' ? 'read' : 'write';
        showToast(`Updated ${g.squad} squad access for "${selectedEvent.title}" to ${newPerm.toUpperCase()}`);
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
            Faculty Command
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Institutional governance & oversight
          </p>
        </div>

        <Mascot name="shield" size="sm" />
      </div>

      {/* 2) Bento Cards Modular Stack (matches user spec exactly) */}
      <div className="flex flex-col gap-4">
        {/* 1. Lifecycle */}
        <OperationCard
          mascot="calendar"
          title="Lifecycle"
          meta={<span className="text-xs font-bold text-[#235347]">{events.length} Events</span>}
          description="Sanction dates, review field proposals, and inspect volunteer duties"
          actionLabel="Manage"
          onClick={() => setActiveTab('events')}
        />

        {/* 2. Finance */}
        <OperationCard
          mascot="coin"
          title="Finance"
          meta={<StatusChip status="live" label="Fiscal Authority" />}
          description={`Budget sign-offs • ₹${totalSpent.toLocaleString()} disbursed • Treasury ledger oversight`}
          actionLabel="Inspect"
          onClick={() => setActiveTab('finance')}
        />

        {/* 3. Squads */}
        <OperationCard
          mascot="clipboard"
          title="Squads"
          meta={<span className="text-xs font-bold text-[#235347]">{teams.length} Squads</span>}
          description="Track committee leadership, appointment sanctions, and deliverable quotas"
          actionLabel="Review"
          onClick={() => setActiveTab('teams')}
        />

        {/* 4. Members Directory & Admissions */}
        <OperationCard
          mascot="notebook"
          title="Members Directory"
          meta={<span className="text-xs font-bold text-[#235347]">{users.length} Scholars</span>}
          description="Scholar roster, executive post assignments, and single or bulk roll-number student onboarding"
          actionLabel="Directory"
          onClick={() => setActiveTab('members')}
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

        {/* 7. Archives */}
        <OperationCard
          mascot="notebook"
          title="Archives"
          meta={<StatusChip status="draft" label="View only" />}
          description="Official templates, DGCA permit letters, and Minutes of Meeting sign-off"
          actionLabel="Sign off"
          onClick={() => setActiveTab('archives')}
        />

        {/* 8. Settings */}
        <OperationCard
          mascot="shield"
          title="Settings"
          meta={<span className="text-xs font-bold text-[#235347]">Academic Tenure {academicYear}</span>}
          description="Configure chapter academic session, verification levels, and audit parameters"
          actionLabel="Configure"
          onClick={() => setIsSettingsOpen(true)}
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

      {/* Governance Settings BottomSheet */}
      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Chapter Settings"
        subtitle="University Club Configuration"
      >
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[#051F20] block mb-1">
              Academic Session
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#DAF1DE] px-3 text-xs outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#051F20] block mb-1">
              Turnstile Gate Policy
            </label>
            <select
              value={gateSecurityLevel}
              onChange={(e) => setGateSecurityLevel(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#DAF1DE] px-3 text-xs bg-white outline-none"
            >
              <option value="Standard Gate Pass">Standard Gate Pass (60s dynamic QR)</option>
              <option value="Strict Verification">Strict Verification (Dual turnstile check)</option>
            </select>
          </div>

          <PillButton
            variant="primary"
            fullWidth
            onClick={() => {
              showToast('Chapter settings updated');
              setIsSettingsOpen(false);
            }}
          >
            Save Settings
          </PillButton>
        </div>
      </BottomSheet>
    </div>
  );
};

export default FacultyOperationsView;
