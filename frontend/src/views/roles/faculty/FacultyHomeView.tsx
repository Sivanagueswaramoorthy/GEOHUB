import React from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Radio,
  Coins,
  History,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  ListRow,
  SectionHeader,
  Avatar,
} from '../../../components/shared';

export const FacultyHomeView: React.FC = () => {
  const { approvals, events, auditLogs, setActiveTab } = useApp();

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const liveEvents = events.filter((e) => e.status === 'live');
  const recentAudits = (auditLogs || []).slice(0, 3);

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Overview", subtitle "Institutional governance", small shield mascot; CTA "Approvals" with live pending-count badge */}
      <HeroCard
        variant="mint"
        title="Overview"
        subtitle="Institutional governance"
        mascot="shield"
        mascotSize="md"
        chip={<StatusChip status="live" label="Faculty Desk" />}
        action={
          <PillButton
            variant="primary"
            fullWidth
            onClick={() => setActiveTab('approvals')}
          >
            <span>Approvals</span>
            {pendingApprovals.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#DAF1DE] text-[#051F20]">
                {pendingApprovals.length}
              </span>
            )}
          </PillButton>
        }
      />

      {/* 2) StatTiles: Pending, Live, Budget */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<AlertCircle size={18} strokeWidth={2} />}
          value={String(pendingApprovals.length || 4)}
          label="Pending"
          tint="amber"
          onClick={() => setActiveTab('approvals')}
        />
        <StatTile
          icon={<Radio size={18} strokeWidth={2} />}
          value={String(liveEvents.length || 2)}
          label="Live"
          tint="mint"
          onClick={() => setActiveTab('events')}
        />
        <StatTile
          icon={<Coins size={18} strokeWidth={2} />}
          value="₹4.5L"
          label="Budget"
          tint="sage"
          onClick={() => setActiveTab('operations')}
        />
      </div>

      {/* 3) Last 3 audit actions feed */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Audit Feed"
          actionLabel="Ledger"
          onAction={() => setActiveTab('audit_logs')}
        />

        <div className="flex flex-col gap-2">
          {recentAudits.length > 0 ? (
            recentAudits.map((audit) => (
              <div
                key={audit.id}
                onClick={() => setActiveTab('audit_logs')}
                className="flex items-center justify-between p-3.5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] hover:border-[#8EB69B] transition-all cursor-pointer pressable"
                style={{ borderRadius: '24px', minHeight: '60px' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={audit.actorName || 'Dr. Jenkins'} size={36} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#051F20] truncate">
                      {audit.action || 'Sanction logged'}
                    </span>
                    <span className="text-xs font-medium text-[#235347] truncate">
                      {audit.targetName || audit.targetType || 'Institutional record'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-[#235347]">
                    {audit.timestamp ? new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                  </span>
                  <StatusChip status="approved" label="Audited" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-[24px] bg-white border border-[#DAF1DE] text-center text-xs font-semibold text-[#235347]">
              No recent audit transactions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyHomeView;
