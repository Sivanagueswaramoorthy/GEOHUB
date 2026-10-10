import React from 'react';
import {
  Calendar,
  CheckSquare,
  Award,
  ArrowRight,
  Scan,
  Sparkles,
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenTwoModel } from '../../components/common/ScreenTwoModel';

export const MemberHomeView: React.FC = () => {
  const {
    currentUser,
    events,
    tasks,
    setActiveTab,
    setSelectedEventId,
    updateTaskStatus,
  } = useApp();

  const userEvents = events.filter((e) => e.registeredUserIds.includes(currentUser.uid));
  const liveEvent = events.find((e) => e.status === 'live') || events[0];
  const userTasks = tasks.filter(
    (t) => t.assigneeId === currentUser.uid || t.assigneeName === currentUser.name || !t.assigneeId
  );
  const pendingTasks = userTasks.filter((t) => t.status !== 'done');

  const isVolunteer =
    currentUser.isVolunteer || currentUser.role === 'volunteer' || currentUser.role === 'super_admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ScreenTwoModel
        quickActionTitle={isVolunteer ? 'Scan Attendee QR' : 'My Dynamic Event Pass'}
        quickActionSubtitle={
          isVolunteer
            ? 'Open camera terminal to verify student entry'
            : 'Access rotating QR badge for Auditorium turnstile gate'
        }
        quickActionIcon={isVolunteer ? <Scan size={24} strokeWidth={1.75} /> : <QrCode size={24} strokeWidth={1.75} />}
        onQuickActionClick={() => setActiveTab(isVolunteer ? 'scan_qr' : 'my_qr')}
        metrics={[
          {
            icon: <CheckSquare size={16} />,
            value: pendingTasks.length,
            label: 'Tasks Today',
            subtext: 'Next: 2:00 PM',
            bgColor: '#ECFDF5',
          },
          {
            icon: <Award size={16} />,
            value: '92%',
            label: 'Attendance Rate',
            subtext: 'Top 5%',
            bgColor: '#F0FDF4',
          },
          {
            icon: <Calendar size={16} />,
            value: userEvents.length > 0 ? userEvents.length : 2,
            label: 'Events Enrolled',
            subtext: 'This term',
            bgColor: '#E6FBF2',
          },
        ]}
        briefTitle="Member Daily Brief"
        briefItems={[
          {
            title: `Flagship Event: ${liveEvent.title}`,
            subtitle: 'Grand Auditorium • Entry open now',
            tag: 'Live',
            tagType: 'active',
          },
          {
            title: `${pendingTasks.length} pending squad deliverables`,
            subtitle: 'Next: GIS analysis summary due at 2:00 PM',
            tag: 'Due',
            tagType: 'due',
          },
          {
            title: 'Dynamic QR Token Ready',
            subtitle: '30s token rotation verified for seamless gate check-in',
            tag: 'Ready',
            tagType: 'active',
          },
        ]}
        tasksHeader="Today's Tasks"
        tasks={userTasks.length > 0 ? userTasks : tasks}
        onTaskToggle={(id) => {
          const t = tasks.find((item) => item.id === id);
          if (t) {
            updateTaskStatus(id, t.status === 'done' ? 'todo' : 'done');
          }
        }}
      >
        {/* Event Pass Shortcut Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            padding: '16px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <QrCode size={24} strokeWidth={1.75} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                Your Check-in Pass
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                ● 30s Dynamic Security Token Active
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('my_qr')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
            }}
          >
            Show QR
          </button>
        </div>
      </ScreenTwoModel>
    </div>
  );
};
