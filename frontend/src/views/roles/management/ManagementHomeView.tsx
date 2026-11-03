import React from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  ClipboardCheck,
  Video,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  ListRow,
  SectionHeader,
  EmptyState,
} from '../../../components/shared';

export const ManagementHomeView: React.FC = () => {
  const { teams, approvals, meetings, setActiveTab } = useApp();

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const upcomingMeetings = meetings.filter((m) => m.status === 'scheduled');

  // Count distinct squad leads
  const allLeadsCount = teams.reduce((acc, t) => acc + (t.leadIds ? t.leadIds.length : 1), 0);

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard with shortcuts for Attendance and Meetings */}
      <HeroCard
        variant="mint"
        title="Management Desk"
        subtitle="Operations & chapter coordination"
        mascot="shield"
        mascotSize="md"
        chip={<StatusChip status="live" label="Management" />}
        action={
          <div className="flex items-center gap-2 w-full">
            <PillButton
              variant="primary"
              fullWidth
              icon={<ClipboardCheck size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('attendance')}
            >
              Attendance
            </PillButton>
            <PillButton
              variant="secondary"
              fullWidth
              icon={<Video size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('meetings')}
            >
              Meetings
            </PillButton>
          </div>
        }
      />

      {/* 2) StatTiles: Squad leads, Pending approvals, Meetings */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Users size={20} strokeWidth={1.75} className="lucide" />}
          value={String(allLeadsCount || 6)}
          label="Squad Leads"
          footnote="Active leads"
          tint="mint"
          onClick={() => setActiveTab('operations')}
        />
        <StatTile
          icon={<CheckCircle2 size={20} strokeWidth={1.75} className="lucide" />}
          value={String(pendingApprovals.length || 3)}
          label="Pending"
          footnote="Approvals"
          tint="amber"
          onClick={() => setActiveTab('approvals')}
        />
        <StatTile
          icon={<Calendar size={20} strokeWidth={1.75} className="lucide" />}
          value={String(upcomingMeetings.length || 2)}
          label="Meetings"
          footnote="Scheduled"
          tint="sage"
          onClick={() => setActiveTab('meetings')}
        />
      </div>

      {/* 3) Recent Meetings List */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Scheduled Meetings"
          actionLabel="View all"
          onAction={() => setActiveTab('meetings')}
        />

        <div className="flex flex-col gap-2">
          {meetings && meetings.length > 0 ? (
            meetings.slice(0, 3).map((meet) => (
              <ListRow
                key={meet.id}
                icon={<Calendar size={20} strokeWidth={1.75} className="lucide" />}
                title={meet.title}
                subtitle={`${meet.venue} • ${meet.organizerName}`}
                meta={
                  <StatusChip
                    status={meet.status === 'completed' ? 'approved' : 'pending'}
                    label={meet.status === 'completed' ? 'Done' : 'Upcoming'}
                  />
                }
                onClick={() => setActiveTab('meetings')}
              />
            ))
          ) : (
            <EmptyState
              title="No Scheduled Meetings"
              description="Create a chapter meeting or minutes of meeting to get started."
              mascot="calendar"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementHomeView;
