import React from 'react';
import {
  Megaphone,
  Clock,
  Send,
  Calendar,
  Plus,
  QrCode,
  FileCheck2,
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

export interface PromotionHomeViewProps {
  showToast?: (msg: string) => void;
}

export const PromotionHomeView: React.FC<PromotionHomeViewProps> = () => {
  const { posts, events, approvals, setActiveTab } = useApp();

  const scheduledCount = posts.filter((p) => p.status === 'Scheduled').length;
  const postedCount = posts.filter((p) => p.status === 'Posted').length;
  const promoApprovals = approvals.filter((a) => a.requestedTeam === 'Promotion' || a.applicantName?.includes('David') || a.applicantName?.includes('Chloe') || a.type === 'event');

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Promotion" with "+ New post" and QR Scanner */}
      <HeroCard
        variant="mint"
        title="Promotion"
        subtitle="Publicity, social media & campus campaigns"
        mascot="megaphone"
        mascotSize="md"
        chip={<StatusChip status="live" label="Promotion" />}
        action={
          <div className="flex items-center gap-2 w-full">
            <PillButton
              variant="primary"
              fullWidth
              icon={<Plus size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('campaigns')}
            >
              + New post
            </PillButton>
            <PillButton
              variant="secondary"
              fullWidth
              icon={<QrCode size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('scan_qr')}
            >
              QR Scanner
            </PillButton>
          </div>
        }
      />

      {/* 2) StatTiles: Scheduled, Posted, Events */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Clock size={20} strokeWidth={1.75} className="lucide" />}
          value={String(scheduledCount)}
          label="Scheduled"
          footnote="Upcoming"
          tint="amber"
          onClick={() => setActiveTab('campaigns')}
        />
        <StatTile
          icon={<Send size={20} strokeWidth={1.75} className="lucide" />}
          value={String(postedCount)}
          label="Posted"
          footnote="Active"
          tint="mint"
          onClick={() => setActiveTab('campaigns')}
        />
        <StatTile
          icon={<Calendar size={20} strokeWidth={1.75} className="lucide" />}
          value={String(events.length)}
          label="Events"
          footnote="Active"
          tint="sage"
          onClick={() => setActiveTab('events')}
        />
      </div>

      {/* 3) Approval list with Approved/Pending chips */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Campaign Approvals"
          actionLabel="View all"
          onAction={() => setActiveTab('approvals')}
        />

        <div className="flex flex-col gap-2">
          {promoApprovals && promoApprovals.length > 0 ? (
            promoApprovals.slice(0, 3).map((item) => (
              <ListRow
                key={item.id}
                icon={<FileCheck2 size={20} strokeWidth={1.75} className="lucide" />}
                title={item.title}
                subtitle={`${item.subtitle || 'Social Media Collateral'} • Submitted`}
                meta={
                  <StatusChip
                    status={item.status === 'approved' ? 'approved' : 'pending'}
                    label={item.status === 'approved' ? 'Approved' : 'Pending'}
                  />
                }
                onClick={() => setActiveTab('approvals')}
              />
            ))
          ) : (
            <EmptyState
              title="No Approvals Pending"
              description="All promotional media campaigns have been reviewed."
              mascot="megaphone"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionHomeView;