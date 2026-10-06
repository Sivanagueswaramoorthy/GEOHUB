import React, { useState, useEffect } from 'react';
import {
  Sun,
  Calendar,
  Users2,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  DollarSign,
  TrendingUp,
  X,
  Radio,
  FileText,
  CheckSquare,
  Upload,
  Images,
  Camera,
  Video,
  Newspaper,
  Download,
  Copy,
  Megaphone,
  Send,
  ExternalLink,
  ListTodo,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { orgConfig, OrgLogoIcon } from '../../config/org';
import { CampaignPlan, CampaignChecklist } from '../../types';
import {
  SectionCard,
  Overline,
  StatTile,
  DonutCard,
  WeekStrip,
  WeekDayItem,
  RoleBadge,
  BottomSheet,
  Toast,
} from '../../components';

export interface EventDocStatus {
  eventId: string;
  eventTitle: string;
  date: string;
  venue: string;
  items: {
    report: 'missing' | 'draft' | 'submitted';
    photos: 'missing' | 'draft' | 'submitted';
    videos: 'missing' | 'draft' | 'submitted';
    dailyNews: 'missing' | 'draft' | 'submitted';
    mom: 'missing' | 'draft' | 'submitted';
    feedback: 'missing' | 'draft' | 'submitted';
    attendanceSheet: 'missing' | 'draft' | 'submitted';
  };
}

export const HomeView: React.FC = () => {
  const {
    currentUser,
    events,
    users,
    gallery,
    docTemplates,
    expenses,
    stockItems,
    posts,
    campaigns,
    tasks,
    registerForEvent,
    updateCampaignChecklist,
    addExpenseItem,
    approveItem,
    rejectItem,
    setActiveTab,
    setSelectedEventId,
  } = useApp();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [selectedDate, setSelectedDate] = useState('2026-10-03');

  // Review Attention Modal State (Faculty & Coordinator)
  const [reviewItem, setReviewItem] = useState<{
    id: string;
    category: string;
    title: string;
    submittedBy: string;
    amount?: string;
    details: string;
  } | null>(null);

  // Documentation Lead State: Needs Documentation Events
  const [docEvents, setDocEvents] = useState<EventDocStatus[]>([
    {
      eventId: 'event_02',
      eventTitle: 'QGIS & Satellite Remote Sensing Workshop',
      date: 'Oct 5, 2026',
      venue: 'Grand Auditorium',
      items: {
        report: 'draft',
        photos: 'submitted',
        videos: 'draft',
        dailyNews: 'submitted',
        mom: 'submitted',
        feedback: 'missing',
        attendanceSheet: 'submitted',
      },
    },
    {
      eventId: 'event_01',
      eventTitle: 'GEO FEST 2026 Flagship Conclave',
      date: 'Oct 12, 2026',
      venue: 'Campus Innovation Tech Hub',
      items: {
        report: 'submitted',
        photos: 'submitted',
        videos: 'submitted',
        dailyNews: 'submitted',
        mom: 'submitted',
        feedback: 'draft',
        attendanceSheet: 'submitted',
      },
    },
    {
      eventId: 'event_03',
      eventTitle: 'Campus Biodiversity Drone Survey',
      date: 'Oct 18, 2026',
      venue: 'Green Canopy Flight Corridor A',
      items: {
        report: 'missing',
        photos: 'draft',
        videos: 'missing',
        dailyNews: 'draft',
        mom: 'missing',
        feedback: 'missing',
        attendanceSheet: 'missing',
      },
    },
    {
      eventId: 'event_05',
      eventTitle: 'Adyar River Environmental Water Sampling',
      date: 'Oct 25, 2026',
      venue: 'Adyar Riverbank Zone 4',
      items: {
        report: 'draft',
        photos: 'submitted',
        videos: 'missing',
        dailyNews: 'missing',
        mom: 'draft',
        feedback: 'missing',
        attendanceSheet: 'draft',
      },
    },
  ]);

  // Selected Event for Checklist BottomSheet
  const [activeChecklistEvent, setActiveChecklistEvent] = useState<EventDocStatus | null>(null);

  // Selected Template for Prefilled Template Modal
  const [previewTemplate, setPreviewTemplate] = useState<{
    title: string;
    category: string;
    content: string;
  } | null>(null);

  // Lightbox modal for recent uploads strip
  const [activeMediaItem, setActiveMediaItem] = useState<import('../../types').GalleryItem | null>(null);

  // Live Countdown Timer for Next Event
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Greeting logic
  const [hour] = useState(() => new Date().getHours());
  const greetingText =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

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

  // Promotion Lead Home State
  const [selectedPromoDate, setSelectedPromoDate] = useState('2026-10-08');
  const [activePromoChecklistCampaign, setActivePromoChecklistCampaign] = useState<CampaignPlan | null>(null);

  // Quick Expense & Lightbox State for Treasurer
  const [activeReceiptLightbox, setActiveReceiptLightbox] = useState<string | null>(null);
  const [isHomeExpenseModalOpen, setIsHomeExpenseModalOpen] = useState(false);
  const [homeExpEventId, setHomeExpEventId] = useState(events[0]?.id || '');
  const [homeExpTitle, setHomeExpTitle] = useState('');
  const [homeExpAmount, setHomeExpAmount] = useState('');
  const [homeExpCategory, setHomeExpCategory] = useState<
    'Logistics' | 'Stage' | 'Printing' | 'Refreshments' | 'Equipment' | 'Other'
  >('Logistics');
  const [homeExpVendor, setHomeExpVendor] = useState('');
  const [homeExpDate, setHomeExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [homeExpReceipt, setHomeExpReceipt] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  );

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleOpenPrefilledExpense = (eventId: string, defaultTitle: string, defaultCategory: any) => {
    setHomeExpEventId(eventId);
    setHomeExpTitle(defaultTitle);
    setHomeExpCategory(defaultCategory);
    setHomeExpAmount('');
    setHomeExpVendor('');
    setIsHomeExpenseModalOpen(true);
  };

  const handleHomeExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeExpTitle.trim() || !homeExpAmount) return;
    const numAmount = parseFloat(homeExpAmount);
    const targetEv = events.find((ev) => ev.id === homeExpEventId);
    addExpenseItem({
      eventId: homeExpEventId || undefined,
      eventTitle: targetEv?.title,
      title: homeExpTitle,
      amount: isNaN(numAmount) ? 0 : numAmount,
      category: homeExpCategory,
      buyingDate: homeExpDate,
      vendorName: homeExpVendor || 'Campus Logistics & Services',
      receiptUrl: homeExpReceipt,
      approvedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
      notes: 'Logged directly from Treasurer Executive Home overview.',
    });
    setToastMsg(`✓ Recorded expense voucher of ${formatINR(numAmount)}!`);
    setIsHomeExpenseModalOpen(false);
  };

  const displayName =
    isFaculty && !currentUser.name.startsWith('Dr.')
      ? `Dr. ${currentUser.name}`
      : currentUser.name;

  // Toggle checklist item status
  const cycleItemStatus = (
    eventId: string,
    key: keyof EventDocStatus['items']
  ) => {
    setDocEvents((prev) =>
      prev.map((ev) => {
        if (ev.eventId !== eventId) return ev;
        const current = ev.items[key];
        const next: 'missing' | 'draft' | 'submitted' =
          current === 'missing'
            ? 'draft'
            : current === 'draft'
            ? 'submitted'
            : 'missing';
        return {
          ...ev,
          items: {
            ...ev.items,
            [key]: next,
          },
        };
      })
    );

    // Keep activeChecklistEvent synchronized
    setActiveChecklistEvent((prev) => {
      if (!prev || prev.eventId !== eventId) return prev;
      const current = prev.items[key];
      const next: 'missing' | 'draft' | 'submitted' =
        current === 'missing'
          ? 'draft'
          : current === 'draft'
          ? 'submitted'
          : 'missing';
      return {
        ...prev,
        items: {
          ...prev.items,
          [key]: next,
        },
      };
    });

    showToast(`Updated status for ${key.toUpperCase()}`);
  };

  // Open Template prefilled from target event data
  const handleOpenTemplateShortcut = (templateName: string) => {
    const targetEvent = events[0] || {
      title: 'QGIS & Satellite Remote Sensing Workshop',
      venue: 'Grand Auditorium',
      startDate: new Date().toISOString(),
      registeredUserIds: ['u_1', 'u_2', 'u_3'],
      budget: 8400,
    };

    const foundTpl = docTemplates.find((t) =>
      t.name.toLowerCase().includes(templateName.toLowerCase().split(' ')[0])
    ) || docTemplates[0];

    const populated = (foundTpl?.defaultContent || '')
      .replace(/\[Event Title Here\]/g, targetEvent.title)
      .replace(/\[Event Title\]/g, targetEvent.title)
      .replace(/\[Date\]/g, new Date(targetEvent.startDate).toLocaleDateString())
      .replace(/\[Venue Name \/ Geo Coordinates\]/g, targetEvent.venue)
      .replace(/\[Venue \/ Auditorium\]/g, targetEvent.venue)
      .replace(
        /\[Verified Attendance\]/g,
        `${targetEvent.registeredUserIds?.length || 185} verified attendees`
      )
      .replace(/\[Budget Amount\]/g, `${targetEvent.budget || 8400}`)
      .replace(/\[Spent Amount\]/g, `${Math.round((targetEvent.budget || 8400) * 0.9)}`);

    setPreviewTemplate({
      title: foundTpl ? foundTpl.name : templateName,
      category: foundTpl ? foundTpl.category : 'official_dossier',
      content: populated,
    });
  };

  // WeekDays Data (Mon 28 Sep to Sun 4 Oct 2026)
  const weekDays: WeekDayItem[] = [
    { dateStr: '2026-09-28', dayName: 'Mon', dayNum: 28, hasDot: false },
    { dateStr: '2026-09-29', dayName: 'Tue', dayNum: 29, hasDot: true },
    { dateStr: '2026-09-30', dayName: 'Wed', dayNum: 30, hasDot: false },
    { dateStr: '2026-10-01', dayName: 'Thu', dayNum: 1, hasDot: true },
    { dateStr: '2026-10-02', dayName: 'Fri', dayNum: 2, hasDot: false },
    { dateStr: '2026-10-03', dayName: 'Sat', dayNum: 3, hasDot: true, isToday: true },
    { dateStr: '2026-10-04', dayName: 'Sun', dayNum: 4, hasDot: false },
  ];

  // Agendas mapped by date
  const agendaByDate: Record<string, { time: string; item: string; venue: string; tag: string }[]> = {
    '2026-10-03': [
      { time: '10:00 AM', item: 'Core Committee Briefing & MoM Review', venue: 'Seminar Hall B', tag: 'Meeting' },
      { time: '02:00 PM', item: 'Poster & Media Review (Promotion Squad)', venue: 'GIS Lab 2', tag: 'Review' },
      { time: '05:00 PM', item: 'Venue Booking & Turnstile Gate Confirmation', venue: 'Grand Auditorium', tag: 'Deadline' },
    ],
    '2026-09-29': [
      { time: '11:00 AM', item: 'GIS Map Lab Equipment Calibration & Drone Test', venue: 'Lab 1', tag: 'Lab' },
      { time: '04:00 PM', item: 'Quarterly Dean of Sciences Consultation', venue: 'Dean Office', tag: 'Faculty' },
    ],
    '2026-10-01': [
      { time: '03:00 PM', item: 'Auditorium AV Testing & Stage Fabrication for GEO FEST', venue: 'Auditorium', tag: 'Rehearsal' },
    ],
  };

  const currentAgenda = agendaByDate[selectedDate] || [
    { time: '09:30 AM', item: 'Faculty office hours & student inquiry desk', venue: 'Room 304', tag: 'Routine' },
    { time: '02:30 PM', item: 'Field GIS curriculum & expedition briefing', venue: 'Seminar Hall', tag: 'Briefing' },
  ];

  // Needs Your Attention Items (Faculty & Coordinator)
  const allAttentionItems = [
    {
      id: 'att_duty',
      category: 'Duties Not Yet Assigned',
      title: 'Duty roster pending: GIS Expedition',
      submittedBy: 'Elena Rostova (Management Lead)',
      details: '5 volunteer duty positions unassigned: 2 documentation, 2 refreshments, 1 signage.',
    },
    {
      id: 'att_mom',
      category: 'MoMs Pending',
      title: 'Missing MoM: Core Committee Meeting',
      submittedBy: 'Aarav Patel (Documentation Lead)',
      details: 'Session concluded yesterday at 4:00 PM. Minutes of Meeting and action items awaiting submission.',
    },
    {
      id: 'att_join',
      category: 'Join Requests',
      title: 'Join request: Anjali R. (Promotion squad)',
      submittedBy: 'David Chen (Promotion Lead)',
      details: '2nd Year Cartography student applying for Social Media Graphics role. Portfolio verified.',
    },
    {
      id: 'att_overdue',
      category: 'Overdue Duties',
      title: 'Overdue duty: Signage printing for Seminar Hall',
      submittedBy: 'Kiran Kumar (Volunteer)',
      details: 'Directional banners and turnstile entrance stands overdue by 2 hours.',
    },
    {
      id: 'att_budget',
      category: 'Budget Approval',
      title: 'Budget approval: GEO FEST Stage & Kits (₹12,000)',
      submittedBy: 'Treasurer Lead',
      amount: '₹12,000',
      details: 'Requisition disbursement for stage sound console, printing badges, and attendee mementos.',
      facultyOnly: true,
    },
    {
      id: 'att_post',
      category: 'Post Approval',
      title: 'Post sanction: Maya Patel to Documentation Officer',
      submittedBy: 'Alex Rivera (Club President)',
      details: 'Executive recommendation to elevate Maya Patel to Documentation Officer for AY 2026-2027.',
      facultyOnly: true,
    },
  ];

  const [attentionItems, setAttentionItems] = useState(() =>
    perms.canReviewExecutiveApprovals
      ? allAttentionItems
      : allAttentionItems.filter((item) => !item.facultyOnly)
  );

  useEffect(() => {
    setAttentionItems(
      perms.canReviewExecutiveApprovals
        ? allAttentionItems
        : allAttentionItems.filter((item) => !item.facultyOnly)
    );
  }, [perms.canReviewExecutiveApprovals]);

  const handleReviewAttention = (item: (typeof allAttentionItems)[0]) => {
    setReviewItem(item);
  };

  const handleApproveCurrent = () => {
    if (!reviewItem) return;
    approveItem(reviewItem.id);
    setAttentionItems((prev) => prev.filter((i) => i.id !== reviewItem.id));
    showToast(`✓ Sanctioned & Approved: ${reviewItem.title}`);
    setReviewItem(null);
  };

  const handleDeclineCurrent = () => {
    if (!reviewItem) return;
    rejectItem(reviewItem.id, isFaculty ? 'Declined by Faculty Advisor' : 'Declined by Coordinator');
    setAttentionItems((prev) => prev.filter((i) => i.id !== reviewItem.id));
    showToast(`Declined: ${reviewItem.title}`);
    setReviewItem(null);
  };

  // Helper for Completion Ring
  const getCompletionDetails = (items: EventDocStatus['items']) => {
    const keys: (keyof EventDocStatus['items'])[] = [
      'report',
      'photos',
      'videos',
      'dailyNews',
      'mom',
      'feedback',
    ];
    const completedCount = keys.filter((k) => items[k] === 'submitted').length;
    const draftCount = keys.filter((k) => items[k] === 'draft').length;
    const percent = Math.round((completedCount / keys.length) * 100);
    return { completedCount, total: keys.length, draftCount, percent };
  };

  return (
    <div className="flex flex-col gap-5">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* 1) Greeting Row: Sun icon + Greeting, Large Name, RoleBadge, Org Logo Card on right */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-0.5">
            <Sun size={15} className="text-amber-500 animate-spin-slow" />
            <span>{greetingText}</span>
          </div>
          <h1
            className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            {displayName}
          </h1>
          <div className="mt-1">
            <RoleBadge
              role={currentUser.role}
              post={currentUser.post || currentUser.teamRole}
              size="sm"
            />
          </div>
        </div>

        {/* Org Logo Card on the Right */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center justify-center p-1.5 rounded-2xl bg-white border border-[#EEF1F5] shadow-[0_4px_16px_rgba(15,23,42,0.06)] cursor-pointer hover:border-emerald-300 hover:scale-105 active:scale-95 transition-all shrink-0"
          style={{ width: '56px', height: '56px' }}
          title={orgConfig.orgName}
        >
          <OrgLogoIcon size={42} />
        </div>
      </div>

      {/* =========================================================================
          BRANCH: TREASURER LEAD HOME (ANANYA IYER)
          ========================================================================= */}
      {isTreasurer ? (
        <>
          {/* 1) Four StatTiles: Total Budget (mint), Spent (amber), Remaining (teal), Pending Entries (lavender), amounts in INR (en-IN) */}
          <div className="stat-tiles-grid">
            <StatTile
              label="Total Budget"
              value={formatINR(450000)}
              footnote="All 4 squad allocations"
              tint="mint"
              icon={<DollarSign size={18} />}
              onClick={() => setActiveTab('finance')}
            />

            <StatTile
              label="Spent"
              value={formatINR(227000)}
              footnote="50.4% corpus utilized"
              tint="amber"
              icon={<TrendingUp size={18} />}
              onClick={() => setActiveTab('finance')}
            />

            <StatTile
              label="Remaining"
              value={formatINR(223000)}
              footnote="49.6% available balance"
              tint="teal"
              icon={<CheckCircle2 size={18} />}
              onClick={() => setActiveTab('finance')}
            />

            <StatTile
              label="Pending Entries"
              value="4"
              footnote="Vouchers awaiting bills"
              tint="lavender"
              icon={<Clock size={18} />}
              onClick={() => setActiveTab('finance')}
            />
          </div>

          {/* 2) Budget Overview Card: allocated vs used progress bar with percent */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline pill>FISCAL GOVERNANCE</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Budget Overview & Corpus Utilization
                </h3>
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                50.4% Utilized
              </span>
            </div>

            {/* Main Progress Bar */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total Allocated vs Used</span>
                <span className="font-extrabold text-emerald-950 font-mono">
                  {formatINR(227000)} / {formatINR(450000)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: '50.4%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="text-emerald-700 font-bold">Spent: {formatINR(227000)}</span>
                <span className="text-teal-700 font-bold">Remaining: {formatINR(223000)}</span>
              </div>
            </div>

            {/* Squad breakdown mini bars */}
            <div className="mt-4 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700">Squad Allocations & Burn Rate</span>
              {[
                { name: 'Logistics Squad', spent: 82500, allocated: 145000, color: 'bg-emerald-500' },
                { name: 'Stage & Entertainment', spent: 58500, allocated: 60000, color: 'bg-purple-500' },
                { name: 'Hospitality & Catering', spent: 47800, allocated: 60000, color: 'bg-amber-500' },
                { name: 'Promotion & Print', spent: 38200, allocated: 45000, color: 'bg-blue-500' },
              ].map((squad) => {
                const pct = Math.round((squad.spent / squad.allocated) * 100);
                return (
                  <div key={squad.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{squad.name}</span>
                      <span className="font-mono text-slate-500">
                        {formatINR(squad.spent)} / {formatINR(squad.allocated)}{' '}
                        <strong className="text-slate-900">({pct}%)</strong>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${squad.color} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* 3) DonutCard "Spend by category" (Logistics, Stage, Printing, Refreshments) */}
          <DonutCard
            title="EXPENDITURE BREAKDOWN"
            subtitle="Spend by category across active fiscal cycle"
            centerTotal={formatINR(227000)}
            centerLabel="Total Spent"
            segments={[
              { label: 'Logistics', count: 82500, color: '#059669' },
              { label: 'Stage', count: 58500, color: '#7C3AED' },
              { label: 'Refreshments', count: 47800, color: '#D97706' },
              { label: 'Printing', count: 38200, color: '#0284C7' },
            ]}
          />

          {/* 4) Bar chart of spend per event */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline pill>EVENT LEDGER</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Spend per Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                View Events →
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  id: 'event_02',
                  title: 'QGIS & Remote Sensing Workshop',
                  spent: 106150,
                  budget: 120000,
                  color: 'bg-emerald-500',
                  badge: '88.5% Utilized',
                  badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                },
                {
                  id: 'event_01',
                  title: 'GEO FEST 2026 Flagship Conclave',
                  spent: 92350,
                  budget: 150000,
                  color: 'bg-teal-500',
                  badge: '61.6% Utilized',
                  badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
                },
                {
                  id: 'event_05',
                  title: 'Adyar River Environmental Water Sampling',
                  spent: 28500,
                  budget: 45000,
                  color: 'bg-amber-500',
                  badge: '63.3% Utilized',
                  badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
                },
                {
                  id: 'event_03',
                  title: 'Campus Biodiversity Drone Survey',
                  spent: 0,
                  budget: 35000,
                  color: 'bg-slate-300',
                  badge: 'Bills Pending',
                  badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
                },
              ].map((ev) => {
                const pct = ev.budget > 0 ? Math.round((ev.spent / ev.budget) * 100) : 0;
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      setActiveTab('events');
                    }}
                    className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {ev.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${ev.badgeBg}`}>
                        {ev.badge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Spent: <strong className="text-slate-800 font-mono">{formatINR(ev.spent)}</strong></span>
                      <span>Budget: <strong className="text-slate-600 font-mono">{formatINR(ev.budget)}</strong></span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${ev.color} rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* 5) "Events needing expense entry" */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline pill>PENDING AUDIT</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Events Needing Expense Entry
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                3 Pending
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  eventId: 'event_03',
                  eventTitle: 'Campus Biodiversity Drone Survey',
                  desc: 'Awaiting invoice for spare propellers & LiPo batteries from Logistics lead.',
                  suggestedTitle: 'Drone Battery Replacements & Flight Spares',
                  suggestedCategory: 'Logistics' as const,
                  urgency: 'Due Today',
                },
                {
                  eventId: 'event_05',
                  eventTitle: 'Adyar River Environmental Water Sampling',
                  desc: 'Water testing reagents & laboratory test kits voucher pending from Volunteer lead.',
                  suggestedTitle: 'River Water Sampling Reagent Kits',
                  suggestedCategory: 'Logistics' as const,
                  urgency: 'Overdue (2d)',
                },
                {
                  eventId: 'event_01',
                  eventTitle: 'GEO FEST 2026 Flagship Conclave',
                  desc: 'Memento plaques freight charges reimbursement bill awaited from Stage lead.',
                  suggestedTitle: 'Guest Scientist Memento Freight & Courier',
                  suggestedCategory: 'Stage' as const,
                  urgency: 'Pending',
                },
              ].map((item) => (
                <div
                  key={item.eventId}
                  className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-amber-300 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                        {item.eventTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                      {item.urgency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Category: {item.suggestedCategory}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenPrefilledExpense(item.eventId, item.suggestedTitle, item.suggestedCategory)}
                      className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>+ Log Expense</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 6) Stock alerts */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline pill>INVENTORY HEALTH</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Stock Alerts
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
              >
                All Stock ({stockItems.length}) →
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {stockItems
                .filter((s) => s.quantity <= s.minThreshold)
                .map((stock) => (
                  <div
                    key={stock.id}
                    className="p-3 rounded-2xl bg-amber-50/40 border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {stock.name}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {stock.location} • Unit Cost: {formatINR(stock.unitCost)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {stock.quantity} / {stock.minThreshold} {stock.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => setToastMsg(`Restock request dispatched for ${stock.name}`)}
                        className="text-[10px] font-bold text-amber-800 hover:underline mt-1 cursor-pointer"
                      >
                        Restock →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>

          {/* 7) Recent Transactions */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline pill>PURCHASE LEDGER</Overline>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  Recent Transactions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Ledger ({expenses.length}) →
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {expenses.slice(0, 5).map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Receipt thumbnail */}
                    {exp.receiptUrl ? (
                      <img
                        src={exp.receiptUrl}
                        alt="Receipt"
                        onClick={() => setActiveReceiptLightbox(exp.receiptUrl || null)}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
                        title="Click to view voucher"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <FileText size={16} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">
                        {exp.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {exp.vendorName} • {new Date(exp.buyingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-extrabold text-xs text-emerald-950 font-mono">
                      {formatINR(exp.amount)}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider mt-0.5 ${
                      exp.category === 'Logistics'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : exp.category === 'Stage'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : exp.category === 'Refreshments'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {exp.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : isPromotion ? (
        <>
          {/* 1) Four StatTiles for Promotion Lead: Events to Promote (mint), Scheduled Posts (lavender), Published This Month (teal), Drafts (amber) */}
          <div className="stat-tiles-grid">
            <StatTile
              label="Events to Promote"
              value={String(campaigns.filter((c) => c.status !== 'completed').length || 4)}
              footnote="2 launches pending"
              tint="mint"
              icon={<Megaphone size={18} />}
              onClick={() => setActiveTab('campaigns')}
            />

            <StatTile
              label="Scheduled Posts"
              value={String(posts.filter((p) => p.status === 'Scheduled').length)}
              footnote="Across 4 channels"
              tint="lavender"
              icon={<Clock size={18} />}
              onClick={() => setActiveTab('campaigns')}
            />

            <StatTile
              label="Published This Month"
              value={String(posts.filter((p) => p.status === 'Posted').length)}
              footnote="+42% reach growth"
              tint="teal"
              icon={<Send size={18} />}
              onClick={() => setActiveTab('campaigns')}
            />

            <StatTile
              label="Drafts"
              value={String(posts.filter((p) => p.status === 'Draft').length)}
              footnote="Review & publish"
              tint="amber"
              icon={<Sparkles size={18} />}
              onClick={() => setActiveTab('campaigns')}
            />
          </div>

          {/* 2) Content calendar card with a week strip and dots for scheduled posts */}
          <SectionCard>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline>CAMPAIGN CADENCE</Overline>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Content Calendar</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => showToast('Displaying previous week')}
                  className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-bold text-slate-700">Oct 2026</span>
                <button
                  type="button"
                  onClick={() => showToast('Displaying next week')}
                  className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPromoDate('2026-10-08')}
                  className="ml-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-100 cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>

            {/* WeekStrip with dots */}
            <WeekStrip
              days={[
                { dateStr: '2026-10-05', dayName: 'Mon', dayNum: 5, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-05') },
                { dateStr: '2026-10-06', dayName: 'Tue', dayNum: 6, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-06') },
                { dateStr: '2026-10-07', dayName: 'Wed', dayNum: 7, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-07') },
                { dateStr: '2026-10-08', dayName: 'Thu', dayNum: 8, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-08') },
                { dateStr: '2026-10-09', dayName: 'Fri', dayNum: 9, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-09') },
                { dateStr: '2026-10-10', dayName: 'Sat', dayNum: 10, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-10') },
                { dateStr: '2026-10-11', dayName: 'Sun', dayNum: 11, hasDot: posts.some((p) => p.status === 'Scheduled' && p.scheduledDate === '2026-10-11') },
              ]}
              selectedDate={selectedPromoDate}
              onSelectDate={(dt) => setSelectedPromoDate(dt)}
            />

            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
              <span>Purple dots indicate days with scheduled social media broadcasts</span>
            </div>

            {/* Posts scheduled on selected date */}
            <div className="mt-3 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Posts on {new Date(selectedPromoDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              {posts.filter((p) => p.scheduledDate === selectedPromoDate).length > 0 ? (
                posts
                  .filter((p) => p.scheduledDate === selectedPromoDate)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            post.platform === 'Instagram'
                              ? 'bg-pink-100 text-pink-700'
                              : post.platform === 'LinkedIn'
                              ? 'bg-blue-100 text-blue-700'
                              : post.platform === 'WhatsApp'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {post.platform}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600">
                            {post.scheduledTime || '11:00 AM'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                          {post.caption}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 shrink-0">
                        {post.status}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs text-slate-500">No posts scheduled for this day.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('campaigns')}
                    className="mt-1 text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Schedule New Post</span>
                  </button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* 3) "Needs promotion" card: upcoming events with a checklist ring */}
          <SectionCard>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline>CAMPAIGN PIPELINE</Overline>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Needs Promotion</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Tap to manage tasks</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {campaigns.map((camp) => {
                const totalTasks = 5;
                const completedTasks = Object.values(camp.checklist).filter(Boolean).length;
                const pct = Math.round((completedTasks / totalTasks) * 100);

                return (
                  <div
                    key={camp.id}
                    onClick={() => setActivePromoChecklistCampaign(camp)}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {camp.eventTitle}
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          completedTasks === 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : completedTasks >= 3
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {completedTasks}/5 Done
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mb-1">
                        {camp.title} • {camp.targetAudience}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span>Poster: {camp.checklist.poster ? '✓' : '✗'}</span> •
                        <span>Teaser: {camp.checklist.teaser ? '✓' : '✗'}</span> •
                        <span>Reg Link: {camp.checklist.regLink ? '✓' : '✗'}</span> •
                        <span>Reel: {camp.checklist.reel ? '✓' : '✗'}</span> •
                        <span>Highlight: {camp.checklist.postEvent ? '✓' : '✗'}</span>
                      </div>
                    </div>

                    {/* Circular Completion Ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#F1F5F9"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={completedTasks === 5 ? '#059669' : '#7C3AED'}
                          strokeWidth="3.5"
                          strokeDasharray={`${pct}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-extrabold text-slate-800">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* 4) AI suggestion shortcut card ("Draft posts for GEO FEST") */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-purple-200 text-[10px] font-extrabold tracking-wide uppercase">
                  <Sparkles size={12} className="text-amber-300" />
                  <span>AI Studio Suggestion</span>
                </span>
                <span className="text-[10px] text-purple-300 font-medium">1-Click Content</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Draft posts for GEO FEST
                </h4>
                <p className="text-xs text-purple-200/90 leading-relaxed mt-0.5">
                  Multi-platform captions, registration hooks & trending geo-hashtags ready for review.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('campaigns')}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Open AI Social Studio</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5) Recent Posts Strip */}
          <SectionCard>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Overline>PUBLISHING LOG</Overline>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Recent Posts</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('campaigns')}
                className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
              >
                View All ({posts.length})
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {posts.slice(0, 4).map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        post.platform === 'Instagram'
                          ? 'bg-pink-100 text-pink-700'
                          : post.platform === 'LinkedIn'
                          ? 'bg-blue-100 text-blue-700'
                          : post.platform === 'WhatsApp'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {post.platform}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {post.status === 'Posted'
                          ? `Published ${post.publishedDate || 'Oct 2'}`
                          : post.status === 'Scheduled'
                          ? `Drop on ${post.scheduledDate} • ${post.scheduledTime || '11:00'}`
                          : 'Draft Mode'}
                      </span>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      post.status === 'Posted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : post.status === 'Scheduled'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>By {post.authorName || 'Promotion Squad'}</span>
                    {post.postUrl && (
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Live</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : isDocLead ? (
        <>
          {/* 1) Four StatTiles for Documentation Lead */}
          <div className="stat-tiles-grid">
            <StatTile
              label="Events to Document"
              value="4"
              footnote="2 pending review"
              tint="mint"
              icon={<FileText size={18} />}
              onClick={() => setActiveTab('events')}
            />

            <StatTile
              label="Pending Uploads"
              value="12"
              footnote="8 photos, 4 videos"
              tint="amber"
              icon={<Upload size={18} />}
              onClick={() => setActiveTab('archives')}
            />

            <StatTile
              label="Reports Submitted"
              value="9"
              footnote="All verified briefs"
              tint="teal"
              icon={<CheckCircle2 size={18} />}
              onClick={() => setActiveTab('operations')}
            />

            <StatTile
              label="Memories This Month"
              value="18"
              footnote="+5 from field trip"
              tint="lavender"
              icon={<Images size={18} />}
              onClick={() => setActiveTab('archives')}
            />
          </div>

          {/* 2) "Needs Documentation" Card with Completion Ring */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Needs Documentation
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tap event for checklist
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {docEvents.map((ev) => {
                const { completedCount, total, percent } = getCompletionDetails(ev.items);
                const strokeDash = 2 * Math.PI * 18; // ~113
                const strokeOffset = strokeDash - (percent / 100) * strokeDash;

                return (
                  <div
                    key={ev.eventId}
                    onClick={() => setActiveChecklistEvent(ev)}
                    className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* SVG Completion Ring */}
                      <div className="relative flex items-center justify-center shrink-0" style={{ width: '48px', height: '48px' }}>
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke="#EEF2F6"
                            strokeWidth="4"
                            fill="transparent"
                          />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke={percent === 100 ? '#10B981' : percent > 50 ? '#0D9488' : '#F59E0B'}
                            strokeWidth="4"
                            strokeDasharray={strokeDash}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-500 ease-out"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-extrabold text-slate-800">
                          {completedCount}/{total}
                        </span>
                      </div>

                      {/* Event Info & Micro Indicator Pills */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {ev.eventTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{ev.date}</span>
                          <span>•</span>
                          <span className="truncate">{ev.venue}</span>
                        </div>

                        {/* 6 item status dots/pill */}
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {[
                            { key: 'report', label: 'Report' },
                            { key: 'photos', label: 'Photos' },
                            { key: 'videos', label: 'Videos' },
                            { key: 'dailyNews', label: 'News' },
                            { key: 'mom', label: 'MoM' },
                            { key: 'feedback', label: 'Feedback' },
                          ].map((chk) => {
                            const st = ev.items[chk.key as keyof EventDocStatus['items']];
                            const bg =
                              st === 'submitted'
                                ? 'bg-emerald-500 text-white'
                                : st === 'draft'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-400';
                            return (
                              <span
                                key={chk.key}
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${bg}`}
                                title={`${chk.label}: ${st}`}
                              >
                                {chk.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          percent === 100
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : percent > 50
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {percent}% Done
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold mt-1 underline">
                        Checklist →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* 3) Template Shortcut Row: Event Report, MoM, Attendance Summary, Budget Summary, Feedback Summary */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Documentation Templates
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('operations')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Studio Full Editor →
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { name: 'Event Report', icon: <FileText size={16} />, bg: '#E7F9F1', border: '#A7F3D0', text: '#065F46' },
                { name: 'MoM', icon: <Calendar size={16} />, bg: '#F3EEFF', border: '#DDD1FF', text: '#5B21B6' },
                { name: 'Attendance Summary', icon: <CheckSquare size={16} />, bg: '#E8FBF8', border: '#99F6E4', text: '#0D9488' },
                { name: 'Budget Summary', icon: <DollarSign size={16} />, bg: '#FFF8E6', border: '#FDE68A', text: '#92400E' },
                { name: 'Feedback Summary', icon: <Sparkles size={16} />, bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
              ].map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleOpenTemplateShortcut(tpl.name)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer text-left active:scale-95"
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: tpl.bg, border: `1px solid ${tpl.border}`, color: tpl.text }}
                  >
                    {tpl.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Prefill & Export
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 4) Recent Uploads Strip */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Images size={17} className="text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Recent Uploads Strip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('archives')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                View Archives ({gallery.length}) →
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {gallery.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveMediaItem(item)}
                  className="w-48 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-2xs overflow-hidden cursor-pointer hover:border-emerald-300 transition-all group"
                  style={{ width: '190px' }}
                >
                  <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.geotag && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white flex items-center gap-1">
                        <MapPin size={9} className="text-emerald-400" />
                        <span className="truncate max-w-[120px]">{item.geotag.locationName || 'Geotagged'}</span>
                      </span>
                    )}
                    {item.submissionStatus && (
                      <span
                        className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.submissionStatus === 'verified'
                            ? 'bg-emerald-600 text-white'
                            : item.submissionStatus === 'submitted'
                            ? 'bg-teal-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.submissionStatus}
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 flex flex-col gap-0.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-semibold truncate">
                      {item.eventTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      By {item.uploadedByName} • {item.fileSizeBytes || '3.2 MB'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : isStudent ? (
        /* =========================================================================
           BRANCH: STUDENT VOLUNTEER HOME
           ========================================================================= */
        <>
          {/* 1) Four StatTiles in .stat-tiles-grid (2x2 square boxes):
                 Upcoming Events (mint), Duties Pending (amber), Events Attended (teal), Hours Volunteered/Badges (lavender) */}
          <div className="stat-tiles-grid">
            <StatTile
              label="Upcoming Events"
              value={String(events.filter((e) => e.status !== 'completed' && e.status !== 'cancelled').length || 3)}
              footnote="2 open for entry"
              tint="mint"
              icon={<Calendar size={18} />}
              onClick={() => setActiveTab('events')}
            />

            <StatTile
              label="Duties Pending"
              value={String(tasks.filter((t) => t.status !== 'done').length || 2)}
              footnote="Turnstile check-in"
              tint="amber"
              icon={<ListTodo size={18} />}
              onClick={() => setActiveTab('operations')}
            />

            <StatTile
              label="Events Attended"
              value="3"
              footnote="Credentials verified"
              tint="teal"
              icon={<CheckCircle2 size={18} />}
              onClick={() => setActiveTab('operations')}
            />

            <StatTile
              label="Volunteer Badges"
              value="16h"
              footnote="2 Squad Badges"
              tint="lavender"
              icon={<Award size={18} />}
              onClick={() => setActiveTab('profile')}
            />
          </div>

          {/* 2) Next Event Hero Card with Register / My Pass action */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Overline pill>NEXT CHAPTER EVENT</Overline>
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Turnstile Active
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 border border-slate-800">
                <img
                  src={events[0]?.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                  alt={events[0]?.title || 'Next Event'}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3.5 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {events[0]?.category || 'Technical Workshop'}
                  </span>
                  <h3 className="font-extrabold text-base text-white leading-tight">
                    {events[0]?.title || 'QGIS & Satellite Remote Sensing Workshop'}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-emerald-400" />
                      <span>{events[0]?.venue || 'Grand Auditorium'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-amber-400" />
                      <span>Starts in 2d 14h</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('my_qr')}
                  className="flex-1 py-2.5 rounded-full font-bold text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode size={14} className="text-purple-600" />
                  <span>Show My Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    registerForEvent(events[0]?.id || 'event_01');
                    showToast('✓ Registered! Turnstile pass active.');
                  }}
                  className="flex-1 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{events[0]?.registeredUserIds?.includes(currentUser.uid) ? 'Registered ✓' : 'Register Now'}</span>
                </button>
              </div>
            </div>
          </SectionCard>

          {/* 3) "My Duties" Card (Top 3 with deadline and status chip) */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo size={17} className="text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  My Assigned Duties
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('operations')}
                className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
              >
                View Roster →
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {[
                {
                  id: 'd1',
                  title: 'Turnstile Gate Scanner - Entry Concourse',
                  event: 'QGIS & Remote Sensing Workshop',
                  time: 'Today @ 02:00 PM',
                  status: 'Pending',
                  chipBg: 'bg-amber-50 text-amber-800 border-amber-200',
                },
                {
                  id: 'd2',
                  title: 'Delegate Kit & Badge Distribution Desk',
                  event: 'GEO FEST 2026 Conclave',
                  time: 'Oct 12 @ 09:30 AM',
                  status: 'Pending',
                  chipBg: 'bg-amber-50 text-amber-800 border-amber-200',
                },
                {
                  id: 'd3',
                  title: 'Drone Flight Corridor Clearance Check',
                  event: 'Canopy Mapping Survey',
                  time: 'Oct 18 @ 07:00 AM',
                  status: 'Assigned',
                  chipBg: 'bg-blue-50 text-blue-800 border-blue-200',
                },
              ].map((duty) => (
                <div
                  key={duty.id}
                  className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs text-slate-900 truncate block">
                      {duty.title}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                      {duty.event} • {duty.time}
                    </span>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${duty.chipBg}`}>
                    {duty.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 4) Upcoming Events Carousel */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={17} className="text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Upcoming Chapter Events
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                All Events ({events.length}) →
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {events.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    setActiveTab('events');
                  }}
                  className="w-48 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-2xs overflow-hidden cursor-pointer hover:border-emerald-300 transition-all flex flex-col justify-between"
                  style={{ width: '200px' }}
                >
                  <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={ev.posterUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 text-white">
                      {ev.category}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {ev.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                      {ev.venue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 5) Pinned Announcements Card */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone size={17} className="text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Pinned Chapter Announcements
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('forum')}
                className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
              >
                Open Forum →
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {[
                {
                  title: 'Turnstile gate passes mandatory for AY 2026-2027 entry',
                  author: 'Dr. Sarah Jenkins (Faculty Advisor)',
                  time: '2 hours ago',
                },
                {
                  title: 'Drone flight corridors open for canopy survey volunteers',
                  author: 'Alex Rivera (Chapter President)',
                  time: 'Yesterday',
                },
              ].map((ann, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1"
                >
                  <span className="font-bold text-xs text-slate-900 leading-snug">
                    {ann.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    By {ann.author} • {ann.time}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        /* =========================================================================
           BRANCH B: FACULTY & COORDINATOR HOME (EXISTING LAYOUT PRESERVED)
           ========================================================================= */
        <>
          {/* 2) Four StatTiles in a 2x2 card */}
          <div className="stat-tiles-grid">
            <StatTile
              label="Total Members"
              value="128"
              footnote="+12 this month"
              tint="mint"
              icon={<Users2 size={18} />}
              onClick={() => setActiveTab('members')}
            />

            <StatTile
              label="Squad Leads"
              value="5"
              footnote="4 Squads"
              tint="lavender"
              icon={<Award size={18} />}
              onClick={() => setActiveTab('teams')}
            />

            <StatTile
              label="Active Events"
              value="3"
              footnote="1 live soon"
              tint="amber"
              icon={<Calendar size={18} />}
              onClick={() => setActiveTab('events')}
            />

            <StatTile
              label="Completed This Year"
              value="7"
              footnote="Across all squads"
              tint="teal"
              icon={<CheckCircle2 size={18} />}
              onClick={() => setActiveTab('gallery')}
            />
          </div>

          {/* 3) DonutCard: Members per team with "128 Total", center "128 Scholars" */}
          <DonutCard
            title="Members per team"
            subtitle="128 Total active chapter scholars"
            centerTotal="128"
            centerLabel="Scholars"
            segments={[
              { label: 'Promotion', count: 34, color: '#A855F7' },
              { label: 'Entertainment', count: 34, color: '#F59E0B' },
              { label: 'Management', count: 32, color: '#3B82F6' },
              { label: 'Documentation', count: 28, color: '#10B981' },
            ]}
          />

          {/* 4) Calendar Card: Month title with prev/next buttons, WeekStrip with event dots, tap date, Today shortcut */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(currentMonth === 'October 2026' ? 'September 2026' : 'October 2026')}
                  className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-extrabold text-sm text-slate-900">{currentMonth}</span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(currentMonth === 'October 2026' ? 'November 2026' : 'October 2026')}
                  className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Today Shortcut Button */}
              <button
                type="button"
                onClick={() => setSelectedDate('2026-10-03')}
                className="px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Today
              </button>
            </div>

            {/* WeekStrip with dots */}
            <WeekStrip
              days={weekDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </SectionCard>

          {/* 5) Agenda Card for the Selected Date */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                <span className="font-extrabold text-sm text-slate-900">
                  Agenda for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentAgenda.length} Items
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {currentAgenda.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="font-extrabold text-xs text-emerald-700 bg-white px-2 py-1 rounded-md border border-slate-200 shrink-0">
                      {item.time}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {item.item}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                        <MapPin size={11} className="text-slate-400" />
                        <span>{item.venue}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 6) "Needs Your Attention" Section with Review Actions */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-amber-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Needs Your Attention
                </h3>
              </div>
              {attentionItems.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {attentionItems.length} Actionable
                </span>
              )}
            </div>

            {attentionItems.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                ✓ All duties, requests, and sanctions have been cleared!
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {item.category}
                      </span>
                      {item.amount && (
                        <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          {item.amount}
                        </span>
                      )}
                    </div>

                    <span className="font-extrabold text-xs text-slate-900 leading-snug mt-1 mb-1">
                      {item.title}
                    </span>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2.5">
                      <span>By: {item.submittedBy}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleReviewAttention(item)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all"
                      >
                        Review & Decide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* 6b) Coordinator Tasks Card (for Coordinator / Lead) */}
          {!isFaculty && (
            <SectionCard padding="18px">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare size={17} className="text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Coordinator Tasks
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  3 Pending
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 leading-snug">
                        Prepare pre-event meeting for GEO FEST
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Due Tomorrow, 10:00 AM • Seminar Hall B
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      Priority
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">Core committee standup</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('meetings')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <FileText size={12} />
                      <span>Prepare MoM</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 leading-snug">
                      Review turnstile checkpoints for Grand Auditorium
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Due Oct 5, 09:00 AM • Terminal 1 & 2
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Gate Prep
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 leading-snug">
                      Confirm volunteer refreshment & meal allocations
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Due Oct 5, 08:30 AM • Canteen Annex
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Logistics
                  </span>
                </div>
              </div>
            </SectionCard>
          )}

          {/* 7) Next Event Spotlight: Countdown, Duty Progress Bars, Registrations vs Expected, Budget */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-red-500 animate-pulse" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Next Event Spotlight
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                Starts in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 mb-3.5">
              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                QGIS & Satellite Remote Sensing Workshop
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                <MapPin size={12} className="text-emerald-600 shrink-0" />
                <span>Grand Auditorium • Oct 5, 10:00 AM</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-emerald-100/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">RSVP Registration</span>
                  <div className="font-extrabold text-xs text-slate-900 mt-0.5">
                    185 / 200 (92%)
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Budget Sanction</span>
                  <div className="font-extrabold text-xs text-slate-900 mt-0.5">
                    ₹8,400 / ₹10,000 (84%)
                  </div>
                </div>
              </div>
            </div>

            {/* Duty Progress Bars */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Operational Duty Readiness
              </span>

              {[
                { label: 'Documentation', percent: 85, color: '#10B981' },
                { label: 'Signage & Badges', percent: 100, color: '#10B981' },
                { label: 'Shortlisting Attendees', percent: 70, color: '#3B82F6' },
                { label: 'Refreshments & Food', percent: 60, color: '#F59E0B' },
                { label: 'Gate Attendance Terminals', percent: 100, color: '#10B981' },
              ].map((duty, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{duty.label}</span>
                    <span className="text-slate-900 font-bold">{duty.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${duty.percent}%`, backgroundColor: duty.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 8) Attendance Per Event Bar Chart */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Attendance per Event
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Past 4 Events</span>
            </div>

            <div className="flex items-end justify-between gap-3 h-32 pt-4 px-2 border-b border-slate-100">
              {[
                { name: 'GIS Mapping', rate: 96, height: '96%' },
                { name: 'Drone Lab', rate: 92, height: '92%' },
                { name: 'Eco Field', rate: 88, height: '88%' },
                { name: 'Hackathon', rate: 94, height: '94%' },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-extrabold text-emerald-800">{bar.rate}%</span>
                  <div className="w-full bg-emerald-100 rounded-t-lg relative overflow-hidden" style={{ height: bar.height }}>
                    <div className="w-full h-full bg-emerald-500 rounded-t-lg transition-all" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 text-center truncate w-full">
                    {bar.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2">
              <span>Overall Chapter Average</span>
              <span className="font-bold text-emerald-600">92.5% Attendance</span>
            </div>
          </SectionCard>

          {/* 9) Duty Completion & Recent Activity Feed */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={17} className="text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Recent Chapter Activity
                </h3>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                94% On-time Duty Rate
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { time: '10m ago', text: 'Elena Rostova verified 42 students at Gate A turnstile terminal', squad: 'Management' },
                { time: '45m ago', text: 'Aarav Patel uploaded Minutes of Meeting for Core Committee', squad: 'Documentation' },
                { time: '2h ago', text: 'David Chen published promotional banner for Geo Fest', squad: 'Promotion' },
                { time: '4h ago', text: 'Ananya Sen logged ₹1,200 refreshment invoice with receipt', squad: 'Entertainment' },
              ].map((act, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 leading-snug">
                      {act.text}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {act.time} • {act.squad} Squad
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 10) Executive Post Holders (Read-Only) */}
          <SectionCard padding="18px">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award size={17} className="text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Executive Post Holders
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Read-only
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {users
                .filter(
                  (u) =>
                    u.role === 'super_admin' ||
                    u.role === 'admin' ||
                    u.role === 'team_admin' ||
                    (u.post && u.post.toLowerCase().includes('lead')) ||
                    (u.teamRole && u.teamRole.toLowerCase().includes('lead')) ||
                    (u.teamRole && u.teamRole.toLowerCase().includes('president'))
                )
                .slice(0, 5)
                .map((holder) => (
                  <div
                    key={holder.uid}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold"
                        style={{
                          backgroundColor: '#E7F9F1',
                          border: '1px solid #A7F3D0',
                          color: '#064E3B',
                        }}
                      >
                        {holder.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{holder.name}</div>
                        <div className="text-[10px] text-slate-500">{holder.department || 'Geosciences'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {holder.post || holder.teamRole || 'Officer'}
                    </span>
                  </div>
                ))}
            </div>
          </SectionCard>
        </>
      )}

      {/* =========================================================================
          MODALS & BOTTOM SHEETS
          ========================================================================= */}

      {/* Review Modal for "Needs Your Attention" (Faculty / Coordinator) */}
      <BottomSheet
        isOpen={!!reviewItem}
        onClose={() => setReviewItem(null)}
        title="Sanction & Review Item"
        subtitle={reviewItem?.category}
      >
        {reviewItem && (
          <div className="flex flex-col gap-4 py-1">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                {reviewItem.title}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {reviewItem.details}
              </p>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-2.5 pt-2 border-t border-amber-200/60">
                <span>Submitted by: {reviewItem.submittedBy}</span>
                {reviewItem.amount && (
                  <span className="text-emerald-700 font-extrabold">{reviewItem.amount}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDeclineCurrent}
                className="px-4 py-2.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={handleApproveCurrent}
                className="px-5 py-2.5 rounded-full font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
              >
                Confirm & Sanction Approval
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Documentation Checklist Bottom Sheet (Doc Lead) */}
      <BottomSheet
        isOpen={!!activeChecklistEvent}
        onClose={() => setActiveChecklistEvent(null)}
        title={activeChecklistEvent?.eventTitle || 'Documentation Checklist'}
        subtitle="Tap any status pill to cycle: Missing → Draft → Submitted"
      >
        {activeChecklistEvent && (
          <div className="flex flex-col gap-3 py-1">
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold text-slate-900">
                  {activeChecklistEvent.date}
                </div>
                <div className="text-[11px] text-slate-500">{activeChecklistEvent.venue}</div>
              </div>
              {(() => {
                const { percent, completedCount, total } = getCompletionDetails(activeChecklistEvent.items);
                return (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                    {completedCount} / {total} Items ({percent}%)
                  </span>
                );
              })()}
            </div>

            <div className="flex flex-col gap-2">
              {[
                { key: 'report', label: 'Event Report', desc: 'NAAC compliant outcome brief', icon: <FileText size={16} /> },
                { key: 'photos', label: 'Photos (Geotagged / Normal)', desc: 'High-res archival pictures', icon: <Camera size={16} /> },
                { key: 'videos', label: 'Videos (Validated Links)', desc: 'Drone & lecture recordings', icon: <Video size={16} /> },
                { key: 'dailyNews', label: 'Daily News', desc: 'Published chapter bulletin', icon: <Newspaper size={16} /> },
                { key: 'mom', label: 'MoM (Minutes of Meeting)', desc: 'Executive decisions & action plan', icon: <Calendar size={16} /> },
                { key: 'feedback', label: 'Feedback Summary', desc: 'Ratings & attendee testimonials', icon: <Sparkles size={16} /> },
                { key: 'attendanceSheet', label: 'Attendance Sheet', desc: 'Turnstile barcode gate logs', icon: <CheckSquare size={16} /> },
              ].map((item) => {
                const status = activeChecklistEvent.items[item.key as keyof EventDocStatus['items']];
                const badgeStyle =
                  status === 'submitted'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                    : status === 'draft'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                    : 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';

                return (
                  <div
                    key={item.key}
                    className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 leading-snug">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        cycleItemStatus(
                          activeChecklistEvent.eventId,
                          item.key as keyof EventDocStatus['items']
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer active:scale-95 uppercase tracking-wide text-[10px] shadow-2xs ${badgeStyle}`}
                      title="Tap to cycle status"
                    >
                      {status === 'submitted' ? '✓ Submitted' : status === 'draft' ? '✎ Draft' : '✗ Missing'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveChecklistEvent(null);
                  setActiveTab('doc_studio');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <FileText size={13} />
                <span>Open Documentation Studio</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Prefilled Template Preview Modal */}
      <BottomSheet
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.title || 'Template Document'}
        subtitle="Prefilled with latest event coordinates and statistics"
      >
        {previewTemplate && (
          <div className="flex flex-col gap-3 py-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-extrabold text-emerald-700 uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {previewTemplate.category}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Live Markdown Preview
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
              {previewTemplate.content}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(previewTemplate.content);
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
                    const blob = new Blob([previewTemplate.content], { type: 'application/msword' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${previewTemplate.title.replace(/\s+/g, '_')}.doc`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('✓ Exported Word Document (.doc)');
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
                            <title>${previewTemplate.title}</title>
                            <style>
                              body { font-family: sans-serif; padding: 30px; color: #0F172A; }
                              pre { white-space: pre-wrap; font-family: sans-serif; font-size: 13px; line-height: 1.6; }
                            </style>
                          </head>
                          <body>
                            <h2 style="color: #047857; margin-bottom: 20px;">COLLEGE GEO CLUB - OFFICIAL DOCUMENT</h2>
                            <pre>${previewTemplate.content}</pre>
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
                  <FileText size={13} />
                  <span>PDF / Print</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Lightbox Modal for Recent Uploads Strip */}
      <BottomSheet
        isOpen={!!activeMediaItem}
        onClose={() => setActiveMediaItem(null)}
        title={activeMediaItem?.title || 'Media Archive Item'}
        subtitle={activeMediaItem?.eventTitle}
      >
        {activeMediaItem && (
          <div className="flex flex-col gap-3 py-1">
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 max-h-64 flex items-center justify-center">
              <img
                src={activeMediaItem.url}
                alt={activeMediaItem.title}
                className="max-h-64 w-full object-contain"
              />
            </div>

            {/* Geotag chip */}
            {activeMediaItem.geotag && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold">
                  <MapPin size={14} className="text-emerald-600" />
                  <span>{activeMediaItem.geotag.locationName}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700">
                  {activeMediaItem.geotag.lat.toFixed(4)}° N, {activeMediaItem.geotag.lng.toFixed(4)}° E
                </span>
              </div>
            )}

            {activeMediaItem.caption && (
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{activeMediaItem.caption}"
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span>Uploaded by {activeMediaItem.uploadedByName}</span>
              <span>{activeMediaItem.fileSizeBytes || '3.5 MB'}</span>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Receipt Voucher Lightbox for Treasurer */}
      {activeReceiptLightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveReceiptLightbox(null)}
        >
          <div
            className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Official Expense Voucher</h3>
                <p className="text-[11px] text-slate-500">Verified fiscal receipt stored in Chapter ledger</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptLightbox(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-80 flex items-center justify-center">
              <img
                src={activeReceiptLightbox}
                alt="Receipt Voucher"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 pt-1 border-t border-slate-100">
              <span>✓ Verified by Ananya Iyer</span>
              <button
                type="button"
                onClick={() => {
                  setToastMsg('✓ Downloaded voucher copy');
                  setActiveReceiptLightbox(null);
                }}
                className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
              >
                Download Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Home Prefilled Expense Entry BottomSheet */}
      <BottomSheet
        isOpen={isHomeExpenseModalOpen}
        onClose={() => setIsHomeExpenseModalOpen(false)}
        title="Log Event Expense Voucher"
        subtitle="Record vendor payment directly for this chapter milestone"
      >
        <form onSubmit={handleHomeExpenseSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked Chapter Event</label>
            <select
              value={homeExpEventId}
              onChange={(e) => setHomeExpEventId(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title / Item</label>
            <input
              type="text"
              required
              value={homeExpTitle}
              onChange={(e) => setHomeExpTitle(e.target.value)}
              placeholder="e.g. Drone battery replacements & LiPo charging hub"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={homeExpCategory}
                onChange={(e) => setHomeExpCategory(e.target.value as any)}
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
                  required
                  value={homeExpAmount}
                  onChange={(e) => setHomeExpAmount(e.target.value)}
                  placeholder="6500"
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
                value={homeExpVendor}
                onChange={(e) => setHomeExpVendor(e.target.value)}
                placeholder="e.g. DroneSpares Hub India"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={homeExpDate}
                onChange={(e) => setHomeExpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Attachment</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const fakeUrl = URL.createObjectURL(file);
                  setHomeExpReceipt(fakeUrl);
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-1 cursor-pointer"
          >
            Confirm & Log Voucher
          </button>
        </form>
      </BottomSheet>

      {/* Promotion Checklist BottomSheet */}
      <BottomSheet
        isOpen={Boolean(activePromoChecklistCampaign)}
        onClose={() => setActivePromoChecklistCampaign(null)}
        title={
          activePromoChecklistCampaign
            ? `Promotion Tasks: ${activePromoChecklistCampaign.eventTitle}`
            : 'Promotion Checklist'
        }
        subtitle="Track event marketing milestones from teaser to post-event highlight"
      >
        {activePromoChecklistCampaign && (
          <div className="flex flex-col gap-3 py-1">
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                  Campaign Title
                </span>
                <span className="text-xs font-extrabold text-purple-950">
                  {activePromoChecklistCampaign.title}
                </span>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-full border border-purple-200">
                {Object.values(activePromoChecklistCampaign.checklist).filter(Boolean).length}/5 Done
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {[
                {
                  key: 'poster',
                  label: 'Official Promotional Poster',
                  desc: 'Design approved & distributed across boards & channels',
                },
                {
                  key: 'teaser',
                  label: 'Teaser Post & Story Sequence',
                  desc: '48-hour countdown reels and announcements',
                },
                {
                  key: 'regLink',
                  label: 'Registration Link Active',
                  desc: 'RSVP form verified & bio link configured',
                },
                {
                  key: 'reel',
                  label: 'Short-Form Reel / Video Short',
                  desc: 'Speaker preview or hands-on teaser published',
                },
                {
                  key: 'postEvent',
                  label: 'Post-Event Highlight & Album',
                  desc: 'Key moments and attendee photos shared',
                },
              ].map((task) => {
                const isChecked =
                  activePromoChecklistCampaign.checklist[task.key as keyof CampaignChecklist];
                return (
                  <button
                    key={task.key}
                    type="button"
                    onClick={() => {
                      const nextVal = !isChecked;
                      updateCampaignChecklist(
                        activePromoChecklistCampaign.id,
                        task.key as keyof CampaignChecklist,
                        nextVal
                      );
                      setActivePromoChecklistCampaign((prev) =>
                        prev
                          ? {
                              ...prev,
                              checklist: {
                                ...prev.checklist,
                                [task.key]: nextVal,
                              },
                            }
                          : null
                      );
                      showToast(`✓ Updated ${task.label}`);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-purple-50/50 border-purple-200 text-slate-800'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isChecked ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-bold block ${
                          isChecked ? 'text-purple-950' : 'text-slate-800'
                        }`}
                      >
                        {task.label}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        {task.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setActivePromoChecklistCampaign(null)}
              className="w-full py-2.5 rounded-full font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 mt-2 cursor-pointer"
            >
              Close Checklist
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

