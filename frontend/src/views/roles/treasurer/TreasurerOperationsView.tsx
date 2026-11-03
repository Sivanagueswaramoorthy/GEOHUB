import React from 'react';
import {
  DollarSign,
  Receipt,
  Package,
  Layers,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
  OperationCard,
} from '../../../components/shared';

export const TreasurerOperationsView: React.FC = () => {
  const {
    setActiveTab,
    expenses,
    stockItems,
  } = useApp();

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
            Treasury Hub
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Fiscal ledger & operational disbursements
          </p>
        </div>

        <Mascot name="coin" size="sm" />
      </div>

      {/* Clear Governance Notice: Budget Approval Belongs to Faculty Only */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-xs text-[#051F20] font-semibold">
        <ShieldCheck size={18} className="lucide text-[#163832] shrink-0" />
        <span>Budget approval belongs to faculty only. Operational expense submission enabled.</span>
      </div>

      {/* 2) Bento Cards Modular Stack (matches user spec exactly) */}
      <div className="flex flex-col gap-4">
        {/* 1. Main Ledger */}
        <OperationCard
          mascot="coin"
          title="Expenditure Ledger"
          meta={<span className="text-xs font-bold text-[#235347]">₹{totalSpent.toLocaleString()} Disbursed</span>}
          description="Review expenditures across logistics, printing, refreshments, and honoraria with receipt vouchers"
          actionLabel="Open Ledger"
          onClick={() => setActiveTab('treasurer')}
        />

        {/* 2. Add Expense */}
        <OperationCard
          mascot="wallet"
          title="Add Expense"
          meta={<StatusChip status="live" label="+ New Voucher" />}
          description="Record operational vouchers with event allocation, category, invoice receipt, and description"
          actionLabel="Create Voucher"
          onClick={() => setActiveTab('treasurer')}
        />

        {/* 3. Inventory & Assets */}
        <OperationCard
          mascot="tree"
          title="Equipment Inventory"
          meta={<span className="text-xs font-bold text-[#235347]">{stockItems.length} Items</span>}
          description="Physical equipment tracking, asset checkout, telemetry sensors, and low-stock indicators"
          actionLabel="Inspect Inventory"
          onClick={() => setActiveTab('treasurer')}
        />

        {/* 4. Financial Audit Export */}
        <OperationCard
          mascot="notebook"
          title="Financial Audit Export"
          meta={<span className="text-xs font-bold text-[#235347]">CSV & Statements</span>}
          description="Export comprehensive financial statements and auditor ledgers by event or academic year"
          actionLabel="Export Statements"
          onClick={() => setActiveTab('treasurer')}
        />
      </div>
    </div>
  );
};

export default TreasurerOperationsView;
