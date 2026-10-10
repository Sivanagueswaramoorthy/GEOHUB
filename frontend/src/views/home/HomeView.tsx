import React, { useState, useEffect } from 'react';
import {
  Sun,
  FileText,
  Camera,
  Video,
  Newspaper,
  Calendar,
  Sparkles,
  CheckSquare,
  Copy,
  Download,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { orgConfig, OrgLogoIcon } from '../../config/org';
import { RoleBadge, BottomSheet, Toast } from '../../components';
import {
  PromotionHomeView,
  TreasurerHomeView,
  DocumentationHomeView,
  StudentHomeView,
  FacultyHomeView,
  CoordinatorHomeView,
} from '../roles';

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
    docTemplates,
    registerForEvent,
    addExpenseItem,
    approveItem,
    rejectItem,
    setActiveTab,
    setSelectedEventId,
  } = useApp();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Calendar State (for Coordinator & Faculty)
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

  // Documentation Lead State
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
      venue: 'Main Campus Quadrangle',
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
      date: 'Sep 28, 2026',
      venue: 'Botanical Garden',
      items: {
        report: 'draft',
        photos: 'submitted',
        videos: 'missing',
        dailyNews: 'draft',
        mom: 'missing',
        feedback: 'missing',
        attendanceSheet: 'submitted',
      },
    },
    {
      eventId: 'event_05',
      eventTitle: 'Adyar River Environmental Water Sampling',
      date: 'Sep 22, 2026',
      venue: 'Adyar Estuary Field Station',
      items: {
        report: 'submitted',
        photos: 'draft',
        videos: 'submitted',
        dailyNews: 'submitted',
        mom: 'draft',
        feedback: 'submitted',
        attendanceSheet: 'submitted',
      },
    },
  ]);
  const [activeChecklistEvent, setActiveChecklistEvent] = useState<EventDocStatus | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<{
    title: string;
    category: string;
    content: string;
  } | null>(null);
  const [activeMediaItem, setActiveMediaItem] = useState<any>(null);

  // Treasurer Expense Modal State
  const [isHomeExpenseModalOpen, setIsHomeExpenseModalOpen] = useState(false);
  const [homeExpEventId, setHomeExpEventId] = useState('');
  const [homeExpTitle, setHomeExpTitle] = useState('');
  const [homeExpCategory, setHomeExpCategory] = useState<
    'Logistics' | 'Stage' | 'Refreshments' | 'Printing' | 'Equipment' | 'Other'
  >('Logistics');
  const [homeExpAmount, setHomeExpAmount] = useState('');
  const [homeExpVendor, setHomeExpVendor] = useState('Campus Logistics & Services');
  const [homeExpDate, setHomeExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [homeExpReceipt, setHomeExpReceipt] = useState(
    'https://images.unsplash.com/photo-1554415707-9e4c010b93bb?auto=format&fit=crop&w=800&q=80'
  );

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleOpenPrefilledExpense = (
    eventId: string,
    title: string,
    category: 'Logistics' | 'Stage' | 'Refreshments' | 'Printing'
  ) => {
    setHomeExpEventId(eventId);
    setHomeExpTitle(title);
    setHomeExpCategory(category);
    setHomeExpAmount('6500');
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
    showToast(`✓ Recorded expense voucher of ${formatINR(numAmount)}!`);
    setIsHomeExpenseModalOpen(false);
  };

  // Greetings
  const hour = new Date().getHours();
  const greetingText =
    hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 4,
    minutes: 32,
    seconds: 15,
  });

  useEffect(() => {
    const targetDate = new Date(Date.now() + 102735000);
    const interval = setInterval(() => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const displayName =
    isFaculty && !currentUser.name.startsWith('Dr.')
      ? `Dr. ${currentUser.name}`
      : currentUser.name;

  // Toggle checklist item status for Doc Lead
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
  const weekDays = [
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

      {/* 1) Greeting Row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-0.5">
            <Sun size={20} strokeWidth={1.75} className="text-amber-500 animate-spin-slow shrink-0" />
            <span className="font-body-strong text-emerald-800">{greetingText}</span>
          </div>
          <h1
            className="font-display text-slate-900 tracking-tight"
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
          style={{ width: '72px', height: '72px', borderRadius: '22px', padding: '12px', boxSizing: 'border-box' }}
          title={orgConfig.orgName}
        >
          <OrgLogoIcon size={48} />
        </div>
      </div>

      {/* 2) Delegated Role Dashboard Views */}
      {isTreasurer ? (
        <TreasurerHomeView
          showToast={showToast}
          setSelectedEventId={setSelectedEventId}
          handleOpenPrefilledExpense={handleOpenPrefilledExpense}
        />
      ) : isPromotion ? (
        <PromotionHomeView showToast={showToast} />
      ) : isDocLead ? (
        <DocumentationHomeView
          docEvents={docEvents as any}
          getCompletionDetails={getCompletionDetails as any}
          setActiveChecklistEvent={setActiveChecklistEvent as any}
          handleOpenTemplateShortcut={handleOpenTemplateShortcut}
          setActiveMediaItem={setActiveMediaItem}
        />
      ) : isStudent ? (
        <StudentHomeView
          showToast={showToast}
          setSelectedEventId={setSelectedEventId}
          registerForEvent={registerForEvent}
        />
      ) : isFaculty ? (
        <FacultyHomeView
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          weekDays={weekDays}
          currentAgenda={currentAgenda}
          attentionItems={attentionItems}
          handleReviewAttention={handleReviewAttention}
          timeLeft={timeLeft}
        />
      ) : (
        <CoordinatorHomeView
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          weekDays={weekDays}
          currentAgenda={currentAgenda}
          attentionItems={attentionItems}
          handleReviewAttention={handleReviewAttention}
          timeLeft={timeLeft}
        />
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
                        <span className="text-[11px] text-slate-400 truncate">
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
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer active:scale-95 uppercase tracking-wide text-[11px] shadow-2xs ${badgeStyle}`}
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
                <FileText size={16} strokeWidth={1.75} />
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
              <span className="font-extrabold text-emerald-700 uppercase tracking-wider text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
                <Copy size={16} strokeWidth={1.75} />
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
                  <Download size={16} strokeWidth={1.75} />
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
                  <FileText size={16} strokeWidth={1.75} />
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
                  <MapPin size={16} strokeWidth={1.75} className="text-emerald-600" />
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
    </div>
  );
};

export default HomeView;
