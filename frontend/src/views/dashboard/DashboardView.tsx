import React from 'react';
import {
  Users2,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  CheckSquare,
  ClipboardList,
  Scan,
  Sparkles,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenTwoModel } from '../../components/common/ScreenTwoModel';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    events,
    tasks,
    report,
    approvals,
    setActiveTab,
    setSelectedEventId,
    updateTaskStatus,
  } = useApp();

  const liveEvent = events.find((e) => e.status === 'live') || events[0];
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ScreenTwoModel
        quickActionTitle="Create New Event"
        quickActionSubtitle="Schedule a symposium, workshop, or field expedition"
        quickActionIcon={<Calendar size={24} strokeWidth={1.75} />}
        onQuickActionClick={() => setActiveTab('events')}
        metrics={[
          {
            icon: <Calendar size={16} />,
            value: 3,
            label: 'Events Today',
            subtext: 'Next: 2:00 PM',
            bgColor: '#ECFDF5',
          },
          {
            icon: <Users2 size={16} />,
            value: users.length,
            label: 'Active Scholars',
            subtext: '4 Squads',
            bgColor: '#F0FDF4',
          },
          {
            icon: <CheckSquare size={16} />,
            value: pendingApprovalsCount,
            label: 'Approvals Due',
            subtext: 'Requires Seal',
            bgColor: '#E6FBF2',
          },
        ]}
        briefTitle="Club Operations Brief"
        briefItems={[
          {
            title: `Flagship Session: ${liveEvent.title}`,
            subtitle: 'Live now in Main Grand Auditorium',
            tag: 'Live',
            tagType: 'active',
          },
          {
            title: '4 tasks due today across squads',
            subtitle: 'Next: Field equipment log at 2:00 PM',
            tag: 'Due',
            tagType: 'due',
          },
          {
            title: `${pendingApprovalsCount} sanction items pending review`,
            subtitle: 'Transmitted to Dr. Sarah Jenkins',
            tag: 'Pending',
            tagType: 'info',
          },
        ]}
        tasksHeader="Today's Tasks"
        tasks={tasks}
        onTaskToggle={(id) => {
          const t = tasks.find((item) => item.id === id);
          if (t) {
            updateTaskStatus(id, t.status === 'done' ? 'todo' : 'done');
          }
        }}
      >
        {/* Live Session Turnstile Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            borderLeft: '4px solid #10B981',
            padding: '16px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
              ● LIVE SESSION ATTENDANCE
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981' }}>
              {liveEvent.registeredUserIds.length} / {liveEvent.capacity} Checked In
            </span>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
            {liveEvent.title}
          </h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('attendance')}
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ClipboardList size={16} strokeWidth={1.75} /> Full Terminal Logs
            </button>
            <button
              onClick={() => setActiveTab('scan_qr')}
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '999px',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Scan size={16} strokeWidth={1.75} /> Scan
            </button>
          </div>
        </div>
      </ScreenTwoModel>
    </div>
  );
};
