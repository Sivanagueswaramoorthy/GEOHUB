import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  Filter,
  Share2,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { AnimatedNumber, PillButton, EmptyState } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';

export interface CampaignReleaseItem {
  id: string;
  title: string;
  event: string;
  channel: 'Instagram' | 'LinkedIn' | 'Notice Board' | 'WhatsApp Broadcast' | 'Circular';
  scheduledDate: string;
  status: 'Scheduled' | 'Live' | 'Draft' | 'Completed';
  caption: string;
  author: string;
}

export interface ReleaseCalendarScreenProps {
  readOnly: boolean;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const ReleaseCalendarScreen: React.FC<ReleaseCalendarScreenProps> = ({
  readOnly,
  onLogAudit,
  currentUser,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { campaigns: contextCampaigns, events } = useApp();
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newEvent, setNewEvent] = useState(events?.[0]?.title || 'Chapter Event');
  const [newChannel, setNewChannel] = useState<'Instagram' | 'LinkedIn' | 'Notice Board' | 'WhatsApp Broadcast' | 'Circular'>('Instagram');
  const [newDate, setNewDate] = useState('2026-11-12');
  const [newCaption, setNewCaption] = useState('');

  const [campaigns, setCampaigns] = useState<CampaignReleaseItem[]>(() => {
    return (contextCampaigns || []).map((c: any) => ({
      id: c.id,
      title: c.name || c.title || 'Campaign',
      event: c.eventTitle || 'Campus Initiative',
      channel: (c.channel || 'Instagram') as any,
      scheduledDate: c.startDate || 'Upcoming',
      status: (c.status || 'Scheduled') as any,
      caption: c.caption || c.description || 'Publicity release',
      author: c.author || 'Promotion Lead',
    }));
  });

  const channels = ['All', 'Instagram', 'LinkedIn', 'Notice Board', 'WhatsApp Broadcast', 'Circular'];

  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedChannel !== 'All' && c.channel !== selectedChannel) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: CampaignReleaseItem = {
      id: `cr-${Date.now()}`,
      title: newTitle.trim(),
      event: newEvent,
      channel: newChannel,
      scheduledDate: newDate,
      status: 'Scheduled',
      caption: newCaption.trim() || 'Official chapter announcement.',
      author: currentUser?.name || 'Promotion Lead',
    };

    setCampaigns((prev) => [created, ...prev]);
    onLogAudit(newEvent, `Scheduled ${newChannel} campaign: "${created.title}" for ${newDate}`);

    setShowScheduleModal(false);
    setNewTitle('');
    setNewCaption('');
    setSuccessMsg(`Scheduled "${created.title}" successfully!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Scheduled</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CalendarIcon size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={campaigns.filter((c) => c.status === 'Scheduled').length} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Live</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Megaphone size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-base sm:text-lg mt-1">
            <AnimatedNumber value={campaigns.filter((c) => c.status === 'Live').length} />
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Channels</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Share2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            5 Outlets
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Action</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-new-release"
            >
              <Plus size={14} />
              <span>Schedule</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Main Calendar Content */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Campaign & Release Timeline
          </h2>

          {/* Channel Filters */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {channels.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedChannel === ch
                    ? 'bg-[#163832] text-white shadow-xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:bg-[#DAF1DE]'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Release Cards Feed */}
        <div className="space-y-3 pt-1">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#051F20] text-xs sm:text-sm">
                      {camp.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        camp.status === 'Scheduled'
                          ? 'bg-[rgba(242,184,75,0.18)] text-[#051F20] border border-[rgba(242,184,75,0.4)]'
                          : camp.status === 'Live'
                          ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]'
                          : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
                      }`}
                    >
                      {camp.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-[#DAF1DE] text-[#235347]">
                      {camp.channel}
                    </span>
                  </div>

                  <p className="text-xs text-[#235347] mt-1 line-clamp-2">
                    {camp.caption}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#235347]/80">
                    <span>Event: <strong className="text-[#051F20]">{camp.event}</strong></span>
                    <span>•</span>
                    <span>Date: <strong className="text-[#051F20]">{camp.scheduledDate}</strong></span>
                    <span>•</span>
                    <span>Lead: {camp.author}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <span className="h-8 px-3 rounded-xl bg-white border border-[#DAF1DE] text-xs font-bold text-[#163832] flex items-center gap-1 shadow-2xs">
                    <Clock size={13} /> {camp.scheduledDate}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              mascot="megaphone"
              title="No Releases Scheduled"
              description="Plan upcoming media releases, teaser reels, and flyers."
            />
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Schedule New Campaign Release
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keynote Speaker Announcement"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Channel
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Notice Board">Notice Board</option>
                    <option value="WhatsApp Broadcast">WhatsApp Broadcast</option>
                    <option value="Circular">Official Circular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Release Caption / Briefing
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter message or copy for campus circular..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleaseCalendarScreen;

