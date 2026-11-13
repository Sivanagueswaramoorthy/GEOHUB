import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  UserCheck,
  Calendar,
  FileText,
  Filter,
  Users,
} from 'lucide-react';
import { AnimatedNumber, ConfirmDialog, EmptyState } from '../../../components/shared';

export interface MilestoneItem {
  id: string;
  squad: string;
  lead: string;
  title: string;
  description: string;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Flagged';
}

export interface LeadActivityReviewScreenProps {
  readOnly: boolean;
  canApprove: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const LeadActivityReviewScreen: React.FC<LeadActivityReviewScreenProps> = ({
  readOnly,
  canApprove,
  onLogAudit,
  currentUser,
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  const pendingCount = milestones.filter((m) => m.status === 'Pending').length;

  const handleSignOff = (id: string, title: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Approved' } : m))
    );
    onLogAudit('Lead Activity Review', `Signed off milestone "${title}"`);
    setNotice(`Signed off "${title}".`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleFlag = (id: string, title: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Flagged' } : m))
    );
    onLogAudit('Lead Activity Review', `Flagged milestone "${title}" for clarification`);
    setNotice(`Flagged "${title}" for clarification.`);
    setTimeout(() => setNotice(null), 3500);
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
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Signed Off</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            <AnimatedNumber value={milestones.filter((m) => m.status === 'Approved').length} /> Completed
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Role</span>
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
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Reporting</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Users size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-sm sm:text-base mt-1">
            4 Squads
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Milestones Feed Card */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Squad Lead Activity Review
          </h2>
          <span className="text-xs font-semibold text-[#235347]">
            Milestones Feed
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {milestones.length > 0 ? (
            milestones.map((m) => (
              <div
                key={m.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#051F20] text-xs sm:text-sm">
                      {m.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        m.status === 'Approved'
                          ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                          : m.status === 'Flagged'
                          ? 'bg-[#D9534F]/10 text-[#D9534F] border border-[#D9534F]/30'
                          : 'bg-[#F2B84B] text-[#051F20]'
                      }`}
                    >
                      {m.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-[#DAF1DE] text-[#235347]">
                      {m.squad} Squad
                    </span>
                  </div>

                  <p className="text-xs text-[#235347] mt-1 line-clamp-2">
                    {m.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#235347]/80">
                    <span>Officer: <strong>{m.lead}</strong></span>
                    <span>•</span>
                    <span>Submitted: {m.submittedDate}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {canApprove && m.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSignOff(m.id, m.title)}
                        className="h-9 px-4 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all shadow-xs cursor-pointer touch-target-44"
                        data-testid={`btn-signoff-${m.id}`}
                      >
                        Sign Off
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFlag(m.id, m.title)}
                        className="h-9 px-3.5 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] text-xs font-bold hover:bg-[#D9534F]/10 active:scale-95 transition-all cursor-pointer touch-target-44"
                      >
                        Clarify
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              mascot="tree"
              title="No Milestones Logged"
              description="Operational milestones will track here as squad tasks complete."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadActivityReviewScreen;

