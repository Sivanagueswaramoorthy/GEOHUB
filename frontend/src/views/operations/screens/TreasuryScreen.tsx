import React, { useState } from 'react';
import {
  Coins,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  FileText,
} from 'lucide-react';
import { AnimatedNumber, ConfirmDialog, PillButton, SearchField, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface BudgetRequest {
  id: string;
  title: string;
  event: string;
  amount: number;
  category: string;
  requesterId: string;
  requesterName: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  date: string;
  note?: string;
}

export interface TreasuryScreenProps {
  readOnly: boolean;
  canApprove: boolean;
  budgetRequests: BudgetRequest[];
  setBudgetRequests: React.Dispatch<React.SetStateAction<BudgetRequest[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const TreasuryScreen: React.FC<TreasuryScreenProps> = ({
  readOnly,
  canApprove,
  budgetRequests,
  setBudgetRequests,
  onLogAudit,
  currentUser,
}) => {
  const { events } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Flagged' | 'Rejected'>('All');
  const [selectedReq, setSelectedReq] = useState<BudgetRequest | null>(null);
  const [actionType, setActionType] = useState<'Approve' | 'Reject' | 'Flag' | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const isPresident = canApprove;
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'super_admin';

  // Metrics
  const totalCorpus = (events || []).reduce((sum, ev) => sum + (ev.budget || 0), 0);
  const totalAllocated = budgetRequests
    .filter((b) => b.status === 'Approved')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalPending = budgetRequests.filter((b) => b.status === 'Pending').length;
  const totalApproved = budgetRequests.filter((b) => b.status === 'Approved').length;

  const handleConfirmDecision = (reason?: string) => {
    if (!selectedReq || !actionType) return;

    const newStatus = actionType === 'Approve' ? 'Approved' : actionType === 'Reject' ? 'Rejected' : 'Flagged';
    const note = reason || decisionNote;

    setBudgetRequests((prev) =>
      prev.map((r) =>
        r.id === selectedReq.id ? { ...r, status: newStatus, note } : r
      )
    );

    onLogAudit(
      selectedReq.event,
      `${actionType} budget request "${selectedReq.title}" of ₹${selectedReq.amount.toLocaleString()} (${note || 'No note'})`
    );

    setSelectedReq(null);
    setActionType(null);
    setDecisionNote('');
  };

  const filteredRequests = budgetRequests.filter((req) => {
    if (statusFilter !== 'All' && req.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      req.title.toLowerCase().includes(q) ||
      req.event.toLowerCase().includes(q) ||
      req.category.toLowerCase().includes(q) ||
      req.requesterName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Top Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Budget</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Coins size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            ₹<AnimatedNumber value={totalCorpus} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Sanctioned</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            ₹<AnimatedNumber value={totalAllocated} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Available</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Shield size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            ₹<AnimatedNumber value={Math.max(0, totalCorpus - totalAllocated)} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[rgba(242,184,75,0.12)] border border-[rgba(242,184,75,0.35)] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#051F20] uppercase tracking-wide">Pending</span>
            <div className="w-6 h-6 rounded-lg bg-white/60 flex items-center justify-center text-[#051F20]">
              <Clock size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={totalPending} /> Reviews
          </div>
        </div>
      </div>

      {/* 2. Main Card Container */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Budget Requests Queue
          </h2>

          <div className="w-full sm:w-64">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search requests..."
              style={{ height: '36px' }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {(['All', 'Pending', 'Approved', 'Flagged', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`h-8 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#163832] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Request Cards List */}
        <div className="space-y-3 pt-1">
          {filteredRequests.length === 0 ? (
            <EmptyState
              mascot="coin"
              title="Budget Queue Clear"
              description="No expenditure sanction requests in the current filter."
            />
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#051F20] text-sm truncate">
                      {req.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        req.status === 'Approved'
                          ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                          : req.status === 'Rejected'
                          ? 'bg-[#D9534F]/10 text-[#D9534F] border border-[#D9534F]/30'
                          : req.status === 'Flagged'
                          ? 'bg-[rgba(242,184,75,0.2)] text-[#051F20] border border-[rgba(242,184,75,0.4)]'
                          : 'bg-[#F2B84B] text-[#051F20]'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-[#DAF1DE] text-[#235347]">
                      {req.category}
                    </span>
                  </div>

                  <p className="text-xs text-[#235347] mt-1 truncate">
                    Event: <strong className="text-[#051F20]">{req.event}</strong> | Requested by: {req.requesterName}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-extrabold text-[#051F20]">
                      ₹{req.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#235347]/70">
                      Submitted on {req.date}
                    </span>
                  </div>

                  {req.note && (
                    <p className="text-xs text-[#235347] italic mt-1 bg-white/70 p-1.5 rounded-lg border border-[#DAF1DE]">
                      Note: &ldquo;{req.note}&rdquo;
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isPresident && req.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReq(req);
                          setActionType('Approve');
                        }}
                        className="h-9 px-3.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all shadow-xs cursor-pointer touch-target-44"
                        data-testid={`btn-approve-budget-${req.id}`}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReq(req);
                          setActionType('Reject');
                        }}
                        className="h-9 px-3.5 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] text-xs font-bold hover:bg-[#D9534F]/10 active:scale-95 transition-all cursor-pointer touch-target-44"
                        data-testid={`btn-reject-budget-${req.id}`}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {isFaculty && req.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('Flag');
                      }}
                      className="h-9 px-3.5 rounded-xl bg-[#DAF1DE] text-[#051F20] text-xs font-bold hover:bg-[#8EB69B]/30 border border-[#8EB69B] active:scale-95 transition-all cursor-pointer touch-target-44"
                      data-testid={`btn-flag-budget-${req.id}`}
                    >
                      Flag for Review
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedReq && actionType)}
        onClose={() => {
          setSelectedReq(null);
          setActionType(null);
          setDecisionNote('');
        }}
        onConfirm={handleConfirmDecision}
        title={`${actionType} Budget Request`}
        message={`Are you sure you want to ${actionType?.toLowerCase()} the request for "${selectedReq?.title}" (₹${selectedReq?.amount.toLocaleString()})?`}
        reasonPlaceholder="Add optional justification or institutional note..."
      />
    </div>
  );
};

export default TreasuryScreen;

