import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  Check,
  X,
  Shield,
  Coins,
  Calendar,
  Users,
  QrCode,
  Layers,
} from 'lucide-react';
import { AnimatedNumber, ConfirmDialog, PillButton, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface ApprovalQueueItem {
  id: string;
  type: 'event' | 'budget' | 'join_request' | 'attendance';
  title: string;
  requesterName: string;
  requesterRole: string;
  submittedAt: string;
  amount?: number;
  event?: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ApprovalsScreenProps {
  readOnly: boolean;
  canApprove: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const ApprovalsScreen: React.FC<ApprovalsScreenProps> = ({
  readOnly,
  canApprove,
  onLogAudit,
  currentUser,
}) => {
  const { approvals } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'event' | 'budget' | 'join_request' | 'attendance'>('all');
  const [selectedItem, setSelectedItem] = useState<ApprovalQueueItem | null>(null);
  const [actionType, setActionType] = useState<'Approve' | 'Reject' | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [items, setItems] = useState<ApprovalQueueItem[]>(() => {
    return (approvals || []).map((a: any) => ({
      id: a.id,
      type: (a.type || 'event') as any,
      title: a.title,
      requesterName: a.submittedBy || 'Chapter Member',
      requesterRole: a.requestedTeam || 'Member',
      submittedAt: a.submittedAt || new Date().toISOString(),
      amount: a.amount,
      event: a.event,
      details: a.details || a.description || 'Institutional request pending approval.',
      status: a.status || 'pending',
    }));
  });

  const filteredItems = items.filter((item) => {
    if (activeTab !== 'all' && item.type !== activeTab) return false;
    return true;
  });

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  const handleDecision = (reason?: string) => {
    if (!selectedItem || !actionType) return;

    const newStatus = actionType === 'Approve' ? 'approved' : 'rejected';
    setItems((prev) =>
      prev.map((i) => (i.id === selectedItem.id ? { ...i, status: newStatus } : i))
    );

    onLogAudit(
      selectedItem.event || 'Approval Queue',
      `${actionType} request "${selectedItem.title}" (${reason || feedbackNote || 'No notes'})`
    );

    setToastMsg(`${actionType}d request: "${selectedItem.title}"`);
    setSelectedItem(null);
    setActionType(null);
    setFeedbackNote('');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getIconForType = (type: ApprovalQueueItem['type']) => {
    switch (type) {
      case 'event':
        return Calendar;
      case 'budget':
        return Coins;
      case 'join_request':
        return Users;
      case 'attendance':
        return QrCode;
      default:
        return Shield;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-[rgba(242,184,75,0.14)] border border-[rgba(242,184,75,0.35)] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#051F20] uppercase tracking-wide">Pending</span>
            <div className="w-6 h-6 rounded-lg bg-white/60 flex items-center justify-center text-[#051F20]">
              <Clock size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={pendingCount} /> Reviews
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Approved</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            <AnimatedNumber value={items.filter((i) => i.status === 'approved').length} /> Completed
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Authority</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Shield size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-xs sm:text-sm mt-1 truncate">
            {canApprove ? 'Signer' : 'Observer'}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Queues</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Layers size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-sm sm:text-base mt-1">
            4 Queues
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2. Main Approvals List Card */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Consolidated Approvals Queue
          </h2>

          {/* Filter Pills */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(
              [
                { key: 'all', label: `All (${items.length})` },
                { key: 'event', label: `Events (${items.filter((i) => i.type === 'event').length})` },
                { key: 'budget', label: `Budget (${items.filter((i) => i.type === 'budget').length})` },
                { key: 'join_request', label: `Squads (${items.filter((i) => i.type === 'join_request').length})` },
                { key: 'attendance', label: `Attendance (${items.filter((i) => i.type === 'attendance').length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items Feed */}
        <div className="space-y-3 pt-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = getIconForType(item.type);

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon size={18} strokeWidth={2.2} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#051F20] text-xs sm:text-sm">
                          {item.title}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.status === 'approved'
                              ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                              : item.status === 'rejected'
                              ? 'bg-[#D9534F]/10 text-[#D9534F] border border-[#D9534F]/30'
                              : 'bg-[#F2B84B] text-[#051F20]'
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                        {item.amount && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-white border border-[#DAF1DE] text-[#051F20]">
                            ₹{item.amount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#235347] mt-1 line-clamp-2">
                        {item.details}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#235347]/80">
                        <span>Requester: <strong>{item.requesterName}</strong> ({item.requesterRole})</span>
                        <span>•</span>
                        <span>Submitted: {item.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {canApprove && item.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType('Approve');
                          }}
                          className="h-9 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all shadow-xs cursor-pointer touch-target-44"
                          data-testid={`btn-approve-${item.id}`}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType('Reject');
                          }}
                          className="h-9 px-4 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] text-xs font-bold hover:bg-[#D9534F]/10 active:scale-95 transition-all cursor-pointer touch-target-44"
                          data-testid={`btn-reject-${item.id}`}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              mascot="shield"
              title="Approval Queue Clear"
              description="No pending sanction or accession requests awaiting review."
            />
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedItem && actionType)}
        onClose={() => {
          setSelectedItem(null);
          setActionType(null);
          setFeedbackNote('');
        }}
        onConfirm={handleDecision}
        title={`${actionType} Sanction Request`}
        message={`Are you sure you want to ${actionType?.toLowerCase()} "${selectedItem?.title}"?`}
        reasonPlaceholder="Optional administrative note or reason..."
      />
    </div>
  );
};

export default ApprovalsScreen;

