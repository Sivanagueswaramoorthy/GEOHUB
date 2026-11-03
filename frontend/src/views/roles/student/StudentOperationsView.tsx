import React from 'react';
import {
  QrCode,
  ListTodo,
  MessageSquare,
  Scan,
  Compass,
  Calendar,
  Award,
  Users,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
  OperationCard,
} from '../../../components/shared';

export const StudentOperationsView: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    events,
    tasks,
    teams,
  } = useApp();

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.uid);

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-24">
      {/* 1) Top Header: Title, Subtitle & Mascot */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Student Operations
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            My duties, squads & volunteer pass
          </p>
        </div>

        <Mascot name="leaf" size="sm" />
      </div>

      {/* 2) Bento Cards Modular Stack (matches user spec exactly) */}
      <div className="flex flex-col gap-4">
        {/* 1. My Duties */}
        <OperationCard
          mascot="clipboard"
          title="My Duties"
          meta={
            <StatusChip
              status={myTasks.length > 0 ? 'live' : 'draft'}
              label={`${myTasks.length} Assigned`}
            />
          }
          description="Field stations, registration desk, crowd management, and logistics checklists"
          actionLabel="View Duties"
          onClick={() => setActiveTab('tasks')}
        />

        {/* 2. My Squads */}
        <OperationCard
          mascot="tree"
          title="My Squads"
          meta={<span className="text-xs font-bold text-[#235347]">{currentUser.team || 'Member'} Squad</span>}
          description="Squad track activities, peer collaboration, and project workgroups"
          actionLabel="Open Squads"
          onClick={() => setActiveTab('teams')}
        />

        {/* 3. Volunteer Scanner */}
        <OperationCard
          mascot="qr-code"
          title="Volunteer Scanner"
          meta={<StatusChip status="live" label="Gate Access" />}
          description="Turnstile camera scanner for designated volunteers assigned to take attendance"
          actionLabel="Launch Scanner"
          onClick={() => setActiveTab('scan_qr')}
        />

        {/* 4. Dynamic Chapter Pass */}
        <OperationCard
          mascot="shield"
          title="Dynamic Pass"
          meta={<span className="text-xs font-bold text-[#235347]">Rotating QR</span>}
          description="Verified chapter membership token with rotating 30s security countdown"
          actionLabel="Open Pass"
          onClick={() => setActiveTab('my_qr')}
        />

        {/* 5. Community Forum */}
        <OperationCard
          mascot="notebook"
          title="Community Forum"
          meta={<span className="text-xs font-bold text-[#235347]">Squad Rooms</span>}
          description="Real-time messaging, field updates, and squad group discussions"
          actionLabel="Join Chat"
          onClick={() => setActiveTab('community')}
        />
      </div>
    </div>
  );
};

export default StudentOperationsView;
