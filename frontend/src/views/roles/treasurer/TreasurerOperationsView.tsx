import React from 'react';
import {
  DollarSign,
  Receipt,
  Package,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
} from '../../../components/shared';

export const TreasurerOperationsView: React.FC = () => {
  const {
    setActiveTab,
    expenses,
    stockItems,
  } = useApp();

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const shortcuts = [
    { id: 'treasurer', label: 'Ledger', icon: Receipt, desc: `${expenses.length} Records` },
    { id: 'treasurer', label: 'Stock', icon: Package, desc: `${stockItems.length} Items` },
    { id: 'events', label: 'Events', icon: Layers, desc: 'Budgets' },
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
            Treasury Hub
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Fiscal ledger & operations
          </p>
        </div>

        <Mascot name="coin" size="sm" />
      </div>

      {/* Clear Notice: Budget Approval Belongs to Faculty Only */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '16px',
          backgroundColor: '#DAF1DE',
          border: '1px solid #8EB69B',
          fontSize: '12px',
          color: '#051F20',
          fontWeight: 600,
        }}
      >
        <ShieldCheck size={18} color="#163832" />
        <span>Budget approval belongs to faculty only. Operational expense submission enabled.</span>
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
                key={sc.label}
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

      {/* Bento Modules */}
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
          {/* Main Ledger */}
          <div
            onClick={() => setActiveTab('treasurer')}
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
                  Ledger
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                ₹{totalSpent.toLocaleString()} Spent
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Review expenditures across logistics, printing, refreshments, and honoraria
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Open Ledger →
              </span>
            </div>
          </div>

          {/* Stock Inventory */}
          <div
            onClick={() => setActiveTab('treasurer')}
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
                <Mascot name="wallet" size="sm" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                  Inventory
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
                {stockItems.length} Items
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#235347', margin: 0 }}>
              Physical equipment tracking, asset checkout, and low-stock indicators
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                Inspect Inventory →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasurerOperationsView;
