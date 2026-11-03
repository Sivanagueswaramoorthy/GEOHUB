import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  ClipboardList,
  ShieldCheck,
  Plus,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Avatar,
  BottomSheet,
  EmptyState,
  Mascot,
  OperationCard,
} from '../../../components/shared';

export const ManagementOperationsView: React.FC = () => {
  const {
    teams,
    users,
    events,
    approvals,
    meetings,
    tasks,
    approveItem,
    rejectItem,
    setActiveTab,
    showToast,
  } = useApp();

  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const handleConfirmReject = () => {
    if (!rejectId || !rejectReason.trim()) {
      showToast('Please state a rejection reason.', 'error');
      return;
    }
    rejectItem(rejectId, rejectReason.trim());
    showToast('✓ Request rejected and logged.');
    setRejectId(null);
    setRejectReason('');
  };

  // Extract squad leads
  const squadLeads = teams.map((team) => {
    const leadUser = users.find((u) => u.team === team.name && (u.role === 'team_admin' || u.post?.toLowerCase().includes('lead')));
    return {
      squadName: team.name,
      leadName: leadUser ? leadUser.name : `${team.name} Squad Lead`,
      leadRoll: leadUser?.rollNo || '21GEO010',
      membersCount: team.memberIds ? team.memberIds.length : 8,
    };
  });

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-24">
      {/* 1) Top Header: Title, Subtitle & Mascot */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Management Desk
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Squad governance, approvals & meetings
          </p>
        </div>

        <Mascot name="shield" size="sm" />
      </div>

      {/* 2) Bento Cards Modular Stack (matches user spec exactly) */}
      <div className="flex flex-col gap-4">
        {/* 1. Attendance Operations */}
        <OperationCard
          mascot="qr-code"
          title="Attendance Operations"
          meta={<span className="text-xs font-bold text-[#235347]">{events.length} Events</span>}
          description="Pick event, assign designated student scanners, and launch live turnstile OTP panels"
          actionLabel="Open Attendance"
          onClick={() => setActiveTab('attendance')}
        />

        {/* 2. Squad Leads List */}
        <OperationCard
          mascot="clipboard"
          title="Squad Leads"
          meta={<span className="text-xs font-bold text-[#235347]">{squadLeads.length} Squads</span>}
          description="Review squad leadership appointments across Promotion, Documentation, Treasurer, and Management"
          actionLabel="Review Leads"
          onClick={() => setIsLeadsOpen(true)}
        />

        {/* 3. Pending Approvals */}
        <OperationCard
          mascot="notebook"
          title="Approvals"
          meta={
            <StatusChip
              status={pendingApprovals.length > 0 ? 'live' : 'draft'}
              label={`${pendingApprovals.length} Pending`}
            />
          }
          description="Review and sanction operational requisitions, event expenditure, and equipment sign-offs"
          actionLabel="Review Requests"
          onClick={() => setIsApprovalsOpen(true)}
        />

        {/* 4. Meetings & MoM */}
        <OperationCard
          mascot="calendar"
          title="Meetings & MoM"
          meta={<span className="text-xs font-bold text-[#235347]">{meetings.length} Records</span>}
          description="Convene executive meetings, draft agendas, and record official Minutes of Meeting"
          actionLabel="Open Meetings"
          onClick={() => setActiveTab('meetings')}
        />

        {/* 5. Duties Assignment */}
        <OperationCard
          mascot="tree"
          title="Duties Assignment"
          meta={<span className="text-xs font-bold text-[#235347]">{tasks.length} Active</span>}
          description="Assign event stations, registration counters, and logistical shifts to student volunteers"
          actionLabel="Assign Duties"
          onClick={() => setActiveTab('tasks')}
        />
      </div>

      {/* Squad Leads BottomSheet */}
      <BottomSheet
        isOpen={isLeadsOpen}
        onClose={() => setIsLeadsOpen(false)}
        title="Squad Leads Roster"
        subtitle="Chapter committee leads & tracks"
      >
        <div className="flex flex-col gap-3 pt-2">
          {squadLeads.map((squad) => (
            <div
              key={squad.squadName}
              className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar name={squad.leadName} size={40} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#051F20]">
                    {squad.leadName}
                  </span>
                  <span className="text-xs text-[#235347]">
                    {squad.squadName} Squad Lead • {squad.leadRoll}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-[#163832] bg-[#DAF1DE] px-2.5 py-1 rounded-full">
                {squad.membersCount} Members
              </span>
            </div>
          ))}

          <PillButton variant="secondary" fullWidth onClick={() => setIsLeadsOpen(false)}>
            Close Roster
          </PillButton>
        </div>
      </BottomSheet>

      {/* Approvals Review BottomSheet */}
      <BottomSheet
        isOpen={isApprovalsOpen}
        onClose={() => setIsApprovalsOpen(false)}
        title="Pending Approvals"
        subtitle="Executive operational sanctions"
      >
        <div className="flex flex-col gap-3 pt-2">
          {pendingApprovals.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#235347]">
              ✓ All operational requests have been reviewed.
            </div>
          ) : (
            pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#051F20]">
                    {item.title}
                  </span>
                  <span className="text-xs font-semibold text-[#235347] bg-[#DAF1DE] px-2 py-0.5 rounded-full">
                    {item.type}
                  </span>
                </div>

                <p className="text-xs text-[#235347] m-0">
                  {item.subtitle || item.details || 'Operational requisition review'}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <PillButton
                    variant="primary"
                    icon={<CheckCircle2 size={16} strokeWidth={1.75} />}
                    onClick={() => {
                      approveItem(item.id);
                      showToast(`✓ Approved "${item.title}"`);
                    }}
                  >
                    Approve
                  </PillButton>

                  <PillButton
                    variant="destructive"
                    icon={<XCircle size={16} strokeWidth={1.75} />}
                    onClick={() => setRejectId(item.id)}
                  >
                    Reject
                  </PillButton>
                </div>
              </div>
            ))
          )}

          {rejectId && (
            <div className="p-3 rounded-2xl bg-white border border-[#D9534F] flex flex-col gap-2 mt-2">
              <span className="text-xs font-bold text-[#051F20]">
                Reason for rejection (mandatory):
              </span>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State policy or budget issue..."
                className="w-full h-10 px-3 rounded-xl border border-[#DAF1DE] text-xs outline-none"
              />
              <div className="flex gap-2">
                <PillButton variant="destructive" onClick={handleConfirmReject}>
                  Confirm Rejection
                </PillButton>
                <PillButton variant="ghost" onClick={() => setRejectId(null)}>
                  Cancel
                </PillButton>
              </div>
            </div>
          )}

          <PillButton variant="secondary" fullWidth onClick={() => setIsApprovalsOpen(false)}>
            Close Approvals
          </PillButton>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ManagementOperationsView;
