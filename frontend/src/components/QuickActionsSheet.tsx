import React, { useState } from 'react';
import {
  CalendarPlus,
  Megaphone,
  UserPlus,
  Calendar,
  Award,
  CheckCircle2,
  FileText,
  Upload,
  Scan,
  Newspaper,
  MapPin,
  Loader2,
  Receipt,
  PackagePlus,
  Layers,
  Send,
  Sparkles,
  Copy,
} from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { useApp } from '../context/AppContext';
import { getRolePermissions } from '../core/permissions';
import { SocialPlatform, SocialPostStatus } from '../types';

export interface QuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onActionTriggered?: (actionKey: string) => void;
}

export const QuickActionsSheet: React.FC<QuickActionsSheetProps> = ({
  isOpen,
  onClose,
  onActionTriggered,
}) => {
  const {
    createEvent,
    createMeeting,
    addStudentToTeam,
    changeStudentPost,
    addForumMessage,
    uploadGalleryItem,
    addExpenseItem,
    addStockItem,
    requestBudgetChange,
    addPost,
    addCampaign,
    events,
    users,
    currentUser,
    setActiveTab,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const isFaculty = currentUser.role === 'super_admin' || currentUser.role === 'faculty';
  const isDocLead = currentUser.role === 'documentation' || currentUser.post?.toLowerCase().includes('documentation');
  const isTreasurer = currentUser.role === 'treasurer' || Boolean(currentUser.post && currentUser.post.toLowerCase().includes('treasurer'));
  const isPromotion =
    currentUser.role === 'social_media' ||
    (currentUser.role === 'team_admin' && (currentUser.team === 'Promotion' || Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion')))) ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion'));

  const [activeModalAction, setActiveModalAction] = useState<
    | 'event'
    | 'meeting'
    | 'post'
    | 'announcement'
    | 'student'
    | 'doc_report'
    | 'doc_upload'
    | 'doc_news'
    | 'treasurer_expense'
    | 'treasurer_stock'
    | 'treasurer_budget'
    | 'promo_post'
    | 'promo_campaign'
    | 'promo_ai_draft'
    | null
  >(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form States (Faculty/Coordinator)
  const [eventTitle, setEventTitle] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);

  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingVenue, setMeetingVenue] = useState('Seminar Hall B');
  const [meetingDate, setMeetingDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [targetPost, setTargetPost] = useState('Promotion Lead');

  const [announcementText, setAnnouncementText] = useState('');

  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentDept, setStudentDept] = useState('Geography & Earth Sciences');
  const [studentYear, setStudentYear] = useState('1st Year');
  const [studentSquad, setStudentSquad] = useState('Management');

  // Documentation Lead Form States
  const [reportTitle, setReportTitle] = useState('');
  const [reportEventId, setReportEventId] = useState(events[0]?.id || '');
  const [reportType, setReportType] = useState('Executive Event Summary');
  const [reportContent, setReportContent] = useState('');

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadEventId, setUploadEventId] = useState(events[0]?.id || '');
  const [uploadCategory, setUploadCategory] = useState<'photos' | 'videos'>('photos');
  const [uploadWithGeotag, setUploadWithGeotag] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [newsHeadline, setNewsHeadline] = useState('');
  const [newsEventId, setNewsEventId] = useState(events[0]?.id || '');
  const [newsBody, setNewsBody] = useState('');

  // Treasurer Lead Form States
  const [expenseEventId, setExpenseEventId] = useState(events[0]?.id || '');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<
    'Logistics' | 'Stage' | 'Printing' | 'Refreshments' | 'Equipment' | 'Other'
  >('Logistics');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  );
  const [expenseNotes, setExpenseNotes] = useState('');

  const [stockName, setStockName] = useState('');
  const [stockCategory, setStockCategory] = useState<
    'Logistics' | 'Stage' | 'Printing' | 'Refreshments' | 'Field Equipment' | 'Stationery'
  >('Field Equipment');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [stockUnit, setStockUnit] = useState('Units');
  const [stockMinThreshold, setStockMinThreshold] = useState('5');
  const [stockUnitCost, setStockUnitCost] = useState('1500');
  const [stockLocation, setStockLocation] = useState('Central Locker B-1');

  const [budgetTeam, setBudgetTeam] = useState('Promotion');
  const [budgetRequestedAmount, setBudgetRequestedAmount] = useState('45000');
  const [budgetReason, setBudgetReason] = useState('');

  // Promotion Lead Quick Action Form States
  const [promoPostEventId, setPromoPostEventId] = useState(events[0]?.id || '');
  const [promoPostPlatform, setPromoPostPlatform] = useState<SocialPlatform>('Instagram');
  const [promoPostCaption, setPromoPostCaption] = useState('');
  const [promoPostStatus, setPromoPostStatus] = useState<SocialPostStatus>('Scheduled');
  const [promoPostDate, setPromoPostDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [promoPostTime, setPromoPostTime] = useState('11:00');

  const [promoCampTitle, setPromoCampTitle] = useState('');
  const [promoCampEventId, setPromoCampEventId] = useState(events[0]?.id || '');
  const [promoCampAudience, setPromoCampAudience] = useState('All collegiate scholars & engineering students');

  const [promoAiEventId, setPromoAiEventId] = useState(events[0]?.id || '');
  const [promoAiTone, setPromoAiTone] = useState<'Formal' | 'Friendly' | 'Energetic'>('Energetic');
  const [promoAiLoading, setPromoAiLoading] = useState(false);
  const [promoAiResult, setPromoAiResult] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleActionSelect = (actionKey: string) => {
    onActionTriggered?.(actionKey);

    switch (actionKey) {
      case 'add_expense':
        setActiveModalAction('treasurer_expense');
        break;
      case 'add_stock':
        setActiveModalAction('treasurer_stock');
        break;
      case 'request_budget':
        setActiveModalAction('treasurer_budget');
        break;
      case 'new_report':
        setReportTitle(events.find((e) => e.id === reportEventId)?.title ? `Report: ${events.find((e) => e.id === reportEventId)?.title}` : 'Executive Event Summary');
        setActiveModalAction('doc_report');
        break;
      case 'upload_media':
        setActiveModalAction('doc_upload');
        break;
      case 'write_news':
        setActiveModalAction('doc_news');
        break;
      case 'scan_attendance':
        setActiveTab('scan_qr');
        onClose();
        break;
      case 'promo_post':
        setActiveModalAction('promo_post');
        break;
      case 'promo_campaign':
        setActiveModalAction('promo_campaign');
        break;
      case 'promo_ai_draft':
        setActiveModalAction('promo_ai_draft');
        break;
      case 'create_event':
        setActiveModalAction('event');
        break;
      case 'schedule_meeting':
        setActiveModalAction('meeting');
        break;
      case 'assign_post':
        if (!perms.canAssignPosts) {
          showToast("You don't have access");
          return;
        }
        setActiveModalAction('post');
        break;
      case 'post_announcement':
        setActiveModalAction('announcement');
        break;
      case 'add_student':
        setActiveModalAction('student');
        break;
      default:
        setActiveTab(actionKey);
        onClose();
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    const targetEvent = events.find((ev) => ev.id === reportEventId);
    uploadGalleryItem({
      title: reportTitle,
      eventId: reportEventId,
      eventTitle: targetEvent?.title || 'Chapter Event',
      academicYear: '2026-2027',
      category: 'reports',
      mediaType: 'report',
      submissionStatus: 'submitted',
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      uploadedByName: currentUser.name,
      fileSizeBytes: '1.8 MB',
      caption: reportContent || 'Official event summary report filed by Documentation Squad.',
    });
    showToast(`✓ Filed "${reportTitle}" in Archives!`);
    setActiveModalAction(null);
    onClose();
    setActiveTab('archives');
  };

  const handleUploadMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    const targetEvent = events.find((ev) => ev.id === uploadEventId);

    // Simulate upload progress
    setUploadProgress(15);
    setTimeout(() => setUploadProgress(55), 300);
    setTimeout(() => setUploadProgress(90), 650);
    setTimeout(() => {
      setUploadProgress(100);
      uploadGalleryItem({
        title: uploadTitle,
        eventId: uploadEventId,
        eventTitle: targetEvent?.title || 'Chapter Event',
        academicYear: '2026-2027',
        category: uploadCategory,
        mediaType: uploadCategory === 'photos' ? 'photo' : 'video',
        submissionStatus: 'submitted',
        geotag: uploadWithGeotag
          ? { lat: 13.0827, lng: 80.2707, locationName: 'Main Campus Quad' }
          : undefined,
        url: uploadCategory === 'photos'
          ? 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
        uploadedByName: currentUser.name,
        fileSizeBytes: uploadCategory === 'photos' ? '4.8 MB' : '48.2 MB',
        caption: `Uploaded by ${currentUser.name} with ${uploadWithGeotag ? 'embedded GPS geotag' : 'standard metadata'}.`,
      });
      setUploadProgress(null);
      showToast(`✓ Uploaded "${uploadTitle}" to Archives!`);
      setActiveModalAction(null);
      onClose();
      setActiveTab('archives');
    }, 900);
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsHeadline.trim() || !newsBody.trim()) return;
    const targetEvent = events.find((ev) => ev.id === newsEventId);
    addForumMessage({
      channelId: 'announcements',
      title: `Daily News: ${newsHeadline}`,
      content: `${newsBody}\n\n— Filed by ${currentUser.name}, Documentation Lead`,
    });
    uploadGalleryItem({
      title: `Daily News: ${newsHeadline}`,
      eventId: newsEventId,
      eventTitle: targetEvent?.title || 'Chapter News',
      academicYear: '2026-2027',
      category: 'reports',
      mediaType: 'news',
      submissionStatus: 'submitted',
      url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      uploadedByName: currentUser.name,
      fileSizeBytes: '640 KB',
      caption: newsBody,
    });
    showToast('✓ Daily News bulletin broadcasted!');
    setActiveModalAction(null);
    onClose();
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    createEvent({
      title: eventTitle,
      category: 'Faculty Expedition',
      venue: eventVenue || 'Campus Auditorium',
      description: 'Scheduled via Faculty Quick Actions.',
      capacity: 300,
      budget: 5000,
      posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      startDate: `${eventDate}T10:00:00.000Z`,
      endDate: `${eventDate}T14:00:00.000Z`,
      status: 'approved',
      createdBy: currentUser.name,
      eventType: 'internal',
    });
    showToast(`✓ Event "${eventTitle}" created!`);
    setActiveModalAction(null);
    onClose();
    setActiveTab('events');
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;
    createMeeting({
      title: meetingTitle,
      type: 'general',
      dateTime: `${meetingDate}T10:00:00.000Z`,
      venue: meetingVenue,
      organizerName: currentUser.name,
      attendeeIds: [currentUser.uid],
      agenda: 'Executive Faculty Advisory Meeting',
      status: 'scheduled',
    });
    showToast(`✓ Meeting "${meetingTitle}" scheduled!`);
    setActiveModalAction(null);
    onClose();
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    const targetUser = users.find((u) => u.uid === selectedStudentId);
    if (!targetUser) return;
    changeStudentPost(targetUser.uid, targetPost, 'team_admin');
    showToast(`✓ Assigned ${targetPost} to ${targetUser.name}!`);
    setActiveModalAction(null);
    onClose();
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    addForumMessage({
      channelId: 'announcements',
      title: 'Advisory Bulletin',
      content: announcementText,
    });
    showToast('✓ Chapter announcement broadcasted!');
    setActiveModalAction(null);
    onClose();
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) return;
    addStudentToTeam({
      name: studentName,
      email: studentEmail,
      department: studentDept,
      yearOfStudy: studentYear,
      team: studentSquad,
      role: 'member',
      isVolunteer: true,
      status: 'active',
    });
    showToast(`✓ Enrolled ${studentName} into ${studentSquad} Squad!`);
    setActiveModalAction(null);
    onClose();
    setActiveTab('members');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) return;
    const targetEvent = events.find((ev) => ev.id === expenseEventId);
    const numAmount = parseFloat(expenseAmount);
    addExpenseItem({
      eventId: expenseEventId || undefined,
      eventTitle: targetEvent?.title || undefined,
      title: expenseTitle,
      amount: isNaN(numAmount) ? 0 : numAmount,
      category: expenseCategory,
      buyingDate: expenseDate,
      vendorName: expenseVendor || 'Campus Vendor',
      receiptUrl: expenseReceiptUrl,
      approvedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
      notes: expenseNotes,
    });
    showToast(`✓ Logged expense of ₹${numAmount.toLocaleString('en-IN')}!`);
    setActiveModalAction(null);
    onClose();
    setActiveTab('treasurer');
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName.trim()) return;
    const qty = parseInt(stockQuantity, 10) || 0;
    const minT = parseInt(stockMinThreshold, 10) || 0;
    const cost = parseFloat(stockUnitCost) || 0;
    addStockItem({
      name: stockName,
      category: stockCategory,
      quantity: qty,
      unit: stockUnit || 'Units',
      minThreshold: minT,
      unitCost: cost,
      lastRestocked: new Date().toISOString().split('T')[0],
      location: stockLocation || 'Central Hardware Store',
      status: qty <= 0 ? 'out_of_stock' : qty <= minT ? 'low_stock' : 'in_stock',
    });
    showToast(`✓ Added ${stockName} to Inventory!`);
    setActiveModalAction(null);
    onClose();
    setActiveTab('treasurer');
  };

  const handleBudgetChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetReason.trim()) return;
    const reqAmount = parseFloat(budgetRequestedAmount) || 0;
    requestBudgetChange(budgetTeam, reqAmount, budgetReason);
    showToast(`✓ Requested ₹${reqAmount.toLocaleString('en-IN')} budget change for ${budgetTeam}!`);
    setActiveModalAction(null);
    onClose();
    setActiveTab('treasurer');
  };

  const handlePromoPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoPostCaption.trim()) return;
    const targetEvent = events.find((ev) => ev.id === promoPostEventId);

    addPost({
      eventId: promoPostEventId || undefined,
      eventTitle: targetEvent?.title || undefined,
      platform: promoPostPlatform,
      caption: promoPostCaption,
      status: promoPostStatus,
      scheduledDate: promoPostStatus === 'Scheduled' ? promoPostDate : undefined,
      scheduledTime: promoPostStatus === 'Scheduled' ? (promoPostTime || '11:00') : undefined,
      publishedDate: promoPostStatus === 'Posted' ? new Date().toISOString().split('T')[0] : undefined,
      authorName: currentUser.name,
    });

    showToast(`✓ Post created for ${promoPostPlatform}!`);
    setPromoPostCaption('');
    setActiveModalAction(null);
    onClose();
    setActiveTab('campaigns');
  };

  const handlePromoCampSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCampTitle.trim()) return;
    const targetEvent = events.find((ev) => ev.id === promoCampEventId);

    addCampaign({
      title: promoCampTitle,
      eventId: promoCampEventId,
      eventTitle: targetEvent?.title || 'Chapter Event',
      targetAudience: promoCampAudience || 'All Campus Scholars',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      checklist: {
        poster: false,
        teaser: false,
        regLink: false,
        reel: false,
        postEvent: false,
      },
    });

    showToast(`✓ Campaign "${promoCampTitle}" launched!`);
    setPromoCampTitle('');
    setActiveModalAction(null);
    onClose();
    setActiveTab('campaigns');
  };

  const handleRunQuickAi = () => {
    setPromoAiLoading(true);
    setPromoAiResult(null);
    const targetEvent = events.find((ev) => ev.id === promoAiEventId);
    const eventName = targetEvent?.title || 'GEO Chapter Event';
    const venue = targetEvent?.venue || 'Campus Auditorium';
    const dateStr = targetEvent?.startDate
      ? new Date(targetEvent.startDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : 'Upcoming';

    setTimeout(() => {
      let copy = '';
      if (promoAiTone === 'Energetic') {
        copy = `🚀 Get hyped, scholars! ${eventName} is hitting ${venue} on ${dateStr}! Don't miss live geospatial demos, hands-on tech workshops & exclusive geo-swag. Tap the link in bio to claim your free pass now! 🌍✨ #GeoHub #${eventName.replace(/\s+/g, '')} #Geospatial #TechCampus`;
      } else if (promoAiTone === 'Formal') {
        copy = `Green Eco Organization cordially invites all faculty and student researchers to ${eventName} on ${dateStr} at ${venue}. Participate in advanced GIS symposium sessions and explore geospatial cartography. Registration details at geohub.org/register. #GeoHub #GeospatialResearch #EarthSciences`;
      } else {
        copy = `Hey everyone! Join us for ${eventName} this ${dateStr} at ${venue}! It's going to be a fun session diving into earth mapping, cool projects, and meeting fellow geo enthusiasts. Bring a friend and let's explore together! 🌱📍 #GeoClub #GeoHub #CampusLife`;
      }
      setPromoAiResult(copy);
      setPromoAiLoading(false);
    }, 1200);
  };

  const treasurerActions = [
    {
      key: 'add_expense',
      title: 'Add Expense',
      desc: 'Log voucher, vendor invoice, receipt, and line item',
      icon: <Receipt size={22} />,
      bg: '#E7F9F1',
      border: '#A7F3D0',
      color: '#065F46',
    },
    {
      key: 'add_stock',
      title: 'Add Stock Item',
      desc: 'Catalog equipment, logistics gear, or supplies',
      icon: <PackagePlus size={22} />,
      bg: '#FFF8E6',
      border: '#FDE68A',
      color: '#92400E',
    },
    {
      key: 'request_budget',
      title: 'Request Budget Change',
      desc: 'Petition faculty advisor for squad allocation rebalance',
      icon: <Layers size={22} />,
      bg: '#F3EEFF',
      border: '#DDD1FF',
      color: '#5B21B6',
    },
    {
      key: 'scan_attendance',
      title: 'Scan Attendance',
      desc: 'Verify delegate check-ins via turnstile QR scanner',
      icon: <Scan size={22} />,
      bg: '#EFF6FF',
      border: '#BFDBFE',
      color: '#1D4ED8',
    },
  ];

  const docActions = [
    {
      key: 'new_report',
      title: 'New Report',
      desc: 'Author event summary or institutional brief',
      icon: <FileText size={22} />,
      bg: '#E7F9F1',
      border: '#A7F3D0',
      color: '#065F46',
    },
    {
      key: 'upload_media',
      title: 'Upload Media',
      desc: 'Upload photos (geotagged/normal) & videos',
      icon: <Upload size={22} />,
      bg: '#F3EEFF',
      border: '#DDD1FF',
      color: '#5B21B6',
    },
    {
      key: 'write_news',
      title: 'Write Daily News',
      desc: 'Publish daily chapter news bulletin & digest',
      icon: <Newspaper size={22} />,
      bg: '#FFF8E6',
      border: '#FDE68A',
      color: '#92400E',
    },
    {
      key: 'scan_attendance',
      title: 'Scan Attendance',
      desc: 'Gate attendance scanner for active session',
      icon: <Scan size={22} />,
      bg: '#EFF6FF',
      border: '#BFDBFE',
      color: '#1D4ED8',
    },
  ];

  const promoActions = [
    {
      key: 'promo_post',
      title: 'New Post',
      desc: 'Create post for Instagram, LinkedIn, WhatsApp',
      icon: <Send size={22} />,
      bg: '#F5F3FF',
      border: '#DDD6FE',
      color: '#6D28D9',
    },
    {
      key: 'promo_campaign',
      title: 'Plan Campaign',
      desc: 'Launch multichannel event outreach campaign',
      icon: <Megaphone size={22} />,
      bg: '#E7F9F1',
      border: '#A7F3D0',
      color: '#065F46',
    },
    {
      key: 'promo_ai_draft',
      title: 'AI Draft',
      desc: 'Generate viral copy with AI Studio',
      icon: <Sparkles size={22} />,
      bg: '#FFF8E6',
      border: '#FDE68A',
      color: '#92400E',
    },
    {
      key: 'scan_attendance',
      title: 'Scan Attendance',
      desc: 'Gate attendance scanner for active session',
      icon: <Scan size={22} />,
      bg: '#EFF6FF',
      border: '#BFDBFE',
      color: '#1D4ED8',
    },
  ];

  const facultyCoordActions = [
    {
      key: 'create_event',
      title: 'Create Event',
      desc: 'Charter a new workshop, expedition or lab',
      icon: <CalendarPlus size={22} />,
      bg: '#E7F9F1',
      border: '#A7F3D0',
      color: '#065F46',
    },
    {
      key: 'schedule_meeting',
      title: 'Schedule Meeting',
      desc: 'Core committee or advisory standup',
      icon: <Calendar size={22} />,
      bg: '#F3EEFF',
      border: '#DDD1FF',
      color: '#5B21B6',
    },
    {
      key: 'assign_post',
      title: 'Assign Post',
      desc: 'Designate squad leads & officer positions',
      icon: <Award size={22} />,
      bg: '#FFF8E6',
      border: '#FDE68A',
      color: '#92400E',
    },
    {
      key: 'post_announcement',
      title: 'Post Announcement',
      desc: 'Broadcast chapter advisory to all scholars',
      icon: <Megaphone size={22} />,
      bg: '#FEF2F2',
      border: '#FECACA',
      color: '#DC2626',
    },
    {
      key: 'add_student',
      title: 'Add Student',
      desc: 'Enroll new scholar directly to a squad',
      icon: <UserPlus size={22} />,
      bg: '#E8FBF8',
      border: '#99F6E4',
      color: '#0F766E',
    },
  ].filter((act) => act.key !== 'assign_post' || perms.canAssignPosts);

  const actions = isPromotion
    ? promoActions
    : isTreasurer
    ? treasurerActions
    : isDocLead
    ? docActions
    : facultyCoordActions;

  return (
    <>
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-900 text-white text-xs font-bold shadow-xl border border-emerald-700 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Quick Actions Picker */}
      <BottomSheet
        isOpen={isOpen && !activeModalAction}
        onClose={onClose}
        title={
          isPromotion
            ? 'Promotion Quick Actions'
            : isTreasurer
            ? 'Treasurer Quick Actions'
            : isDocLead
            ? 'Documentation Quick Actions'
            : isFaculty
            ? 'Faculty Quick Actions'
            : 'Coordinator Quick Actions'
        }
        subtitle={
          isPromotion
            ? `Social broadcasts, campaigns & AI drafting for ${currentUser.name}`
            : isTreasurer
            ? `Fiscal management, vouchers and inventory shortcuts for ${currentUser.name}`
            : isDocLead
            ? `Archival, report authoring and media actions for ${currentUser.name}`
            : isFaculty
            ? 'Executive management shortcuts for Dr. Sarah Jenkins'
            : `Executive management shortcuts for ${currentUser.name}`
        }
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          {actions.map((act) => (
            <button
              key={act.key}
              type="button"
              onClick={() => handleActionSelect(act.key)}
              className="flex flex-col items-start p-3.5 rounded-2xl transition-all duration-150 text-left border cursor-pointer hover:scale-[1.02] bg-white border-slate-100 shadow-xs"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl mb-2.5"
                style={{
                  backgroundColor: act.bg,
                  border: `1px solid ${act.border}`,
                  color: act.color,
                }}
              >
                {act.icon}
              </div>
              <span className="font-extrabold text-sm text-slate-900 leading-tight">
                {act.title}
              </span>
              <span className="text-xs text-slate-500 font-medium leading-normal mt-0.5 line-clamp-2">
                {act.desc}
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Action 1 Form: Create Event */}
      <BottomSheet
        isOpen={activeModalAction === 'event'}
        onClose={() => setActiveModalAction(null)}
        title="Create New Club Event"
        subtitle="Charter a new expedition, workshop, or symposium"
      >
        <form onSubmit={handleEventSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Field GIS Mapping & Drone Expedition"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Venue</label>
            <input
              type="text"
              required
              value={eventVenue}
              onChange={(e) => setEventVenue(e.target.value)}
              placeholder="e.g. Science Block Seminar Hall A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-2"
          >
            Charter Event
          </button>
        </form>
      </BottomSheet>

      {/* Action 2 Form: Schedule Meeting */}
      <BottomSheet
        isOpen={activeModalAction === 'meeting'}
        onClose={() => setActiveModalAction(null)}
        title="Schedule Chapter Meeting"
        subtitle="Set up faculty advisory or squad synchronization"
      >
        <form onSubmit={handleMeetingSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g. Core Committee Pre-Event Briefing"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Venue</label>
            <input
              type="text"
              required
              value={meetingVenue}
              onChange={(e) => setMeetingVenue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all mt-2"
          >
            Confirm & Schedule Meeting
          </button>
        </form>
      </BottomSheet>

      {/* Action 3 Form: Assign Post */}
      <BottomSheet
        isOpen={activeModalAction === 'post'}
        onClose={() => setActiveModalAction(null)}
        title="Assign Chapter Post"
        subtitle="Designate leadership post for active scholar"
      >
        <form onSubmit={handlePostSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Scholar</label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
            >
              <option value="">Choose student...</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name} ({u.department || 'Student'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Officer Post / Designation</label>
            <select
              value={targetPost}
              onChange={(e) => setTargetPost(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
            >
              <option value="Promotion Lead">Promotion Lead</option>
              <option value="Documentation Lead">Documentation Lead</option>
              <option value="Treasurer Lead">Treasurer Lead</option>
              <option value="Entertainment Lead">Entertainment Lead</option>
              <option value="Management Lead">Management Lead</option>
              <option value="Student Volunteer">Student Volunteer</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-amber-600 text-white shadow-sm hover:bg-amber-700 transition-all mt-2"
          >
            Confirm Post Assignment
          </button>
        </form>
      </BottomSheet>

      {/* Action 4 Form: Post Announcement */}
      <BottomSheet
        isOpen={activeModalAction === 'announcement'}
        onClose={() => setActiveModalAction(null)}
        title="Post Advisory Announcement"
        subtitle="Broadcast official bulletin to all scholars and squads"
      >
        <form onSubmit={handleAnnouncementSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Message</label>
            <textarea
              rows={3}
              required
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Mandatory briefing tomorrow at 10 AM in Seminar Hall for all expedition volunteers."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-red-600 text-white shadow-sm hover:bg-red-700 transition-all mt-2"
          >
            Broadcast Announcement
          </button>
        </form>
      </BottomSheet>

      {/* Action 5 Form: Add Student */}
      <BottomSheet
        isOpen={activeModalAction === 'student'}
        onClose={() => setActiveModalAction(null)}
        title="Enroll New Scholar"
        subtitle="Register new student into chapter database and squad"
      >
        <form onSubmit={handleStudentSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Liam Washington"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College Email Address</label>
            <input
              type="email"
              required
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="e.g. liam.w@college.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={studentDept}
                onChange={(e) => setStudentDept(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study</label>
              <select
                value={studentYear}
                onChange={(e) => setStudentYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Squad</label>
            <select
              value={studentSquad}
              onChange={(e) => setStudentSquad(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
            >
              <option value="Management">Management Squad</option>
              <option value="Promotion">Promotion Squad</option>
              <option value="Documentation">Documentation Squad</option>
              <option value="Entertainment">Entertainment Squad</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-teal-600 text-white shadow-sm hover:bg-teal-700 transition-all mt-2"
          >
            Complete Scholar Enrollment
          </button>
        </form>
      </BottomSheet>

      {/* Documentation Action 1: New Report */}
      <BottomSheet
        isOpen={activeModalAction === 'doc_report'}
        onClose={() => setActiveModalAction(null)}
        title="Author Institutional Event Report"
        subtitle="Compile chapter summary, fieldwork brief, or symposium dossier"
      >
        <form onSubmit={handleReportSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Chapter Event</label>
            <select
              value={reportEventId}
              onChange={(e) => {
                setReportEventId(e.target.value);
                const ev = events.find((item) => item.id === e.target.value);
                if (ev) setReportTitle(`Report: ${ev.title}`);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.venue})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Report Title / Dossier Name</label>
            <input
              type="text"
              required
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g. Fieldwork Executive Summary - GIS Expedition"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Report Template Scope</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
            >
              <option value="Executive Event Summary">Executive Event Summary (Overview & Metrics)</option>
              <option value="Fieldwork Technical Report">Fieldwork Technical Report (Data & Geo Layers)</option>
              <option value="Symposium Dossier">Symposium Dossier (Delegation & Proceedings)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Executive Summary / Key Findings</label>
            <textarea
              rows={3}
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder="e.g. The field mapping expedition successfully logged 45 waypoints with sub-meter RTK accuracy. Complete attendance verified with 95% turnstile rate."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveModalAction(null);
                onClose();
                setActiveTab('doc_studio');
              }}
              className="flex-1 py-3 rounded-full font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              Open in Doc Studio
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
            >
              Publish to Archives
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Documentation Action 2: Upload Media */}
      <BottomSheet
        isOpen={activeModalAction === 'doc_upload'}
        onClose={() => {
          if (uploadProgress === null) setActiveModalAction(null);
        }}
        title="Ingest Media into Archives"
        subtitle="Store geotagged photos, orthomosaics, and expedition video links"
      >
        <form onSubmit={handleUploadMediaSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Media Title / Description</label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. GPS Base Station Setup at Seminar Quad"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Linked Event</label>
              <select
                value={uploadEventId}
                onChange={(e) => setUploadEventId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Asset Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as 'photos' | 'videos')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
              >
                <option value="photos">High-Res Photos (JPG/PNG)</option>
                <option value="videos">Stream / Video (MP4)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-purple-700 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-purple-950">Store Geotagged Coordinates</span>
                <span className="text-[11px] text-purple-700 font-medium">13.0827° N, 80.2707° E • Main Campus Quad</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={uploadWithGeotag}
              onChange={(e) => setUploadWithGeotag(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          {uploadProgress !== null && (
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-purple-600" />
                  <span>Processing & Ingesting Media...</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploadProgress !== null}
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-all mt-1 cursor-pointer"
          >
            {uploadProgress !== null ? 'Uploading Asset...' : 'Ingest into Archives'}
          </button>
        </form>
      </BottomSheet>

      {/* Documentation Action 3: Write Daily News */}
      <BottomSheet
        isOpen={activeModalAction === 'doc_news'}
        onClose={() => setActiveModalAction(null)}
        title="Publish Daily News Bulletin"
        subtitle="Broadcast official chapter highlights, expedition updates and milestones"
      >
        <form onSubmit={handleNewsSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              required
              value={newsHeadline}
              onChange={(e) => setNewsHeadline(e.target.value)}
              placeholder="e.g. Campus Biodiversity Drone Survey Completes Aerial Transects"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked Chapter Event</label>
            <select
              value={newsEventId}
              onChange={(e) => setNewsEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-amber-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bulletin Story & Highlights</label>
            <textarea
              rows={4}
              required
              value={newsBody}
              onChange={(e) => setNewsBody(e.target.value)}
              placeholder="e.g. Over 45 student scholars participated in today's autonomous flight session. Multi-spectral imagery captured 3.2 sq km of canopy vegetation..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-amber-600 text-white shadow-sm hover:bg-amber-700 transition-all mt-1 cursor-pointer"
          >
            Broadcast Daily Bulletin
          </button>
        </form>
      </BottomSheet>

      {/* Treasurer Action 1: Add Expense */}
      <BottomSheet
        isOpen={activeModalAction === 'treasurer_expense'}
        onClose={() => setActiveModalAction(null)}
        title="Log Chapter Expense & Voucher"
        subtitle="Record vendor payment, invoice details, and allocate to event"
      >
        <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked Chapter Event</label>
            <select
              value={expenseEventId}
              onChange={(e) => setExpenseEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
            >
              <option value="">General Chapter Operations (No specific event)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.venue})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title / Item Description</label>
            <input
              type="text"
              required
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="e.g. Trimble GNSS RTK Rover Rental (2 Days)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Budget Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-emerald-500"
              >
                <option value="Logistics">Logistics</option>
                <option value="Stage">Stage & AV</option>
                <option value="Printing">Printing & Kits</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="54000"
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Payee</label>
              <input
                type="text"
                required
                value={expenseVendor}
                onChange={(e) => setExpenseVendor(e.target.value)}
                placeholder="e.g. Apex Geo-Instruments Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Receipt / Voucher Document</label>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <img
                src={expenseReceiptUrl}
                alt="Receipt Preview"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-emerald-950 truncate">Official Tax Invoice / Bill Attached</span>
                <span className="text-[11px] text-emerald-700 font-medium">Verified by Treasurer • Digital receipt archived</span>
              </div>
              <label className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold cursor-pointer hover:bg-emerald-50 transition-colors shrink-0">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setExpenseReceiptUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Expenditure Purpose</label>
            <textarea
              rows={2}
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              placeholder="e.g. Dual-frequency receiver rented for campus field practicum."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-1 cursor-pointer"
          >
            Confirm & Record Expense
          </button>
        </form>
      </BottomSheet>

      {/* Treasurer Action 2: Add Stock Item */}
      <BottomSheet
        isOpen={activeModalAction === 'treasurer_stock'}
        onClose={() => setActiveModalAction(null)}
        title="Add Inventory & Stock Item"
        subtitle="Catalog physical equipment, field gear, or chapter stationery"
      >
        <form onSubmit={handleStockSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              required
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              placeholder="e.g. Garmin eTrex 32x Handheld GPS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={stockCategory}
                onChange={(e) => setStockCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-amber-500"
              >
                <option value="Field Equipment">Field Equipment</option>
                <option value="Logistics">Logistics</option>
                <option value="Stage">Stage & AV</option>
                <option value="Printing">Printing & Badges</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measurement</label>
              <select
                value={stockUnit}
                onChange={(e) => setStockUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-amber-500"
              >
                <option value="Units">Units</option>
                <option value="Packs">Packs</option>
                <option value="Rolls">Rolls</option>
                <option value="Pieces">Pieces</option>
                <option value="Sets">Sets</option>
                <option value="Pairs">Pairs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Qty</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Alert Qty</label>
              <input
                type="number"
                min="1"
                required
                value={stockMinThreshold}
                onChange={(e) => setStockMinThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={stockUnitCost}
                onChange={(e) => setStockUnitCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Storage / Locker Location</label>
            <input
              type="text"
              required
              value={stockLocation}
              onChange={(e) => setStockLocation(e.target.value)}
              placeholder="e.g. Geospatial Hardware Locker A-2"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-amber-600 text-white shadow-sm hover:bg-amber-700 transition-all mt-1 cursor-pointer"
          >
            Add to Inventory Ledger
          </button>
        </form>
      </BottomSheet>

      {/* Treasurer Action 3: Request Budget Change */}
      <BottomSheet
        isOpen={activeModalAction === 'treasurer_budget'}
        onClose={() => setActiveModalAction(null)}
        title="Request Budget Change"
        subtitle="Petition Faculty Advisor (Dr. Sarah Jenkins) for squad allocation change"
      >
        <form onSubmit={handleBudgetChangeSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Squad / Category</label>
            <select
              value={budgetTeam}
              onChange={(e) => setBudgetTeam(e.target.value)}
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
                min="1000"
                step="500"
                required
                value={budgetRequestedAmount}
                onChange={(e) => setBudgetRequestedAmount(e.target.value)}
                placeholder="45000"
                className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Justification & Fiscal Impact</label>
            <textarea
              rows={3}
              required
              value={budgetReason}
              onChange={(e) => setBudgetReason(e.target.value)}
              placeholder="e.g. Additional digital canopy banner printing and sponsor collateral required for GEO FEST 2026."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
            <span className="font-bold text-purple-700 shrink-0">Note:</span>
            <span>Allocations are governed and ratified exclusively by Faculty Advisor Dr. Sarah Jenkins. Upon submission, this request enters the Faculty Approvals queue.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-all mt-1 cursor-pointer"
          >
            Submit Budget Request
          </button>
        </form>
      </BottomSheet>

      {/* 9. PROMOTION LEAD: New Post Modal */}
      <BottomSheet
        isOpen={activeModalAction === 'promo_post'}
        onClose={() => setActiveModalAction(null)}
        title="Schedule / Publish Post"
        subtitle="Broadcast content across official chapter channels"
      >
        <form onSubmit={handlePromoPostSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Event</label>
            <select
              value={promoPostEventId}
              onChange={(e) => setPromoPostEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
            >
              <option value="">General Club Promotion</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
              <select
                value={promoPostPlatform}
                onChange={(e) => setPromoPostPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={promoPostStatus}
                onChange={(e) => setPromoPostStatus(e.target.value as SocialPostStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Posted">Posted</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Copy</label>
            <textarea
              rows={3}
              required
              value={promoPostCaption}
              onChange={(e) => setPromoPostCaption(e.target.value)}
              placeholder="Write engaging caption with event details, dates, and call-to-action..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          {promoPostStatus === 'Scheduled' && (
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-purple-50/50 border border-purple-200/60">
              <div>
                <label className="block text-[10px] font-bold text-purple-900 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={promoPostDate}
                  onChange={(e) => setPromoPostDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-purple-900 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={promoPostTime}
                  onChange={(e) => setPromoPostTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs font-medium outline-none bg-white focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition-all mt-1 cursor-pointer"
          >
            Save Post to Schedule
          </button>
        </form>
      </BottomSheet>

      {/* 10. PROMOTION LEAD: Plan Campaign Modal */}
      <BottomSheet
        isOpen={activeModalAction === 'promo_campaign'}
        onClose={() => setActiveModalAction(null)}
        title="Plan Outreach Campaign"
        subtitle="Charter a synchronized multichannel event promotion plan"
      >
        <form onSubmit={handlePromoCampSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title</label>
            <input
              type="text"
              required
              value={promoCampTitle}
              onChange={(e) => setPromoCampTitle(e.target.value)}
              placeholder="e.g. QGIS Workshop 360° Outreach"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Event</label>
            <select
              value={promoCampEventId}
              onChange={(e) => setPromoCampEventId(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
            <input
              type="text"
              required
              value={promoCampAudience}
              onChange={(e) => setPromoCampAudience(e.target.value)}
              placeholder="e.g. Engineering students & GIS scholars"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-col gap-1">
            <span className="font-bold text-slate-800">Pre-configured Campaign Checklist:</span>
            <span className="text-slate-500 text-[11px]">
              ✓ Official Poster • Teaser Post • Registration Link • Reel • Post-event Highlight
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-purple-700 text-white shadow-sm hover:bg-purple-800 transition-all mt-1 cursor-pointer"
          >
            Launch Campaign Schedule
          </button>
        </form>
      </BottomSheet>

      {/* 11. PROMOTION LEAD: Quick AI Draft Modal */}
      <BottomSheet
        isOpen={activeModalAction === 'promo_ai_draft'}
        onClose={() => setActiveModalAction(null)}
        title="Quick AI Post Generator"
        subtitle="Synthesize social copy from chapter event archives"
      >
        <div className="flex flex-col gap-3 py-1">
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-snug">
            <strong>Note:</strong> Drafts are suggestions for review. Nothing is posted automatically.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event</label>
            <select
              value={promoAiEventId}
              onChange={(e) => setPromoAiEventId(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Tone</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Formal', 'Friendly', 'Energetic'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPromoAiTone(t)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    promoAiTone === t
                      ? 'bg-purple-50 text-purple-900 border-purple-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunQuickAi}
            disabled={promoAiLoading}
            className="w-full py-2.5 rounded-full font-bold text-xs bg-purple-700 text-white hover:bg-purple-800 flex items-center justify-center gap-1.5"
          >
            {promoAiLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generating Copy...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-amber-300" />
                <span>Generate Suggestion</span>
              </>
            )}
          </button>

          {promoAiResult && !promoAiLoading && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2 mt-1">
              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {promoAiResult}
              </p>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(promoAiResult);
                    showToast('✓ Copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-white"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addPost({
                      eventId: promoAiEventId,
                      platform: 'Instagram',
                      status: 'Draft',
                      caption: promoAiResult,
                      authorName: `${currentUser.name} (AI Quick)`,
                      createdAt: new Date().toISOString(),
                    });
                    showToast('✓ Saved as Draft in Posts!');
                    setActiveModalAction(null);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
};
