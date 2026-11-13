import React, { useState } from 'react';
import {
  Download,
  FileText,
  CheckCircle2,
  Shield,
  Calendar,
  Lock,
  FileSpreadsheet,
  Coins,
  Check,
  Building,
} from 'lucide-react';
import { AnimatedNumber } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface FinancialAuditExportScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const FinancialAuditExportScreen: React.FC<FinancialAuditExportScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const { events, expenses } = useApp();
  const [selectedEvent, setSelectedEvent] = useState('All Events (Overall)');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const eventOptions = [
    'All Events (Comprehensive)',
    ...(events || []).map((e) => e.title),
  ];

  const totalSanctioned = (events || []).reduce((sum, e) => sum + (e.budget || 0), 0);
  const totalDisbursed = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const surplus = Math.max(0, totalSanctioned - totalDisbursed);

  const handleExport = (format: 'PDF' | 'CSV' | 'JSON') => {
    onLogAudit(selectedEvent, `Generated formal ${format} audit statement for "${selectedEvent}"`);
    setExportNotice(`Generated ${format} audit package: GeoHub_Audit_${selectedEvent.replace(/\s+/g, '_')}.${format.toLowerCase()}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Audit Summary Banner */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">
            Audit Status
          </span>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-0.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#163832]" />
            <span>Audited & Cleared</span>
          </div>
          <span className="text-xs text-[#235347] mt-0.5 block truncate">
            Cycle: AY 2025-2026 • Verified by {currentUser?.name || 'Treasurer'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
            Zero Variances
          </span>
        </div>
      </div>

      {/* 2. Main Audit Console */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Financial Audit Statements
          </h2>

          <div>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full sm:w-64 p-2 rounded-xl border border-[#DAF1DE] text-xs font-semibold text-[#051F20] bg-[#F6FBF7] focus:outline-none focus:border-[#163832] cursor-pointer"
            >
              {eventOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Balance Reconciliation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="text-xs text-[#235347] font-bold uppercase tracking-wide">Sanctioned</span>
            <div className="font-extrabold text-[#051F20] text-base mt-1">
              ₹<AnimatedNumber value={totalSanctioned} />
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="text-xs text-[#235347] font-bold uppercase tracking-wide">Disbursed</span>
            <div className="font-extrabold text-[#051F20] text-base mt-1">
              ₹<AnimatedNumber value={totalDisbursed} />
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="text-xs text-[#235347] font-bold uppercase tracking-wide">Surplus</span>
            <div className="font-extrabold text-[#163832] text-base mt-1">
              ₹<AnimatedNumber value={surplus} />
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B]">
            <span className="text-xs text-[#163832] font-bold uppercase tracking-wide">Audit Delta</span>
            <div className="font-extrabold text-[#163832] text-base mt-1">
              ₹0.00
            </div>
          </div>
        </div>

        {/* Audit Verification Checkpoints */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] space-y-2">
          <span className="text-xs font-bold text-[#051F20] uppercase tracking-wide block">
            Verification Checkpoints
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#235347]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#163832]" />
              <span>Internal College Auditor Sign-off</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#163832]" />
              <span>GST & Merchant Tax Invoices Validated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#163832]" />
              <span>Digital Ledger Cryptographic Hash Locked</span>
            </div>
          </div>
        </div>

        {/* Export Action Buttons */}
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleExport('PDF')}
              className="h-10 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer touch-target-44"
              data-testid="btn-export-pdf"
            >
              <Download size={15} />
              <span>Export Certified Statement (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport('CSV')}
              className="h-10 px-4 rounded-xl bg-white border border-[#163832] text-[#163832] text-xs font-bold hover:bg-[#DAF1DE] active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer touch-target-44"
              data-testid="btn-export-csv"
            >
              <FileSpreadsheet size={15} />
              <span>Raw Ledger (CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport('JSON')}
              className="h-10 px-4 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-[#235347] text-xs font-bold hover:bg-[#DAF1DE] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer touch-target-44"
            >
              <Lock size={15} />
              <span>Cryptographic Proof (JSON)</span>
            </button>
          </div>
        )}

        {exportNotice && (
          <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#163832]" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAuditExportScreen;

