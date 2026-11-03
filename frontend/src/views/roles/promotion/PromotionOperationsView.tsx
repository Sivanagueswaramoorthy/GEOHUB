import React from 'react';
import {
  Megaphone,
  Calendar,
  Sparkles,
  Newspaper,
  Share2,
  Camera,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
  OperationCard,
} from '../../../components/shared';

export const PromotionOperationsView: React.FC = () => {
  const {
    setActiveTab,
    posts,
    dailyNews,
  } = useApp();

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn pb-24">
      {/* 1) Top Header: Title, Subtitle & Mascot */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Publicity Hub
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Publicity campaigns & AI studio
          </p>
        </div>

        <Mascot name="megaphone" size="sm" />
      </div>

      {/* 2) Bento Cards Modular Stack (matches user spec exactly) */}
      <div className="flex flex-col gap-4">
        {/* 1. Campaigns & Posts */}
        <OperationCard
          mascot="megaphone"
          title="Campaigns & Posts"
          meta={<StatusChip status="live" label={`${posts.length} Active`} />}
          description="Social media release schedules, Instagram reels, LinkedIn updates, and WhatsApp blasts"
          actionLabel="Open Campaigns"
          onClick={() => setActiveTab('campaigns')}
        />

        {/* 2. Release Calendar */}
        <OperationCard
          mascot="calendar"
          title="Release Calendar"
          meta={<span className="text-xs font-bold text-[#235347]">Holidays & Eco Days</span>}
          description="Track government holidays, world environment days, and scheduled post launches"
          actionLabel="View Calendar"
          onClick={() => setActiveTab('campaigns')}
        />

        {/* 3. Per-Event Media Upload */}
        <OperationCard
          mascot="camera"
          title="Event Media Upload"
          meta={<span className="text-xs font-bold text-[#235347]">Photos & Videos</span>}
          description="Upload event photos, highlight videos, and promotional graphics directly to albums"
          actionLabel="Upload Media"
          onClick={() => setActiveTab('gallery')}
        />

        {/* 4. Bulletins & Daily News */}
        <OperationCard
          mascot="notebook"
          title="Bulletins & Daily News"
          meta={<span className="text-xs font-bold text-[#235347]">{dailyNews.length} Broadcasts</span>}
          description="Campus notice board broadcasts, squad bulletins, and urgent club directives"
          actionLabel="View News"
          onClick={() => setActiveTab('campaigns')}
        />
      </div>
    </div>
  );
};

export default PromotionOperationsView;
