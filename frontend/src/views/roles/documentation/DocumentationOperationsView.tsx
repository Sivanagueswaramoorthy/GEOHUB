import React from 'react';
import {
  FileText,
  Archive,
  Calendar,
  MessageSquare,
  ArrowRight,
  Camera,
  Upload,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  PillButton,
  StatusChip,
  Mascot,
  OperationCard,
} from '../../../components/shared';

export const DocumentationOperationsView: React.FC = () => {
  const {
    setActiveTab,
    events,
    docTemplates,
    meetings,
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
            Archival Wing
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Official templates, uploads & archival records
          </p>
        </div>

        <Mascot name="notebook" size="sm" />
      </div>

      {/* 2) Bento Cards Modular Stack (matches user spec exactly) */}
      <div className="flex flex-col gap-4">
        {/* 1. Documentation Studio */}
        <OperationCard
          mascot="notebook"
          title="Studio & Templates"
          meta={<StatusChip status="live" label={`${docTemplates.length} Templates`} />}
          description="Official templates, PDF/Word/Excel exports, and institutional clearance letters"
          actionLabel="Open Studio"
          onClick={() => setActiveTab('doc_studio')}
        />

        {/* 2. Per-Event Upload */}
        <OperationCard
          mascot="camera"
          title="Per-Event Upload"
          meta={<span className="text-xs font-bold text-[#235347]">{events.length} Events</span>}
          description="Upload official event reports, photographic records, and participant certificates per event"
          actionLabel="Upload Files"
          onClick={() => setActiveTab('doc_studio')}
        />

        {/* 3. Meetings & Minutes of Meeting (MoM) */}
        <OperationCard
          mascot="calendar"
          title="Meetings & MoM"
          meta={<span className="text-xs font-bold text-[#235347]">{meetings.length} Records</span>}
          description="Draft meeting minutes, attendee resolutions, and action items for faculty sign-off"
          actionLabel="Record MoM"
          onClick={() => setActiveTab('meetings')}
        />

        {/* 4. Media Archives & Gallery */}
        <OperationCard
          mascot="camera"
          title="Media Archives"
          meta={<span className="text-xs font-bold text-[#235347]">Gallery Hub</span>}
          description="High-resolution expedition photos, telemetry records, and field video reels"
          actionLabel="View Media"
          onClick={() => setActiveTab('gallery')}
        />

        {/* 5. Daily News Bulletins */}
        <OperationCard
          mascot="notebook"
          title="Daily News Bulletins"
          meta={<span className="text-xs font-bold text-[#235347]">{dailyNews.length} Articles</span>}
          description="Curated geospatial news, department achievements, and campus journalism"
          actionLabel="Read Bulletins"
          onClick={() => setActiveTab('doc_studio')}
        />
      </div>
    </div>
  );
};

export default DocumentationOperationsView;
