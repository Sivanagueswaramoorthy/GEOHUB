import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  X,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatTile } from '../../../components/StatTile';
import { SectionCard } from '../../../components/SectionCard';
import { Overline } from '../../../components/Overline';
import { DonutCard } from '../../../components/DonutCard';

export interface TreasurerHomeViewProps {
  showToast: (msg: string) => void;
  setSelectedEventId: (id: string) => void;
  handleOpenPrefilledExpense: (eventId: string, title: string, category: 'Logistics' | 'Stage' | 'Refreshments' | 'Printing') => void;
}

export const TreasurerHomeView: React.FC<TreasurerHomeViewProps> = ({
  showToast,
  setSelectedEventId,
  handleOpenPrefilledExpense,
}) => {
  const { expenses, stockItems, setActiveTab } = useApp();
  const [activeReceiptLightbox, setActiveReceiptLightbox] = useState<string | null>(null);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <>
      {/* 1) Four StatTiles: Total Budget, Spent, Remaining, Pending Entries */}
      <div className="stat-tiles-grid">
        <StatTile
          label="Total Budget"
          value={formatINR(450000)}
          footnote="All 4 squad allocations"
          tint="mint"
          icon={<DollarSign size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('finance')}
        />

        <StatTile
          label="Spent"
          value={formatINR(227000)}
          footnote="50.4% corpus utilized"
          tint="amber"
          icon={<TrendingUp size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('finance')}
        />

        <StatTile
          label="Remaining"
          value={formatINR(223000)}
          footnote="49.6% available balance"
          tint="teal"
          icon={<CheckCircle2 size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('finance')}
        />

        <StatTile
          label="Pending Entries"
          value="4"
          footnote="Vouchers awaiting bills"
          tint="lavender"
          icon={<Clock size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('finance')}
        />
      </div>

      {/* 2) Budget Overview Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline pill>FISCAL GOVERNANCE</Overline>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1">
              Budget Overview & Corpus Utilization
            </h3>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            50.4% Utilized
          </span>
        </div>

        {/* Main Progress Bar */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Total Allocated vs Used</span>
            <span className="font-extrabold text-emerald-950 font-mono">
              {formatINR(227000)} / {formatINR(450000)}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full"
              style={{ width: '50.4%' }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="text-emerald-700 font-bold">Spent: {formatINR(227000)}</span>
            <span className="text-teal-700 font-bold">Remaining: {formatINR(223000)}</span>
          </div>
        </div>

        {/* Squad breakdown mini bars */}
        <div className="mt-4 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-700">Squad Allocations & Burn Rate</span>
          {[
            { name: 'Logistics Squad', spent: 82500, allocated: 145000, color: 'bg-emerald-500' },
            { name: 'Stage & Entertainment', spent: 58500, allocated: 60000, color: 'bg-purple-500' },
            { name: 'Hospitality & Catering', spent: 47800, allocated: 60000, color: 'bg-amber-500' },
            { name: 'Promotion & Print', spent: 38200, allocated: 45000, color: 'bg-blue-500' },
          ].map((squad) => {
            const pct = Math.round((squad.spent / squad.allocated) * 100);
            return (
              <div key={squad.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">{squad.name}</span>
                  <span className="font-mono text-slate-500">
                    {formatINR(squad.spent)} / {formatINR(squad.allocated)}{' '}
                    <strong className="text-slate-900">({pct}%)</strong>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${squad.color} rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* 3) DonutCard "Spend by category" */}
      <DonutCard
        title="EXPENDITURE BREAKDOWN"
        subtitle="Spend by category across active fiscal cycle"
        centerTotal={formatINR(227000)}
        centerLabel="Total Spent"
        segments={[
          { label: 'Logistics', count: 82500, color: '#059669' },
          { label: 'Stage', count: 58500, color: '#7C3AED' },
          { label: 'Refreshments', count: 47800, color: '#D97706' },
          { label: 'Printing', count: 38200, color: '#0284C7' },
        ]}
      />

      {/* 4) Spend per Event */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline pill>EVENT LEDGER</Overline>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1">Spend per Event</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            View Events →
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            {
              id: 'event_02',
              title: 'QGIS & Remote Sensing Workshop',
              spent: 106150,
              budget: 120000,
              color: 'bg-emerald-500',
              badge: '88.5% Utilized',
              badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            },
            {
              id: 'event_01',
              title: 'GEO FEST 2026 Flagship Conclave',
              spent: 92350,
              budget: 150000,
              color: 'bg-teal-500',
              badge: '61.6% Utilized',
              badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
            },
            {
              id: 'event_05',
              title: 'Adyar River Environmental Water Sampling',
              spent: 28500,
              budget: 45000,
              color: 'bg-amber-500',
              badge: '63.3% Utilized',
              badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
            },
            {
              id: 'event_03',
              title: 'Campus Biodiversity Drone Survey',
              spent: 0,
              budget: 35000,
              color: 'bg-slate-300',
              badge: 'Bills Pending',
              badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
            },
          ].map((ev) => {
            const pct = ev.budget > 0 ? Math.round((ev.spent / ev.budget) * 100) : 0;
            return (
              <div
                key={ev.id}
                onClick={() => {
                  setSelectedEventId(ev.id);
                  setActiveTab('events');
                }}
                className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs text-slate-900 truncate">{ev.title}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${ev.badgeBg}`}>
                    {ev.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Spent: <strong className="text-slate-800 font-mono">{formatINR(ev.spent)}</strong></span>
                  <span>Budget: <strong className="text-slate-600 font-mono">{formatINR(ev.budget)}</strong></span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${ev.color} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* 5) Events Needing Expense Entry */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline pill>PENDING AUDIT</Overline>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1">
              Events Needing Expense Entry
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            3 Pending
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            {
              eventId: 'event_03',
              eventTitle: 'Campus Biodiversity Drone Survey',
              desc: 'Awaiting invoice for spare propellers & LiPo batteries from Logistics lead.',
              suggestedTitle: 'Drone Battery Replacements & Flight Spares',
              suggestedCategory: 'Logistics' as const,
              urgency: 'Due Today',
            },
            {
              eventId: 'event_05',
              eventTitle: 'Adyar River Environmental Water Sampling',
              desc: 'Water testing reagents & laboratory test kits voucher pending from Volunteer lead.',
              suggestedTitle: 'River Water Sampling Reagent Kits',
              suggestedCategory: 'Logistics' as const,
              urgency: 'Overdue (2d)',
            },
            {
              eventId: 'event_01',
              eventTitle: 'GEO FEST 2026 Flagship Conclave',
              desc: 'Memento plaques freight charges reimbursement bill awaited from Stage lead.',
              suggestedTitle: 'Guest Scientist Memento Freight & Courier',
              suggestedCategory: 'Stage' as const,
              urgency: 'Pending',
            },
          ].map((item) => (
            <div
              key={item.eventId}
              className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-amber-300 transition-all flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {item.eventTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    {item.desc}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  {item.urgency}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                <span className="text-[11px] text-slate-400 font-medium">Category: {item.suggestedCategory}</span>
                <button
                  type="button"
                  onClick={() => handleOpenPrefilledExpense(item.eventId, item.suggestedTitle, item.suggestedCategory)}
                  className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>+ Log Expense</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 6) Stock Alerts */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline pill>INVENTORY HEALTH</Overline>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1">Stock Alerts</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
          >
            All Stock ({stockItems.length}) →
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {stockItems
            .filter((s) => s.quantity <= s.minThreshold)
            .map((stock) => (
              <div
                key={stock.id}
                className="p-3 rounded-2xl bg-amber-50/40 border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={16} strokeWidth={1.75} className="text-amber-600 shrink-0" />
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {stock.name}
                    </h4>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {stock.location} • Unit Cost: {formatINR(stock.unitCost)}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {stock.quantity} / {stock.minThreshold} {stock.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast(`Restock request dispatched for ${stock.name}`)}
                    className="text-[11px] font-bold text-amber-800 hover:underline mt-1 cursor-pointer"
                  >
                    Restock →
                  </button>
                </div>
              </div>
            ))}
        </div>
      </SectionCard>

      {/* 7) Recent Transactions */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Overline pill>PURCHASE LEDGER</Overline>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1">Recent Transactions</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Ledger ({expenses.length}) →
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {expenses.slice(0, 5).map((exp) => (
            <div
              key={exp.id}
              className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {exp.receiptUrl ? (
                  <img
                    src={exp.receiptUrl}
                    alt="Receipt"
                    onClick={() => setActiveReceiptLightbox(exp.receiptUrl || null)}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
                    title="Click to view voucher"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <FileText size={16} />
                  </div>
                )}

                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-slate-900 truncate">
                    {exp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {exp.vendorName} • {new Date(exp.buyingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="font-extrabold text-xs text-emerald-950 font-mono">
                  {formatINR(exp.amount)}
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider mt-0.5 ${
                    exp.category === 'Logistics'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : exp.category === 'Stage'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : exp.category === 'Refreshments'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  {exp.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Receipt Lightbox */}
      {activeReceiptLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveReceiptLightbox(null)}
        >
          <div
            className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Procurement Invoice</h3>
                <p className="text-[11px] text-slate-500">Official digital receipt copy</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptLightbox(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-80 flex items-center justify-center">
              <img src={activeReceiptLightbox} alt="Receipt" className="w-full h-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => {
                showToast('✓ Downloaded voucher receipt');
                setActiveReceiptLightbox(null);
              }}
              className="w-full py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Download PDF Copy
            </button>
          </div>
        </div>
      )}
    </>
  );
};
