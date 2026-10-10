import React, { useState } from 'react';
import {
  Receipt,
  FileText,
  PackagePlus,
  BarChart3,
  DollarSign,
  Layers,
  Archive,
  Scan,
  QrCode,
  MessageSquare,
  Bell,
  Download,
  Lock,
  X,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ShortcutTile } from '../../../components/ShortcutTile';
import { CategoryCard } from '../../../components/CategoryCard';
import { ModuleTile } from '../../../components/ModuleTile';
import { BottomSheet } from '../../../components/BottomSheet';
import { Toast } from '../../../components/Toast';

export const TreasurerOperationsView: React.FC = () => {
  const {
    setActiveTab,
    expenses,
    stockItems,
    requestBudgetChange,
  } = useApp();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Treasurer Operations Modals & State
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isAuditReportExportOpen, setIsAuditReportExportOpen] = useState(false);
  const [isReceiptsVaultOpen, setIsReceiptsVaultOpen] = useState(false);
  const [isOpsStockModalOpen, setIsOpsStockModalOpen] = useState(false);
  const [isOpsPurchaseHistoryOpen, setIsOpsPurchaseHistoryOpen] = useState(false);
  const [activeReceiptPreview, setActiveReceiptPreview] = useState<string | null>(null);

  // Allocation Request Sub-form State
  const [allocRequestTeam, setAllocRequestTeam] = useState('Promotion');
  const [allocRequestAmount, setAllocRequestAmount] = useState('50000');
  const [allocRequestReason, setAllocRequestReason] = useState('');
  const [isAllocRequestFormOpen, setIsAllocRequestFormOpen] = useState(false);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleAllocRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocRequestReason.trim()) return;

    requestBudgetChange(allocRequestTeam, Number(allocRequestAmount) || 0, allocRequestReason);
    showToast(`✓ Budget petition for ${allocRequestTeam} (${formatINR(Number(allocRequestAmount))}) sent to Faculty!`);
    setIsAllocRequestFormOpen(false);
    setAllocRequestReason('');
  };

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />
      )}

      {/* Screen Title & Role Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Treasurer Lead
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Fiscal Operations Suite</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Club Operations Hub</h1>
      </div>

      {/* Shortcuts (row of 4): Add Expense, Receipts, Stock, Audit Report */}
      <div className="flex items-center justify-between gap-2.5 overflow-x-auto no-scrollbar py-1">
        <ShortcutTile
          label="Add Expense"
          icon={<Receipt size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          iconColor="#065F46"
          onClick={() => setActiveTab('treasurer')}
        />

        <ShortcutTile
          label="Receipts"
          icon={<FileText size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          iconColor="#5B21B6"
          badge={expenses.length}
          onClick={() => setIsReceiptsVaultOpen(true)}
        />

        <ShortcutTile
          label="Stock"
          icon={<PackagePlus size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          iconColor="#92400E"
          badge={stockItems.filter((s) => s.quantity <= s.minThreshold).length || undefined}
          onClick={() => setIsOpsStockModalOpen(true)}
        />

        <ShortcutTile
          label="Audit Report"
          icon={<BarChart3 size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          iconColor="#1D4ED8"
          onClick={() => setIsAuditReportExportOpen(true)}
        />
      </div>

      {/* Category 1: Finance (3 modules) */}
      <CategoryCard title="Finance" countBadge={3}>
        <ModuleTile
          title="Expenses & Claims"
          icon={<DollarSign size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          accentColor="#059669"
          onClick={() => setActiveTab('treasurer')}
        />

        <ModuleTile
          title="Budget Overview"
          icon={<BarChart3 size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => setActiveTab('treasurer')}
        />

        <ModuleTile
          title="Allocation Requests"
          icon={<Layers size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          accentColor="#5B21B6"
          onClick={() => setIsAllocationModalOpen(true)}
        />
      </CategoryCard>

      {/* Category 2: Stock & Purchases (2 modules) */}
      <CategoryCard title="Stock & Purchases" countBadge={2}>
        <ModuleTile
          title="Stock Inventory"
          icon={<PackagePlus size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          accentColor="#B45309"
          onClick={() => setIsOpsStockModalOpen(true)}
        />

        <ModuleTile
          title="Purchase Ledger"
          icon={<Archive size={20} />}
          iconBg="#F8FAFC"
          iconBorder="#E2E8F0"
          accentColor="#475569"
          onClick={() => setIsOpsPurchaseHistoryOpen(true)}
        />
      </CategoryCard>

      {/* Category 3: Attendance & Gates (2 modules) */}
      <CategoryCard title="Attendance & Gates" countBadge={2}>
        <ModuleTile
          title="Gate Scanner"
          icon={<Scan size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => setActiveTab('scan_qr')}
        />

        <ModuleTile
          title="Advisor Pass"
          icon={<QrCode size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          accentColor="#7C3AED"
          onClick={() => setActiveTab('my_qr')}
        />
      </CategoryCard>

      {/* Category 4: Communication (2 modules) */}
      <CategoryCard title="Communication" countBadge={2}>
        <ModuleTile
          title="Discussions"
          icon={<MessageSquare size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#1D4ED8"
          onClick={() => setActiveTab('forum')}
        />

        <ModuleTile
          title="Bulletins"
          icon={<Bell size={20} />}
          iconBg="#FEF2F2"
          iconBorder="#FECACA"
          accentColor="#DC2626"
          onClick={() => setActiveTab('notifications')}
        />
      </CategoryCard>

      {/* Category 5: Reports (1 module) */}
      <CategoryCard title="Reports" countBadge={1}>
        <ModuleTile
          title="Official Dossier"
          icon={<Download size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          accentColor="#059669"
          onClick={() => setIsAuditReportExportOpen(true)}
        />
      </CategoryCard>

      {/* =========================================================================
          MODALS & BOTTOMSHEETS FOR TREASURER LEAD
          ========================================================================= */}

      {/* Squad Budget Allocations Modal */}
      <BottomSheet
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        title="Squad Budget Allocations"
        subtitle="Fiscal parameters governed by Faculty Advisor Dr. Sarah Jenkins"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <span className="font-extrabold text-amber-800 shrink-0 inline-flex items-center gap-1">
              <Lock size={12} strokeWidth={1.75} />
              Read-Only:
            </span>
            <span>
              Chapter allocations are set exclusively by Faculty Advisor Dr. Sarah Jenkins. The Treasurer Lead cannot edit allocations directly, but may petition for rebalances below.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">Active Squad Allocations (FY 2026-2027)</span>
            {[
              { team: 'Logistics Squad', allocated: 145000, lead: 'Elena Rostova', spent: 82500 },
              { team: 'Stage & Entertainment', allocated: 60000, lead: 'Marcus Vance', spent: 58500 },
              { team: 'Hospitality & Catering', allocated: 60000, lead: 'Ananya Sen', spent: 47800 },
              { team: 'Promotion Squad', allocated: 45000, lead: 'David Chen', spent: 38200 },
              { team: 'General Reserve Corpus', allocated: 140000, lead: 'Faculty Trustee', spent: 0 },
            ].map((item) => (
              <div
                key={item.team}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">{item.team}</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      Set by Faculty
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Custodian: {item.lead} • Spent: {formatINR(item.spent)}
                  </div>
                </div>

                <span className="font-mono font-extrabold text-xs text-slate-900">
                  {formatINR(item.allocated)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAllocationModalOpen(false);
                setIsAllocRequestFormOpen(true);
              }}
              className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-xs hover:bg-purple-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>+ Request Budget Change from Faculty</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Petition Budget Rebalance Modal */}
      <BottomSheet
        isOpen={isAllocRequestFormOpen}
        onClose={() => setIsAllocRequestFormOpen(false)}
        title="Petition Budget Rebalance"
        subtitle="Submit request with justification reason to Dr. Sarah Jenkins"
      >
        <form onSubmit={handleAllocRequestSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Squad</label>
            <select
              value={allocRequestTeam}
              onChange={(e) => setAllocRequestTeam(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
            >
              <option value="Promotion">Promotion Squad</option>
              <option value="Logistics">Logistics Squad</option>
              <option value="Hospitality">Hospitality & Catering</option>
              <option value="Entertainment">Stage & Entertainment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Corpus (INR)</label>
            <input
              type="number"
              required
              value={allocRequestAmount}
              onChange={(e) => setAllocRequestAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Justification</label>
            <textarea
              rows={3}
              required
              value={allocRequestReason}
              onChange={(e) => setAllocRequestReason(e.target.value)}
              placeholder="Explain reasons for allocation delta (e.g. higher venue security fees, speaker travel)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-xs hover:bg-purple-700 transition-all mt-1 cursor-pointer"
          >
            Submit Request to Faculty Advisor
          </button>
        </form>
      </BottomSheet>

      {/* Chapter Stock & Inventory Modal */}
      <BottomSheet
        isOpen={isOpsStockModalOpen}
        onClose={() => setIsOpsStockModalOpen(false)}
        title="Chapter Stock & Inventory"
        subtitle={`${stockItems.length} physical assets and consumables monitored`}
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Inventory Catalog</span>
            <button
              type="button"
              onClick={() => {
                setIsOpsStockModalOpen(false);
                setActiveTab('treasurer');
              }}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Open in Finance →
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {stockItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{item.name}</span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.2 rounded-md ${
                        item.quantity <= item.minThreshold
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.quantity <= item.minThreshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.location} • Cost: {formatINR(item.unitCost)}/{item.unit}
                  </div>
                </div>

                <span className="font-mono font-extrabold text-xs text-slate-900 shrink-0">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Procurement & Purchase History Modal */}
      <BottomSheet
        isOpen={isOpsPurchaseHistoryOpen}
        onClose={() => setIsOpsPurchaseHistoryOpen(false)}
        title="Procurement & Purchase History"
        subtitle="Chronological trail of verified vouchers and payments"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Total Expenditure Logged:</span>
            <span className="font-extrabold text-emerald-950 font-mono text-sm">{formatINR(227000)}</span>
          </div>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{exp.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {exp.vendorName} • {exp.category} • {exp.buyingDate}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-mono font-extrabold text-xs text-slate-900">
                    {formatINR(exp.amount)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                    Verified ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Receipts Vault Modal */}
      <BottomSheet
        isOpen={isReceiptsVaultOpen}
        onClose={() => setIsReceiptsVaultOpen(false)}
        title="Receipts & Invoices Vault"
        subtitle="Official bills, tax receipts, and payment proofs"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setActiveReceiptPreview(exp.receiptUrl || null)}
                className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer flex flex-col gap-1.5"
              >
                <div className="relative h-24 w-full bg-slate-100 rounded-xl overflow-hidden">
                  <img src={exp.receiptUrl} alt={exp.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 text-white">
                    {formatINR(exp.amount)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-slate-900 truncate">{exp.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{exp.vendorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Receipt Lightbox */}
      {activeReceiptPreview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveReceiptPreview(null)}
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
                onClick={() => setActiveReceiptPreview(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-80 flex items-center justify-center">
              <img src={activeReceiptPreview} alt="Receipt" className="w-full h-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => {
                showToast('✓ Downloaded voucher receipt');
                setActiveReceiptPreview(null);
              }}
              className="w-full py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Download PDF Copy
            </button>
          </div>
        </div>
      )}

      {/* Fiscal Audit Dossier Export Modal */}
      <BottomSheet
        isOpen={isAuditReportExportOpen}
        onClose={() => setIsAuditReportExportOpen(false)}
        title="Fiscal Audit Dossier Export"
        subtitle="Official financial statement and ledger download"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Fiscal Cycle:</span>
              <span className="font-extrabold text-emerald-900">Academic Year 2026-2027</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-200/60 text-center">
              <div>
                <span className="text-[11px] text-emerald-700 font-bold block">Allocated</span>
                <span className="font-mono font-extrabold text-xs text-emerald-950">{formatINR(450000)}</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-700 font-bold block">Spent</span>
                <span className="font-mono font-extrabold text-xs text-amber-950">{formatINR(227000)}</span>
              </div>
              <div>
                <span className="text-[11px] text-teal-700 font-bold block">Balance</span>
                <span className="font-mono font-extrabold text-xs text-teal-950">{formatINR(223000)}</span>
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-700 mt-1">Select Export Format</span>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>GeoHub Official Fiscal Audit Statement 2026-2027</title>
                        <style>
                          body { font-family: sans-serif; padding: 40px; color: #0F172A; }
                          h1 { color: #065F46; font-size: 20px; border-bottom: 2px solid #065F46; padding-bottom: 8px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                          th, td { border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
                          th { background-color: #F8FAFC; color: #1E293B; font-weight: bold; }
                          .totals { font-weight: bold; background-color: #F1F5F9; }
                        </style>
                      </head>
                      <body>
                        <h1>GREEN ECO ORGANIZATION (GEO HUB) - FISCAL AUDIT STATEMENT</h1>
                        <p><strong>Lead Treasurer:</strong> Ananya Iyer | <strong>Advising Faculty:</strong> Dr. Sarah Jenkins</p>
                        <p><strong>Total Corpus Allocated:</strong> ₹4,50,000 | <strong>Total Spent:</strong> ₹2,27,000 | <strong>Balance:</strong> ₹2,23,000</p>
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Item Description</th>
                              <th>Category</th>
                              <th>Vendor</th>
                              <th>Amount (INR)</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${expenses
                              .map(
                                (e) => `
                              <tr>
                                <td>${e.buyingDate}</td>
                                <td>${e.title}</td>
                                <td>${e.category}</td>
                                <td>${e.vendorName}</td>
                                <td>₹${e.amount.toLocaleString('en-IN')}</td>
                              </tr>
                            `
                              )
                              .join('')}
                            <tr class="totals">
                              <td colspan="4">TOTAL EXPENDITURE</td>
                              <td>₹2,27,000</td>
                            </tr>
                          </tbody>
                        </table>
                        <br/><br/>
                        <p>Verified and Certified by: ________________________ (Ananya Iyer, Treasurer Lead)</p>
                        <script>window.onload = function() { window.print(); }</script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  showToast('✓ Prepared printable PDF fiscal statement');
                }
              }}
              className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 hover:bg-emerald-100/50 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                  PDF
                </div>
                <div className="text-left">
                  <span className="block font-extrabold text-xs text-slate-900">Official Audit PDF Report</span>
                  <span className="text-[11px] text-slate-500">Includes institutional seal, line items and signatories</span>
                </div>
              </div>
              <Download size={20} strokeWidth={1.75} className="text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={() => {
                const docContent = `
                  GREEN ECO ORGANIZATION (GEO HUB)
                  ANNUAL FISCAL STATEMENT 2026-2027

                  Lead Treasurer: Ananya Iyer
                  Faculty Advisor: Dr. Sarah Jenkins

                  SUMMARY:
                  Total Budget: ₹4,50,000
                  Total Spent: ₹2,27,000
                  Remaining Corpus: ₹2,23,000

                  LINE ITEMS:
                  ${expenses.map((e) => `• [${e.buyingDate}] ${e.title} (${e.category}) - ₹${e.amount} | Vendor: ${e.vendorName}`).join('\n')}
                `;
                const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GeoHub_Fiscal_Audit_Dossier_${new Date().toISOString().split('T')[0]}.doc`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('✓ Downloaded Word (.doc) Fiscal Dossier');
              }}
              className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 hover:bg-blue-100/50 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                  DOC
                </div>
                <div className="text-left">
                  <span className="block font-extrabold text-xs text-slate-900">Word Document Dossier (.doc)</span>
                  <span className="text-[11px] text-slate-500">Editable executive text report with table summaries</span>
                </div>
              </div>
              <Download size={20} strokeWidth={1.75} className="text-blue-700" />
            </button>

            <button
              type="button"
              onClick={() => {
                const csvHeader = 'Voucher ID,Date,Item Title,Category,Vendor,Amount (INR),Paid By,Status\n';
                const csvRows = expenses
                  .map(
                    (e) =>
                      `"${e.id}","${e.buyingDate}","${e.title.replace(/"/g, '""')}","${e.category}","${e.vendorName.replace(/"/g, '""')}",${e.amount},"${e.paidBy}","${e.status}"`
                  )
                  .join('\n');
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GeoHub_Fiscal_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('✓ Downloaded Excel / CSV Ledger');
              }}
              className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 hover:bg-emerald-100/50 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xs">
                  XLS
                </div>
                <div className="text-left">
                  <span className="block font-extrabold text-xs text-slate-900">Excel / CSV Spreadsheet</span>
                  <span className="text-[11px] text-slate-500">Structured ledger data with numerical values for auditing</span>
                </div>
              </div>
              <Download size={20} strokeWidth={1.75} className="text-teal-700" />
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
