import React, { useState } from 'react';
import {
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  Receipt,
  CheckCircle2,
  Calendar,
  Tag,
  Coins,
} from 'lucide-react';
import { AnimatedNumber, SearchField, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';
import { ExpenseItem } from './AddExpenseScreen';

export interface ExpenditureLedgerScreenProps {
  readOnly: boolean;
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const ExpenditureLedgerScreen: React.FC<ExpenditureLedgerScreenProps> = ({
  readOnly,
  expenses,
  setExpenses,
  onLogAudit,
  currentUser,
}) => {
  const { events } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<string>('All');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const categories = ['All', 'Equipment', 'Refreshments', 'Travel', 'Printing', 'Honorarium'];
  const eventsList = [
    'All',
    'General Club Operations',
    ...(events || []).map((e) => e.title),
  ];

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;
    if (selectedEvent !== 'All' && exp.event !== selectedEvent) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      exp.description.toLowerCase().includes(q) ||
      exp.event.toLowerCase().includes(q) ||
      exp.actor.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q)
    );
  });

  const totalFilteredSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleExportCSV = () => {
    onLogAudit('Expenditure Ledger', `Exported CSV ledger with ${filteredExpenses.length} entries (Total: ₹${totalFilteredSum})`);
    setExportNotice(`Exported ${filteredExpenses.length} ledger rows to GeoHub_Expenditure_Ledger.csv`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Volume</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Coins size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            ₹<AnimatedNumber value={totalFilteredSum} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Status</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            100% Reconciled
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Export</span>
          <button
            type="button"
            onClick={handleExportCSV}
            className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
            data-testid="btn-export-ledger-csv"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Main Ledger Card */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Official Expenditure Ledger
          </h2>

          <div className="w-full sm:w-64">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search ledger..."
              style={{ height: '36px' }}
            />
          </div>
        </div>

        {/* Category & Event Filter Ribbons */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="h-8 px-2.5 rounded-xl border border-[#DAF1DE] text-xs font-semibold text-[#051F20] bg-[#F6FBF7] ml-auto shrink-0 cursor-pointer"
          >
            {eventsList.map((ev) => (
              <option key={ev} value={ev}>
                {ev === 'All' ? 'All Events' : ev}
              </option>
            ))}
          </select>
        </div>

        {/* Ledger Items Feed (Card rows that scale fluidly from 360px mobile to desktop) */}
        <div className="space-y-2.5 pt-1">
          {filteredExpenses.length === 0 ? (
            <EmptyState
              mascot="wallet"
              title="Ledger Clear"
              description="No expenditure transactions recorded in the official audit books."
            />
          ) : (
            filteredExpenses.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0 font-extrabold text-xs shadow-2xs">
                    ₹
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#051F20] text-xs sm:text-sm truncate">
                        {exp.description}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-[#DAF1DE] text-[#235347]">
                        {exp.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#235347] mt-0.5 truncate">
                      Event: <strong className="text-[#051F20]">{exp.event}</strong> | Verified by {exp.actor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-[#DAF1DE] pt-2 sm:pt-0">
                  <span className="text-xs text-[#235347]/70 font-semibold">
                    {exp.time}
                  </span>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-[#051F20] block">
                      -₹{exp.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#163832] font-semibold inline-flex items-center gap-1">
                      <Receipt size={11} /> {exp.billProof || 'Receipt'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenditureLedgerScreen;

