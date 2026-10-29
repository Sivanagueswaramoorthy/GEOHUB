import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  ListRow,
  SectionHeader,
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
      {/* 1) HeroCard: "Plan something", subtitle "Chapter leadership", small calendar mascot; CTA "New event" */}
      <HeroCard
        variant="mint"
        title="Plan something"
        subtitle="Chapter leadership"
        mascot="calendar"
        mascotSize="md"
        chip={<StatusChip status="live" label="Coordinator" />}
        action={
          <PillButton
            variant="primary"
            fullWidth
            icon={<Plus size={16} strokeWidth={2.2} />}
            onClick={() => setActiveTab('events')}
          >
            New event
          </PillButton>
        }
      />

      {/* 2) StatTiles: Events, Pending, Volunteers */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Calendar size={18} strokeWidth={2} />}
          value={String(events.length || 6)}
          label="Events"
          tint="mint"
          onClick={() => setActiveTab('events')}
        />
        <StatTile
          icon={<AlertCircle size={18} strokeWidth={2} />}
          value={String(pendingCount || 3)}
          label="Pending"
          tint="amber"
          onClick={() => setActiveTab('operations')}
        />
        <StatTile
          icon={<Users size={18} strokeWidth={2} />}
          value={String(users.length || 128)}
          label="Volunteers"
          tint="sage"
          onClick={() => setActiveTab('members')}
        />
      </div>

      {/* 3) Action-required list rows */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Needs action"
          actionLabel="View all"
          onAction={() => setActiveTab('operations')}
        />

        <div className="flex flex-col gap-2">
          {items.slice(0, 3).map((item) => (
            <ListRow
              key={item.id}
              icon={<Clock size={18} strokeWidth={2} />}
              title={item.title}
              subtitle={item.category || item.submittedBy || 'Review required'}
              meta={<StatusChip status="pending" />}
              onClick={() => {
                if (handleReviewAttention) {
                  handleReviewAttention(item);
                } else {
                  setActiveTab('operations');
                }
              }}
            />
          ))}

          {items.length === 0 && (
            <div className="p-4 rounded-[24px] bg-white border border-[#DAF1DE] text-center text-xs font-semibold text-[#235347]">
              All items actioned!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorHomeView;
