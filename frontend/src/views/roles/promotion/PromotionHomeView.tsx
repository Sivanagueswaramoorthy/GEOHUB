import React from 'react';
import {
  Megaphone,
  Clock,
  Send,
  Sparkles,
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

export interface PromotionHomeViewProps {
  showToast?: (msg: string) => void;
}

export const PromotionHomeView: React.FC<PromotionHomeViewProps> = () => {
  const { posts, setActiveTab } = useApp();

  const scheduledCount = posts.filter((p) => p.status === 'Scheduled').length;
  const postedCount = posts.filter((p) => p.status === 'Posted').length;

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Promotion", subtitle "Publicity & engagement", small megaphone mascot; CTA "New post" */}
      <HeroCard
        variant="mint"
        title="Promotion"
        subtitle="Publicity & engagement"
        mascot="megaphone"
        mascotSize="md"
        chip={<StatusChip status="live" label="Media Desk" />}
        action={
          <PillButton
            variant="primary"
            fullWidth
            icon={<Plus size={16} strokeWidth={2.2} />}
            onClick={() => setActiveTab('campaigns')}
          >
            New post
          </PillButton>
        }
      />

      {/* 2) StatTiles: Scheduled, Posted, Reach */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Clock size={18} strokeWidth={2} />}
          value={String(scheduledCount || 2)}
          label="Scheduled"
          footnote="Upcoming"
          tint="amber"
          onClick={() => setActiveTab('campaigns')}
        />
        <StatTile
          icon={<Send size={18} strokeWidth={2} />}
          value={String(postedCount || 6)}
          label="Posted"
          footnote="Live"
          tint="mint"
          onClick={() => setActiveTab('campaigns')}
        />
        <StatTile
          icon={<Sparkles size={18} strokeWidth={2} />}
          value="4.2k"
          label="Reach"
          footnote="+42% growth"
          tint="sage"
          onClick={() => setActiveTab('campaigns')}
        />
      </div>

      {/* 3) Recent Campaign Posts */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Campaigns"
          actionLabel="Studio"
          onAction={() => setActiveTab('campaigns')}
        />

        <div className="flex flex-col gap-2">
          {posts.slice(0, 3).map((post) => (
            <ListRow
              key={post.id}
              icon={<Megaphone size={18} strokeWidth={2} />}
              title={post.caption || 'Event Announcement'}
              subtitle={`${post.platform || 'Social'} • ${post.status}`}
              meta={<StatusChip status={post.status === 'Posted' ? 'done' : 'live'} />}
              onClick={() => setActiveTab('campaigns')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionHomeView;
