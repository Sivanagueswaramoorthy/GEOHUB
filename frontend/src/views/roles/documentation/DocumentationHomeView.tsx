import React from 'react';
import {
  FileText,
  Upload,
  Newspaper,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatusChip,
  SectionHeader,
  PastelCard,
  EmptyState,
} from '../../../components/shared';

export interface DocumentationHomeViewProps {
  docEvents?: any[];
  getCompletionDetails?: (items: any) => { completedCount: number; total: number; percent: number };
  setActiveChecklistEvent?: (ev: any) => void;
  handleOpenTemplateShortcut?: (name: string) => void;
  setActiveMediaItem?: (item: any) => void;
}

export const DocumentationHomeView: React.FC<DocumentationHomeViewProps> = () => {
  const { currentUser, events, setActiveTab, setSelectedEventId } = useApp();

  const upcomingEvents = events.slice(0, 3);

  const formatDateBadge = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: d.getDate(),
      };
    } catch {
      return { month: 'OCT', day: 15 };
    }
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard with Greeting */}
      <HeroCard
        variant="mint"
        title={`Welcome back, ${currentUser.name.split(' ')[0]}`}
        subtitle="Archival studio, records & official press bulletins"
        mascot="notebook"
        mascotSize="md"
        chip={<StatusChip status="live" label="Documentation" />}
      />

      {/* 2) Quick Links to Templates, Upload and Daily News */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-[#235347] uppercase tracking-wider pl-1">
          Quick Links
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          <PastelCard
            variant="mint"
            className="flex flex-col items-center justify-center p-3 text-center cursor-pointer pressable"
            onClick={() => setActiveTab('doc_studio')}
          >
            <div className="w-10 h-10 rounded-full bg-[#DAF1DE] flex items-center justify-center mb-1.5">
              <FileText size={20} strokeWidth={1.75} className="lucide text-[#163832]" />
            </div>
            <span className="text-xs font-bold text-[#051F20]">Templates</span>
            <span className="text-xs text-[#235347] mt-0.5">Dossiers</span>
          </PastelCard>

          <PastelCard
            variant="sage"
            className="flex flex-col items-center justify-center p-3 text-center cursor-pointer pressable"
            onClick={() => setActiveTab('doc_studio')}
          >
            <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center mb-1.5">
              <Upload size={20} strokeWidth={1.75} className="lucide text-[#235347]" />
            </div>
            <span className="text-xs font-bold text-[#051F20]">Upload</span>
            <span className="text-xs text-[#235347] mt-0.5">Media & MoM</span>
          </PastelCard>

          <PastelCard
            variant="mint"
            className="flex flex-col items-center justify-center p-3 text-center cursor-pointer pressable"
            onClick={() => setActiveTab('doc_studio')}
          >
            <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center mb-1.5">
              <Newspaper size={20} strokeWidth={1.75} className="lucide text-[#051F20]" />
            </div>
            <span className="text-xs font-bold text-[#051F20]">Daily News</span>
            <span className="text-xs text-[#235347] mt-0.5">Bulletins</span>
          </PastelCard>
        </div>
      </div>

      {/* 3) Upcoming events list */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Upcoming Events"
          actionLabel="View all"
          onAction={() => setActiveTab('events')}
        />

        <div className="flex flex-col gap-3">
          {upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map((ev) => {
              const dateBadge = formatDateBadge(ev.startDate);
              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    setActiveTab('events');
                  }}
                  className="flex items-center justify-between p-3.5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] hover:border-[#8EB69B] transition-all cursor-pointer pressable"
                  style={{
                    borderRadius: '24px',
                    minHeight: '64px',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] shrink-0"
                      style={{ borderRadius: '14px' }}
                    >
                      <span className="text-xs font-black leading-none">
                        {dateBadge.day}
                      </span>
                      <span className="text-xs font-bold text-[#235347] leading-none mt-0.5">
                        {dateBadge.month}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[#051F20] truncate">
                        {ev.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#235347] truncate mt-0.5">
                        <MapPin size={12} strokeWidth={1.75} className="lucide" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    <StatusChip status={ev.status === 'completed' ? 'done' : 'live'} />
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              title="No Upcoming Events"
              description="No upcoming events scheduled for documentation."
              mascot="calendar"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationHomeView;