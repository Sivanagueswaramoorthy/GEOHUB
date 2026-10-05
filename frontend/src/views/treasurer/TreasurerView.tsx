import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Receipt,
  Download,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Eye,
  Layers,
  PackagePlus,
  Tag,
  ExternalLink,
  Sparkles,
  Calendar,
  Building,
  Filter,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { ExpenseItem, StockItem } from '../../types';
import {
  Overline,
  StatTile,
  SectionCard,
  DonutCard,
  Chip,
  BottomSheet,
  Toast,
  ConfirmDialog,
  EmptyState,
} from '../../components';

export const TreasurerView: React.FC = () => {
  const {
    currentUser,
    expenses,
    stockItems,
    budgetRequests,
    events,
    addExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    requestBudgetChange,
    setActiveTab,
    setSelectedEventId,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'expenses' | 'stock' | 'history'>('overview');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // INR Formatting Helper
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ----------------------------------------------------
  // TOTALS & CALCULATIONS (Consistent with DonutCard & Ledger)
  // ----------------------------------------------------
  const totalBudget = 450000;
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const pendingEntriesCount = 4;

  // ----------------------------------------------------
  // EXPENSES FILTERS & SEARCH
  // ----------------------------------------------------
  const [expenseSearch, setExpenseSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterAmount, setFilterAmount] = useState('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search
      if (expenseSearch.trim()) {
        const q = expenseSearch.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchVendor = e.vendorName.toLowerCase().includes(q);
        const matchEvent = (e.eventTitle || '').toLowerCase().includes(q);
        if (!matchTitle && !matchVendor && !matchEvent) return false;
      }
      // Event filter
      if (filterEvent !== 'all' && e.eventId !== filterEvent) {
        return false;
      }
      // Category filter
      if (filterCategory !== 'all' && e.category !== filterCategory) {
        return false;
      }
      // Amount filter
      if (filterAmount === 'under_20k' && e.amount >= 20000) return false;
      if (filterAmount === '20k_50k' && (e.amount < 20000 || e.amount > 50000)) return false;
      if (filterAmount === 'over_50k' && e.amount <= 50000) return false;
      // Date filter
      if (filterDateRange === 'last_7d') {
        const diffDays = (Date.now() - new Date(e.buyingDate).getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (filterDateRange === 'last_30d') {
        const diffDays = (Date.now() - new Date(e.buyingDate).getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      }
      return true;
    });
  }, [expenses, expenseSearch, filterEvent, filterCategory, filterDateRange, filterAmount]);

  // ----------------------------------------------------
  // ADD / EDIT EXPENSE FORM STATE
  // ----------------------------------------------------
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [formEventId, setFormEventId] = useState(events[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseItem['category']>('Logistics');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formVendor, setFormVendor] = useState('');
  const [formReceiptUrl, setFormReceiptUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  );
  const [formNotes, setFormNotes] = useState('');

  // Delete Expense Confirmation
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);

  // Receipt Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // ----------------------------------------------------
  // STOCK FORM & DELETE STATE
  // ----------------------------------------------------
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [stockName, setStockName] = useState('');
  const [stockCategory, setStockCategory] = useState<StockItem['category']>('Field Equipment');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [stockUnit, setStockUnit] = useState('Units');
  const [stockMinThreshold, setStockMinThreshold] = useState('5');
  const [stockUnitCost, setStockUnitCost] = useState('1500');
  const [stockLocation, setStockLocation] = useState('Central Hardware Locker B-1');
  const [stockToDelete, setStockToDelete] = useState<StockItem | null>(null);

  // ----------------------------------------------------
  // ALLOCATION REQUESTS MODAL
  // ----------------------------------------------------
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isRequestRebalanceOpen, setIsRequestRebalanceOpen] = useState(false);
  const [rebalanceTeam, setRebalanceTeam] = useState('Promotion');
  const [rebalanceAmount, setRebalanceAmount] = useState('45000');
  const [rebalanceReason, setRebalanceReason] = useState('');

  // ----------------------------------------------------
  // REFRESHMENTS DUTY CONVERSION HANDLER
  // ----------------------------------------------------
  const handleConvertRefreshmentDuty = () => {
    setFormEventId('event_02');
    setFormTitle('Catering & Lunch Packs for 180 Scholars (Day 1)');
    setFormCategory('Refreshments');
    setFormAmount('28750');
    setFormDate('2026-10-05');
    setFormVendor('College Green Canteen Catering');
    setFormReceiptUrl('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');
    setFormNotes('Auto-converted from Food & Refreshments Operational Duty assigned to Ananya Sen.');
    setEditingExpenseId(null);
    setIsAddExpenseOpen(true);
    showToast('Prefilled expense voucher from Refreshments Duty!');
  };

  // Open Edit Expense
  const handleOpenEditExpense = (exp: ExpenseItem) => {
    setEditingExpenseId(exp.id);
    setFormEventId(exp.eventId || '');
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormAmount(String(exp.amount));
    setFormDate(exp.buyingDate);
    setFormVendor(exp.vendorName);
    setFormReceiptUrl(exp.receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80');
    setFormNotes(exp.notes || '');
    setIsAddExpenseOpen(true);
  };

  // Submit Add / Edit Expense
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount) return;
    const num = parseFloat(formAmount);
    const targetEv = events.find((ev) => ev.id === formEventId);

    if (editingExpenseId) {
      updateExpenseItem(editingExpenseId, {
        eventId: formEventId || undefined,
        eventTitle: targetEv?.title,
        title: formTitle,
        amount: isNaN(num) ? 0 : num,
        category: formCategory,
        buyingDate: formDate,
        vendorName: formVendor,
        receiptUrl: formReceiptUrl,
        notes: formNotes,
      });
      showToast(`✓ Updated expense: "${formTitle}"`);
    } else {
      addExpenseItem({
        eventId: formEventId || undefined,
        eventTitle: targetEv?.title,
        title: formTitle,
        amount: isNaN(num) ? 0 : num,
        category: formCategory,
        buyingDate: formDate,
        vendorName: formVendor || 'Campus Vendor',
        receiptUrl: formReceiptUrl,
        approvedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
        notes: formNotes,
      });
      showToast(`✓ Recorded expense voucher of ${formatINR(num)}!`);
    }

    setIsAddExpenseOpen(false);
    setEditingExpenseId(null);
    setFormTitle('');
    setFormAmount('');
    setFormVendor('');
    setFormNotes('');
  };

  // Confirm Delete Expense
  const handleConfirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    deleteExpenseItem(expenseToDelete.id);
    showToast(`✓ Deleted expense voucher "${expenseToDelete.title}"`);
    setExpenseToDelete(null);
  };

  // Stock Submit
  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName.trim()) return;
    const qty = parseInt(stockQuantity, 10) || 0;
    const minT = parseInt(stockMinThreshold, 10) || 0;
    const cost = parseFloat(stockUnitCost) || 0;

    addStockItem({
      name: stockName,
      category: stockCategory,
      quantity: qty,
      unit: stockUnit || 'Units',
      minThreshold: minT,
      unitCost: cost,
      lastRestocked: new Date().toISOString().split('T')[0],
      location: stockLocation || 'Central Locker B-1',
      status: qty <= 0 ? 'out_of_stock' : qty <= minT ? 'low_stock' : 'in_stock',
    });
    showToast(`✓ Cataloged ${stockName} in inventory!`);
    setIsAddStockOpen(false);
    setStockName('');
  };

  // Confirm Delete Stock
  const handleConfirmDeleteStock = () => {
    if (!stockToDelete) return;
    deleteStockItem(stockToDelete.id);
    showToast(`✓ Removed ${stockToDelete.name} from inventory`);
    setStockToDelete(null);
  };

  // Submit Allocation Request
  const handleBudgetRebalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rebalanceReason.trim()) return;
    const amt = parseFloat(rebalanceAmount) || 0;
    requestBudgetChange(rebalanceTeam, amt, rebalanceReason);
    showToast(`✓ Dispatched budget request for ${rebalanceTeam} (${formatINR(amt)}) to Faculty!`);
    setIsRequestRebalanceOpen(false);
    setRebalanceReason('');
  };

  // CSV Export for Expenses
  const handleExportCsv = () => {
    const csvHeader = 'Voucher ID,Date,Title,Category,Event,Vendor,Amount (INR),Paid By,Status\n';
    const csvRows = filteredExpenses
      .map(
        (e) =>
          `"${e.id}","${e.buyingDate}","${e.title.replace(/"/g, '""')}","${e.category}","${(e.eventTitle || 'General').replace(/"/g, '""')}","${e.vendorName.replace(/"/g, '""')}",${e.amount},"${e.paidBy}","${e.status}"`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoHub_Treasurer_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Exported expense ledger to CSV!');
  };

  return (
    <div className="flex flex-col gap-5 pb-16">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Overline pill dot>
              TREASURY & FISCAL GOVERNANCE
            </Overline>
            {!perms.canEditBudget && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Allocations Set by Faculty
              </span>
            )}
          </div>
          <h1
            className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Treasurer Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage vouchers, equipment inventory, budget allocations & fiscal audits
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingExpenseId(null);
            setFormTitle('');
            setFormAmount('');
            setFormVendor('');
            setFormNotes('');
            setIsAddExpenseOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer active:scale-95 shrink-0 mt-1"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* 4 Tabs: Overview, Expenses, Stock, History */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs">
        {(
          [
            { key: 'overview', label: 'Overview' },
            { key: 'expenses', label: `Expenses (${expenses.length})` },
            { key: 'stock', label: `Stock (${stockItems.length})` },
            { key: 'history', label: 'History' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === tab.key
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
          ========================================================================= */}
      {activeSubTab === 'overview' && (
        <>
          {/* Four StatTiles: Total Budget, Spent, Remaining, Pending Entries */}
          <div
            className="grid grid-cols-2 gap-3"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}
          >
            <StatTile
              label="Total Budget"
              value={formatINR(totalBudget)}
              footnote="All 4 squad allocations"
              tint="mint"
              icon={<DollarSign size={18} />}
              onClick={() => setIsAllocationModalOpen(true)}
            />

            <StatTile
              label="Spent"
              value={formatINR(totalSpent)}
              footnote="50.4% corpus utilized"
              tint="amber"
              icon={<TrendingUp size={18} />}
              onClick={() => setActiveSubTab('expenses')}
            />

            <StatTile
              label="Remaining"
              value={formatINR(remainingBudget)}
              footnote="49.6% available balance"
              tint="teal"
              icon={<CheckCircle2 size={18} />}
              onClick={() => setActiveSubTab('expenses')}
            />

            <StatTile
              label="Pending Entries"
              value={String(pendingEntriesCount)}
              footnote="Vouchers awaiting bills"
              tint="lavender"
              icon={<Clock size={18} />}
              onClick={() => setActiveSubTab('expenses')}
            />
          </div>

          {/* Refreshments Duty Link (converts food details into an expense) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                🍔
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-extrabold text-amber-950 truncate">
                  Unconverted Refreshments Duty
                </span>
                <span className="text-[11px] text-amber-800 font-medium line-clamp-1">
                  Ananya Sen arranged catering for 180 delegates during QGIS Workshop.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConvertRefreshmentDuty}
              className="px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
            >
              Convert to Expense →
            </button>
          </div>

          {/* Budget Overview Card: allocated vs used progress bar with percent */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline pill>BUDGET UTILIZATION</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Corpus Allocation & Burn Rate
                </h3>
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                50.4% Utilized
              </span>
            </div>

            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total Allocated vs Used</span>
                <span className="font-extrabold text-emerald-950 font-mono">
                  {formatINR(totalSpent)} / {formatINR(totalBudget)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: '50.4%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="text-emerald-700 font-bold">Spent: {formatINR(totalSpent)}</span>
                <span className="text-teal-700 font-bold">Remaining: {formatINR(remainingBudget)}</span>
              </div>
            </div>

            {/* Squad breakdown mini bars */}
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Squad Allocations</span>
                <button
                  type="button"
                  onClick={() => setIsAllocationModalOpen(true)}
                  className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                >
                  Allocation Requests →
                </button>
              </div>
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

          {/* DonutCard "Spend by category" (Logistics, Stage, Printing, Refreshments) */}
          <DonutCard
            title="SPEND BY CATEGORY"
            subtitle="Breakdown across all 4 procurement domains"
            centerTotal={formatINR(227000)}
            centerLabel="Total Spent"
            segments={[
              { label: 'Logistics', count: 82500, color: '#059669' },
              { label: 'Stage', count: 58500, color: '#7C3AED' },
              { label: 'Refreshments', count: 47800, color: '#D97706' },
              { label: 'Printing', count: 38200, color: '#0284C7' },
            ]}
          />

          {/* Bar Chart of Spend per Event */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline pill>EVENT EXPENDITURE</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Spend per Event
                </h3>
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
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {ev.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${ev.badgeBg}`}>
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
        </>
      )}

      {/* =========================================================================
          TAB 2: EXPENSES
          ========================================================================= */}
      {activeSubTab === 'expenses' && (
        <div className="flex flex-col gap-4">
          {/* Filters & Search */}
          <SectionCard padding="14px">
            <div className="flex flex-col gap-2.5">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search item, vendor or event..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
                />
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                {expenseSearch && (
                  <button
                    type="button"
                    onClick={() => setExpenseSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Multi Filters Row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Filter by Event</label>
                  <select
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white text-slate-800"
                  >
                    <option value="all">All Chapter Events</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white text-slate-800"
                  >
                    <option value="all">All Categories</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Stage">Stage & AV</option>
                    <option value="Printing">Printing</option>
                    <option value="Refreshments">Refreshments</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Date Range</label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white text-slate-800"
                  >
                    <option value="all">All Time</option>
                    <option value="last_7d">Last 7 Days</option>
                    <option value="last_30d">Last 30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Amount Range</label>
                  <select
                    value={filterAmount}
                    onChange={(e) => setFilterAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none bg-white text-slate-800"
                  >
                    <option value="all">Any Amount</option>
                    <option value="under_20k">Under ₹20,000</option>
                    <option value="20k_50k">₹20,000 - ₹50,000</option>
                    <option value="over_50k">Over ₹50,000</option>
                  </select>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500">
                  Showing {filteredExpenses.length} of {expenses.length} vouchers
                </span>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Expenses Cards List */}
          {filteredExpenses.length === 0 ? (
            <EmptyState
              title="No Expense Vouchers Found"
              description="No records match your active search and category filters."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-300 transition-all flex flex-col gap-3"
                >
                  {/* Top Row: Title, Amount, Category */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                          exp.category === 'Logistics'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : exp.category === 'Stage'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : exp.category === 'Refreshments'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {exp.category}
                        </span>
                        {exp.eventTitle && (
                          <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[180px]">
                            {exp.eventTitle}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1 leading-snug">
                        {exp.title}
                      </h4>
                    </div>

                    <span className="text-base font-extrabold text-emerald-950 font-mono shrink-0">
                      {formatINR(exp.amount)}
                    </span>
                  </div>

                  {/* Vendor, Date & Payer info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span>Vendor: <strong className="text-slate-800">{exp.vendorName}</strong></span>
                    <span>{new Date(exp.buyingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {exp.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{exp.notes}"
                    </p>
                  )}

                  {/* Bottom Row: Receipt preview thumbnail, Edit & Delete Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    {exp.receiptUrl ? (
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(exp.receiptUrl || null)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        <img
                          src={exp.receiptUrl}
                          alt="Receipt thumbnail"
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200 shadow-2xs"
                        />
                        <span>View Receipt Voucher</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">No receipt attached</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditExpense(exp)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit voucher"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete voucher"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: STOCK
          ========================================================================= */}
      {activeSubTab === 'stock' && (
        <div className="flex flex-col gap-4">
          {/* Header Summary & Add Stock Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Physical Asset Inventory</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {stockItems.length} Items Monitored
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddStockOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <PackagePlus size={14} />
              <span>Add Stock Item</span>
            </button>
          </div>

          {/* Stock Cards List */}
          <div className="flex flex-col gap-3">
            {stockItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-amber-300 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                        item.quantity <= item.minThreshold
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.quantity <= item.minThreshold ? 'Low Stock Alert' : 'In Stock'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-mono font-extrabold text-base text-slate-900">
                      {item.quantity} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Min: {item.minThreshold}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <span>Location: <strong className="text-slate-800">{item.location}</strong></span>
                  <span>Unit Cost: <strong className="text-emerald-950 font-mono">{formatINR(item.unitCost)}</strong></span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {item.quantity <= item.minThreshold ? (
                    <button
                      type="button"
                      onClick={() => showToast(`Restock requisition dispatched for ${item.name}`)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      Requisition Restock →
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Stock level optimal</span>
                  )}

                  <button
                    type="button"
                    onClick={() => setStockToDelete(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: HISTORY
          ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="flex flex-col gap-4">
          {/* Summary Box */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Overline pill>AUDIT RECORD</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Annual Procurement Ledger
                </h3>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                <Download size={13} />
                <span>Export Ledger</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">TOTAL OUTFLOW</span>
                <span className="font-mono font-extrabold text-sm text-slate-900">{formatINR(totalSpent)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">VOUCHERS</span>
                <span className="font-mono font-extrabold text-sm text-slate-900">{expenses.length} Logged</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">CERTIFICATION</span>
                <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">Faculty Ratified ✓</span>
              </div>
            </div>
          </SectionCard>

          {/* Chronological Record List */}
          <div className="flex flex-col gap-2.5">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400">{exp.id.toUpperCase()}</span>
                    <span className="text-[10px] font-bold text-slate-400">• {exp.buyingDate}</span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 truncate mt-0.5">
                    {exp.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">
                    Vendor: {exp.vendorName} • Paid by: {exp.paidBy}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="font-mono font-extrabold text-sm text-emerald-950">
                    {formatINR(exp.amount)}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 mt-0.5">
                    Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD / EDIT EXPENSE FORM
          ========================================================================= */}
      <BottomSheet
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title={editingExpenseId ? 'Edit Expense Voucher' : 'Log Expense Voucher'}
        subtitle="Record vendor payment, invoice details, and allocate to event"
      >
        <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked Chapter Event</label>
            <select
              value={formEventId}
              onChange={(e) => setFormEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
            >
              <option value="">General Club Operations (No specific event)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.venue})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Item Title / Description</label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Trimble GNSS RTK Rover Rental (2 Days)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
              >
                <option value="Logistics">Logistics</option>
                <option value="Stage">Stage & AV</option>
                <option value="Printing">Printing & Kits</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="54000"
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Payee</label>
              <input
                type="text"
                required
                value={formVendor}
                onChange={(e) => setFormVendor(e.target.value)}
                placeholder="e.g. Apex Geo-Instruments Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Upload & Preview</label>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <img
                src={formReceiptUrl}
                alt="Receipt Preview"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-emerald-950 truncate">Tax Invoice / Bill Proof</span>
                <span className="text-[11px] text-emerald-700 font-medium">Digital receipt archived in fiscal ledger</span>
              </div>
              <label className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold cursor-pointer hover:bg-emerald-50 transition-colors shrink-0">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setFormReceiptUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Purpose</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Dual-frequency receiver rented for campus boundary mapping practicum."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-1 cursor-pointer"
          >
            {editingExpenseId ? 'Save Changes' : 'Confirm & Record Expense'}
          </button>
        </form>
      </BottomSheet>

      {/* =========================================================================
          MODAL 2: ADD STOCK ITEM FORM
          ========================================================================= */}
      <BottomSheet
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        title="Add Inventory & Stock Item"
        subtitle="Catalog physical equipment, field gear, or stationery"
      >
        <form onSubmit={handleStockSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              required
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              placeholder="e.g. Garmin eTrex 32x Handheld GPS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={stockCategory}
                onChange={(e) => setStockCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-amber-500"
              >
                <option value="Field Equipment">Field Equipment</option>
                <option value="Logistics">Logistics</option>
                <option value="Stage">Stage & AV</option>
                <option value="Printing">Printing & Badges</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={stockUnit}
                onChange={(e) => setStockUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-amber-500"
              >
                <option value="Units">Units</option>
                <option value="Packs">Packs</option>
                <option value="Rolls">Rolls</option>
                <option value="Pieces">Pieces</option>
                <option value="Sets">Sets</option>
                <option value="Pairs">Pairs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Qty</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Threshold</label>
              <input
                type="number"
                min="1"
                required
                value={stockMinThreshold}
                onChange={(e) => setStockMinThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={stockUnitCost}
                onChange={(e) => setStockUnitCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Storage Location</label>
            <input
              type="text"
              required
              value={stockLocation}
              onChange={(e) => setStockLocation(e.target.value)}
              placeholder="e.g. Geospatial Hardware Locker A-2"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-amber-600 text-white shadow-sm hover:bg-amber-700 transition-all mt-1 cursor-pointer"
          >
            Add to Inventory Ledger
          </button>
        </form>
      </BottomSheet>

      {/* =========================================================================
          MODAL 3: ALLOCATION REQUESTS (Read-only "Set by Faculty" + Request button)
          ========================================================================= */}
      <BottomSheet
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        title="Squad Budget Allocations"
        subtitle="Allocations are governed and set by Faculty Advisor Dr. Sarah Jenkins"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <span className="font-extrabold text-amber-800 shrink-0">🔒 Read-Only:</span>
            <span>Allocations are set by Faculty Advisor Dr. Sarah Jenkins. Modification is hidden by permission and route for the Treasurer Lead. You may submit a budget change petition below.</span>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { squad: 'Logistics Squad', allocated: 145000, spent: 82500 },
              { squad: 'Stage & Entertainment', allocated: 60000, spent: 58500 },
              { squad: 'Hospitality & Catering', allocated: 60000, spent: 47800 },
              { squad: 'Promotion Squad', allocated: 45000, spent: 38200 },
              { squad: 'General Reserve Fund', allocated: 140000, spent: 0 },
            ].map((item) => (
              <div
                key={item.squad}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">{item.squad}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      Set by Faculty
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Spent: {formatINR(item.spent)}
                  </div>
                </div>

                <span className="font-mono font-extrabold text-xs text-slate-900">
                  {formatINR(item.allocated)}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAllocationModalOpen(false);
              setIsRequestRebalanceOpen(true);
            }}
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all cursor-pointer mt-1"
          >
            + Request Allocation Change from Faculty
          </button>
        </div>
      </BottomSheet>

      {/* Sub-Modal: Send Reason for Allocation Change */}
      <BottomSheet
        isOpen={isRequestRebalanceOpen}
        onClose={() => setIsRequestRebalanceOpen(false)}
        title="Request Budget Change"
        subtitle="Send justification to Faculty Advisor Dr. Sarah Jenkins"
      >
        <form onSubmit={handleBudgetRebalanceSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Squad</label>
            <select
              value={rebalanceTeam}
              onChange={(e) => setRebalanceTeam(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
            >
              <option value="Promotion">Promotion Squad</option>
              <option value="Entertainment">Entertainment Squad</option>
              <option value="Documentation">Documentation Squad</option>
              <option value="Management">Management Squad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Requested Total Allocation (₹ INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="5000"
                step="500"
                required
                value={rebalanceAmount}
                onChange={(e) => setRebalanceAmount(e.target.value)}
                placeholder="45000"
                className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Justification Reason</label>
            <textarea
              rows={3}
              required
              value={rebalanceReason}
              onChange={(e) => setRebalanceReason(e.target.value)}
              placeholder="e.g. Additional digital canopy banner printing and sponsor collateral required for GEO FEST 2026."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all mt-1 cursor-pointer"
          >
            Submit Request to Faculty Advisor
          </button>
        </form>
      </BottomSheet>

      {/* =========================================================================
          RECEIPT LIGHTBOX DIALOG
          ========================================================================= */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Procurement Invoice Voucher</h3>
                <p className="text-[11px] text-slate-500">Official verified receipt stored in chapter ledger</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-80 flex items-center justify-center">
              <img
                src={lightboxUrl}
                alt="Receipt"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                showToast('✓ Downloaded voucher receipt copy');
                setLightboxUrl(null);
              }}
              className="w-full py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Download PDF Copy
            </button>
          </div>
        </div>
      )}

      {/* Delete Expense Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleConfirmDeleteExpense}
        title="Delete Expense Voucher?"
        message={`Are you sure you want to delete "${expenseToDelete?.title}" for ${formatINR(expenseToDelete?.amount || 0)}? This action cannot be undone.`}
        confirmLabel="Delete Voucher"
        isDanger
      />

      {/* Delete Stock Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!stockToDelete}
        onClose={() => setStockToDelete(null)}
        onConfirm={handleConfirmDeleteStock}
        title="Delete Stock Item?"
        message={`Are you sure you want to remove "${stockToDelete?.name}" from chapter inventory?`}
        confirmLabel="Remove Item"
        isDanger
      />
    </div>
  );
};
