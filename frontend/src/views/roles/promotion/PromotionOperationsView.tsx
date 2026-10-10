import React, { useState } from 'react';
import {
  Send,
  Calendar,
  Sparkles,
  BarChart3,
  Newspaper,
  Images,
  Archive,
  Scan,
  QrCode,
  MessageSquare,
  Bell,
  Download,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  X,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { SocialPlatform, SocialPostStatus } from '../../../types';
import { ShortcutTile } from '../../../components/ShortcutTile';
import { CategoryCard } from '../../../components/CategoryCard';
import { ModuleTile } from '../../../components/ModuleTile';
import { BottomSheet } from '../../../components/BottomSheet';
import { Toast } from '../../../components/Toast';

export const PromotionOperationsView: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    events,
    gallery,
    posts,
    campaigns,
    dailyNews,
    uploadGalleryItem,
    addPost,
    updatePost,
    deletePost,
    markPostPublished,
  } = useApp();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Promotion Operations Modals & Drawers State
  const [isContentCalendarOpen, setIsContentCalendarOpen] = useState(false);
  const [isPostsStudioOpen, setIsPostsStudioOpen] = useState(false);
  const [isAiSuggestionsOpen, setIsAiSuggestionsOpen] = useState(false);
  const [isMemoriesCreatorOpen, setIsMemoriesCreatorOpen] = useState(false);
  const [isCampaignReachExportOpen, setIsCampaignReachExportOpen] = useState(false);

  // Content Calendar State
  const [calendarFilterPlatform, setCalendarFilterPlatform] = useState<string>('All');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>('All');
  const [isScheduleDropOpen, setIsScheduleDropOpen] = useState(false);
  const [dropEventId, setDropEventId] = useState(events[0]?.id || '');
  const [dropPlatform, setDropPlatform] = useState<SocialPlatform>('Instagram');
  const [dropDate, setDropDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [dropTime, setDropTime] = useState('11:00');
  const [dropCaption, setDropCaption] = useState('');
  const [dropMediaUrl, setDropMediaUrl] = useState(
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
  );

  // Posts Studio State
  const [postsFilterTab, setPostsFilterTab] = useState<'All' | 'Scheduled' | 'Draft' | 'Posted'>('All');
  const [isNewPostDrawerOpen, setIsNewPostDrawerOpen] = useState(false);
  const [newPostEventId, setNewPostEventId] = useState(events[0]?.id || '');
  const [newPostPlatform, setNewPostPlatform] = useState<SocialPlatform>('Instagram');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostStatus, setNewPostStatus] = useState<SocialPostStatus>('Draft');
  const [newPostMedia, setNewPostMedia] = useState('');

  // AI Suggestions State
  const [aiEventId, setAiEventId] = useState(events[0]?.id || '');
  const [aiPlatform, setAiPlatform] = useState<'Instagram' | 'LinkedIn' | 'WhatsApp'>('Instagram');
  const [aiTone, setAiTone] = useState<'viral' | 'official' | 'urgent'>('viral');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Memories Creator State
  const [memoryEventId, setMemoryEventId] = useState(events[0]?.id || '');
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryCoverUrl, setMemoryCoverUrl] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
  );
  const [memoryCaption, setMemoryCaption] = useState('');
  const [memoryLinks, setMemoryLinks] = useState('');
  const [isCampaignExporting, setIsCampaignExporting] = useState(false);

  const handleMemoriesCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryTitle.trim()) return;
    const targetEvent = events.find((ev) => ev.id === memoryEventId);

    uploadGalleryItem({
      title: memoryTitle,
      eventId: memoryEventId,
      eventTitle: targetEvent?.title || 'Chapter Memories',
      academicYear: '2026-2027',
      category: 'photos',
      mediaType: 'photo',
      submissionStatus: 'verified',
      caption: `${memoryCaption}${memoryLinks ? `\nMedia links: ${memoryLinks}` : ''}`,
      url:
        memoryCoverUrl ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      uploadedByName: `${currentUser.name} (Promotion Lead)`,
      fileSizeBytes: '12.4 MB',
    });

    showToast(`✓ Published "${memoryTitle}" to Event Memories!`);
    setIsMemoriesCreatorOpen(false);
    setMemoryTitle('');
    setMemoryCaption('');
    setMemoryLinks('');
  };

  const handleCampaignExport = (format: 'PDF' | 'Word' | 'Excel') => {
    setIsCampaignExporting(true);
    setTimeout(() => {
      setIsCampaignExporting(false);
      setIsCampaignReachExportOpen(false);
      showToast(`✓ Campaign Reach Report (${format}) exported successfully!`);
    }, 900);
  };

  const handleScheduleDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropCaption.trim()) return;

    addPost({
      eventId: dropEventId,
      platform: dropPlatform,
      caption: dropCaption,
      mediaUrl: dropMediaUrl,
      scheduledTime: `${dropDate}T${dropTime}:00`,
      status: 'Scheduled',
      authorName: 'Promotion Lead',
    });

    showToast(`✓ Scheduled drop for ${dropPlatform} on ${dropDate} at ${dropTime}!`);
    setIsScheduleDropOpen(false);
    setDropCaption('');
  };

  const handleNewPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption.trim()) return;

    addPost({
      eventId: newPostEventId,
      platform: newPostPlatform,
      caption: newPostCaption,
      mediaUrl: newPostMedia || undefined,
      status: newPostStatus,
      authorName: 'Promotion Lead',
    });

    showToast(`✓ Created ${newPostStatus} post for ${newPostPlatform}!`);
    setIsNewPostDrawerOpen(false);
    setNewPostCaption('');
    setNewPostMedia('');
  };

  const handleCopyAiSuggestion = (content: string) => {
    navigator.clipboard?.writeText(content);
    showToast('✓ AI Copy copied to clipboard!');
  };

  const filteredPosts = posts.filter((p) => {
    if (postsFilterTab === 'All') return true;
    return p.status === postsFilterTab;
  });

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-300">
      {/* Toast feedback */}
      {toastMsg && (
        <Toast
          message={toastMsg}
          type="success"
          onClose={() => setToastMsg(null)}
        />
      )}

      {/* Screen Title & Role Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Promotion Lead
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Operations Suite</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Club Operations Hub</h1>
      </div>

      {/* Shortcuts (row of 4): New Post, Calendar, AI Drafts, Campaign Report */}
      <div
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          maxWidth: '480px',
          gap: '8px',
        }}
      >
        <ShortcutTile
          label="New Post"
          icon={<Send size={20} />}
          iconBg="#F5F3FF"
          iconBorder="#DDD6FE"
          iconColor="#6D28D9"
          onClick={() => setIsPostsStudioOpen(true)}
        />

        <ShortcutTile
          label="Calendar"
          icon={<Calendar size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          iconColor="#1D4ED8"
          onClick={() => setIsContentCalendarOpen(true)}
        />

        <ShortcutTile
          label="AI Drafts"
          icon={<Sparkles size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          iconColor="#92400E"
          onClick={() => setIsAiSuggestionsOpen(true)}
        />

        <ShortcutTile
          label="Campaign Report"
          icon={<BarChart3 size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          iconColor="#065F46"
          onClick={() => setIsCampaignReachExportOpen(true)}
        />
      </div>

      {/* Category 1: Campaigns (4 modules) */}
      <CategoryCard title="Campaigns" countBadge={4}>
        <ModuleTile
          title="Content Calendar"
          icon={<Calendar size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => setIsContentCalendarOpen(true)}
        />

        <ModuleTile
          title="Posts"
          icon={<Send size={20} />}
          iconBg="#F5F3FF"
          iconBorder="#DDD6FE"
          accentColor="#7C3AED"
          onClick={() => setIsPostsStudioOpen(true)}
        />

        <ModuleTile
          title="AI Suggestions"
          icon={<Sparkles size={20} />}
          iconBg="#FFF8E6"
          iconBorder="#FDE68A"
          accentColor="#D97706"
          onClick={() => setIsAiSuggestionsOpen(true)}
        />

        <ModuleTile
          title="Daily News"
          icon={<Newspaper size={20} />}
          iconBg="#E8FBF8"
          iconBorder="#99F6E4"
          accentColor="#0D9488"
          onClick={() => setActiveTab('campaigns')}
        />
      </CategoryCard>

      {/* Category 2: Media (2 modules) */}
      <CategoryCard title="Media" countBadge={2}>
        <ModuleTile
          title="Memories Creator"
          icon={<Images size={20} />}
          iconBg="#FDF2F8"
          iconBorder="#FBCFE8"
          accentColor="#DB2777"
          onClick={() => setIsMemoriesCreatorOpen(true)}
        />

        <ModuleTile
          title="Media Archives"
          icon={<Archive size={20} />}
          iconBg="#F3EEFF"
          iconBorder="#DDD1FF"
          accentColor="#6D28D9"
          onClick={() => setActiveTab('archives')}
        />
      </CategoryCard>

      {/* Category 3: Attendance & Gates (2 modules) */}
      <CategoryCard title="Attendance & Gates" countBadge={2}>
        <ModuleTile
          title="Gate Scanner"
          icon={<Scan size={20} />}
          iconBg="#EFF6FF"
          iconBorder="#BFDBFE"
          accentColor="#2563EB"
          onClick={() => setActiveTab('scan_qr')}
        />

        <ModuleTile
          title="My Pass"
          icon={<QrCode size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          accentColor="#059669"
          onClick={() => setActiveTab('my_qr')}
        />
      </CategoryCard>

      {/* Category 4: Communication (2 modules) */}
      <CategoryCard title="Communication" countBadge={2}>
        <ModuleTile
          title="Forum (post and pin)"
          icon={<MessageSquare size={20} />}
          iconBg="#F5F3FF"
          iconBorder="#DDD6FE"
          accentColor="#7C3AED"
          onClick={() => setActiveTab('forum')}
        />

        <ModuleTile
          title="Notifications"
          icon={<Bell size={20} />}
          iconBg="#FEF2F2"
          iconBorder="#FECACA"
          accentColor="#DC2626"
          onClick={() => setActiveTab('notifications')}
        />
      </CategoryCard>

      {/* Category 5: Reports (1 module) */}
      <CategoryCard title="Reports" countBadge={1}>
        <ModuleTile
          title="Campaign Reach export"
          icon={<Download size={20} />}
          iconBg="#E7F9F1"
          iconBorder="#A7F3D0"
          accentColor="#059669"
          onClick={() => setIsCampaignReachExportOpen(true)}
        />
      </CategoryCard>

      {/* =========================================================================
          MODALS & DRAWERS FOR PROMOTION LEAD
          ========================================================================= */}

      {/* Memories Creator BottomSheet */}
      <BottomSheet
        isOpen={isMemoriesCreatorOpen}
        onClose={() => setIsMemoriesCreatorOpen(false)}
        title="Memories Creator"
        subtitle="Build an event media collection from high-res photos and video links"
      >
        <form onSubmit={handleMemoriesCreatorSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Event</label>
            <select
              value={memoryEventId}
              onChange={(e) => setMemoryEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collection Title</label>
            <input
              type="text"
              required
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              placeholder="e.g. GEO FEST 2026 Opening Night Showcase"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={memoryCoverUrl}
              onChange={(e) => setMemoryCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
            {memoryCoverUrl && (
              <div className="mt-2 rounded-xl overflow-hidden h-28 border border-slate-200">
                <img src={memoryCoverUrl} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Highlight Story</label>
            <textarea
              rows={3}
              required
              value={memoryCaption}
              onChange={(e) => setMemoryCaption(e.target.value)}
              placeholder="Describe the atmosphere, memorable moments, and key speakers..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Media Links / Cloud Folders (Optional)</label>
            <input
              type="text"
              value={memoryLinks}
              onChange={(e) => setMemoryLinks(e.target.value)}
              placeholder="e.g. drive.google.com/..., youtu.be/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-700 text-white shadow-xs hover:bg-purple-800 transition-all mt-1 cursor-pointer"
          >
            Publish Collection to Memories
          </button>
        </form>
      </BottomSheet>

      {/* Campaign Reach Export BottomSheet */}
      <BottomSheet
        isOpen={isCampaignReachExportOpen}
        onClose={() => setIsCampaignReachExportOpen(false)}
        title="Campaign Reach Export"
        subtitle="Export social media metrics, engagement rates and channel breakdown"
      >
        <div className="flex flex-col gap-4 py-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Total Reach</span>
              <span className="text-lg font-black text-purple-950 mt-0.5">1,24,500</span>
              <span className="text-[11px] text-purple-600 font-medium">+38% vs prev semester</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Avg Engagement</span>
              <span className="text-lg font-black text-emerald-950 mt-0.5">8.4%</span>
              <span className="text-[11px] text-emerald-600 font-medium">Industry bench 3.2%</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Channel Distribution</span>
              <span className="text-purple-700">4 Active Channels</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span>Instagram (Reels & Stories)</span>
                <span className="font-bold text-slate-900">64% (79,680)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>LinkedIn (Professional Articles)</span>
                <span className="font-bold text-slate-900">22% (27,390)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>WhatsApp (Broadcast Channels)</span>
                <span className="font-bold text-slate-900">11% (13,695)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Other / Campus News Bulletin</span>
                <span className="font-bold text-slate-900">3% (3,735)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-800">Select Export Format</span>

            <button
              type="button"
              disabled={isCampaignExporting}
              onClick={() => handleCampaignExport('PDF')}
              className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 hover:bg-rose-100/60 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-extrabold text-xs">
                  PDF
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xs text-slate-900">Executive PDF Analytics Report</span>
                  <span className="text-[11px] text-slate-500">High-res charts & verified reach figures</span>
                </div>
              </div>
              <Download size={16} className="text-rose-700" />
            </button>

            <button
              type="button"
              disabled={isCampaignExporting}
              onClick={() => handleCampaignExport('Word')}
              className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 hover:bg-blue-100/60 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                  DOC
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xs text-slate-900">Word Dossier Summary (.docx)</span>
                  <span className="text-[11px] text-slate-500">Editable advisory report text</span>
                </div>
              </div>
              <Download size={16} className="text-blue-700" />
            </button>

            <button
              type="button"
              disabled={isCampaignExporting}
              onClick={() => handleCampaignExport('Excel')}
              className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 hover:bg-emerald-100/60 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                  XLS
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xs text-slate-900">Raw Metrics Spreadsheet (.csv)</span>
                  <span className="text-[11px] text-slate-500">Detailed per-post reach, likes & shares</span>
                </div>
              </div>
              <Download size={16} className="text-emerald-700" />
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Content Calendar BottomSheet */}
      <BottomSheet
        isOpen={isContentCalendarOpen}
        onClose={() => {
          setIsContentCalendarOpen(false);
          setIsScheduleDropOpen(false);
        }}
        title="Content Calendar & Drop Planner"
        subtitle="Schedule, coordinate and drop media campaigns across chapter channels"
      >
        <div className="flex flex-col gap-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['All', 'Instagram', 'LinkedIn', 'WhatsApp'].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setCalendarFilterPlatform(platform)}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    calendarFilterPlatform === platform
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsScheduleDropOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-700 text-white flex items-center gap-1.5 hover:bg-purple-800 shadow-xs cursor-pointer shrink-0"
            >
              <Plus size={14} /> Schedule Drop
            </button>
          </div>

          {/* Schedule Drop Sub-form */}
          {isScheduleDropOpen && (
            <form
              onSubmit={handleScheduleDropSubmit}
              className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col gap-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-900">Schedule New Drop</span>
                <button
                  type="button"
                  onClick={() => setIsScheduleDropOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Event</label>
                  <select
                    value={dropEventId}
                    onChange={(e) => setDropEventId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Channel Platform</label>
                  <select
                    value={dropPlatform}
                    onChange={(e) => setDropPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dropDate}
                    onChange={(e) => setDropDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={dropTime}
                    onChange={(e) => setDropTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Caption / Teaser Hook</label>
                <textarea
                  rows={2}
                  required
                  value={dropCaption}
                  onChange={(e) => setDropCaption(e.target.value)}
                  placeholder="Catchy caption, teaser hashtags..."
                  className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-purple-700 text-white font-bold text-xs shadow-xs hover:bg-purple-800 transition-all cursor-pointer"
              >
                Confirm Drop Schedule
              </button>
            </form>
          )}

          {/* List of Scheduled Posts */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-800">
              Scheduled Queue ({posts.filter((p) => p.status === 'Scheduled').length})
            </span>
            {posts
              .filter(
                (p) =>
                  p.status === 'Scheduled' &&
                  (calendarFilterPlatform === 'All' || p.platform === calendarFilterPlatform)
              )
              .map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-purple-700">{post.platform}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : 'Upcoming'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2">{post.caption}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400 font-medium">Target: {post.eventId || 'Geo Chapter'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        markPostPublished(post.id);
                        showToast(`✓ Marked post as Published on ${post.platform}!`);
                      }}
                      className="font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      Publish Now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </BottomSheet>

      {/* Posts Studio BottomSheet */}
      <BottomSheet
        isOpen={isPostsStudioOpen}
        onClose={() => {
          setIsPostsStudioOpen(false);
          setIsNewPostDrawerOpen(false);
        }}
        title="Posts & Media Studio"
        subtitle="Draft, publish and analyze promotional posts across social handles"
      >
        <div className="flex flex-col gap-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['All', 'Draft', 'Scheduled', 'Posted'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPostsFilterTab(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    postsFilterTab === tab
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsNewPostDrawerOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-700 text-white flex items-center gap-1.5 hover:bg-purple-800 shadow-xs cursor-pointer shrink-0"
            >
              <Plus size={14} /> New Post
            </button>
          </div>

          {/* New Post Drawer Sub-form */}
          {isNewPostDrawerOpen && (
            <form
              onSubmit={handleNewPostSubmit}
              className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col gap-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-900">Create New Post</span>
                <button
                  type="button"
                  onClick={() => setIsNewPostDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Platform</label>
                  <select
                    value={newPostPlatform}
                    onChange={(e) => setNewPostPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newPostStatus}
                    onChange={(e) => setNewPostStatus(e.target.value as SocialPostStatus)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Posted">Posted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Caption</label>
                <textarea
                  rows={3}
                  required
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  placeholder="Write post copy..."
                  className="w-full px-2.5 py-1.5 rounded-xl border border-purple-200 text-xs bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-purple-700 text-white font-bold text-xs shadow-xs hover:bg-purple-800 transition-all cursor-pointer"
              >
                Save Post
              </button>
            </form>
          )}

          {/* Posts List */}
          <div className="flex flex-col gap-2">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-purple-700">{post.platform}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        post.status === 'Posted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : post.status === 'Scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {post.publishedDate ? `Published ${post.publishedDate}` : 'In Production'}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{post.caption}</p>
                {post.status !== 'Posted' && (
                  <div className="flex items-center justify-end pt-1 border-t border-slate-100 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        markPostPublished(post.id);
                        showToast(`✓ Published post to ${post.platform}!`);
                      }}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      Mark Published
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* AI Suggestions BottomSheet */}
      <BottomSheet
        isOpen={isAiSuggestionsOpen}
        onClose={() => setIsAiSuggestionsOpen(false)}
        title="AI Social Studio & Caption Generator"
        subtitle="Generate viral hooks, captions and registration calls powered by GeoHub AI"
      >
        <div className="flex flex-col gap-4 py-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Event</label>
              <select
                value={aiEventId}
                onChange={(e) => setAiEventId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
              <select
                value={aiPlatform}
                onChange={(e) => setAiPlatform(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-800">Generated Variations</span>

            {[
              {
                title: 'Viral Hook & Teaser',
                content:
                  '🚀 Ready to map the world like never before? Join GeoHub for hands-on drone mapping and satellite telemetry workshops. Scan your student pass at the turnstile gate! Limited to first 50 registrations. #GeoHub #GeospatialScience #CampusLife',
              },
              {
                title: 'Official Academic Tone',
                content:
                  'GeoHub is pleased to announce our upcoming seminar featuring Dr. Sarah Jenkins. Participants will receive certified credit hours and access to high-altitude orthomosaic datasets. Register via the portal now.',
              },
              {
                title: 'Urgent Last Call',
                content:
                  '⚠️ ONLY 12 SEATS REMAINING! Gates open tomorrow at 10:00 AM. Turnstile check-in enabled with QR codes. Don\'t miss out!',
              },
            ].map((sug, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-900">{sug.title}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyAiSuggestion(sug.content)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-xs cursor-pointer"
                  >
                    Copy Copy
                  </button>
                </div>
                <p className="text-xs text-slate-700 font-mono leading-relaxed">{sug.content}</p>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
