import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Plus,
  QrCode,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  ListRow,
  SectionHeader,
  EmptyState,
} from '../../../components/shared';

export interface CoordinatorHomeViewProps {
  attentionItems?: any[];
  handleReviewAttention?: (item: any) => void;
}

export const CoordinatorHomeView: React.FC<CoordinatorHomeViewProps> = ({
  attentionItems,
  handleReviewAttention,
}) => {
  const { events, users, approvals, setActiveTab } = useApp();

  // Pending items needing coordinator attention
  const items = attentionItems || approvals.filter((a) => a.status === 'pending');
  const pendingCount = items.length;

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Plan something" with Operations and QR Generator */}
      <HeroCard
        variant="mint"
        title="Plan something"
        subtitle="Chapter leadership & event execution"
        mascot="calendar"
        mascotSize="md"
        chip={<StatusChip status="live" label="Coordinator" />}
        action={
          <div className="flex items-center gap-2 w-full">
            <PillButton
              variant="primary"
              fullWidth
              icon={<Layers size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('operations')}
            >
              <span>Operations</span>
              {pendingCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#FAF3E5] text-[#D4A359] border border-[#E5CE9F]/50">
                  {pendingCount}
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

      {/* 2) StatTiles: Events, Pending, Volunteers */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Calendar size={20} strokeWidth={1.75} className="lucide" />}
          value={String(events.length)}
          label="Events"
          tint="mint"
          onClick={() => setActiveTab('events')}
        />
        <StatTile
          icon={<AlertCircle size={20} strokeWidth={1.75} className="lucide" />}
          value={String(pendingCount)}
          label="Pending"
          tint="amber"
          onClick={() => setActiveTab('operations')}
        />
        <StatTile
          icon={<Users size={20} strokeWidth={1.75} className="lucide" />}
          value={String(users.length)}
          label="Volunteers"
          tint="sage"
          onClick={() => setActiveTab('operations')}
        />
      </div>

      {/* 3) "Need action" list with View all */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Need action"
          actionLabel="View all"
          onAction={() => setActiveTab('operations')}
        />

        <div className="flex flex-col gap-2">
          {items && items.length > 0 ? (
            items.slice(0, 3).map((item) => (
              <ListRow
                key={item.id}
                icon={<Clock size={20} strokeWidth={1.75} className="lucide" />}
                title={item.title}
                subtitle={item.category || item.submittedBy || 'Review required'}
                meta={<StatusChip status="pending" label="Pending" />}
                onClick={() => {
                  if (handleReviewAttention) {
                    handleReviewAttention(item);
                  } else {
                    setActiveTab('approvals');
                  }
                }}
              />
            ))
          ) : (
            <EmptyState
              title="All Caught Up"
              description="No pending actions requiring immediate coordinator review."
              mascot="shield"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorHomeView;
