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

  const shortcuts = [
    { id: 'my_qr', label: 'My Pass', icon: QrCode, desc: 'Dynamic QR' },
    { id: 'tasks', label: 'My Duties', icon: ListTodo, desc: `${myTasks.length} Assigned` },
    { id: 'forum', label: 'Forum', icon: MessageSquare, desc: 'Discussions' },
    { id: 'teams', label: 'Squads', icon: Users, desc: 'Tracks' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1
            style={{
              fontSize: '28px',
              lineHeight: '32px',
              fontWeight: 800,
              color: '#051F20',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Student Hub
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Campus geomatics & eco initiatives
          </p>
        </div>

        <Mascot name="leaf" size="sm" />
      </div>

      {/* Shortcuts */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20', marginBottom: '10px' }}>
          Shortcuts
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => setActiveTab(sc.id as any)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #DAF1DE',
                  padding: '14px',
                  boxShadow: '0 4px 14px rgba(5,31,32,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '9999px',
                    backgroundColor: '#DAF1DE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#163832',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20', lineHeight: 1.2 }}>
                    {sc.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                    {sc.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bento Modules: My Duties, Volunteer Scanner, Chapter Memories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
          My Activities
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {/* Volunteer Turnstile Scanner */}
          <div
            onClick={() => setActiveTab('scan_qr')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mascot name="qr-code" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Scanner
                </h3>
              </div>
              <StatusChip status="live" label="Gate Access" />
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Turnstile camera scanner for attendee check-in and roster verification
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Launch Scanner →
              </span>
            </div>
          </div>

          {/* Chapter Memories */}
          <div
            onClick={() => setActiveTab('memories')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mascot name="gps-pin" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Memories
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                Expeditions
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Masonry visual archives, geo-coordinates, and field trip albums
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                View Photos →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOperationsView;
