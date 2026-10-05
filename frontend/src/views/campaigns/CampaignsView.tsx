import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Send,
  Sparkles,
  Newspaper,
  Plus,
  Clock,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  Share2,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Camera,
  MessageCircle,
  Loader2,
  Flame,
  ThumbsUp,
  RotateCw,
  X,
  FileText,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialPlatform, SocialPostStatus, SocialPost, DailyNewsItem } from '../../types';
import {
  SectionCard,
  Overline,
  StatTile,
  BottomSheet,
  Toast,
  ConfirmDialog,
  WeekStrip,
  WeekDayItem,
} from '../../components';

export const CampaignsView: React.FC = () => {
  const {
    currentUser,
    events,
    posts,
    addPost,
    updatePost,
    deletePost,
    markPostPublished,
    dailyNews,
    addDailyNews,
    updateDailyNews,
    deleteDailyNews,
  } = useApp();

  // Active top-level subtab
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'posts' | 'ai' | 'news'>('posts');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // -------------------------------------------------------------
  // POSTS SUB-TAB STATE & FILTERS
  // -------------------------------------------------------------
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'All' | SocialPlatform>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | SocialPostStatus>('All');

  // Add / Edit Post Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postEventId, setPostEventId] = useState(events[0]?.id || '');
  const [postPlatform, setPostPlatform] = useState<SocialPlatform>('Instagram');
  const [postStatus, setPostStatus] = useState<SocialPostStatus>('Scheduled');
  const [postCaption, setPostCaption] = useState('');
  const [postScheduledDate, setPostScheduledDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [postScheduledTime, setPostScheduledTime] = useState('11:00');
  const [postLiveUrl, setPostLiveUrl] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80');

  // Mark Posted Modal
  const [isMarkPostedOpen, setIsMarkPostedOpen] = useState(false);
  const [targetPostForMark, setTargetPostForMark] = useState<SocialPost | null>(null);
  const [inputLiveUrl, setInputLiveUrl] = useState('');

  // Delete Confirm Dialog
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // CALENDAR SUB-TAB STATE
  // -------------------------------------------------------------
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [selectedDateStr, setSelectedDateStr] = useState('2026-10-08');

  const weekDays: WeekDayItem[] = [
    { dateStr: '2026-10-05', dayName: 'Mon', dayNum: 5, hasDot: posts.some((p) => p.scheduledDate === '2026-10-05') },
    { dateStr: '2026-10-06', dayName: 'Tue', dayNum: 6, hasDot: posts.some((p) => p.scheduledDate === '2026-10-06') },
    { dateStr: '2026-10-07', dayName: 'Wed', dayNum: 7, hasDot: posts.some((p) => p.scheduledDate === '2026-10-07') },
    { dateStr: '2026-10-08', dayName: 'Thu', dayNum: 8, hasDot: posts.some((p) => p.scheduledDate === '2026-10-08') },
    { dateStr: '2026-10-09', dayName: 'Fri', dayNum: 9, hasDot: posts.some((p) => p.scheduledDate === '2026-10-09') },
    { dateStr: '2026-10-10', dayName: 'Sat', dayNum: 10, hasDot: posts.some((p) => p.scheduledDate === '2026-10-10') },
    { dateStr: '2026-10-11', dayName: 'Sun', dayNum: 11, hasDot: posts.some((p) => p.scheduledDate === '2026-10-11') },
  ];

  // -------------------------------------------------------------
  // AI SUB-TAB STATE
  // -------------------------------------------------------------
  const [aiSelectedEventId, setAiSelectedEventId] = useState(events[0]?.id || 'event_01');
  const [aiTone, setAiTone] = useState<'Formal' | 'Friendly' | 'Energetic'>('Energetic');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiGeneratedCards, setAiGeneratedCards] = useState<{
    instagram: { headline: string; caption: string; hashtags: string[]; cta: string };
    linkedin: { headline: string; caption: string; hashtags: string[]; cta: string };
    dailyNews: { title: string; paragraph: string; hashtags: string[] };
  } | null>(null);

  // In-place draft editing state
  const [editingDraftChannel, setEditingDraftChannel] = useState<'instagram' | 'linkedin' | 'news' | null>(null);
  const [editedCaption, setEditedCaption] = useState('');

  // -------------------------------------------------------------
  // DAILY NEWS SUB-TAB STATE
  // -------------------------------------------------------------
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsEventId, setNewsEventId] = useState(events[0]?.id || '');
  const [deleteConfirmNewsId, setDeleteConfirmNewsId] = useState<string | null>(null);

  // Prepopulate AI drafts on mount if empty
  const selectedAiEvent = events.find((e) => e.id === aiSelectedEventId) || events[0] || {
    id: 'event_01',
    title: 'Annual Geo-Symposium & Tech Expo',
    venue: 'Grand Auditorium',
    startDate: '2026-10-10T09:00:00Z',
    description: 'Flagship convention featuring research in autonomous spatial sensing and UAV photogrammetry.',
    registeredUserIds: ['u_1', 'u_2', 'u_3'],
  };

  const handleGenerateAiSuggestions = async () => {
    setAiIsLoading(true);
    setAiGeneratedCards(null);

    // Simulated 1.2s skeleton adapter with realistic delay
    setTimeout(() => {
      const evTitle = selectedAiEvent.title;
      const venue = selectedAiEvent.venue;
      const dateStr = new Date(selectedAiEvent.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (aiTone === 'Energetic') {
        setAiGeneratedCards({
          instagram: {
            headline: `🚀 READY TO UNLOCK THE FUTURE OF GEOMATICS? ${evTitle} is HERE! ✨`,
            caption: `Get hands-on with autonomous LiDAR point-clouds, drone flight telemetry, and satellite radar mapping! 🛰️💥\n\nWhether you're gearing up for internships or mapping your first digital elevation model, this is the marquee event of the semester!\n\n🗓️ Date: ${dateStr}\n📍 Venue: ${venue}\n🎟️ Exclusive student access badges now available!`,
            hashtags: ['#GeoHub', '#Geomatics', '#DroneMapping', '#GISLife', '#InnovationInSTEM', '#CollegeCampus'],
            cta: '📲 Tap link in bio or visit GeoHub portal to secure your badge!',
          },
          linkedin: {
            headline: `Advancing Applied Geospatial Engineering: Join Us for ${evTitle}`,
            caption: `The Department of Geomatics and Green Eco Organization (GeoHub) are proud to present "${evTitle}" on ${dateStr} at ${venue}.\n\nThis high-impact seminar bridges academic theory with industry standards, featuring hands-on labs in:\n• Multispectral terrain classification & RTK positioning\n• Open-source GIS workflows adhering to ISO geospatial standards\n• High-precision UAV survey protocols with faculty oversight\n\nStudent scholars from all engineering disciplines are encouraged to attend and network with technical chapter mentors.`,
            hashtags: ['#GeospatialEngineering', '#GIS', '#RemoteSensing', '#HigherEducation', '#STEMLeadership'],
            cta: 'Student delegate registrations are managed through the official college portal.',
          },
          dailyNews: {
            title: `CAMPUS BULLETIN: ${evTitle} Scheduled for ${dateStr}`,
            paragraph: `The Department of Geomatics in collaboration with the GeoHub Student Chapter will host "${evTitle}" on ${dateStr} at ${venue}. The session will feature field demonstrations of Topcon RTK GNSS systems and autonomous UAV mapping under the supervision of Faculty Advisor Dr. Sarah Jenkins. Over 180 delegates have registered, making this one of the largest collaborative geospatial initiatives of the academic year.`,
            hashtags: ['#CollegeDailyNews', '#DepartmentOfGeomatics', '#StudentExcellence', '#GeoHub'],
          },
        });
      } else if (aiTone === 'Formal') {
        setAiGeneratedCards({
          instagram: {
            headline: `Official Academic Notice: ${evTitle}`,
            caption: `We cordially invite faculty, researchers, and students to attend "${evTitle}".\n\nThe symposium will provide structured demonstrations in advanced remote sensing methodologies and geospatial analytics.\n\nDate: ${dateStr}\nLocation: ${venue}`,
            hashtags: ['#Geomatics', '#AcademicExcellence', '#GeoHubChapter', '#SurveyScience'],
            cta: 'Formal registration verification is required at the turnstile gate.',
          },
          linkedin: {
            headline: `Institutional Announcement: Departmental Symposium on ${evTitle}`,
            caption: `Green Eco Organization (GeoHub) announces the schedule for "${evTitle}" taking place on ${dateStr} at ${venue}.\n\nUnder the advisory leadership of Dr. Sarah Jenkins, this session addresses regional environmental monitoring and digital spatial twins for disaster mitigation.\n\nWe commend our student executive committee for organizing this technical seminar.`,
            hashtags: ['#SpatialDataScience', '#HigherEducation', '#Geodesy', '#CivilEngineering'],
            cta: 'Official delegate clearance is open via the chapter portal.',
          },
          dailyNews: {
            title: `OFFICIAL DISPATCH: Department Confirms Dates for ${evTitle}`,
            paragraph: `The collegiate chapter of Green Eco Organization confirmed that "${evTitle}" will take place on ${dateStr} at ${venue}. The proceedings will document student research in geospatial analytics and autonomous mapping. Dean and faculty mentors will review technical presentations delivered by student squads.`,
            hashtags: ['#OfficialDispatch', '#AcademicIntegrity', '#GeomaticsDepartment'],
          },
        });
      } else {
        // Friendly
        setAiGeneratedCards({
          instagram: {
            headline: `Hey Geo-Scholars! 🌍 What are your plans for ${dateStr}?`,
            caption: `Join us at ${venue} for ${evTitle}! 🤗 We'll have drone flight demos, GPS treasure hunts, and free stickers for everyone who checks in via the app!\n\nNo prior GIS experience needed - our student mentors will guide you step by step. Bring your friends and let's map something cool together! ✨`,
            hashtags: ['#GeoHubFamily', '#ClubLife', '#GeomaticsFun', '#CollegeVibes'],
            cta: 'Tag a friend in the comments and tap the link in bio to RSVP! 👇',
          },
          linkedin: {
            headline: `Empowering Student Exploration: Announcing ${evTitle}`,
            caption: `Student-led learning is at the heart of GeoHub! On ${dateStr}, we are hosting "${evTitle}" at ${venue}.\n\nIt is always inspiring to see junior scholars collaborating across departments on real-world spatial challenges. Special thanks to our volunteer crews for coordinating gate check-ins and hardware distribution.`,
            hashtags: ['#StudentLeadership', '#HandsOnLearning', '#GeoHub', '#PeerMentoring'],
            cta: 'Check out the event details on our chapter app.',
          },
          dailyNews: {
            title: `STUDENT SPOTLIGHT: Hands-on Tech Experience at ${evTitle}`,
            paragraph: `The GeoHub Student Chapter welcomes all undergraduates to participate in "${evTitle}" on ${dateStr} at ${venue}. The student-driven event offers an approachable introduction to spatial mapping, GPS receivers, and club activities. Event lead David Chen highlighted that peer mentorship will be provided throughout the day.`,
            hashtags: ['#StudentLife', '#HandsOnTech', '#GeoHubCommunity'],
          },
        });
      }

      setAiIsLoading(false);
      showToast('✓ AI content draft ready for review!');
    }, 1200);
  };

  // Copy helper
  const handleCopyText = (text: string, label = 'Content') => {
    navigator.clipboard?.writeText(text);
    showToast(`✓ Copied ${label} to clipboard!`);
  };

  // Convert AI draft directly into a SocialPost (Draft status)
  const handleSaveAiDraftAsPost = (platform: SocialPlatform, caption: string, hashtags: string[]) => {
    addPost({
      eventId: selectedAiEvent.id,
      eventTitle: selectedAiEvent.title,
      platform,
      status: 'Draft',
      caption,
      hashtags,
      authorName: `${currentUser.name} (AI Studio)`,
      createdAt: new Date().toISOString(),
    });
    showToast(`✓ Saved as ${platform} Draft in Posts!`);
  };

  // Convert AI draft directly into a SocialPost (Posted status with link)
  const handleMarkAiDraftAsPosted = (platform: SocialPlatform, caption: string, hashtags: string[]) => {
    const liveLink = prompt('Enter the live post URL (Instagram, LinkedIn, or Web):', 'https://instagram.com/p/geohub_live');
    if (!liveLink) return;
    addPost({
      eventId: selectedAiEvent.id,
      eventTitle: selectedAiEvent.title,
      platform,
      status: 'Posted',
      caption,
      hashtags,
      postUrl: liveLink,
      publishedDate: new Date().toISOString().split('T')[0],
      authorName: `${currentUser.name} (AI Studio)`,
      createdAt: new Date().toISOString(),
    });
    showToast(`✓ Recorded as Posted on ${platform}!`);
  };

  // Post Submission handler (Add/Edit)
  const handlePostFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCaption.trim()) return;

    const targetEvent = events.find((ev) => ev.id === postEventId);

    if (editingPostId) {
      updatePost(editingPostId, {
        eventId: postEventId || undefined,
        eventTitle: targetEvent?.title,
        platform: postPlatform,
        status: postStatus,
        caption: postCaption,
        scheduledDate: postStatus === 'Scheduled' ? postScheduledDate : undefined,
        scheduledTime: postStatus === 'Scheduled' ? postScheduledTime : undefined,
        postUrl: postStatus === 'Posted' ? postLiveUrl || undefined : undefined,
        publishedDate: postStatus === 'Posted' ? new Date().toISOString().split('T')[0] : undefined,
      });
      showToast('✓ Updated post details!');
    } else {
      addPost({
        eventId: postEventId || undefined,
        eventTitle: targetEvent?.title,
        platform: postPlatform,
        status: postStatus,
        caption: postCaption,
        scheduledDate: postStatus === 'Scheduled' ? postScheduledDate : undefined,
        scheduledTime: postStatus === 'Scheduled' ? postScheduledTime : undefined,
        postUrl: postStatus === 'Posted' ? postLiveUrl || undefined : undefined,
        publishedDate: postStatus === 'Posted' ? new Date().toISOString().split('T')[0] : undefined,
        mediaUrl: postMediaUrl,
        authorName: `${currentUser.name} (${currentUser.post || 'Promotion Lead'})`,
        createdAt: new Date().toISOString(),
      });
      showToast(`✓ Created new ${postStatus} on ${postPlatform}!`);
    }

    setIsPostModalOpen(false);
    setEditingPostId(null);
  };

  // Open Edit Post
  const handleOpenEditPost = (post: SocialPost) => {
    setEditingPostId(post.id);
    setPostEventId(post.eventId || events[0]?.id || '');
    setPostPlatform(post.platform);
    setPostStatus(post.status);
    setPostCaption(post.caption);
    setPostScheduledDate(post.scheduledDate || new Date().toISOString().split('T')[0]);
    setPostScheduledTime(post.scheduledTime || '11:00');
    setPostLiveUrl(post.postUrl || '');
    setPostMediaUrl(post.mediaUrl || '');
    setIsPostModalOpen(true);
  };

  // Confirm Mark Posted
  const handleConfirmMarkPosted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPostForMark) return;
    markPostPublished(targetPostForMark.id, inputLiveUrl || undefined);
    showToast(`✓ Marked post as Posted on ${targetPostForMark.platform}!`);
    setIsMarkPostedOpen(false);
    setTargetPostForMark(null);
    setInputLiveUrl('');
  };

  // Daily News submit
  const handleNewsFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    const targetEv = events.find((ev) => ev.id === newsEventId);
    addDailyNews({
      title: newsTitle,
      date: new Date().toISOString().split('T')[0],
      eventId: newsEventId || undefined,
      eventTitle: targetEv?.title,
      author: `${currentUser.name} (Promotion Lead)`,
      content: newsContent,
      hashtags: ['#CollegeDailyNews', '#DepartmentOfGeomatics', '#GeoHub'],
      status: 'published',
    });

    showToast('✓ Published chapter daily news bulletin!');
    setIsNewsModalOpen(false);
    setNewsTitle('');
    setNewsContent('');
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    const matchesPlatform = selectedPlatformFilter === 'All' || p.platform === selectedPlatformFilter;
    const matchesStatus = selectedStatusFilter === 'All' || p.status === selectedStatusFilter;
    return matchesPlatform && matchesStatus;
  });

  // Scheduled posts for calendar
  const scheduledForSelectedDate = posts.filter(
    (p) => p.status === 'Scheduled' && (p.scheduledDate === selectedDateStr || !p.scheduledDate)
  );

  return (
    <div className="flex flex-col gap-5 pb-12">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <Overline dot>CAMPAIGNS & SOCIAL MEDIA COMMAND</Overline>
          <h1
            className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Campaigns Hub
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPostId(null);
            setPostCaption('');
            setPostStatus('Scheduled');
            setPostPlatform('Instagram');
            setIsPostModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus size={15} />
          <span>New Post</span>
        </button>
      </div>

      {/* 4 Segmented Sub-Tabs */}
      <div
        className="flex items-center p-1 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] gap-1"
        style={{ fontFamily: 'var(--font-family)' }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('posts')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'posts'
              ? 'bg-white text-purple-900 shadow-xs border border-purple-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Posts ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'calendar'
              ? 'bg-white text-purple-900 shadow-xs border border-purple-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Calendar
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ai')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer inline-flex items-center justify-center gap-1 ${
            activeSubTab === 'ai'
              ? 'bg-white text-purple-900 shadow-xs border border-purple-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles size={13} className="text-amber-500" />
          <span>AI Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('news')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'news'
              ? 'bg-white text-purple-900 shadow-xs border border-purple-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daily News ({dailyNews.length})
        </button>
      </div>

      {/* =========================================================================
          SUB-TAB 1: POSTS LIST
          ========================================================================= */}
      {activeSubTab === 'posts' && (
        <div className="flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-2">
            {/* Platform filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                Platform:
              </span>
              {(['All', 'Instagram', 'LinkedIn', 'WhatsApp', 'Other'] as const).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatformFilter(plat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedPlatformFilter === plat
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                Status:
              </span>
              {(['All', 'Draft', 'Scheduled', 'Posted'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center flex flex-col items-center">
              <Megaphone size={36} className="text-slate-300 mb-2" />
              <h3 className="font-extrabold text-sm text-slate-800">No Posts Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                No social posts match the selected platform and status filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlatformFilter('All');
                  setSelectedStatusFilter('All');
                }}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-white border border-[#EEF1F5] shadow-xs flex flex-col gap-2.5 transition-all hover:border-purple-200"
                >
                  {/* Top Bar: Platform chip & Status chip */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          post.platform === 'Instagram'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : post.platform === 'LinkedIn'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : post.platform === 'WhatsApp'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {post.platform === 'Instagram' && <Camera size={12} />}
                        {post.platform === 'LinkedIn' && <Share2 size={12} />}
                        {post.platform === 'WhatsApp' && <MessageCircle size={12} />}
                        <span>{post.platform}</span>
                      </span>

                      {post.eventTitle && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 truncate max-w-[140px]">
                          {post.eventTitle}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        post.status === 'Posted'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : post.status === 'Scheduled'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  {/* Caption snippet */}
                  <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                    {post.caption}
                  </p>

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold text-purple-700 bg-purple-50/60 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Bar: Date/Time + Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      {post.status === 'Scheduled' && (
                        <>
                          <Clock size={13} className="text-purple-600" />
                          <span>
                            {post.scheduledDate} at {post.scheduledTime || '11:00'}
                          </span>
                        </>
                      )}
                      {post.status === 'Posted' && (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Published {post.publishedDate}</span>
                        </>
                      )}
                      {post.status === 'Draft' && (
                        <>
                          <FileText size={13} className="text-amber-600" />
                          <span>Unscheduled Draft</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Copy caption */}
                      <button
                        type="button"
                        onClick={() => handleCopyText(post.caption, 'Caption')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Copy caption"
                      >
                        <Copy size={14} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditPost(post)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit post"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* If Draft or Scheduled, can Mark as Posted */}
                      {post.status !== 'Posted' && (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetPostForMark(post);
                            setInputLiveUrl(post.postUrl || '');
                            setIsMarkPostedOpen(true);
                          }}
                          className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Mark Posted
                        </button>
                      )}

                      {/* If Posted with Live Link */}
                      {post.status === 'Posted' && post.postUrl && (
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        >
                          <span>Live</span>
                          <ExternalLink size={10} />
                        </a>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPostId(post.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: CONTENT CALENDAR
          ========================================================================= */}
      {activeSubTab === 'calendar' && (
        <div className="flex flex-col gap-4">
          {/* Calendar Header with Month & Controls */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon size={17} className="text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">{currentMonth}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => showToast('Navigated to September 2026')}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateStr('2026-10-08')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Navigated to November 2026')}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* WeekStrip */}
            <WeekStrip
              days={weekDays}
              selectedDate={selectedDateStr}
              onSelectDate={(dt) => setSelectedDateStr(dt)}
            />

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Purple dots indicate days with scheduled social media broadcasts</span>
            </div>
          </SectionCard>

          {/* Timeline for Selected Day */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Scheduled for {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[11px] font-extrabold text-purple-700">
                {scheduledForSelectedDate.length} Posts Queued
              </span>
            </div>

            {scheduledForSelectedDate.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-100 text-center flex flex-col items-center">
                <Clock size={28} className="text-slate-300 mb-1" />
                <p className="text-xs font-bold text-slate-700">No Posts Scheduled</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Keep chapter momentum active by scheduling content for this date.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPostId(null);
                    setPostScheduledDate(selectedDateStr);
                    setPostStatus('Scheduled');
                    setIsPostModalOpen(true);
                  }}
                  className="mt-3 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 cursor-pointer"
                >
                  + Schedule Post for This Day
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {scheduledForSelectedDate.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#EEF1F5] shadow-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-purple-800 font-mono">
                          {p.scheduledTime || '11:00'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {p.platform}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{p.eventTitle}</span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-snug">
                      {p.caption}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => handleCopyText(p.caption)}
                        className="text-[10px] font-bold text-slate-600 hover:text-purple-700"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditPost(p)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPostForMark(p);
                          setInputLiveUrl('');
                          setIsMarkPostedOpen(true);
                        }}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        Publish Now ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: AI SOCIAL STUDIO
          ========================================================================= */}
      {activeSubTab === 'ai' && (
        <div className="flex flex-col gap-4">
          {/* CRITICAL NOTE: Persistent & always visible */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-bold">Editorial Review Notice:</strong>{' '}
              Drafts are suggestions for review. Nothing is posted automatically.
            </div>
          </div>

          {/* Event Picker & Documentation Summary Card */}
          <SectionCard padding="18px">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Event for AI Content Generation
            </label>
            <select
              value={aiSelectedEventId}
              onChange={(e) => setAiSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none bg-white focus:border-purple-500 mb-3"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.venue})
                </option>
              ))}
            </select>

            {/* Event Description & Documentation Context Summary */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-col gap-1.5 mb-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Event Scope & Takeaways:</span>
                <span className="text-emerald-700 font-extrabold">
                  {selectedAiEvent.registeredUserIds.length || 180} RSVPs
                </span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {selectedAiEvent.description ||
                  'Advanced hands-on workshop covering open-source geospatial toolchains, RTK GNSS receivers, and digital terrain modeling.'}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200/50">
                <span>📍 {selectedAiEvent.venue}</span>
                <span>
                  🗓️{' '}
                  {new Date(selectedAiEvent.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                Editorial Voice & Tone:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Formal', 'Friendly', 'Energetic'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setAiTone(tone)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      aiTone === tone
                        ? 'bg-purple-50 text-purple-900 border-purple-300 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tone === 'Energetic' && '⚡ '}
                    {tone === 'Formal' && '🏛️ '}
                    {tone === 'Friendly' && '🤝 '}
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate CTA Button */}
            <button
              type="button"
              onClick={handleGenerateAiSuggestions}
              disabled={aiIsLoading}
              className="w-full mt-4 py-3 rounded-full font-bold text-xs bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75"
            >
              {aiIsLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Synthesizing Content from Event Documentation...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-300" />
                  <span>Suggest Content</span>
                </>
              )}
            </button>
          </SectionCard>

          {/* 1.2s Skeleton Loader */}
          {aiIsLoading && (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="p-4 rounded-2xl bg-white border border-slate-100 flex flex-col gap-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="h-8 bg-slate-100 rounded mt-2" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 flex flex-col gap-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-8 bg-slate-100 rounded mt-2" />
              </div>
            </div>
          )}

          {/* AI Generated Draft Cards */}
          {aiGeneratedCards && !aiIsLoading && (
            <div className="flex flex-col gap-3">
              {/* 1. Instagram Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#EEF1F5] shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700">
                    <Camera size={15} />
                    <span>Instagram Reel / Teaser Draft</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                    Social Copy
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  <p className="font-extrabold text-slate-900 mb-1">
                    {aiGeneratedCards.instagram.headline}
                  </p>
                  <p>{aiGeneratedCards.instagram.caption}</p>
                  <p className="font-semibold text-purple-700 mt-2">
                    {aiGeneratedCards.instagram.cta}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {aiGeneratedCards.instagram.hashtags.join(' ')}
                  </p>
                </div>

                {/* Action Buttons: Copy, Edit, Save as Draft, Mark as Posted, Regenerate */}
                <div className="flex items-center justify-between pt-1 gap-1 text-[11px] flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `${aiGeneratedCards.instagram.headline}\n\n${aiGeneratedCards.instagram.caption}\n\n${aiGeneratedCards.instagram.cta}\n\n${aiGeneratedCards.instagram.hashtags.join(' ')}`,
                        'Instagram Draft'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingDraftChannel('instagram');
                      setEditedCaption(
                        `${aiGeneratedCards.instagram.headline}\n\n${aiGeneratedCards.instagram.caption}\n\n${aiGeneratedCards.instagram.cta}`
                      );
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSaveAiDraftAsPost(
                        'Instagram',
                        `${aiGeneratedCards.instagram.headline}\n\n${aiGeneratedCards.instagram.caption}\n\n${aiGeneratedCards.instagram.cta}`,
                        aiGeneratedCards.instagram.hashtags
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 cursor-pointer font-bold"
                  >
                    <span>Save as Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleMarkAiDraftAsPosted(
                        'Instagram',
                        `${aiGeneratedCards.instagram.headline}\n\n${aiGeneratedCards.instagram.caption}`,
                        aiGeneratedCards.instagram.hashtags
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer font-bold"
                  >
                    <span>Mark as Posted</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateAiSuggestions}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-700 hover:bg-slate-50 cursor-pointer"
                    title="Regenerate"
                  >
                    <RotateCw size={13} />
                  </button>
                </div>
              </div>

              {/* 2. LinkedIn Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#EEF1F5] shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                    <Share2 size={15} />
                    <span>LinkedIn Professional Article / Update</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Professional
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  <p className="font-extrabold text-slate-900 mb-1">
                    {aiGeneratedCards.linkedin.headline}
                  </p>
                  <p>{aiGeneratedCards.linkedin.caption}</p>
                  <p className="font-semibold text-blue-800 mt-2">
                    {aiGeneratedCards.linkedin.cta}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {aiGeneratedCards.linkedin.hashtags.join(' ')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 gap-1 text-[11px] flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `${aiGeneratedCards.linkedin.headline}\n\n${aiGeneratedCards.linkedin.caption}\n\n${aiGeneratedCards.linkedin.cta}\n\n${aiGeneratedCards.linkedin.hashtags.join(' ')}`,
                        'LinkedIn Draft'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingDraftChannel('linkedin');
                      setEditedCaption(
                        `${aiGeneratedCards.linkedin.headline}\n\n${aiGeneratedCards.linkedin.caption}`
                      );
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSaveAiDraftAsPost(
                        'LinkedIn',
                        `${aiGeneratedCards.linkedin.headline}\n\n${aiGeneratedCards.linkedin.caption}`,
                        aiGeneratedCards.linkedin.hashtags
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 cursor-pointer font-bold"
                  >
                    <span>Save as Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleMarkAiDraftAsPosted(
                        'LinkedIn',
                        `${aiGeneratedCards.linkedin.headline}\n\n${aiGeneratedCards.linkedin.caption}`,
                        aiGeneratedCards.linkedin.hashtags
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer font-bold"
                  >
                    <span>Mark as Posted</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateAiSuggestions}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-700 hover:bg-slate-50 cursor-pointer"
                    title="Regenerate"
                  >
                    <RotateCw size={13} />
                  </button>
                </div>
              </div>

              {/* 3. Daily News Paragraph Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#EEF1F5] shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <Newspaper size={15} />
                    <span>College Press & Daily News Paragraph</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Daily Digest
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  <p className="font-extrabold text-slate-900 mb-1">
                    {aiGeneratedCards.dailyNews.title}
                  </p>
                  <p>{aiGeneratedCards.dailyNews.paragraph}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {aiGeneratedCards.dailyNews.hashtags.join(' ')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 gap-1 text-[11px] flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `${aiGeneratedCards.dailyNews.title}\n\n${aiGeneratedCards.dailyNews.paragraph}\n\n${aiGeneratedCards.dailyNews.hashtags.join(' ')}`,
                        'Daily News Paragraph'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addDailyNews({
                        title: aiGeneratedCards.dailyNews.title,
                        date: new Date().toISOString().split('T')[0],
                        eventId: selectedAiEvent.id,
                        eventTitle: selectedAiEvent.title,
                        author: `${currentUser.name} (AI Studio)`,
                        content: aiGeneratedCards.dailyNews.paragraph,
                        hashtags: aiGeneratedCards.dailyNews.hashtags,
                        status: 'published',
                      });
                      showToast('✓ Saved directly to Daily News Bulletins!');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer font-bold"
                  >
                    <span>Publish to Daily News</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateAiSuggestions}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-700 hover:bg-slate-50 cursor-pointer"
                    title="Regenerate"
                  >
                    <RotateCw size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: DAILY NEWS
          ========================================================================= */}
      {activeSubTab === 'news' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Published College Press Bulletins ({dailyNews.length})
            </span>
            <button
              type="button"
              onClick={() => setIsNewsModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer"
            >
              <Plus size={13} />
              <span>Write Bulletin</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {dailyNews.map((news) => (
              <div
                key={news.id}
                className="p-4 rounded-2xl bg-white border border-[#EEF1F5] shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 leading-tight">
                    {news.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {news.date}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {news.content}
                </p>

                {news.hashtags && news.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {news.hashtags.map((h, i) => (
                      <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Author: {news.author}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyText(`${news.title}\n\n${news.content}`, 'Bulletin')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                      title="Copy bulletin"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmNewsId(news.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete bulletin"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & BOTTOM SHEETS
          ========================================================================= */}

      {/* 1. Add / Edit Post BottomSheet */}
      <BottomSheet
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingPostId(null);
        }}
        title={editingPostId ? 'Edit Social Post' : 'Create Social Media Post'}
        subtitle="Schedule or publish content across official club channels"
      >
        <form onSubmit={handlePostFormSubmit} className="flex flex-col gap-3 py-1">
          {/* Target Event */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
            <select
              value={postEventId}
              onChange={(e) => setPostEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
            >
              <option value="">General Club Promotion (No Event)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Platform & Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
              <select
                value={postPlatform}
                onChange={(e) => setPostPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Other">Other (Web/Campus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value as SocialPostStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Posted">Posted (Live)</option>
              </select>
            </div>
          </div>

          {/* Caption Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Post Caption & Copy</label>
            <textarea
              required
              rows={4}
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              placeholder="Write the announcement hook, event details, venue, and call to action..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Schedule fields if Scheduled */}
          {postStatus === 'Scheduled' && (
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-purple-50/50 border border-purple-200/60">
              <div>
                <label className="block text-[11px] font-bold text-purple-900 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={postScheduledDate}
                  onChange={(e) => setPostScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-purple-900 mb-1">Broadcast Time</label>
                <input
                  type="time"
                  required
                  value={postScheduledTime}
                  onChange={(e) => setPostScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Live Link if Posted */}
          {postStatus === 'Posted' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Live Post Link (URL)</label>
              <input
                type="url"
                value={postLiveUrl}
                onChange={(e) => setPostLiveUrl(e.target.value)}
                placeholder="https://instagram.com/p/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition-all mt-1 cursor-pointer"
          >
            {editingPostId ? 'Save Changes' : postStatus === 'Posted' ? 'Publish Post Now' : 'Save to Content Schedule'}
          </button>
        </form>
      </BottomSheet>

      {/* 2. Mark as Posted BottomSheet */}
      <BottomSheet
        isOpen={isMarkPostedOpen}
        onClose={() => {
          setIsMarkPostedOpen(false);
          setTargetPostForMark(null);
        }}
        title="Mark Post as Published"
        subtitle={`Verify live link for ${targetPostForMark?.platform || 'Social Post'}`}
      >
        <form onSubmit={handleConfirmMarkPosted} className="flex flex-col gap-3 py-1">
          <p className="text-xs text-slate-600 leading-relaxed">
            Provide the live URL where this post is published. This will record the post as{' '}
            <strong className="text-emerald-700">Posted</strong> and display the live link chip.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Live Post URL</label>
            <input
              type="url"
              required
              value={inputLiveUrl}
              onChange={(e) => setInputLiveUrl(e.target.value)}
              placeholder="https://instagram.com/p/geohub_live"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-1 cursor-pointer"
          >
            Confirm & Mark as Live Posted
          </button>
        </form>
      </BottomSheet>

      {/* 3. In-Place AI Draft Editor Modal */}
      {editingDraftChannel && (
        <BottomSheet
          isOpen={Boolean(editingDraftChannel)}
          onClose={() => setEditingDraftChannel(null)}
          title="Edit AI Suggested Copy"
          subtitle="Refine wording before saving as draft or publishing"
        >
          <div className="flex flex-col gap-3 py-1">
            <textarea
              rows={6}
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const channel = editingDraftChannel === 'instagram' ? 'Instagram' : 'LinkedIn';
                  addPost({
                    eventId: selectedAiEvent.id,
                    eventTitle: selectedAiEvent.title,
                    platform: channel,
                    status: 'Draft',
                    caption: editedCaption,
                    authorName: `${currentUser.name} (AI Studio)`,
                    createdAt: new Date().toISOString(),
                  });
                  showToast('✓ Saved edited draft to Posts!');
                  setEditingDraftChannel(null);
                }}
                className="flex-1 py-2.5 rounded-full font-bold text-xs bg-purple-700 text-white hover:bg-purple-800"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setEditingDraftChannel(null)}
                className="px-4 py-2.5 rounded-full font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* 4. Write Daily News Bulletin BottomSheet */}
      <BottomSheet
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        title="Author Daily Chapter News"
        subtitle="Official college press bulletin and media digest"
      >
        <form onSubmit={handleNewsFormSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              required
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              placeholder="e.g. GeoHub Concludes Regional LiDAR Drone Survey"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Related Event</label>
            <select
              value={newsEventId}
              onChange={(e) => setNewsEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
            >
              <option value="">General Club Bulletin</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">News Article Body</label>
            <textarea
              required
              rows={5}
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="Write formal chapter bulletin with date, venue, attendance, and outcomes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-amber-700 text-white shadow-sm hover:bg-amber-800 transition-all mt-1 cursor-pointer"
          >
            Publish Daily Bulletin
          </button>
        </form>
      </BottomSheet>

      {/* Delete Post Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmPostId)}
        title="Delete Social Media Post?"
        message="Are you sure you want to delete this post? This action will remove it from the schedule and cannot be undone."
        confirmLabel="Delete Post"
        cancelLabel="Keep Post"
        isDanger
        onConfirm={() => {
          if (deleteConfirmPostId) {
            deletePost(deleteConfirmPostId);
            showToast('✓ Post deleted from schedule');
            setDeleteConfirmPostId(null);
          }
        }}
        onClose={() => setDeleteConfirmPostId(null)}
      />

      {/* Delete News Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmNewsId)}
        title="Delete Daily News Bulletin?"
        message="Are you sure you want to remove this bulletin from the official college press digest?"
        confirmLabel="Delete Bulletin"
        cancelLabel="Keep Bulletin"
        isDanger
        onConfirm={() => {
          if (deleteConfirmNewsId) {
            deleteDailyNews(deleteConfirmNewsId);
            showToast('✓ Bulletin removed');
            setDeleteConfirmNewsId(null);
          }
        }}
        onClose={() => setDeleteConfirmNewsId(null)}
      />
    </div>
  );
};
