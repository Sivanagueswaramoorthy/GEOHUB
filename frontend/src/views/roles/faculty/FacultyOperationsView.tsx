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
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
  BottomSheet,
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
  } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [gateSecurityLevel, setGateSecurityLevel] = useState('Standard Gate Pass');

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

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
            Faculty Command
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Institutional governance & oversight
          </p>
        </div>

        <Mascot name="shield" size="sm" />
      </div>

      {/* Bento Grid of 5 Modules: Lifecycle, Finance, Squads, Archives with MoM sign-off, Settings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* 1. Event Lifecycle */}
        <div
          onClick={() => setActiveTab('events')}
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
              <Mascot name="calendar" size="sm" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Lifecycle
              </h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
              {events.length} Events
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
            Sanction dates, review field proposals, and inspect volunteer duties
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
              Manage →
            </span>
          </div>
        </div>

        {/* 2. Finance Oversight */}
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mascot name="coin" size="sm" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Finance
              </h3>
            </div>
            <StatusChip status="live" label="Fiscal Authority" />
          </div>
          <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
            Budget sign-offs • ₹{totalSpent.toLocaleString()} disbursed • Treasury ledger oversight
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
              Inspect →
            </span>
          </div>
        </div>

        {/* 3. Squads Oversight */}
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
              <Mascot name="clipboard" size="sm" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Squads
              </h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
              {teams.length} Squads
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
            Track committee leadership, appointment sanctions, and deliverable quotas
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
              Review →
            </span>
          </div>
        </div>

        {/* 4. Documentation view-only with MoM sign-off */}
        <div
          onClick={() => setActiveTab('meetings')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #DAF1DE',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mascot name="notebook" size="sm" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Archives
              </h3>
            </div>
            <StatusChip status="draft" label="View only" />
          </div>
          <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
            Official templates, DGCA permit letters, and Minutes of Meeting sign-off
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
              Sign off →
            </span>
          </div>
        </div>

        {/* 5. Governance Settings */}
        <div
          onClick={() => setIsSettingsOpen(true)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #DAF1DE',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
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
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9999px',
                  backgroundColor: '#DAF1DE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#163832',
                }}
              >
                <Settings size={18} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Settings
              </h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
              Academic Tenure {academicYear}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
            Configure chapter academic session, verification levels, and audit parameters
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
              Configure →
            </span>
          </div>
        </div>
      </div>

      {/* Governance Settings BottomSheet */}
      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Chapter Settings"
        subtitle="University Club Configuration"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Academic Session
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Turnstile Gate Policy
            </label>
            <select
              value={gateSecurityLevel}
              onChange={(e) => setGateSecurityLevel(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              <option value="Standard Gate Pass">Standard Gate Pass (60s dynamic QR)</option>
              <option value="Strict Verification">Strict Verification (Dual turnstile check)</option>
            </select>
          </div>

          <PillButton
            variant="primary"
            fullWidth
            onClick={() => setIsSettingsOpen(false)}
          >
            Save
          </PillButton>
        </div>
      </BottomSheet>
    </div>
  );
};

export default FacultyOperationsView;
