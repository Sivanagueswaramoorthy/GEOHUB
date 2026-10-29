import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Receipt,
  Download,
  AlertTriangle,
  Package,
  Layers,
  Building,
  Calendar,
  Tag,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseItem, StockItem } from '../../types';
import {
  PillButton,
  StatusChip,
  StatTile,
  BottomSheet,
  EmptyState,
  SegmentedTabs,
  UploadCard,
  AmountInput,
} from '../../components/shared';

export const TreasurerView: React.FC = () => {
  const {
    currentUser,
    expenses,
    stockItems,
    events,
    addExpenseItem,
    addStockItem,
    updateStockItem,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'expenses' | 'stock' | 'history'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState('Logistics');
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseEventId, setExpenseEventId] = useState(events[0]?.id || '');

  // Add Stock State
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [stockName, setStockName] = useState('');
  const [stockCategory, setStockCategory] = useState('Equipment');
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockMinThreshold, setStockMinThreshold] = useState(5);
  const [stockLocation, setStockLocation] = useState('Lab 204');

  const totalBudget = 450000;
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  const categories = ['All', 'Logistics', 'Stage', 'Printing', 'Refreshments', 'Equipment', 'Honorarium'];

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'All' && e.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchVendor = (e.vendorName || '').toLowerCase().includes(q);
      const matchDesc = e.title.toLowerCase().includes(q);
      if (!matchVendor && !matchDesc) return false;
    }
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;
    const targetEvent = events.find((ev) => ev.id === expenseEventId);
    addExpenseItem({
      amount: expenseAmount,
      category: expenseCategory as any,
      title: expenseDescription || `${expenseCategory} expenditure`,
      vendorName: expenseVendor || 'Approved Vendor',
      buyingDate: new Date().toISOString().split('T')[0],
      approvedBy: 'Faculty Governance',
      eventId: expenseEventId || undefined,
      eventTitle: targetEvent ? targetEvent.title : undefined,
      receiptUrl: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0c2?auto=format&fit=crop&w=600&q=80',
    });
    setIsAddExpenseOpen(false);
    setExpenseAmount(0);
    setExpenseVendor('');
    setExpenseDescription('');
  };

  const handleCreateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName) return;
    addStockItem({
      name: stockName,
      category: (stockCategory as any) || 'Logistics',
      quantity: stockQuantity,
      unit: 'units',
      minThreshold: stockMinThreshold,
      unitCost: 100,
      lastRestocked: new Date().toISOString(),
      location: stockLocation,
      status: stockQuantity <= stockMinThreshold ? 'low_stock' : 'in_stock',
    });
    setIsAddStockOpen(false);
    setStockName('');
    setStockQuantity(1);
  };

  const handleAdjustStock = (item: StockItem, delta: number) => {
    const nextQty = Math.max(0, item.quantity + delta);
    updateStockItem(item.id, {
      quantity: nextQty,
      status: nextQty <= (item.minThreshold || 5) ? 'low_stock' : 'in_stock',
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Category', 'Vendor', 'Description', 'Amount', 'Date', 'Status'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      e.category,
      `"${e.vendorName || 'N/A'}"`,
      `"${e.title}"`,
      e.amount,
      e.buyingDate,
      e.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoHub_Expenses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const subTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'stock', label: 'Stock' },
    { key: 'history', label: 'History' },
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
            Chapter Treasury
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Fiscal ledger & inventory
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {activeSubTab === 'stock' ? (
            <PillButton
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsAddStockOpen(true)}
            >
              Add item
            </PillButton>
          ) : (
            <PillButton
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsAddExpenseOpen(true)}
            >
              Add expense
            </PillButton>
          )}
        </div>
      </div>

      {/* Clear notice: budget approval belongs to faculty only */}
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
        <span>Budget approval and sanction authority belongs strictly to Faculty Advisors.</span>
      </div>

      {/* Sub-tabs: Overview, Expenses, Stock, History */}
      <SegmentedTabs
        tabs={subTabs}
        activeTab={activeSubTab}
        onChange={(k) => setActiveSubTab(k as any)}
      />

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stat Tiles: Allocated, Spent, Left */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            <StatTile
              icon={<DollarSign size={18} strokeWidth={2} />}
              value={`₹${(totalBudget / 1000).toFixed(0)}k`}
              label="Allocated"
              tint="mint"
            />
            <StatTile
              icon={<Receipt size={18} strokeWidth={2} />}
              value={`₹${(totalSpent / 1000).toFixed(0)}k`}
              label="Spent"
              tint="amber"
            />
            <StatTile
              icon={<DollarSign size={18} strokeWidth={2} />}
              value={`₹${(remainingBudget / 1000).toFixed(0)}k`}
              label="Left"
              tint="white"
            />
          </div>

          {/* Recent Expenses Summary */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                Recent Vouchers
              </h3>
              <PillButton
                variant="ghost"
                size="sm"
                onClick={() => setActiveSubTab('expenses')}
              >
                See all
              </PillButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expenses.slice(0, 4).map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: '#F6FBF7',
                    border: '1px solid #DAF1DE',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#051F20' }}>
                      {exp.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                      {exp.vendorName || exp.category} • {new Date(exp.buyingDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#163832' }}>
                      ₹{exp.amount.toLocaleString()}
                    </div>
                    <StatusChip status={exp.status as any} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EXPENSES (LEDGER) */}
      {activeSubTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Category Chips: Logistics/Stage/Printing/Refreshments/Equipment/Honorarium */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#163832' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#235347',
                    border: isActive ? '1px solid #163832' : '1px solid #DAF1DE',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Bar & Export */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                style={{
                  width: '100%',
                  height: '44px',
                  boxSizing: 'border-box',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  fontSize: '13px',
                  color: '#051F20',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DAF1DE',
                  borderRadius: '16px',
                  outline: 'none',
                  boxShadow: '0 4px 14px rgba(5,31,32,0.03)',
                }}
                placeholder="Search vendor or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                size={18}
                strokeWidth={2}
                color="#8EB69B"
                style={{ position: 'absolute', left: 14, top: 13 }}
              />
            </div>

            <PillButton
              variant="secondary"
              icon={<Download size={16} />}
              onClick={handleExportCSV}
            >
              Export
            </PillButton>
          </div>

          {/* Expense Rows (category icon, vendor, voucher amount, StatusChip) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredExpenses.length === 0 ? (
              <EmptyState
                mascot="wallet"
                title="No expenses"
                description="No expenditures match filter"
                actionLabel="Add expense"
                onAction={() => setIsAddExpenseOpen(true)}
              />
            ) : (
              filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #DAF1DE',
                    padding: '16px 18px',
                    boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
                      <Receipt size={18} strokeWidth={2} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#051F20' }}>
                        {exp.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px', fontWeight: 500 }} className="truncate">
                        Vendor: {exp.vendorName || 'Campus Vendor'} • {exp.category}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#163832' }}>
                      ₹{exp.amount.toLocaleString()}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <StatusChip status={exp.status as any} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STOCK (INVENTORY) */}
      {activeSubTab === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Stock Grid with quantity, amber low-stock chip, +/- quick adjust */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
            }}
          >
            {stockItems.map((item) => {
              const isLowStock = item.quantity <= (item.minThreshold || 5);
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #DAF1DE',
                    padding: '18px',
                    boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#235347', fontWeight: 500 }}>
                        {item.location || 'Store Room'} • {item.category}
                      </span>
                    </div>

                    {isLowStock ? (
                      <StatusChip status="low-stock" label="Low stock" />
                    ) : (
                      <StatusChip status="done" label="In stock" />
                    )}
                  </div>

                  {/* Quantity and +/- Quick Adjust */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #DAF1DE',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>Quantity</span>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#051F20' }}>
                        {item.quantity}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(item, -1)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '9999px',
                          backgroundColor: '#F6FBF7',
                          border: '1px solid #DAF1DE',
                          color: '#051F20',
                          fontSize: '16px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(item, 1)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '9999px',
                          backgroundColor: '#DAF1DE',
                          border: '1px solid #8EB69B',
                          color: '#163832',
                          fontSize: '16px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: HISTORY */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {expenses
            .filter((e) => e.status === 'approved' || e.status === 'rejected')
            .map((exp) => (
              <div
                key={exp.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #DAF1DE',
                  padding: '16px 18px',
                  boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#051F20' }}>
                    {exp.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                    {exp.vendorName} • {new Date(exp.buyingDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#051F20' }}>
                    ₹{exp.amount.toLocaleString()}
                  </div>
                  <StatusChip status={exp.status as any} />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add Expense BottomSheet */}
      <BottomSheet
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Add Expense"
        subtitle="Submit payment voucher"
      >
        <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Amount (₹ INR)
            </label>
            <AmountInput
              value={expenseAmount}
              onChange={setExpenseAmount}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Category
            </label>
            <select
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
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
            >
              <option value="Logistics">Logistics</option>
              <option value="Stage">Stage</option>
              <option value="Printing">Printing</option>
              <option value="Refreshments">Refreshments</option>
              <option value="Equipment">Equipment</option>
              <option value="Honorarium">Honorarium</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Vendor / Beneficiary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. City Print Works"
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
              value={expenseVendor}
              onChange={(e) => setExpenseVendor(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Linked Event
            </label>
            <select
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
              value={expenseEventId}
              onChange={(e) => setExpenseEventId(e.target.value)}
            >
              <option value="">-- General Chapter Expense --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Receipt Voucher
            </label>
            <UploadCard
              label="Attach receipt voucher"
              onFileSelected={() => {}}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Save
          </PillButton>
        </form>
      </BottomSheet>

      {/* Add Stock BottomSheet */}
      <BottomSheet
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        title="Add Stock"
        subtitle="Track inventory equipment"
      >
        <form onSubmit={handleCreateStock} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Survey Tripods"
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
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Quantity
            </label>
            <input
              type="number"
              min={1}
              required
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
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Save
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default TreasurerView;
