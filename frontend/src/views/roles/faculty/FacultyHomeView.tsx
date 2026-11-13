import React from 'react';
import {
  AlertCircle,
  Radio,
  Coins,
  QrCode,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  SectionHeader,
  EmptyState,
} from '../../../components/shared';

export const FacultyHomeView: React.FC = () => {
  const { approvals, events, auditLogs, setActiveTab } = useApp();

  const pendingApprovals = (approvals || []).filter((a) => a.status === 'pending');
  const liveEvents = (events || []).filter((e) => e.status === 'live');
  const recentAudits = (auditLogs || []).slice(0, 3);
  const totalBudget = (events || []).reduce((sum, e) => sum + (Number(e.budget) || 0), 0);
  const budgetFormatted = totalBudget > 0
    ? (totalBudget >= 100000 ? `₹${(totalBudget / 100000).toFixed(1)}L` : `₹${totalBudget.toLocaleString()}`)
    : '₹0';

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Faculty desk" with Approvals and QR Generator buttons */}
      <HeroCard
        variant="mint"
        title="Faculty desk"
        subtitle="Institutional governance & sanction authority"
        mascot="shield"
        mascotSize="md"
        chip={<StatusChip status="live" label="Advisor Desk" />}
        action={
          <div className="flex items-center gap-2 w-full">
            <PillButton
              variant="primary"
              fullWidth
              onClick={() => setActiveTab('approvals')}
            >
              <span>Approvals</span>
              {pendingApprovals.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#FAF3E5] text-[#D4A359] border border-[#E5CE9F]/50">
                  {pendingApprovals.length}
                </span>
              )}
            </PillButton>
            <PillButton
              variant="secondary"
              fullWidth
              icon={<QrCode size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('my_qr')}
            >
              QR Generator
            </PillButton>
          </div>
        }
      />

      {/* 2) StatTiles: Total events, Live, Budget - Real computed counts */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Calendar size={20} strokeWidth={1.75} className="lucide" />}
          value={String(events.length)}
          label="Total events"
          tint="mint"
          onClick={() => setActiveTab('events')}
        />
        <StatTile
          icon={<Radio size={20} strokeWidth={1.75} className="lucide" />}
          value={String(liveEvents.length)}
          label="Live"
          tint="amber"
          onClick={() => setActiveTab('events')}
        />
        <StatTile
          icon={<Coins size={20} strokeWidth={1.75} className="lucide" />}
          value={budgetFormatted}
          label="Budget"
          footnote="Corpus"
          tint="sage"
          onClick={() => setActiveTab('ledger')}
        />
      </div>

      {/* 3) Audit Feed list - Only rendered when genuine audit logs exist */}
      {recentAudits.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <SectionHeader
            title="Audit Feed"
            actionLabel="View all"
            onAction={() => setActiveTab('audit_logs')}
          />

          <div className="flex flex-col gap-2">
            {recentAudits.map((audit) => (
              <div
                key={audit.id}
                onClick={() => setActiveTab('audit_logs')}
                className="flex items-center justify-between p-3.5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] hover:border-[#8EB69B] transition-all cursor-pointer pressable"
                style={{ borderRadius: '24px', minHeight: '60px' }}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm font-bold text-[#051F20] truncate">
                    {audit.action || 'Sanction logged'}
                  </span>
                  {(audit.targetName || audit.targetType) && (
                    <span className="text-xs font-medium text-[#235347] truncate">
                      {audit.targetName || audit.targetType}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-[#235347]">
                    {audit.timestamp ? new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                  </span>
                  <StatusChip status="approved" label="Audited" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyHomeView;
