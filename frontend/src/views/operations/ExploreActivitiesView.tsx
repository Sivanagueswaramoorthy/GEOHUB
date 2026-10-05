import React, { useState } from 'react';
import {
  Scan,
  QrCode,
  ClipboardList,
  Image,
  CheckSquare,
  BarChart3,
  Calendar,
  Users2,
  ListTodo,
  MessageSquare,
  FileText,
  DollarSign,
  Bell,
  Settings,
  Download,
  Award,
  Sparkles,
  UserCheck,
  Upload,
  Newspaper,
  FileCheck,
  Video,
  Camera,
  Trash2,
  Edit2,
  Copy,
  Printer,
  MapPin,
  Check,
  Receipt,
  PackagePlus,
  Layers,
  X,
  Send,
  Archive,
  Images,
  Clock,
  Share2,
  ThumbsUp,
  CheckCircle2,
  AlertCircle,
  Filter,
  Plus,
  Star,
  Lock,
  ShieldCheck,
  Eye,
  RefreshCw,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { SocialPlatform, SocialPostStatus } from '../../types';
import {
  Overline,
  ShortcutTile,
  CategoryCard,
  ModuleTile,
  BottomSheet,
  Toast,
  ConfirmDialog,
} from '../../components';

export const ExploreActivitiesView: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    attendance,
    approvals,
    tasks,
    users,
    events,
    gallery,
    docTemplates,
    expenses,
    stockItems,
    posts,
    campaigns,
    dailyNews,
    requestBudgetChange,
    uploadGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    changeStudentPost,
    addPost,
    updatePost,
    deletePost,
    markPostPublished,
    updateTaskStatus,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const isFaculty = currentUser.role === 'super_admin' || currentUser.role === 'faculty';
  const isDocLead =
    currentUser.role === 'documentation' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('documentation'));
  const isTreasurer =
    currentUser.role === 'treasurer' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('treasurer'));
  const isPromotion =
    currentUser.role === 'social_media' ||
    (currentUser.role === 'team_admin' &&
      (currentUser.team === 'Promotion' ||
        Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion')))) ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion'));
  const isStudent = currentUser.role === 'member';

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Treasurer Operations Modals & State
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isAuditReportExportOpen, setIsAuditReportExportOpen] = useState(false);
  const [isReceiptsVaultOpen, setIsReceiptsVaultOpen] = useState(false);
  const [isOpsStockModalOpen, setIsOpsStockModalOpen] = useState(false);
  const [isOpsPurchaseHistoryOpen, setIsOpsPurchaseHistoryOpen] = useState(false);
  const [activeReceiptPreview, setActiveReceiptPreview] = useState<string | null>(null);

  // Allocation Request Sub-form State
  const [allocRequestTeam, setAllocRequestTeam] = useState('Promotion');
  const [allocRequestAmount, setAllocRequestAmount] = useState('50000');
  const [allocRequestReason, setAllocRequestReason] = useState('');
  const [isAllocRequestFormOpen, setIsAllocRequestFormOpen] = useState(false);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  // Promotion Operations State & Handlers
  const [isContentCalendarOpen, setIsContentCalendarOpen] = useState(false);
  const [isPostsStudioOpen, setIsPostsStudioOpen] = useState(false);
  const [isAiSuggestionsOpen, setIsAiSuggestionsOpen] = useState(false);

  // Content Calendar State
  const [calendarFilterPlatform, setCalendarFilterPlatform] = useState<string>('All');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>('All');
  const [isScheduleDropOpen, setIsScheduleDropOpen] = useState(false);
  const [dropEventId, setDropEventId] = useState(events[0]?.id || '');
  const [dropPlatform, setDropPlatform] = useState<SocialPlatform>('Instagram');
  const [dropDate, setDropDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [dropTime, setDropTime] = useState('11:00');
  const [dropCaption, setDropCaption] = useState('');
  const [dropMediaUrl, setDropMediaUrl] = useState('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80');

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

  // Student Operations Modals & State
  const [isStudentPassOpen, setIsStudentPassOpen] = useState(false);
  const [isStudentDutiesOpen, setIsStudentDutiesOpen] = useState(false);
  const [isStudentRegHistoryOpen, setIsStudentRegHistoryOpen] = useState(false);
  const [isStudentFeedbackOpen, setIsStudentFeedbackOpen] = useState(false);
  const [isGateScannerDutyWarningOpen, setIsGateScannerDutyWarningOpen] = useState(false);

  // Student Feedback State
  const [studentFeedbackEventId, setStudentFeedbackEventId] = useState(events[0]?.id || '');
  const [studentFeedbackRating, setStudentFeedbackRating] = useState(5);
  const [studentFeedbackCategory, setStudentFeedbackCategory] = useState('Workshop Quality');
  const [studentFeedbackComment, setStudentFeedbackComment] = useState('');

  // Faculty/Coordinator Modals
  const [isFeedbackSummaryOpen, setIsFeedbackSummaryOpen] = useState(false);

  const [isCampaignReachExportOpen, setIsCampaignReachExportOpen] = useState(false);
  const [isMemoriesCreatorOpen, setIsMemoriesCreatorOpen] = useState(false);
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

  // Settings Modal State (Faculty)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [tenurePeriod, setTenurePeriod] = useState('Fall 2026 - Spring 2027');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [gateSmsAlerts, setGateSmsAlerts] = useState(false);

  // Posts & Squad Leads Modal State (Faculty)
  const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);
  const [selectedStudentForPost, setSelectedStudentForPost] = useState(users[0]?.uid || '');
  const [targetPost, setTargetPost] = useState('Promotion Lead');
  const [targetRole, setTargetRole] = useState<'team_admin' | 'member'>('team_admin');

  // ==========================================
  // DOCUMENTATION LEAD MODALS & STATES
  // ==========================================
  // 1. Templates Modal
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);

  // 2. Documentation Update Modal
  const [isDocUpdateOpen, setIsDocUpdateOpen] = useState(false);
  const [docUpdateEventId, setDocUpdateEventId] = useState(events[0]?.id || 'event_02');
  const [docAuditStatuses, setDocAuditStatuses] = useState<Record<string, 'missing' | 'draft' | 'submitted'>>({
    report: 'draft',
    photos: 'submitted',
    videos: 'draft',
    dailyNews: 'submitted',
    mom: 'submitted',
    feedback: 'missing',
    attendanceSheet: 'submitted',
  });

  // 3. Daily News Editor Modal
  const [isDailyNewsOpen, setIsDailyNewsOpen] = useState(false);
  const [newsTitle, setNewsTitle] = useState('Field Expedition Drone Permits Sanctioned');
  const [newsEventId, setNewsEventId] = useState(events[0]?.id || 'event_02');
  const [newsHeadline, setNewsHeadline] = useState('DGCA clear zones confirmed for upcoming campus aerial canopy mapping survey.');
  const [newsContent, setNewsContent] = useState('The College Directorate has officially granted GeoHub clearance to operate unmanned aerial mapping receivers across Zone B and C.');

  // 4. MoM Author Modal
  const [isMomAuthorOpen, setIsMomAuthorOpen] = useState(false);
  const [momTitle, setMomTitle] = useState('Core Committee Preparation: QGIS Workshop');
  const [momVenue, setMomVenue] = useState('Grand Auditorium Annex');
  const [momDate, setMomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [momAttendees, setMomAttendees] = useState('Dr. Sarah Jenkins, Alex Rivera, Aarav Patel, Elena Rostova, David Chen');
  const [momAgenda, setMomAgenda] = useState('1. Turnstile gate attendance terminals\n2. Geotagged photographic documentation\n3. Pre-event briefing and attendee roster');
  const [momDecisions, setMomDecisions] = useState('1. All camera units must record GPS coordinates.\n2. Documentation squad will publish daily news bulletin within 4 hours of closing.');
  const [momActions, setMomActions] = useState('Aarav Patel: Finalize drone camera calibration | Elena: Gate terminal setup');

  // 5. Photo Upload Modal (Geotagged or Normal with progress)
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('Laboratory Spectrometer Calibration');
  const [photoEventId, setPhotoEventId] = useState(events[0]?.id || 'event_02');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80');
  const [photoGeotag, setPhotoGeotag] = useState(true);
  const [photoCoords, setPhotoCoords] = useState({ lat: 13.0827, lng: 80.2707, locationName: 'Main Campus Grand Auditorium' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // 6. Video Links Modal (Validated links)
  const [isVideoLinksOpen, setIsVideoLinksOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('Drone Corridor 4K Aerial Orthomosaic Stream');
  const [videoEventId, setVideoEventId] = useState(events[0]?.id || 'event_03');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [videoError, setVideoError] = useState<string | null>(null);

  // 7. Gallery Manager Modal (Edit captions, delete with confirm)
  const [isGalleryManagerOpen, setIsGalleryManagerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // 8. PDF Briefs Export Modal
  const [isPdfBriefsOpen, setIsPdfBriefsOpen] = useState(false);
  const [briefEventId, setBriefEventId] = useState(events[0]?.id || 'event_02');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleModuleClick = (tabKey: string) => {
    if (tabKey === 'settings' && !perms.canManageSettings) {
      showToast("You don't have access");
      return;
    }
    if ((tabKey === 'posts' || tabKey === 'assign_post') && !perms.canAssignPosts) {
      showToast("You don't have access");
      return;
    }
    if (tabKey === 'approvals' && !perms.canReviewExecutiveApprovals) {
      setActiveTab('members');
      return;
    }
    setActiveTab(tabKey);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('✓ Chapter governance settings updated!');
    setIsSettingsOpen(false);
  };

  const handleAssignPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPost) return;
    const targetUser = users.find((u) => u.uid === selectedStudentForPost);
    if (!targetUser) return;
    changeStudentPost(targetUser.uid, targetPost, targetRole);
    showToast(`✓ Confirmed: Assigned ${targetPost} to ${targetUser.name}!`);
    setIsPostsModalOpen(false);
  };

  // Photo Upload Handler with Geotag & Progress Animation
  const handlePhotoUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      showToast('Please provide a title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    // If geotag is enabled, attempt browser geolocation
    if (photoGeotag && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPhotoCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            locationName: 'Detected Browser GPS Location',
          });
        },
        () => {
          // Fallback to campus coordinates
          setPhotoCoords({
            lat: 13.0827,
            lng: 80.2707,
            locationName: 'Main Campus Grand Auditorium',
          });
        },
        { timeout: 3000 }
      );
    }

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const ev = events.find((item) => item.id === photoEventId);
          uploadGalleryItem({
            title: photoTitle,
            eventId: photoEventId,
            eventTitle: ev?.title || 'Campus Expedition',
            academicYear: '2026-2027',
            category: 'photos',
            mediaType: 'photo',
            submissionStatus: 'submitted',
            geotag: photoGeotag ? photoCoords : undefined,
            caption: photoTitle,
            url: photoUrl,
            uploadedByName: currentUser.name,
            fileSizeBytes: '4.8 MB',
          });
          setIsPhotoUploadOpen(false);
          setUploadProgress(0);
          showToast(`✓ Uploaded & Geotagged: "${photoTitle}"`);
          return 0;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Video Link Submit with Regex Validation
  const handleVideoLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com)\/.+$/i;
    if (!urlPattern.test(videoUrl.trim())) {
      setVideoError('Please enter a valid YouTube, Vimeo, or Google Drive link.');
      return;
    }
    setVideoError(null);
    const ev = events.find((item) => item.id === videoEventId);
    uploadGalleryItem({
      title: videoTitle,
      eventId: videoEventId,
      eventTitle: ev?.title || 'Campus Expedition',
      academicYear: '2026-2027',
      category: 'videos',
      mediaType: 'video',
      submissionStatus: 'submitted',
      caption: `Stream link: ${videoUrl}`,
      url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      uploadedByName: currentUser.name,
      fileSizeBytes: 'Streaming Link',
    });
    setIsVideoLinksOpen(false);
    showToast(`✓ Video link validated & added to media archives!`);
  };

  // Daily News Publish Handler
  const handleDailyNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ev = events.find((item) => item.id === newsEventId);
    uploadGalleryItem({
      title: newsTitle,
      eventId: newsEventId,
      eventTitle: ev?.title || 'Chapter Activities',
      academicYear: '2026-2027',
      category: 'reports',
      mediaType: 'news',
      submissionStatus: 'verified',
      caption: newsHeadline,
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      uploadedByName: currentUser.name,
      fileSizeBytes: '540 KB',
    });
    setIsDailyNewsOpen(false);
    showToast(`✓ Daily Chapter News bulletin published!`);
  };

  // MoM Author Submit & Export
  const handleMomAuthorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadGalleryItem({
      title: `MoM: ${momTitle}`,
      eventId: events[0]?.id || 'event_01',
      eventTitle: momTitle,
      academicYear: '2026-2027',
      category: 'reports',
      mediaType: 'mom',
      submissionStatus: 'verified',
      caption: `MoM recorded by ${currentUser.name} for ${momTitle}`,
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      uploadedByName: currentUser.name,
      fileSizeBytes: '1.2 MB',
    });
    setIsMomAuthorOpen(false);
    showToast(`✓ Minutes of Meeting saved and archived!`);
  };

  return (
    <div className="flex flex-col gap-5">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="flex flex-col pt-1">
        <div className="mb-1.5">
          <Overline pill dot>
            {isPromotion
              ? 'PROMOTION & MEDIA OPERATIONS'
              : isTreasurer
              ? 'FISCAL & TREASURY OPERATIONS'
              : isDocLead
              ? 'DOCUMENTATION & ARCHIVAL OPERATIONS'
              : isStudent
              ? 'STUDENT VOLUNTEER OPERATIONS'
              : 'Activity Hub'}
          </Overline>
        </div>

        <h1
          className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight"
          style={{ fontFamily: 'var(--font-family)' }}
        >
          {isPromotion
            ? 'Promotion Operations Hub'
            : isTreasurer
            ? 'Treasurer Operations Hub'
            : isDocLead
            ? 'Documentation Hub'
            : isStudent
            ? 'Student Operations Hub'
            : 'Explore Activities'}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {isPromotion
            ? 'Social broadcasts, campaign calendars, media storytelling & engagement reach'
            : isTreasurer
            ? 'Manage vouchers, audit statements, inventory stock & allocation requests'
            : isDocLead
            ? 'Manage templates, verify media geotags, author daily bulletins & MoMs'
            : isStudent
            ? 'Digital student pass, duty checkpoints, event feedback & registration history'
            : 'Browse modules by category and jump straight into the task you need.'}
        </p>
      </div>

      {/* =========================================================================
          BRANCH: PROMOTION LEAD OPERATIONS HUB
          ========================================================================= */}
      {isPromotion ? (
        <>
          {/* Shortcuts (row of 4): New Post, Calendar, AI Drafts, Campaign Report */}
          <div
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              maxWidth: '480px',
              gap: '10px',
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

          {/* Category 1: Campaigns (4 modules: Content Calendar, Posts, AI Suggestions, Daily News) */}
          <CategoryCard title="Campaigns" countBadge={4}>
            <ModuleTile
              title="Content Calendar"
              icon={<Calendar size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge={`${campaigns.length} Plans`}
              onClick={() => setIsContentCalendarOpen(true)}
            />

            <ModuleTile
              title="Posts"
              icon={<Send size={20} />}
              iconBg="#F5F3FF"
              iconBorder="#DDD6FE"
              accentColor="#7C3AED"
              badge={`${posts.length} Posts`}
              onClick={() => setIsPostsStudioOpen(true)}
            />

            <ModuleTile
              title="AI Suggestions"
              icon={<Sparkles size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              accentColor="#D97706"
              badge="AI Social Studio"
              onClick={() => setIsAiSuggestionsOpen(true)}
            />

            <ModuleTile
              title="Daily News"
              icon={<Newspaper size={20} />}
              iconBg="#E8FBF8"
              iconBorder="#99F6E4"
              accentColor="#0D9488"
              badge={`${dailyNews.length} Bulletins`}
              onClick={() => setIsDailyNewsOpen(true)}
            />
          </CategoryCard>

          {/* Category 2: Media (2 modules: Memories Creator, Media Archives) */}
          <CategoryCard title="Media" countBadge={2}>
            <ModuleTile
              title="Memories Creator"
              icon={<Images size={20} />}
              iconBg="#FDF2F8"
              iconBorder="#FBCFE8"
              accentColor="#DB2777"
              badge="Story Builder"
              onClick={() => setIsMemoriesCreatorOpen(true)}
            />

            <ModuleTile
              title="Media Archives"
              icon={<Archive size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#6D28D9"
              badge={`${gallery.length} Assets`}
              onClick={() => setActiveTab('archives')}
            />
          </CategoryCard>

          {/* Category 3: Attendance & Gates (2 modules: Gate Scanner, My Pass) */}
          <CategoryCard title="Attendance & Gates" countBadge={2}>
            <ModuleTile
              title="Gate Scanner"
              icon={<Scan size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge="Turnstile Check-in"
              onClick={() => setActiveTab('scan_qr')}
            />

            <ModuleTile
              title="My Pass"
              icon={<QrCode size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="Dynamic QR"
              onClick={() => setActiveTab('my_qr')}
            />
          </CategoryCard>

          {/* Category 4: Communication (2 modules: Forum, Notifications) */}
          <CategoryCard title="Communication" countBadge={2}>
            <ModuleTile
              title="Forum (post and pin)"
              icon={<MessageSquare size={20} />}
              iconBg="#F5F3FF"
              iconBorder="#DDD6FE"
              accentColor="#7C3AED"
              badge="Post & Pin"
              onClick={() => setActiveTab('forum')}
            />

            <ModuleTile
              title="Notifications"
              icon={<Bell size={20} />}
              iconBg="#FEF2F2"
              iconBorder="#FECACA"
              accentColor="#DC2626"
              badge="Broadcasts"
              onClick={() => handleModuleClick('notifications')}
            />
          </CategoryCard>

          {/* Category 5: Reports (1 module: Campaign Reach export) */}
          <CategoryCard title="Reports" countBadge={1}>
            <ModuleTile
              title="Campaign Reach export"
              icon={<Download size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="PDF, Word, Excel"
              onClick={() => setIsCampaignReachExportOpen(true)}
            />
          </CategoryCard>
        </>
      ) : isTreasurer ? (
        <>
          {/* Shortcuts (row of 4): Add Expense, Receipts, Stock, Audit Report */}
          <div className="flex items-center justify-between gap-2.5 overflow-x-auto no-scrollbar py-1">
            <ShortcutTile
              label="Add Expense"
              icon={<Receipt size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              iconColor="#065F46"
              onClick={() => setActiveTab('treasurer')}
            />

            <ShortcutTile
              label="Receipts"
              icon={<FileText size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              iconColor="#5B21B6"
              badge={expenses.length}
              onClick={() => setIsReceiptsVaultOpen(true)}
            />

            <ShortcutTile
              label="Stock"
              icon={<PackagePlus size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              iconColor="#92400E"
              badge={stockItems.filter((s) => s.quantity <= s.minThreshold).length || undefined}
              onClick={() => setIsOpsStockModalOpen(true)}
            />

            <ShortcutTile
              label="Audit Report"
              icon={<BarChart3 size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              iconColor="#1D4ED8"
              onClick={() => setIsAuditReportExportOpen(true)}
            />
          </div>

          {/* Category 1: Finance (3 modules) */}
          <CategoryCard title="Finance" countBadge={3}>
            <ModuleTile
              title="Expenses"
              icon={<DollarSign size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge={`${expenses.length} Vouchers`}
              onClick={() => setActiveTab('treasurer')}
            />

            <ModuleTile
              title="Budget Overview"
              icon={<BarChart3 size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge="₹4,50,000"
              onClick={() => setActiveTab('treasurer')}
            />

            <ModuleTile
              title="Allocation Requests"
              icon={<Layers size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#7C3AED"
              badge="Set by Faculty"
              onClick={() => setIsAllocationModalOpen(true)}
            />
          </CategoryCard>

          {/* Category 2: Stock & Purchases (2 modules) */}
          <CategoryCard title="Stock & Purchases" countBadge={2}>
            <ModuleTile
              title="Stock Items"
              icon={<PackagePlus size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              accentColor="#92400E"
              badge={`${stockItems.length} Cataloged`}
              onClick={() => setIsOpsStockModalOpen(true)}
            />

            <ModuleTile
              title="Purchase History"
              icon={<FileText size={20} />}
              iconBg="#E8FBF8"
              iconBorder="#99F6E4"
              accentColor="#0D9488"
              badge="Ledger"
              onClick={() => setIsOpsPurchaseHistoryOpen(true)}
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
              badge="Camera"
              onClick={() => handleModuleClick('scan_qr')}
            />

            <ModuleTile
              title="My Pass"
              icon={<QrCode size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#7C3AED"
              badge="30s Token"
              onClick={() => handleModuleClick('my_qr')}
            />
          </CategoryCard>

          {/* Category 4: Communication (2 modules) */}
          <CategoryCard title="Communication" countBadge={2}>
            <ModuleTile
              title="Forum"
              icon={<MessageSquare size={20} />}
              iconBg="#ECFDF5"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="Discussions"
              onClick={() => handleModuleClick('forum')}
            />

            <ModuleTile
              title="Notifications"
              icon={<Bell size={20} />}
              iconBg="#FEF2F2"
              iconBorder="#FECACA"
              accentColor="#DC2626"
              badge="Bulletins"
              onClick={() => handleModuleClick('notifications')}
            />
          </CategoryCard>

          {/* Category 5: Reports (1 module) */}
          <CategoryCard title="Reports" countBadge={1}>
            <ModuleTile
              title="Fiscal Audit export"
              icon={<Download size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="PDF, Word, Excel"
              onClick={() => setIsAuditReportExportOpen(true)}
            />
          </CategoryCard>
        </>
      ) : isDocLead ? (
        <>
          {/* Shortcuts (row of 4): Templates, Daily News, Upload, Checklists */}
          <div
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              maxWidth: '480px',
              gap: '10px',
            }}
          >
            <ShortcutTile
              label="Templates"
              icon={<FileText size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              iconColor="#065F46"
              onClick={() => setIsTemplatesModalOpen(true)}
            />

            <ShortcutTile
              label="Daily News"
              icon={<Newspaper size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              iconColor="#92400E"
              onClick={() => setIsDailyNewsOpen(true)}
            />

            <ShortcutTile
              label="Upload"
              icon={<Upload size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              iconColor="#5B21B6"
              onClick={() => setIsPhotoUploadOpen(true)}
            />

            <ShortcutTile
              label="Checklists"
              icon={<FileCheck size={20} />}
              iconBg="#E8FBF8"
              iconBorder="#99F6E4"
              iconColor="#0D9488"
              onClick={() => setIsDocUpdateOpen(true)}
            />
          </div>

          {/* Category 1: Documentation (4 modules) */}
          <CategoryCard title="Documentation" countBadge={4}>
            <ModuleTile
              title="Templates"
              icon={<FileText size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="Prefilled"
              onClick={() => setIsTemplatesModalOpen(true)}
            />

            <ModuleTile
              title="Documentation Update"
              icon={<FileCheck size={20} />}
              iconBg="#E8FBF8"
              iconBorder="#99F6E4"
              accentColor="#0D9488"
              badge="Status Audit"
              onClick={() => setIsDocUpdateOpen(true)}
            />

            <ModuleTile
              title="Daily News editor"
              icon={<Newspaper size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              accentColor="#92400E"
              badge="Publish"
              onClick={() => setIsDailyNewsOpen(true)}
            />

            <ModuleTile
              title="MoM Author"
              icon={<Calendar size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#5B21B6"
              badge="Full Author & Export"
              onClick={() => setIsMomAuthorOpen(true)}
            />
          </CategoryCard>

          {/* Category 2: Media Archives (3 modules) */}
          <CategoryCard title="Media Archives" countBadge={3}>
            <ModuleTile
              title="Photo Upload"
              icon={<Camera size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge="Geotagged / Normal"
              onClick={() => setIsPhotoUploadOpen(true)}
            />

            <ModuleTile
              title="Video Links"
              icon={<Video size={20} />}
              iconBg="#F5F3FF"
              iconBorder="#DDD1FF"
              accentColor="#7C3AED"
              badge="Validated Links"
              onClick={() => setIsVideoLinksOpen(true)}
            />

            <ModuleTile
              title="Gallery Manager"
              icon={<Image size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              accentColor="#B45309"
              badge={`${gallery.length} items`}
              onClick={() => setIsGalleryManagerOpen(true)}
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
              badge="Camera"
              onClick={() => handleModuleClick('scan_qr')}
            />

            <ModuleTile
              title="My Pass"
              icon={<QrCode size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#7C3AED"
              badge="30s Token"
              onClick={() => handleModuleClick('my_qr')}
            />
          </CategoryCard>

          {/* Category 4: Communication (2 modules) */}
          <CategoryCard title="Communication" countBadge={2}>
            <ModuleTile
              title="Forum"
              icon={<MessageSquare size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#1D4ED8"
              badge="Post & Pin"
              onClick={() => handleModuleClick('forum')}
            />

            <ModuleTile
              title="Notifications"
              icon={<Bell size={20} />}
              iconBg="#FEF2F2"
              iconBorder="#FECACA"
              accentColor="#DC2626"
              badge="Advisories"
              onClick={() => handleModuleClick('notifications')}
            />
          </CategoryCard>

          {/* Category 5: Reports (1 module) */}
          <CategoryCard title="Reports" countBadge={1}>
            <ModuleTile
              title="PDF Briefs export"
              icon={<Download size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="Official Dossier"
              onClick={() => setIsPdfBriefsOpen(true)}
            />
          </CategoryCard>
        </>
      ) : isStudent ? (
        /* =========================================================================
           BRANCH: STUDENT VOLUNTEER OPERATIONS HUB
           ========================================================================= */
        <>
          {/* Shortcuts (row of 4): My Pass, My Duties, Feedback, Forum */}
          <div
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              maxWidth: '480px',
              gap: '10px',
            }}
          >
            <ShortcutTile
              label="My Pass"
              icon={<QrCode size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              iconColor="#7C3AED"
              onClick={() => setIsStudentPassOpen(true)}
            />

            <ShortcutTile
              label="My Duties"
              icon={<ListTodo size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              iconColor="#2563EB"
              badge={tasks.filter((t) => t.status !== 'done').length || undefined}
              onClick={() => setIsStudentDutiesOpen(true)}
            />

            <ShortcutTile
              label="Feedback"
              icon={<Star size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              iconColor="#D97706"
              onClick={() => setIsStudentFeedbackOpen(true)}
            />

            <ShortcutTile
              label="Forum"
              icon={<MessageSquare size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              iconColor="#059669"
              onClick={() => setActiveTab('forum')}
            />
          </div>

          {/* Category 1: Gate & Pass (2 modules: My Pass, Gate Scanner) */}
          <CategoryCard title="Gate & Pass" countBadge={2}>
            <ModuleTile
              title="My Pass"
              icon={<QrCode size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#7C3AED"
              badge="Dynamic QR"
              onClick={() => setIsStudentPassOpen(true)}
            />

            <ModuleTile
              title="Gate Scanner"
              icon={<Scan size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge="Turnstile Gate"
              onClick={() => {
                const hasAttendanceDuty = tasks.some(
                  (t) =>
                    t.assigneeId === currentUser.uid &&
                    (t.title.toLowerCase().includes('gate') ||
                      t.title.toLowerCase().includes('scanner') ||
                      t.title.toLowerCase().includes('attendance'))
                );
                if (hasAttendanceDuty) {
                  setActiveTab('scan_qr');
                } else {
                  setIsGateScannerDutyWarningOpen(true);
                }
              }}
            />
          </CategoryCard>

          {/* Category 2: Events & Duties (2 modules: My Duties, Registration History) */}
          <CategoryCard title="Events & Duties" countBadge={2}>
            <ModuleTile
              title="My Duties"
              icon={<ListTodo size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge={`${tasks.filter((t) => t.status !== 'done').length} Pending`}
              onClick={() => setIsStudentDutiesOpen(true)}
            />

            <ModuleTile
              title="Registration History"
              icon={<FileCheck size={20} />}
              iconBg="#E8FBF8"
              iconBorder="#99F6E4"
              accentColor="#0D9488"
              badge="3 Events"
              onClick={() => setIsStudentRegHistoryOpen(true)}
            />
          </CategoryCard>

          {/* Category 3: Community & Media (2 modules: Forum, Memories) */}
          <CategoryCard title="Community & Media" countBadge={2}>
            <ModuleTile
              title="Forum (Discussions)"
              icon={<MessageSquare size={20} />}
              iconBg="#F5F3FF"
              iconBorder="#DDD6FE"
              accentColor="#7C3AED"
              badge="Discussions"
              onClick={() => setActiveTab('forum')}
            />

            <ModuleTile
              title="Event Memories"
              icon={<Images size={20} />}
              iconBg="#FDF2F8"
              iconBorder="#FBCFE8"
              accentColor="#DB2777"
              badge={`${gallery.length} Photos`}
              onClick={() => setActiveTab('gallery')}
            />
          </CategoryCard>

          {/* Category 4: Feedback (1 module: Event Feedback) */}
          <CategoryCard title="Feedback" countBadge={1}>
            <ModuleTile
              title="Event Feedback"
              icon={<Sparkles size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="Rate Experience"
              onClick={() => setIsStudentFeedbackOpen(true)}
            />
          </CategoryCard>
        </>
      ) : (
        /* =========================================================================
           BRANCH B: FACULTY & COORDINATOR OPERATIONS (EXISTING PRESERVED)
           ========================================================================= */
        <>
          {/* Shortcuts (row of 4): Team Leaders, Approvals / Join Requests, Reports, Squads */}
          <div
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              maxWidth: '480px',
              gap: '10px',
            }}
          >
            <ShortcutTile
              label="Team Leaders"
              icon={<Award size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              iconColor="#5B21B6"
              onClick={() => handleModuleClick('teams')}
            />

            {perms.canReviewExecutiveApprovals ? (
              <ShortcutTile
                label="Approvals"
                icon={<CheckSquare size={20} />}
                iconBg="#FFF8E6"
                iconBorder="#FDE68A"
                iconColor="#92400E"
                badge={approvals.filter((a) => a.status === 'pending').length}
                onClick={() => handleModuleClick('approvals')}
              />
            ) : (
              <ShortcutTile
                label="Join Requests"
                icon={<UserCheck size={20} />}
                iconBg="#FFF8E6"
                iconBorder="#FDE68A"
                iconColor="#92400E"
                badge={3}
                onClick={() => handleModuleClick('members')}
              />
            )}

            <ShortcutTile
              label="Reports"
              icon={<BarChart3 size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              iconColor="#065F46"
              onClick={() => handleModuleClick('reports')}
            />

            <ShortcutTile
              label="Squads"
              icon={<Users2 size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              iconColor="#1D4ED8"
              onClick={() => handleModuleClick('teams')}
            />
          </div>

          {/* Category 1: Attendance & Gates (2 modules) */}
          <CategoryCard title="Attendance & Gates" countBadge={2}>
            <ModuleTile
              title="Gate Scanner"
              icon={<Scan size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge="Camera"
              onClick={() => handleModuleClick('scan_qr')}
            />

            <ModuleTile
              title={isFaculty ? 'Advisor Pass' : 'My Pass'}
              icon={<QrCode size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#7C3AED"
              badge="30s Token"
              onClick={() => handleModuleClick('my_qr')}
            />
          </CategoryCard>

          {/* Category 2: Gate Logs & Archives (2 modules) */}
          <CategoryCard title="Gate Logs & Archives" countBadge={2}>
            <ModuleTile
              title="Live Gate Logs"
              icon={<ClipboardList size={20} />}
              iconBg="#E8FBF8"
              iconBorder="#99F6E4"
              accentColor="#0D9488"
              badge={`${attendance.length} records`}
              onClick={() => handleModuleClick('attendance')}
            />

            <ModuleTile
              title="Media Archives"
              icon={<Image size={20} />}
              iconBg="#FFF8E6"
              iconBorder="#FDE68A"
              accentColor="#92400E"
              badge="Photo/Video"
              onClick={() => handleModuleClick('gallery')}
            />
          </CategoryCard>

          {/* Category 3: Events & Duties (3 modules) */}
          <CategoryCard title="Events & Duties" countBadge={3}>
            <ModuleTile
              title="Duty Roster"
              icon={<ListTodo size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#2563EB"
              badge={`${tasks.filter((t) => t.status !== 'done').length} tasks`}
              onClick={() => handleModuleClick('tasks')}
            />

            <ModuleTile
              title="Meetings & MoM"
              icon={<Calendar size={20} />}
              iconBg="#F5F3FF"
              iconBorder="#DDD1FF"
              accentColor="#6D28D9"
              badge="Agendas"
              onClick={() => handleModuleClick('meetings')}
            />

            <ModuleTile
              title="Feedback Summary"
              icon={<Sparkles size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="4.9 / 5.0"
              onClick={() => setIsFeedbackSummaryOpen(true)}
            />
          </CategoryCard>

          {/* Category 4: Governance */}
          <CategoryCard title="Governance" countBadge={perms.canManageSettings ? 4 : 2}>
            <ModuleTile
              title={perms.canAssignPosts ? 'Posts & Squad Leads' : 'Squad Leads'}
              icon={<Award size={20} />}
              iconBg="#F3EEFF"
              iconBorder="#DDD1FF"
              accentColor="#5B21B6"
              badge={perms.canAssignPosts ? '5 Leads' : 'Read-only'}
              onClick={() => setIsPostsModalOpen(true)}
            />

            <ModuleTile
              title={perms.canEditBudget ? 'Budget Audit' : 'Budget View'}
              icon={<DollarSign size={20} />}
              iconBg="#ECFDF5"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge={perms.canEditBudget ? '₹45k Total' : 'View only'}
              onClick={() => handleModuleClick('treasurer')}
            />

            {perms.canReviewExecutiveApprovals && (
              <ModuleTile
                title="Join Requests"
                icon={<UserCheck size={20} />}
                iconBg="#FFF8E6"
                iconBorder="#FDE68A"
                accentColor="#B45309"
                badge="3 Pending"
                onClick={() => handleModuleClick('approvals')}
              />
            )}

            {perms.canManageSettings && (
              <ModuleTile
                title="Settings"
                icon={<Settings size={20} />}
                iconBg="#F8FAFC"
                iconBorder="#E2E8F0"
                accentColor="#475569"
                badge="Tenure"
                onClick={() => setIsSettingsOpen(true)}
              />
            )}
          </CategoryCard>

          {/* Category 5: Communication (2 modules) */}
          <CategoryCard title="Communication" countBadge={2}>
            <ModuleTile
              title="Forum"
              icon={<MessageSquare size={20} />}
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              accentColor="#1D4ED8"
              badge="Pin & Post"
              onClick={() => handleModuleClick('forum')}
            />

            <ModuleTile
              title="Notifications"
              icon={<Bell size={20} />}
              iconBg="#FEF2F2"
              iconBorder="#FECACA"
              accentColor="#DC2626"
              badge="Advisories"
              onClick={() => handleModuleClick('notifications')}
            />
          </CategoryCard>

          {/* Category 6: Reports (1 module) */}
          <CategoryCard title="Reports Center" countBadge={1}>
            <ModuleTile
              title="Reports Center"
              icon={<BarChart3 size={20} />}
              iconBg="#E7F9F1"
              iconBorder="#A7F3D0"
              accentColor="#059669"
              badge="PDF, Word, Excel"
              onClick={() => handleModuleClick('reports')}
            />
          </CategoryCard>
        </>
      )}

      {/* =========================================================================
          MODALS & SHEETS FOR DOCUMENTATION LEAD
          ========================================================================= */}

      {/* 1. Templates Prefilled Modal */}
      <BottomSheet
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        title="Official Documentation Templates"
        subtitle="Prefilled from latest chapter event metrics with 1-click export"
      >
        <div className="flex flex-col gap-3 py-1">
          {/* Template Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {docTemplates.map((tpl, idx) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplateIdx(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTemplateIdx === idx
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>

          {/* Template Document Body */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
            {docTemplates[activeTemplateIdx]?.defaultContent
              .replace(/\[Event Title Here\]/g, events[0]?.title || 'QGIS Workshop')
              .replace(/\[Event Title\]/g, events[0]?.title || 'QGIS Workshop')
              .replace(/\[Date\]/g, new Date().toLocaleDateString())
              .replace(/\[Venue Name \/ Geo Coordinates\]/g, events[0]?.venue || 'Grand Auditorium')
              .replace(/\[Venue \/ Auditorium\]/g, events[0]?.venue || 'Grand Auditorium')
              .replace(/\[Verified Attendance\]/g, '185 verified scholars')}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(docTemplates[activeTemplateIdx]?.defaultContent || '');
                showToast('✓ Markdown copied to clipboard');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Copy size={13} />
              <span>Copy</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const content = docTemplates[activeTemplateIdx]?.defaultContent || '';
                  const blob = new Blob([content], { type: 'application/msword' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${docTemplates[activeTemplateIdx]?.name.replace(/\s+/g, '_')}.doc`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showToast('✓ Downloaded Word Document (.doc)');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <Download size={13} />
                <span>Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>${docTemplates[activeTemplateIdx]?.name}</title>
                          <style>
                            body { font-family: sans-serif; padding: 30px; color: #0F172A; }
                            pre { white-space: pre-wrap; font-family: sans-serif; font-size: 13px; line-height: 1.6; }
                          </style>
                        </head>
                        <body>
                          <h2 style="color: #047857; margin-bottom: 20px;">COLLEGE GEO CLUB - OFFICIAL TEMPLATE</h2>
                          <pre>${docTemplates[activeTemplateIdx]?.defaultContent}</pre>
                          <script>window.onload = function() { window.print(); }</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    showToast('✓ Opened Print / PDF Dialog');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <Printer size={13} />
                <span>PDF Print</span>
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* 2. Documentation Update Modal */}
      <BottomSheet
        isOpen={isDocUpdateOpen}
        onClose={() => setIsDocUpdateOpen(false)}
        title="Documentation Update & Audit"
        subtitle="Inspect and update compliance checklist across chapter events"
      >
        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Event</label>
            <select
              value={docUpdateEventId}
              onChange={(e) => setDocUpdateEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {[
              { key: 'report', label: 'Event Report', desc: 'Post-event outcomes brief' },
              { key: 'photos', label: 'Photos (Geotagged / Normal)', desc: 'High-res images with GPS records' },
              { key: 'videos', label: 'Videos (as links)', desc: 'Validated video links' },
              { key: 'dailyNews', label: 'Daily News', desc: 'Official bulletin published' },
              { key: 'mom', label: 'MoM (Minutes of Meeting)', desc: 'Signed meeting minutes' },
              { key: 'feedback', label: 'Feedback Summary', desc: 'Survey analytics & quotes' },
              { key: 'attendanceSheet', label: 'Attendance Sheet', desc: 'Gate scanner barcode records' },
            ].map((chk) => {
              const st = docAuditStatuses[chk.key] || 'missing';
              const chipClass =
                st === 'submitted'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                  : st === 'draft'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                  : 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';

              return (
                <div
                  key={chk.key}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{chk.label}</span>
                    <span className="text-[10px] text-slate-400">{chk.desc}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = st === 'missing' ? 'draft' : st === 'draft' ? 'submitted' : 'missing';
                      setDocAuditStatuses((prev) => ({ ...prev, [chk.key]: next }));
                      showToast(`✓ Updated ${chk.label} to ${next.toUpperCase()}`);
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] border shadow-2xs transition-all cursor-pointer uppercase tracking-wider ${chipClass}`}
                  >
                    {st === 'submitted' ? '✓ Submitted' : st === 'draft' ? '✎ Draft' : '✗ Missing'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDocUpdateOpen(false);
              showToast('✓ Documentation checklist audit saved!');
            }}
            className="w-full py-2.5 rounded-full font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all mt-1"
          >
            Confirm & Save Checklist Status
          </button>
        </div>
      </BottomSheet>

      {/* 3. Daily News Editor Modal */}
      <BottomSheet
        isOpen={isDailyNewsOpen}
        onClose={() => setIsDailyNewsOpen(false)}
        title="Write Daily Chapter News"
        subtitle="Compose and publish official daily activities to members feed"
      >
        <form onSubmit={handleDailyNewsSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              required
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="e.g. Drone Corridor Permission Sanctioned"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
            <select
              value={newsEventId}
              onChange={(e) => setNewsEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary (Sub-headline)</label>
            <input
              type="text"
              required
              value={newsHeadline}
              onChange={(e) => setNewsHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="Summary for chapter feed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bulletin Story / Details</label>
            <textarea
              rows={4}
              required
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none resize-none leading-relaxed"
              placeholder="Write the full news brief..."
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Author: <strong>{currentUser.name}</strong></span>
            <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
              Documentation Squad
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer mt-1"
          >
            Publish Daily News Bulletin
          </button>
        </form>
      </BottomSheet>

      {/* 4. MoM Author Modal */}
      <BottomSheet
        isOpen={isMomAuthorOpen}
        onClose={() => setIsMomAuthorOpen(false)}
        title="Author Minutes of Meeting (MoM)"
        subtitle="Full authoring, attendee roll-call, decisions, and export"
      >
        <form onSubmit={handleMomAuthorSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={momTitle}
              onChange={(e) => setMomTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={momDate}
                onChange={(e) => setMomDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Room</label>
              <input
                type="text"
                value={momVenue}
                onChange={(e) => setMomVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Attendees List</label>
            <input
              type="text"
              value={momAttendees}
              onChange={(e) => setMomAttendees(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Agenda Items Discussed</label>
            <textarea
              rows={2}
              value={momAgenda}
              onChange={(e) => setMomAgenda(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Decisions Taken</label>
            <textarea
              rows={2}
              value={momDecisions}
              onChange={(e) => setMomDecisions(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Action Items & Deliverables</label>
            <input
              type="text"
              value={momActions}
              onChange={(e) => setMomActions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                const docText = `# MINUTES OF MEETING\n\n**Title:** ${momTitle}\n**Date:** ${momDate} | **Venue:** ${momVenue}\n\n**Attendees:** ${momAttendees}\n\n### Agenda:\n${momAgenda}\n\n### Decisions:\n${momDecisions}\n\n### Actions:\n${momActions}\n\n**Recorded by:** ${currentUser.name} (Documentation Lead)`;
                const blob = new Blob([docText], { type: 'application/msword' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `MoM_${momTitle.replace(/\s+/g, '_')}.doc`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('✓ Exported MoM as Word (.doc)');
              }}
              className="px-3.5 py-2 rounded-full font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Export Word (.doc)
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              Save & Archive MoM
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* 5. Photo Upload Modal (Geotagged or Normal with Progress) */}
      <BottomSheet
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        title="Upload Archival Photo"
        subtitle="Store high-resolution photograph with embedded geolocation metadata"
      >
        <form onSubmit={handlePhotoUploadSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Photo Title / Caption</label>
            <input
              type="text"
              required
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="e.g. Spectrometer Calibration Session"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
            <select
              value={photoEventId}
              onChange={(e) => setPhotoEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Geotag Toggle */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                <MapPin size={15} className="text-emerald-600" />
                <span>Geotag with Browser Location</span>
              </div>
              <input
                type="checkbox"
                checked={photoGeotag}
                onChange={(e) => setPhotoGeotag(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer rounded"
              />
            </div>

            {photoGeotag && (
              <div className="text-[11px] text-emerald-800 font-medium">
                📍 Location Coordinates: <strong>{photoCoords.lat}° N, {photoCoords.lng}° E</strong> ({photoCoords.locationName})
              </div>
            )}
          </div>

          {/* Upload Progress Bar if active */}
          {isUploading && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Uploading to Media Archives...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer mt-1 disabled:opacity-60"
          >
            {isUploading ? 'Uploading Media...' : 'Upload & Archive Photo'}
          </button>
        </form>
      </BottomSheet>

      {/* 6. Video Links Modal (Validated links) */}
      <BottomSheet
        isOpen={isVideoLinksOpen}
        onClose={() => setIsVideoLinksOpen(false)}
        title="Archive Event Video Link"
        subtitle="Validate and catalog YouTube, Vimeo, or Google Drive recordings"
      >
        <form onSubmit={handleVideoLinkSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Video Title</label>
            <input
              type="text"
              required
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="e.g. Drone Corridor Flight Survey Stream"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
            <select
              value={videoEventId}
              onChange={(e) => setVideoEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Validated Video URL</label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setVideoError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              placeholder="https://youtube.com/... or drive.google.com/..."
            />
            {videoError ? (
              <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                {videoError}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 mt-1 block">
                Accepted: YouTube, Vimeo, Google Drive share links
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer mt-2"
          >
            Validate & Catalog Video
          </button>
        </form>
      </BottomSheet>

      {/* 7. Gallery Manager Modal (Edit captions, delete with confirm) */}
      <BottomSheet
        isOpen={isGalleryManagerOpen}
        onClose={() => setIsGalleryManagerOpen(false)}
        title="Gallery & Media Manager"
        subtitle="Edit media captions or delete items with confirmation"
      >
        <div className="flex flex-col gap-3 py-1 max-h-[70vh] overflow-y-auto">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-xs text-slate-900 truncate">
                    {item.title}
                  </span>
                  {editingItemId === item.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={editCaptionText}
                        onChange={(e) => setEditCaptionText(e.target.value)}
                        className="px-2 py-0.5 rounded-lg border border-emerald-400 text-xs font-medium outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, { caption: editCaptionText });
                          setEditingItemId(null);
                          showToast('✓ Caption updated');
                        }}
                        className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.caption || 'No caption'}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {item.eventTitle} • {item.fileSizeBytes || '3 MB'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(item.id);
                    setEditCaptionText(item.caption || item.title);
                  }}
                  className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Edit Caption"
                >
                  <Edit2 size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setItemToDelete(item.id)}
                  className="p-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
                  title="Delete Media"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteGalleryItem(itemToDelete);
            setItemToDelete(null);
            showToast('✓ Media item removed from club archives.');
          }
        }}
        title="Delete Archival Media?"
        message="This action will permanently remove the item from the central repository and event galleries. Are you sure?"
        confirmLabel="Yes, Delete Item"
        isDanger
      />

      {/* 8. PDF Briefs Export Modal */}
      <BottomSheet
        isOpen={isPdfBriefsOpen}
        onClose={() => setIsPdfBriefsOpen(false)}
        title="Official Event Briefs Export"
        subtitle="Generate NAAC and Institutional compliance summary dossier"
      >
        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Event for Brief</label>
            <select
              value={briefEventId}
              onChange={(e) => setBriefEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Dossier Preview Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-extrabold text-xs text-emerald-800">
                COLLEGE GEO CLUB (GEOHUB) OFFICIAL BRIEF
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                AY 2026-2027
              </span>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed">
              <strong>Event:</strong> {events.find((e) => e.id === briefEventId)?.title || 'QGIS Workshop'}<br />
              <strong>Venue:</strong> {events.find((e) => e.id === briefEventId)?.venue || 'Grand Auditorium'}<br />
              <strong>Verified Attendance Turnout:</strong> 92.5% (185 / 200 Attendees)<br />
              <strong>Documentation Status:</strong> All 7 compliance deliverables submitted and verified.<br />
              <strong>Lead Officer:</strong> Aarav Patel (Documentation Lead)
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  const ev = events.find((e) => e.id === briefEventId);
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Official Event Brief - ${ev?.title}</title>
                        <style>
                          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0F172A; }
                          .header { border-bottom: 3px solid #10B981; padding-bottom: 12px; margin-bottom: 24px; }
                          .title { font-size: 20px; font-weight: 800; color: #064E3B; margin: 0; }
                          .content { font-size: 13px; line-height: 1.6; }
                          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                          th, td { border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
                          th { background-color: #F8FAFC; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1 class="title">COLLEGE GEO CLUB - OFFICIAL NAAC COMPLIANCE BRIEF</h1>
                          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Academic Year: 2026-2027 | Chapter ID: #GEO-CHAPTER-01</div>
                        </div>
                        <div class="content">
                          <p><strong>Event Title:</strong> ${ev?.title}</p>
                          <p><strong>Venue & Coordinates:</strong> ${ev?.venue}</p>
                          <p><strong>Turnstile Attendance:</strong> 185 Verified Scholars (92.5% Attendance Rate)</p>
                          <p><strong>Sanctioned Budget:</strong> ₹8,400 | <strong>Actual Expenditure:</strong> ₹7,560</p>
                          <table>
                            <tr><th>Documentation Requirement</th><th>Status</th><th>Verified By</th></tr>
                            <tr><td>Post-Event Outcome Report</td><td>Submitted & Verified</td><td>Aarav Patel (Doc Lead)</td></tr>
                            <tr><td>Geotagged Aerial Drone Media</td><td>Stored in Archive</td><td>Aarav Patel (Doc Lead)</td></tr>
                            <tr><td>Executive MoM & Standup Records</td><td>Archived</td><td>Alex Rivera (President)</td></tr>
                            <tr><td>Gate Entry Barcode Manifest</td><td>100% Validated</td><td>Elena Rostova (Management)</td></tr>
                          </table>
                          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                            <div>_______________________<br>Aarav Patel<br>Documentation Lead</div>
                            <div>_______________________<br>Dr. Sarah Jenkins<br>Faculty Advisor</div>
                          </div>
                        </div>
                        <script>window.onload = function() { window.print(); }</script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  showToast('✓ Opened Print / PDF Dossier');
                }
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Printer size={13} />
              <span>Print Official PDF Brief</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Settings Bottom Sheet Modal (Faculty) */}
      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Chapter Governance Settings"
        subtitle="Manage academic tenure, club standing, and advisory notifications"
      >
        <form onSubmit={handleSettingsSave} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tenure Period</label>
            <input
              type="text"
              value={tenurePeriod}
              onChange={(e) => setTenurePeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">Notification Preferences</span>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Email alerts for budget & duty approvals</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Live gate entry SMS summaries</span>
              <input
                type="checkbox"
                checked={gateSmsAlerts}
                onChange={(e) => setGateSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-2 cursor-pointer"
          >
            Save Governance Settings
          </button>
        </form>
      </BottomSheet>

      {/* Posts & Squad Leads Management Bottom Sheet (Faculty / Coordinator) */}
      <BottomSheet
        isOpen={isPostsModalOpen}
        onClose={() => setIsPostsModalOpen(false)}
        title={perms.canAssignPosts ? 'Posts & Squad Leads Governance' : 'Designated Squad Leaders'}
        subtitle={
          perms.canAssignPosts
            ? 'Assign officer posts, designate squad leads, and inspect post history'
            : 'Chapter leadership roster and designated squad leaders (Read-only)'
        }
      >
        <div className="flex flex-col gap-4 py-1">
          {/* Current Leads */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Designated Squad Leaders (AY 2026-2027)
            </span>
            <div className="flex flex-col gap-2">
              {users
                .filter(
                  (u) =>
                    u.role === 'team_admin' ||
                    u.role === 'admin' ||
                    u.post?.toLowerCase().includes('lead')
                )
                .slice(0, 4)
                .map((lead) => (
                  <div
                    key={lead.uid}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {lead.team} Squad • {lead.department}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {lead.post || 'Squad Lead'}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Form to Assign New Post (Only for Faculty) */}
          {perms.canAssignPosts ? (
            <form onSubmit={handleAssignPostSubmit} className="flex flex-col gap-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                Designate Scholar to Squad Lead Post
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Select Scholar
                </label>
                <select
                  value={selectedStudentForPost}
                  onChange={(e) => setSelectedStudentForPost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
                >
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.name} ({u.team || 'General'} • {u.yearOfStudy})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Officer Post Title
                </label>
                <select
                  value={targetPost}
                  onChange={(e) => {
                    const post = e.target.value;
                    setTargetPost(post);
                    setTargetRole(post.includes('Lead') || post.includes('President') ? 'team_admin' : 'member');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
                >
                  <option value="Promotion Lead">Promotion Lead</option>
                  <option value="Entertainment Lead">Entertainment Lead</option>
                  <option value="Management Lead">Management Lead</option>
                  <option value="Documentation Lead">Documentation Lead</option>
                  <option value="Treasurer Lead">Treasurer Lead</option>
                  <option value="Vice President">Vice President</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-1 cursor-pointer"
              >
                Confirm Appointment & Assign Post
              </button>
            </form>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-900 block">
                Post designation is governed exclusively by the Faculty Advisor.
              </span>
              <p className="text-[11px] text-amber-700 mt-1">
                Executive appointments and squad post designations are read-only for Chapter Coordinators.
              </p>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Treasurer Modal 1: Allocation Requests (Read-only "Set by Faculty" + Request button) */}
      <BottomSheet
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        title="Squad Budget Allocations"
        subtitle="Fiscal parameters governed by Faculty Advisor Dr. Sarah Jenkins"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <span className="font-extrabold text-amber-800 shrink-0">🔒 Read-Only:</span>
            <span>Chapter allocations are set exclusively by Faculty Advisor Dr. Sarah Jenkins. The Treasurer Lead cannot edit allocations directly, but may petition for rebalances below.</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">Active Squad Allocations (FY 2026-2027)</span>
            {[
              { team: 'Logistics Squad', allocated: 145000, lead: 'Elena Rostova', spent: 82500 },
              { team: 'Stage & Entertainment', allocated: 60000, lead: 'Marcus Vance', spent: 58500 },
              { team: 'Hospitality & Catering', allocated: 60000, lead: 'Ananya Sen', spent: 47800 },
              { team: 'Promotion Squad', allocated: 45000, lead: 'David Chen', spent: 38200 },
              { team: 'General Reserve Corpus', allocated: 140000, lead: 'Faculty Trustee', spent: 0 },
            ].map((item) => (
              <div
                key={item.team}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">{item.team}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      Set by Faculty
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Custodian: {item.lead} • Spent: {formatINR(item.spent)}
                  </div>
                </div>

                <span className="font-mono font-extrabold text-xs text-slate-900">
                  {formatINR(item.allocated)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAllocationModalOpen(false);
                setIsAllocRequestFormOpen(true);
              }}
              className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>+ Request Budget Change from Faculty</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Treasurer Modal 1B: Send Reason for Allocation Change */}
      <BottomSheet
        isOpen={isAllocRequestFormOpen}
        onClose={() => setIsAllocRequestFormOpen(false)}
        title="Petition Budget Rebalance"
        subtitle="Submit request with justification reason to Dr. Sarah Jenkins"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!allocRequestReason.trim()) return;
            const amt = parseFloat(allocRequestAmount) || 0;
            requestBudgetChange(allocRequestTeam, amt, allocRequestReason);
            setToastMsg(`✓ Dispatched budget request for ${allocRequestTeam} (${formatINR(amt)}) to Faculty!`);
            setIsAllocRequestFormOpen(false);
            setAllocRequestReason('');
          }}
          className="flex flex-col gap-3 py-1"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Squad</label>
            <select
              value={allocRequestTeam}
              onChange={(e) => setAllocRequestTeam(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
            >
              <option value="Promotion">Promotion Squad</option>
              <option value="Entertainment">Entertainment Squad</option>
              <option value="Documentation">Documentation Squad</option>
              <option value="Management">Management Squad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Requested Total Allocation (₹ INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="5000"
                step="500"
                required
                value={allocRequestAmount}
                onChange={(e) => setAllocRequestAmount(e.target.value)}
                placeholder="50000"
                className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Justification Reason</label>
            <textarea
              rows={3}
              required
              value={allocRequestReason}
              onChange={(e) => setAllocRequestReason(e.target.value)}
              placeholder="e.g. Additional flex printing and customized delegate badge lanyards needed for external college symposium."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all mt-1 cursor-pointer"
          >
            Submit Request to Faculty Advisor
          </button>
        </form>
      </BottomSheet>

      {/* Treasurer Modal 2: Stock Items */}
      <BottomSheet
        isOpen={isOpsStockModalOpen}
        onClose={() => setIsOpsStockModalOpen(false)}
        title="Chapter Stock & Inventory"
        subtitle={`${stockItems.length} physical assets and consumables monitored`}
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Inventory Catalog</span>
            <button
              type="button"
              onClick={() => {
                setIsOpsStockModalOpen(false);
                setActiveTab('treasurer');
              }}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Open in Finance →
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {stockItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{item.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      item.quantity <= item.minThreshold
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {item.quantity <= item.minThreshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {item.location} • Cost: {formatINR(item.unitCost)}/{item.unit}
                  </div>
                </div>

                <span className="font-mono font-extrabold text-xs text-slate-900 shrink-0">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Treasurer Modal 3: Purchase History */}
      <BottomSheet
        isOpen={isOpsPurchaseHistoryOpen}
        onClose={() => setIsOpsPurchaseHistoryOpen(false)}
        title="Procurement & Purchase History"
        subtitle="Chronological trail of verified vouchers and payments"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Total Expenditure Logged:</span>
            <span className="font-extrabold text-emerald-950 font-mono text-sm">{formatINR(227000)}</span>
          </div>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{exp.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {exp.vendorName} • {exp.category} • {exp.buyingDate}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-mono font-extrabold text-xs text-slate-900">
                    {formatINR(exp.amount)}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                    Verified ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Treasurer Modal 4: Receipts Vault */}
      <BottomSheet
        isOpen={isReceiptsVaultOpen}
        onClose={() => setIsReceiptsVaultOpen(false)}
        title="Receipts & Invoices Vault"
        subtitle="Official bills, tax receipts, and payment proofs"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setActiveReceiptPreview(exp.receiptUrl || null)}
                className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer flex flex-col gap-1.5"
              >
                <div className="relative h-24 w-full bg-slate-100 rounded-xl overflow-hidden">
                  <img
                    src={exp.receiptUrl}
                    alt={exp.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 text-white">
                    {formatINR(exp.amount)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-slate-900 truncate">{exp.title}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{exp.vendorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Receipt Lightbox */}
      {activeReceiptPreview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveReceiptPreview(null)}
        >
          <div
            className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Procurement Invoice</h3>
                <p className="text-[11px] text-slate-500">Official digital receipt copy</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptPreview(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-80 flex items-center justify-center">
              <img
                src={activeReceiptPreview}
                alt="Receipt"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setToastMsg('✓ Downloaded voucher receipt');
                setActiveReceiptPreview(null);
              }}
              className="w-full py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Download PDF Copy
            </button>
          </div>
        </div>
      )}

      {/* Treasurer Modal 5: Fiscal Audit Export (PDF, Word, Excel) */}
      <BottomSheet
        isOpen={isAuditReportExportOpen}
        onClose={() => setIsAuditReportExportOpen(false)}
        title="Fiscal Audit Dossier Export"
        subtitle="Official financial statement and ledger download"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Fiscal Cycle:</span>
              <span className="font-extrabold text-emerald-900">Academic Year 2026-2027</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-200/60 text-center">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block">Allocated</span>
                <span className="font-mono font-extrabold text-xs text-emerald-950">{formatINR(450000)}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-bold block">Spent</span>
                <span className="font-mono font-extrabold text-xs text-amber-950">{formatINR(227000)}</span>
              </div>
              <div>
                <span className="text-[10px] text-teal-700 font-bold block">Balance</span>
                <span className="font-mono font-extrabold text-xs text-teal-950">{formatINR(223000)}</span>
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-700 mt-1">Select Export Format</span>

          <div className="flex flex-col gap-2">
            {/* 1. PDF Export */}
            <button
              type="button"
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>GeoHub Official Fiscal Audit Statement 2026-2027</title>
                        <style>
                          body { font-family: sans-serif; padding: 40px; color: #0F172A; }
                          h1 { color: #065F46; font-size: 20px; border-bottom: 2px solid #065F46; padding-bottom: 8px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                          th, td { border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
                          th { background-color: #F8FAFC; color: #1E293B; font-weight: bold; }
                          .totals { font-weight: bold; background-color: #F1F5F9; }
                        </style>
                      </head>
                      <body>
                        <h1>GREEN ECO ORGANIZATION (GEO HUB) - FISCAL AUDIT STATEMENT</h1>
                        <p><strong>Lead Treasurer:</strong> Ananya Iyer | <strong>Advising Faculty:</strong> Dr. Sarah Jenkins</p>
                        <p><strong>Total Corpus Allocated:</strong> ₹4,50,000 | <strong>Total Spent:</strong> ₹2,27,000 | <strong>Balance:</strong> ₹2,23,000</p>
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Item Description</th>
                              <th>Category</th>
                              <th>Vendor</th>
                              <th>Amount (INR)</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${expenses
                              .map(
                                (e) => `
                              <tr>
                                <td>${e.buyingDate}</td>
                                <td>${e.title}</td>
                                <td>${e.category}</td>
                                <td>${e.vendorName}</td>
                                <td>₹${e.amount.toLocaleString('en-IN')}</td>
                              </tr>
                            `
                              )
                              .join('')}
                            <tr class="totals">
                              <td colspan="4">TOTAL EXPENDITURE</td>
                              <td>₹2,27,000</td>
                            </tr>
                          </tbody>
                        </table>
                        <br/><br/>
                        <p>Verified and Certified by: ________________________ (Ananya Iyer, Treasurer Lead)</p>
                        <script>window.onload = function() { window.print(); }</script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  setToastMsg('✓ Prepared printable PDF fiscal statement');
                }
              }}
              className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 hover:bg-emerald-100/50 transition-all flex items-center justify-between cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                  PDF
                </div>
                <div className="text-left">
                  <span className="block font-extrabold text-xs text-slate-900">Official Audit PDF Report</span>
                  <span className="text-[11px] text-slate-500">Includes institutional seal, line items and signatories</span>
                </div>
              </div>
              <Download size={18} className="text-emerald-700" />
            </button>

            {/* 2. Word Export */}
            <button
              type="button"
              onClick={() => {
                const docContent = `
                  GREEN ECO ORGANIZATION (GEO HUB)
                  ANNUAL FISCAL STATEMENT 2026-2027

                  Lead Treasurer: Ananya Iyer
                  Faculty Advisor: Dr. Sarah Jenkins

                  SUMMARY:
                  Total Budget: ₹4,50,000
                  Total Spent: ₹2,27,000
                  Remaining Corpus: ₹2,23,000

                  LINE ITEMS:
                  ${expenses.map((e) => `• [${e.buyingDate}] ${e.title} (${e.category}) - ₹${e.amount} | Vendor: ${e.vendorName}`).join('\n')}
                `;
                const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GeoHub_Fiscal_Audit_Dossier_${new Date().toISOString().split('T')[0]}.doc`;
                a.click();
                URL.revokeObjectURL(url);
                setToastMsg('✓ Downloaded Word (.doc) Fiscal Dossier');
              }}
              className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 hover:bg-blue-100/50 transition-all flex items-center justify-between cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                  DOC
                </div>
                <div className="text-left">
                  <span className="block font-extrabold text-xs text-slate-900">Word Document Dossier (.doc)</span>
                  <span className="text-[11px] text-slate-500">Editable executive text report with table summaries</span>
                </div>
              </div>
              <Download size={18} className="text-blue-700" />
            </button>

            {/* 3. Excel Export */}
            <button
              type="button"
              onClick={() => {
                const csvHeader = 'Voucher ID,Date,Item Title,Category,Vendor,Amount (INR),Paid By,Status\n';
                const csvRows = expenses
                  .map(
                    (e) =>
                      `"${e.id}","${e.buyingDate}","${e.title.replace(/"/g, '""')}","${e.category}","${e.vendorName.replace(/"/g, '""')}",${e.amount},"${e.paidBy}","${e.status}"`
                  )
                  .join('\n');
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GeoHub_Fiscal_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                setToastMsg('✓ Downloaded Excel / CSV Ledger');
              }}
              className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 hover:bg-emerald-100/50 transition-all flex items-center justify-between cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xs">
                  XLS
                </div>
                <div className="text-left">
                  <span className="block font-extrabold text-xs text-slate-900">Excel / CSV Spreadsheet</span>
                  <span className="text-[11px] text-slate-500">Structured ledger data with numerical values for auditing</span>
                </div>
              </div>
              <Download size={18} className="text-teal-700" />
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Promotion Lead: Memories Creator BottomSheet */}
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
                <img
                  src={memoryCoverUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Caption / Highlight Story
            </label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Media Links / Cloud Folders (Optional)
            </label>
            <input
              type="text"
              value={memoryLinks}
              onChange={(e) => setMemoryLinks(e.target.value)}
              placeholder="e.g. drive.google.com/drive/folders/..., youtu.be/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition-all mt-1 cursor-pointer"
          >
            Publish Collection to Memories
          </button>
        </form>
      </BottomSheet>

      {/* Promotion Lead: Campaign Reach Export BottomSheet */}
      <BottomSheet
        isOpen={isCampaignReachExportOpen}
        onClose={() => setIsCampaignReachExportOpen(false)}
        title="Campaign Reach Export"
        subtitle="Export social media metrics, engagement rates and channel breakdown"
      >
        <div className="flex flex-col gap-4 py-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                Total Reach
              </span>
              <span className="text-lg font-black text-purple-950 mt-0.5">1,24,500</span>
              <span className="text-[10px] text-purple-600 font-medium">+38% vs prev semester</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Avg Engagement
              </span>
              <span className="text-lg font-black text-emerald-950 mt-0.5">8.4%</span>
              <span className="text-[10px] text-emerald-600 font-medium">Industry bench 3.2%</span>
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

          {/* Export Options */}
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
                  <span className="block font-bold text-xs text-slate-900">
                    Executive PDF Analytics Report
                  </span>
                  <span className="text-[11px] text-slate-500">
                    High-res charts & verified reach figures
                  </span>
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
                  <span className="block font-bold text-xs text-slate-900">
                    Word Dossier Summary (.docx)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Editable advisory report text
                  </span>
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
                  <span className="block font-bold text-xs text-slate-900">
                    Raw Metrics Spreadsheet (.csv)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Detailed per-post reach, likes & shares
                  </span>
                </div>
              </div>
              <Download size={16} className="text-emerald-700" />
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* =========================================================================
          PROMOTION LEAD MODAL: CONTENT CALENDAR & DROP PLANNER
          ========================================================================= */}
      <BottomSheet
        isOpen={isContentCalendarOpen}
        onClose={() => {
          setIsContentCalendarOpen(false);
          setIsScheduleDropOpen(false);
        }}
        title="Content Calendar & Drop Planner"
        subtitle="Schedule, coordinate and drop media campaigns across chapter channels"
      >
        <div className="flex flex-col gap-3 py-1">
          {/* Header Action & Top Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Weekly Drop Schedule</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {posts.filter((p) => p.status === 'Scheduled').length + 3} Planned Drops
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsScheduleDropOpen(!isScheduleDropOpen)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={13} />
              <span>{isScheduleDropOpen ? 'Close Composer' : 'Schedule Drop'}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Scheduled</span>
              <span className="font-extrabold text-sm text-slate-900 font-mono">
                {posts.filter((p) => p.status === 'Scheduled').length || 4}
              </span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Next Drop</span>
              <span className="font-extrabold text-xs text-blue-600 truncate block px-1">
                Tomorrow 11 AM
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Channels</span>
              <span className="font-extrabold text-xs text-emerald-700 block">
                IG, LI, WA
              </span>
            </div>
          </div>

          {/* Interactive Week Days Strip (Mon to Sun) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">Select Day to Filter</span>
            <div className="grid grid-cols-7 gap-1">
              {[
                { day: 'Mon', num: 5, date: '2026-10-05', dots: ['#E1306C'] },
                { day: 'Tue', num: 6, date: '2026-10-06', dots: ['#0A66C2', '#25D366'] },
                { day: 'Wed', num: 7, date: '2026-10-07', dots: ['#E1306C'] },
                { day: 'Thu', num: 8, date: '2026-10-08', dots: ['#E1306C', '#25D366'] },
                { day: 'Fri', num: 9, date: '2026-10-09', dots: ['#0A66C2'] },
                { day: 'Sat', num: 10, date: '2026-10-10', dots: ['#E1306C', '#0A66C2', '#25D366'] },
                { day: 'Sun', num: 11, date: '2026-10-11', dots: ['#25D366'] },
              ].map((d) => {
                const isSelected = selectedCalendarDay === d.date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedCalendarDay(isSelected ? 'All' : d.date)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-100 hover:border-blue-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[9px] font-semibold uppercase">{d.day}</span>
                    <span className="text-xs font-black">{d.num}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {d.dots.map((dotColor, dotIdx) => (
                        <span
                          key={dotIdx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: isSelected ? '#FFFFFF' : dotColor }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {['All', 'Instagram', 'LinkedIn', 'WhatsApp'].map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => setCalendarFilterPlatform(platform)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  calendarFilterPlatform === platform
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>

          {/* Schedule Drop Collapsible Composer */}
          {isScheduleDropOpen && (
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-950">Schedule New Social Drop</span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-100/60 px-2 py-0.5 rounded-md">
                  Auto-publish sync
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Event</label>
                <select
                  value={dropEventId}
                  onChange={(e) => setDropEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-blue-500 outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Platform</label>
                  <select
                    value={dropPlatform}
                    onChange={(e) => setDropPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Instagram">Instagram (Reel/Post)</option>
                    <option value="LinkedIn">LinkedIn (Article)</option>
                    <option value="WhatsApp">WhatsApp (Channel)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Drop Date</label>
                  <input
                    type="date"
                    value={dropDate}
                    onChange={(e) => setDropDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Post Caption & Hook</label>
                <textarea
                  rows={2}
                  value={dropCaption}
                  onChange={(e) => setDropCaption(e.target.value)}
                  placeholder="Catchy hook, event teaser, registration CTA and hashtags..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Media URL (Poster/Video)</label>
                <input
                  type="url"
                  value={dropMediaUrl}
                  onChange={(e) => setDropMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!dropCaption.trim()) {
                    showToast('Please enter a caption');
                    return;
                  }
                  const targetEvent = events.find((ev) => ev.id === dropEventId);
                  addPost({
                    eventId: dropEventId,
                    eventTitle: targetEvent?.title || 'Chapter Event',
                    platform: dropPlatform,
                    status: 'Scheduled',
                    caption: dropCaption,
                    scheduledDate: dropDate,
                    scheduledTime: dropTime,
                    mediaUrl: dropMediaUrl,
                    authorName: currentUser.name,
                    hashtags: ['#GeoHub', '#CollegeGeoClub', '#GIS'],
                  });
                  showToast(`✓ Scheduled drop for ${dropPlatform} on ${dropDate}!`);
                  setDropCaption('');
                  setIsScheduleDropOpen(false);
                }}
                className="w-full py-2.5 rounded-full font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-xs mt-1"
              >
                Confirm & Add to Calendar
              </button>
            </div>
          )}

          {/* Scheduled Drops Timeline List */}
          <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {posts
              .filter((p) => {
                if (calendarFilterPlatform !== 'All' && p.platform !== calendarFilterPlatform) return false;
                if (selectedCalendarDay !== 'All' && p.scheduledDate && p.scheduledDate !== selectedCalendarDay) return false;
                return true;
              })
              .map((post) => {
                const isIG = post.platform === 'Instagram';
                const isLI = post.platform === 'LinkedIn';

                return (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isIG
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isLI
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {post.platform}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {post.scheduledDate ? `${post.scheduledDate} • ${post.scheduledTime || '11:00 AM'}` : 'Scheduled for Drop'}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          post.status === 'Posted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 leading-snug">
                      {post.caption}
                    </div>

                    {post.eventTitle && (
                      <div className="text-[10px] font-bold text-blue-600">
                        Campaign: {post.eventTitle}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Est. Reach: ~{post.platform === 'Instagram' ? '18,500' : post.platform === 'LinkedIn' ? '8,200' : '4,500'} scholars
                      </span>

                      <div className="flex items-center gap-2">
                        {post.status !== 'Posted' ? (
                          <button
                            type="button"
                            onClick={() => {
                              markPostPublished(post.id, 'https://instagram.com/p/geohub_live');
                              showToast(`✓ Dropped "${post.platform}" post live to feed!`);
                            }}
                            className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
                          >
                            🚀 Drop Now
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Live on Feed ✓
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            deletePost(post.id);
                            showToast('Removed from schedule');
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </BottomSheet>

      {/* =========================================================================
          PROMOTION LEAD MODAL: POSTS STUDIO & SOCIAL HUB
          ========================================================================= */}
      <BottomSheet
        isOpen={isPostsStudioOpen}
        onClose={() => {
          setIsPostsStudioOpen(false);
          setIsNewPostDrawerOpen(false);
        }}
        title="Posts Studio & Social Hub"
        subtitle={`${posts.length} Total social posts cataloged across Instagram, LinkedIn & WhatsApp`}
      >
        <div className="flex flex-col gap-3 py-1">
          {/* Header Action & Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['All', 'Scheduled', 'Draft', 'Posted'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPostsFilterTab(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    postsFilterTab === tab
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'Posted' ? 'Published' : tab}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsNewPostDrawerOpen(!isNewPostDrawerOpen)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus size={13} />
              <span>{isNewPostDrawerOpen ? 'Close' : 'New Post'}</span>
            </button>
          </div>

          {/* New Post Drawer */}
          {isNewPostDrawerOpen && (
            <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 flex flex-col gap-2.5">
              <span className="text-xs font-extrabold text-purple-950">Compose Social Broadcast</span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Platform</label>
                  <select
                    value={newPostPlatform}
                    onChange={(e) => setNewPostPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-purple-500 outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newPostStatus}
                    onChange={(e) => setNewPostStatus(e.target.value as SocialPostStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-purple-500 outline-none"
                  >
                    <option value="Draft">Save as Draft</option>
                    <option value="Scheduled">Schedule Drop</option>
                    <option value="Posted">Publish Now</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Caption</label>
                <textarea
                  rows={3}
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  placeholder="Post copy with hashtags and registration links..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-purple-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newPostCaption.trim()) {
                    showToast('Please enter post text');
                    return;
                  }
                  const targetEvent = events.find((ev) => ev.id === newPostEventId);
                  addPost({
                    eventId: newPostEventId,
                    eventTitle: targetEvent?.title || 'Chapter Event',
                    platform: newPostPlatform,
                    status: newPostStatus,
                    caption: newPostCaption,
                    authorName: currentUser.name,
                    hashtags: ['#GeoHub', '#CampusInnovation', '#Geoinformatics'],
                    publishedDate: newPostStatus === 'Posted' ? new Date().toISOString().split('T')[0] : undefined,
                  });
                  showToast(`✓ Post created for ${newPostPlatform}!`);
                  setNewPostCaption('');
                  setIsNewPostDrawerOpen(false);
                }}
                className="w-full py-2.5 rounded-full font-bold text-xs bg-purple-700 text-white hover:bg-purple-800 transition-all cursor-pointer shadow-xs"
              >
                Create & Publish Post
              </button>
            </div>
          )}

          {/* Posts List */}
          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {posts
              .filter((p) => {
                if (postsFilterTab === 'All') return true;
                return p.status === postsFilterTab;
              })
              .map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {post.platform}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        By {post.authorName || 'Promotion Squad'}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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

                  <p className="text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {post.caption}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={12} />
                        <span>{post.likesCount || 142}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{post.reachCount || 1850}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.status !== 'Posted' && (
                        <button
                          type="button"
                          onClick={() => {
                            markPostPublished(post.id);
                            showToast(`✓ Published post to ${post.platform}!`);
                          }}
                          className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors"
                        >
                          Publish Now
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          deletePost(post.id);
                          showToast('Post removed');
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </BottomSheet>

      {/* =========================================================================
          PROMOTION LEAD MODAL: AI SUGGESTIONS & SOCIAL STUDIO
          ========================================================================= */}
      <BottomSheet
        isOpen={isAiSuggestionsOpen}
        onClose={() => setIsAiSuggestionsOpen(false)}
        title="AI Social Studio & Caption Generator"
        subtitle="Generate viral hooks, captions and registration calls powered by GeoHub AI"
      >
        <div className="flex flex-col gap-3 py-1">
          {/* Controls */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Event</label>
            <select
              value={aiEventId}
              onChange={(e) => setAiEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-amber-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Channel Format</label>
              <select
                value={aiPlatform}
                onChange={(e) => setAiPlatform(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-amber-500 outline-none"
              >
                <option value="Instagram">Instagram Reel & Carousel</option>
                <option value="LinkedIn">LinkedIn Executive Article</option>
                <option value="WhatsApp">WhatsApp Broadcast Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tone & Voice</label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-amber-500 outline-none"
              >
                <option value="viral">Viral & High-Energy</option>
                <option value="official">Official & Academic</option>
                <option value="urgent">Urgent Final 24h</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={isAiGenerating}
            onClick={() => {
              setIsAiGenerating(true);
              setTimeout(() => {
                setIsAiGenerating(false);
                showToast('✨ Generated 3 tailored social drafts!');
              }, 700);
            }}
            className="w-full py-3 rounded-full font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} className={isAiGenerating ? 'animate-spin' : ''} />
            <span>{isAiGenerating ? 'Analyzing event parameters...' : '✨ Generate AI Social Drafts'}</span>
          </button>

          {/* Generated AI Draft Cards */}
          <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {[
              {
                title: 'Option A: Viral Hook & Reel Caption',
                caption: `Ready to see campus from 400ft above? 🛰️🦅\n\nJoin the College Geo Club for an immersive hands-on expedition! Learn drone canopy mapping, real-time telemetry and aerial orthomosaic imaging.\n\n📍 Venue: Grand Auditorium\n📅 Date: Tomorrow @ 10:00 AM\n🎟️ Seats filling fast!\n\n#GeoHub #CampusDrones #Geoinformatics #TechSymposium #CollegeGeoClub`,
                match: '98% Engagement Match',
              },
              {
                title: 'Option B: Official Academic Announcement',
                caption: `ANNOUNCEMENT: Registration is formally open for the Chapter Technical Workshop on Satellite Remote Sensing & QGIS.\n\nOpen to all engineering and earth sciences scholars. Certified credentials issued upon turnstile attendance validation.\n\nRegister via your GeoHub student pass today.\n\n#GeoHub #GeospatialScience #AcademicConclave`,
                match: '94% Professional Score',
              },
              {
                title: 'Option C: Urgent 24-Hour Countdown',
                caption: `⏳ ONLY 15 SEATS LEFT! Final call for turnstile registration.\n\nDon't miss the flagship symposium of the semester. Secure your spot before the portal locks at 6:00 PM!\n\n👉 Tap link in bio to register with your student QR pass.\n\n#GeoHub #LastChance #CampusFest`,
                match: '96% Urgency Index',
              },
            ].map((draft, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{draft.title}</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {draft.match}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                  {draft.caption}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(draft.caption);
                      showToast('✓ AI caption copied to clipboard!');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addPost({
                        eventId: aiEventId,
                        eventTitle: events.find((e) => e.id === aiEventId)?.title || 'Chapter Event',
                        platform: aiPlatform,
                        status: 'Scheduled',
                        caption: draft.caption,
                        authorName: `${currentUser.name} (AI Studio)`,
                        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        scheduledTime: '11:00',
                      });
                      showToast('✓ Draft sent to Content Calendar!');
                      setIsAiSuggestionsOpen(false);
                      setIsContentCalendarOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full font-bold text-xs bg-purple-700 text-white hover:bg-purple-800 transition-colors shadow-2xs"
                  >
                    <Calendar size={12} />
                    <span>Send to Content Calendar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* =========================================================================
          STUDENT VOLUNTEER MODALS
          ========================================================================= */}
      {/* 1. Digital Student Pass Modal */}
      <BottomSheet
        isOpen={isStudentPassOpen}
        onClose={() => setIsStudentPassOpen(false)}
        title="Digital Student Pass"
        subtitle="Turnstile gate barcode with live 30-second rotating security token"
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="p-4 rounded-3xl bg-slate-900 text-white flex flex-col items-center gap-3 shadow-xl max-w-xs w-full">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400">
                Official GeoHub Pass
              </span>
              <span className="text-[10px] font-mono text-slate-400">AY 2026-2027</span>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white shadow-inner flex items-center justify-center">
              <QrCode size={180} className="text-slate-950" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-base text-white tracking-tight">{currentUser.name}</span>
              <span className="text-xs text-slate-400">
                {currentUser.department || 'Geoinformatics'} • {currentUser.yearOfStudy || '3rd Year'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 mt-1">ID: #GEO-2026-8841</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
              <div className="bg-emerald-500 h-full w-3/4 animate-pulse" />
            </div>
            <span className="text-[9px] text-slate-400">Token refreshes automatically in 18s</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Active & cleared for turnstile entry at all campus venues & workshops.</span>
          </div>
        </div>
      </BottomSheet>

      {/* 2. Student Duties Modal */}
      <BottomSheet
        isOpen={isStudentDutiesOpen}
        onClose={() => setIsStudentDutiesOpen(false)}
        title="My Volunteer Duties"
        subtitle="Chapter tasks, gate responsibilities and volunteer duty roster"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Assigned Responsibilities</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              3 Checkpoints
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {[
              {
                id: 'duty_01',
                title: 'Turnstile Gate Scanner - Entry Concourse',
                event: 'QGIS & Remote Sensing Workshop',
                due: 'Today @ 02:00 PM',
                status: 'pending',
                venue: 'Grand Auditorium Gate B',
              },
              {
                id: 'duty_02',
                title: 'Delegate Kit & Badge Distribution Desk',
                event: 'GEO FEST 2026 Flagship Conclave',
                due: 'Oct 12 @ 09:30 AM',
                status: 'pending',
                venue: 'Innovation Hub Lobby',
              },
              {
                id: 'duty_03',
                title: 'Aerial Drone Flight Corridor Clearance',
                event: 'Biodiversity Drone Mapping Survey',
                due: 'Oct 18 @ 07:00 AM',
                status: 'pending',
                venue: 'Campus Zone B Canopy',
              },
            ].map((duty) => (
              <div
                key={duty.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{duty.title}</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    Pending
                  </span>
                </div>

                <div className="text-[11px] text-slate-600">
                  <strong>Event:</strong> {duty.event}<br />
                  <strong>Venue:</strong> {duty.venue}<br />
                  <strong>Reporting Time:</strong> {duty.due}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`✓ Marked "${duty.title}" completed! Logged 2 volunteer hours.`);
                    }}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors"
                  >
                    Mark Complete ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 3. Student Registration History Modal */}
      <BottomSheet
        isOpen={isStudentRegHistoryOpen}
        onClose={() => setIsStudentRegHistoryOpen(false)}
        title="Registration & Event Ledger"
        subtitle="Record of registered sessions, attended workshops and digital certificates"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {[
              {
                title: 'QGIS & Satellite Remote Sensing Workshop',
                date: 'Today, Oct 5, 2026',
                venue: 'Grand Auditorium',
                status: 'Registered • Pass Active',
                badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
              },
              {
                title: 'Drone Aerial Mapping & Photogrammetry',
                date: 'Sep 24, 2026',
                venue: 'Aero Lab Corridor',
                status: 'Attended ✓ (Certificate Issued)',
                badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              },
              {
                title: 'Introductory Cartography & GIS Hackathon',
                date: 'Aug 18, 2026',
                venue: 'Tech Innovation Hall',
                status: 'Attended ✓ (Certificate Issued)',
                badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              },
            ].map((reg, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{reg.title}</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${reg.badgeBg}`}>
                    {reg.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {reg.date} • {reg.venue}
                </span>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('✓ Opened certificate download dialog');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Download Certificate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 4. Student Feedback Modal */}
      <BottomSheet
        isOpen={isStudentFeedbackOpen}
        onClose={() => setIsStudentFeedbackOpen(false)}
        title="Share Event Feedback"
        subtitle="Rate completed workshops and suggest improvements for the chapter"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showToast('✓ Thank you! Your verified event feedback has been recorded.');
            setIsStudentFeedbackOpen(false);
            setStudentFeedbackComment('');
          }}
          className="flex flex-col gap-3 py-1"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Event to Review</label>
            <select
              value={studentFeedbackEventId}
              onChange={(e) => setStudentFeedbackEventId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-emerald-500 outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
            <div className="flex items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStudentFeedbackRating(star)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    studentFeedbackRating >= star
                      ? 'bg-amber-100 text-amber-600 scale-105'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Star size={20} fill={studentFeedbackRating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="text-xs font-extrabold text-slate-800 ml-2 font-mono">
                {studentFeedbackRating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={studentFeedbackCategory}
              onChange={(e) => setStudentFeedbackCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:border-emerald-500 outline-none"
            >
              <option value="Workshop Quality">Workshop Content & Speaker Quality</option>
              <option value="Logistics & Venue">Logistics, Audio/Visual & Venue</option>
              <option value="Turnstile Check-in">Gate Entry & Turnstile Experience</option>
              <option value="Materials">Hands-on Exercises & Software Datasets</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Comments & Suggestions</label>
            <textarea
              rows={3}
              required
              value={studentFeedbackComment}
              onChange={(e) => setStudentFeedbackComment(e.target.value)}
              placeholder="What did you enjoy most? What can the GeoHub committee improve?"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-emerald-500 outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs mt-1"
          >
            Submit Event Feedback
          </button>
        </form>
      </BottomSheet>

      {/* Gate Scanner Warning Dialog for Students */}
      <ConfirmDialog
        isOpen={isGateScannerDutyWarningOpen}
        onClose={() => setIsGateScannerDutyWarningOpen(false)}
        onConfirm={() => setIsGateScannerDutyWarningOpen(false)}
        title="Attendance Duty Required"
        message="The Turnstile Gate Scanner is reserved for student volunteers who hold active turnstile check-in duties for the ongoing session. If you need duty clearance, speak with your Squad Lead or Faculty Advisor."
        confirmLabel="Understood"
      />

      {/* =========================================================================
          FACULTY & COORDINATOR MODAL: EXECUTIVE FEEDBACK SUMMARY
          ========================================================================= */}
      <BottomSheet
        isOpen={isFeedbackSummaryOpen}
        onClose={() => setIsFeedbackSummaryOpen(false)}
        title="Executive Event Feedback Summary"
        subtitle="Chapter-wide participant ratings, sentiment analysis and attendee reviews"
      >
        <div className="flex flex-col gap-3 py-1">
          {/* Top Score Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Overall Chapter Satisfaction
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-950 font-mono">4.9</span>
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">From 420 verified participant reviews</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-900 block font-mono">96% Positive</span>
              <span className="text-[10px] text-emerald-700">Sentiment score</span>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-slate-700 mb-1">Rating Distribution</span>
            {[
              { stars: 5, pct: 82 },
              { stars: 4, pct: 14 },
              { stars: 3, pct: 4 },
            ].map((r) => (
              <div key={r.stars} className="flex items-center gap-2 text-xs">
                <span className="w-10 font-bold text-slate-600">{r.stars} ★</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-10 font-mono text-right text-slate-500">{r.pct}%</span>
              </div>
            ))}
          </div>

          {/* Recent Attendee Testimonials */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">Recent Scholar Testimonials</span>
            {[
              {
                name: 'Kavita Sundaram',
                dept: 'Remote Sensing • 3rd Year',
                event: 'QGIS Workshop',
                comment: 'The live drone telemetry stream during the session was incredible! Turnstile QR check-in took 2 seconds.',
              },
              {
                name: 'Rohan Mehra',
                dept: 'Civil & Cartography • 2nd Year',
                event: 'GEO FEST 2026',
                comment: 'Super organized event, amazing datasets provided for the mapping challenge. 5 stars all the way!',
              },
            ].map((quote, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{quote.name}</span>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {quote.dept} • {quote.event}
                </span>
                <p className="text-xs text-slate-700 italic mt-0.5">"{quote.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
