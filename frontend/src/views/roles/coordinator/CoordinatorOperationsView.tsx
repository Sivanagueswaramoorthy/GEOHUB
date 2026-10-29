import React from 'react';
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
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
} from '../../../components/shared';

export const CoordinatorOperationsView: React.FC = () => {
  const {
    setActiveTab,
    attendance,
    tasks,
    users,
    events,
    expenses,
    teams,
  } = useApp();

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const shortcuts = [
    { id: 'doc_studio', label: 'Templates', icon: FileText, desc: 'Doc exports' },
    { id: 'members', label: 'Join Requests', icon: UserPlus, desc: 'Applicant review' },
    { id: 'events', label: 'Calendar', icon: Calendar, desc: 'Chapter timeline' },
    { id: 'attendance', label: 'Rosters', icon: ClipboardList, desc: 'Gate roster' },
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
            Operations Hub
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Chapter coordination and workflows
          </p>
        </div>
        <Mascot name="clipboard" size="sm" />
      </div>

      {/* Shortcuts row of 20px tiles with 40px circular icons */}
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
                  transition: 'all 200ms ease-out',
                }}
              >
                {/* 40px circular icon */}
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
                    boxShadow: '0 2px 8px rgba(5,31,32,0.06)',
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20', lineHeight: 1.2 }}>
                    {sc.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', fontWeight: 500, marginTop: '2px' }} className="truncate">
                    {sc.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bento Modules: Squads, Members Directory, Attendance, Duties, read-only Treasury */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
          Workflows
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {/* Squads */}
          <div
            onClick={() => setActiveTab('teams')}
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
                <Mascot name="trophy" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Squads
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                {teams.length} Squads
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Management, Documentation, Promotion, and Entertainment squads
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Open →
              </span>
            </div>
          </div>

          {/* Members Directory */}
          <div
            onClick={() => setActiveTab('members')}
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
                <Mascot name="shield" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Members
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                {users.length} Scholars
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Official roster, posts designation, and applicant approval
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Open →
              </span>
            </div>
          </div>

          {/* Attendance */}
          <div
            onClick={() => setActiveTab('attendance')}
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
                <Mascot name="clipboard" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Attendance
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                {attendance.length} Logs
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Live turnstile verification, check-in history, and CSV export
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Open →
              </span>
            </div>
          </div>

          {/* Duties */}
          <div
            onClick={() => setActiveTab('tasks')}
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
                <Mascot name="tree" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Duties
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                {tasks.length} Active
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Station assignments, signage, food delivery, and badges
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Open →
              </span>
            </div>
          </div>

          {/* Read-only Treasury summary with 'View only' chip */}
          <div
            onClick={() => setActiveTab('finance')}
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
              gridColumn: '1 / -1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mascot name="coin" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Treasury
                </h3>
              </div>
              <StatusChip status="draft" label="View only" />
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Expenditure ledger oversight • Total Spent: ₹{totalSpent.toLocaleString()} • Budget approval belongs to Faculty
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Inspect Ledger →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorOperationsView;
