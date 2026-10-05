import React, { useState, useMemo } from 'react';
import {
  Plus,
  Calendar,
  Radio,
  CheckCircle2,
  FileText,
  Star,
  Archive,
  Ban,
  Scan,
  Edit3,
  UserCheck,
  Play,
  Camera,
  Video,
  Newspaper,
  FileSpreadsheet,
  DollarSign,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions, FACULTY_ONLY_ARCHIVE } from '../../core/permissions';
import { EventModel, EventStatus, CampaignChecklist } from '../../types';
import {
  Overline,
  StatTile,
  SearchBar,
  EventHero,
  EventCard,
  BottomSheet,
  Toast,
  EmptyState,
} from '../../components';

export const ClubEventsView: React.FC = () => {
  const {
    currentUser,
    events,
    meetings,
    gallery,
    expenses,
    posts,
    campaigns,
    updateCampaignChecklist,
    addExpenseItem,
    setSelectedEventId,
    registerForEvent,
    createEvent,
    updateEvent,
    cancelEvent,
    completeEventWithData,
    setActiveTab,
    isPhoneFrame,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const isFaculty = currentUser.role === 'super_admin' || currentUser.role === 'faculty';
  const canArchive = perms.canArchiveEvents && FACULTY_ONLY_ARCHIVE;
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState<EventModel | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Event Expense Modal State
  const [isEventExpenseModalOpen, setIsEventExpenseModalOpen] = useState(false);
  const [eventExpTitle, setEventExpTitle] = useState('');
  const [eventExpCategory, setEventExpCategory] = useState<
    'Logistics' | 'Stage' | 'Printing' | 'Refreshments' | 'Equipment' | 'Other'
  >('Logistics');
  const [eventExpAmount, setEventExpAmount] = useState('');
  const [eventExpVendor, setEventExpVendor] = useState('');
  const [eventExpDate, setEventExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventExpReceipt, setEventExpReceipt] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  );
  const [eventExpNotes, setEventExpNotes] = useState('');

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleAddEventExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventModal || !eventExpTitle.trim() || !eventExpAmount) return;
    const num = parseFloat(eventExpAmount);
    addExpenseItem({
      eventId: selectedEventModal.id,
      eventTitle: selectedEventModal.title,
      title: eventExpTitle,
      amount: isNaN(num) ? 0 : num,
      category: eventExpCategory,
      buyingDate: eventExpDate,
      vendorName: eventExpVendor || 'Campus Vendor',
      receiptUrl: eventExpReceipt,
      approvedBy: 'Dr. Sarah Jenkins (Faculty Advisor)',
      notes: eventExpNotes,
    });
    showToast(`✓ Added ₹${num.toLocaleString('en-IN')} expense to ${selectedEventModal.title}`);
    setIsEventExpenseModalOpen(false);
    setEventExpTitle('');
    setEventExpAmount('');
    setEventExpVendor('');
    setEventExpNotes('');
  };

  // Documentation Checklist Map per event
  const [eventDocStatusMap, setEventDocStatusMap] = useState<
    Record<string, Record<string, 'missing' | 'draft' | 'submitted'>>
  >({
    event_01: {
      report: 'submitted',
      photos: 'submitted',
      videos: 'submitted',
      dailyNews: 'submitted',
      mom: 'submitted',
      feedback: 'submitted',
      attendanceSheet: 'submitted',
    },
    event_02: {
      report: 'draft',
      photos: 'submitted',
      videos: 'draft',
      dailyNews: 'submitted',
      mom: 'submitted',
      feedback: 'missing',
      attendanceSheet: 'submitted',
    },
    event_03: {
      report: 'missing',
      photos: 'draft',
      videos: 'missing',
      dailyNews: 'draft',
      mom: 'missing',
      feedback: 'missing',
      attendanceSheet: 'missing',
    },
    event_05: {
      report: 'draft',
      photos: 'submitted',
      videos: 'missing',
      dailyNews: 'missing',
      mom: 'draft',
      feedback: 'missing',
      attendanceSheet: 'draft',
    },
  });

  const getDocItemStatus = (eventId: string, key: string): 'missing' | 'draft' | 'submitted' => {
    return eventDocStatusMap[eventId]?.[key] || 'missing';
  };

  const handleCycleEventDocStatus = (eventId: string, key: string, label: string) => {
    const current = getDocItemStatus(eventId, key);
    const next: 'missing' | 'draft' | 'submitted' =
      current === 'missing' ? 'draft' : current === 'draft' ? 'submitted' : 'missing';
    setEventDocStatusMap((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [key]: next,
      },
    }));
    showToast(`✓ Updated ${label}: ${next.toUpperCase()}`);
  };

  // Cancel Event Confirmation Dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');

  // Assign Duties Modal State
  const [isAssignDutiesOpen, setIsAssignDutiesOpen] = useState(false);
  const [docVolunteer, setDocVolunteer] = useState('Priya Sharma');
  const [signageVolunteer, setSignageVolunteer] = useState('Kiran Kumar');
  const [foodVolunteer, setFoodVolunteer] = useState('Ananya Sen');

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('GIS Expedition');
  const [newVenue, setNewVenue] = useState('');
  const [newDate, setNewDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newGoogleForm, setNewGoogleForm] = useState('');

  // Edit Event Form State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBudget, setEditBudget] = useState(5000);
  const [editCapacity, setEditCapacity] = useState(250);

  const handleOpenEdit = () => {
    if (!selectedEventModal) return;
    setEditTitle(selectedEventModal.title);
    setEditCategory(selectedEventModal.category || 'GIS Expedition');
    setEditVenue(selectedEventModal.venue);
    setEditDate(selectedEventModal.startDate ? selectedEventModal.startDate.split('T')[0] : '');
    setEditDesc(selectedEventModal.description || '');
    setEditBudget(selectedEventModal.budget || 5000);
    setEditCapacity(selectedEventModal.capacity || 250);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventModal) return;
    const updated = {
      title: editTitle,
      category: editCategory,
      venue: editVenue,
      startDate: editDate ? `${editDate}T10:00:00.000Z` : selectedEventModal.startDate,
      description: editDesc,
      budget: Number(editBudget),
      capacity: Number(editCapacity),
    };
    updateEvent(selectedEventModal.id, updated);
    setSelectedEventModal({ ...selectedEventModal, ...updated });
    setIsEditOpen(false);
    showToast(`✓ Updated event: "${editTitle}"`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Metrics
  const totalEvents = events.length;
  const liveEvents = events.filter((e) => e.status === 'live').length;

  // Spotlight / Live Event for EventHero
  const spotlightEvent = useMemo(() => {
    const live = events.find((e) => e.status === 'live');
    if (live) return live;
    return events.find((e) => e.status === 'approved') || events[0];
  }, [events]);

  // Filtered Events list
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        (ev.description && ev.description.toLowerCase().includes(q))
      );
    });
  }, [events, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVenue.trim()) {
      showToast('Please provide a title and venue');
      return;
    }

    const startDateTime = newDate ? new Date(`${newDate}T10:00:00`) : new Date(Date.now() + 86400000 * 2);
    createEvent({
      title: newTitle,
      category: newCategory,
      venue: newVenue,
      description: newDesc || 'Academic expedition and GIS fieldwork symposium.',
      capacity: 250,
      budget: 5000,
      googleFormUrl: newGoogleForm.trim() || undefined,
      posterUrl:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      startDate: startDateTime.toISOString(),
      endDate: new Date(startDateTime.getTime() + 14400000).toISOString(),
      status: 'approved',
      createdBy: currentUser.name,
      eventType: 'internal',
      volunteerAssignments: {
        documentation: ['Priya Sharma'],
        signageDesign: ['Kiran Kumar'],
        shortlistedStudents: ['Vikram Patel'],
        foodRefreshments: ['Ananya Sen'],
      },
      workDoneStatus: {
        documentationDone: false,
        signageDone: true,
        shortlistingDone: true,
        foodArranged: false,
      },
    });

    setIsCreateOpen(false);
    showToast(`✓ Created event: "${newTitle}"`);
    setNewTitle('');
    setNewVenue('');
    setNewDesc('');
    setNewGoogleForm('');
  };

  const handleCardClick = (ev: EventModel) => {
    setSelectedEventModal(ev);
    setSelectedEventId(ev.id);
  };

  // Lifecycle status actions
  const handleUpdateStatus = (newStatus: EventStatus) => {
    if (!selectedEventModal) return;
    if (newStatus === 'completed') {
      completeEventWithData(selectedEventModal.id, {
        feedbackRating: 4.9,
        feedbackNotes: 'Exemplary faculty feedback and 95% attendance.',
      });
    }
    updateEvent(selectedEventModal.id, { status: newStatus });
    setSelectedEventModal({ ...selectedEventModal, status: newStatus });
    showToast(`✓ Event status transitioned to: ${newStatus.toUpperCase()}`);
  };

  // Cancel with minimum 10 characters reason check
  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventModal) return;
    if (cancelReasonText.trim().length < 10) {
      showToast('Cancellation reason must be at least 10 characters long.');
      return;
    }

    cancelEvent(selectedEventModal.id, cancelReasonText);
    showToast(`Event cancelled: "${cancelReasonText}"`);
    setIsCancelDialogOpen(false);
    setSelectedEventModal(null);
    setCancelReasonText('');
  };

  const handleAssignDutiesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventModal) return;
    const newAssignments = {
      documentation: [docVolunteer],
      signageDesign: [signageVolunteer],
      foodRefreshments: [foodVolunteer],
      shortlistedStudents: ['Vikram Patel'],
    };
    updateEvent(selectedEventModal.id, { volunteerAssignments: newAssignments });
    setSelectedEventModal({
      ...selectedEventModal,
      volunteerAssignments: newAssignments,
    });
    showToast('✓ Operational duties assigned and notification dispatched!');
    setIsAssignDutiesOpen(false);
  };

  const lifecycleStages: { key: EventStatus; label: string }[] = [
    { key: 'draft', label: 'Draft' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'live', label: 'Live' },
    { key: 'completed', label: 'Done' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <Overline pill dot className="mb-1.5">
            GEO EXPEDITIONS & LABS
          </Overline>

          <h1
            className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Club Events
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Discover upcoming workshops, expeditions, and campus activities
          </p>
        </div>

        {/* Green + New Event pill button */}
        {perms.canCreateEditEvents && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-95 shrink-0 mt-1 cursor-pointer"
            style={{
              backgroundColor: '#10B981',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Event</span>
          </button>
        )}
      </div>

      {/* Two Stat Boxes: Total Events & Live Sessions */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Total Events"
          value={totalEvents}
          footnote="Semester Calendar"
          tint="mint"
          icon={<Calendar size={18} />}
        />
        <StatTile
          label="Live Sessions"
          value={liveEvents > 0 ? liveEvents : 1}
          footnote="Auditorium Entry Active"
          tint="lavender"
          icon={<Radio size={18} className="animate-pulse" />}
        />
      </div>

      {/* EventHero for the Live / Featured Event */}
      {spotlightEvent && (
        <EventHero
          event={spotlightEvent}
          onDetailsClick={handleCardClick}
        />
      )}

      {/* SearchBar */}
      <div className="pt-1">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title, venue, or description..."
        />
      </div>

      {/* Events List Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          All Chapter Activities ({filteredEvents.length})
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* EventCards List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Try modifying your search query or clear the filter to see all events."
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isPhoneFrame ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '14px',
          }}
        >
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* Full Event Detail Modal with Lifecycle, Duties, MoM, Attendance, Actions */}
      <BottomSheet
        isOpen={!!selectedEventModal && !isCancelDialogOpen && !isAssignDutiesOpen}
        onClose={() => setSelectedEventModal(null)}
        title={selectedEventModal?.title}
        subtitle={`${selectedEventModal?.category || 'Expedition'} • ${selectedEventModal?.venue}`}
      >
        {selectedEventModal && (
          <div className="flex flex-col gap-4 py-1">
            {/* 1. Lifecycle Timeline */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Event Lifecycle Progress
              </span>
              <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                {lifecycleStages.map((stage, idx) => {
                  const isCurrent = selectedEventModal.status === stage.key;
                  const isPassed =
                    lifecycleStages.findIndex((s) => s.key === selectedEventModal.status) >= idx;

                  return (
                    <div key={stage.key} className="flex-1 flex flex-col items-center min-w-[44px]">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all ${
                          isCurrent
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[9.5px] font-bold mt-1 text-center truncate w-full ${
                          isCurrent ? 'text-emerald-700' : isPassed ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Executive Action Bar: Edit, Assign duties, Start, Complete, Archive, Cancel */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 flex flex-wrap gap-2">
              <span className="w-full text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                {isFaculty ? 'Faculty Governance Actions' : 'Event Management Actions'}
              </span>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAssignDutiesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                <UserCheck size={13} />
                <span>Assign Duties</span>
              </button>
              {selectedEventModal.status !== 'live' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('live')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                >
                  <Play size={13} />
                  <span>Start Live Event</span>
                </button>
              )}
              {selectedEventModal.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('completed')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  <span>Mark Completed</span>
                </button>
              )}
              {canArchive && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('archived')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <Archive size={13} />
                  <span>Archive</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCancelDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 ml-auto cursor-pointer"
              >
                <Ban size={13} />
                <span>Cancel Event</span>
              </button>
            </div>

            {/* 3. Operational Duties Checklist */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Operational Duties Roster
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Roster
                </span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800">1. Documentation & MoM</span>
                  <span className="text-slate-600 font-medium">Priya Sharma (Done ✓)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800">2. Signage & Entrance Badges</span>
                  <span className="text-slate-600 font-medium">Kiran Kumar (Ready ✓)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800">3. Shortlisted Students</span>
                  <span className="text-slate-600 font-medium">Vikram Patel (45 Scholars)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800">4. Food & Refreshments</span>
                  <span className="text-slate-600 font-medium">Ananya Sen (Arranged)</span>
                </div>
              </div>
            </div>

            {/* 4. Attendance Check & Quick Gate Scanner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-extrabold text-emerald-800 uppercase">
                  Turnstile Gate Headcount
                </span>
                <span className="font-extrabold text-base text-emerald-950 mt-0.5">
                  {selectedEventModal.registeredUserIds.length} Registered Attendees
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedEventModal(null);
                  setActiveTab('scan_qr');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              >
                <Scan size={14} />
                <span>Launch Scanner</span>
              </button>
            </div>

            {/* Event Detail: Budget Section (allocated, spent, remaining, expenses, Add expense) */}
            {(() => {
              const eventAllocated =
                selectedEventModal.id === 'event_01'
                  ? 150000
                  : selectedEventModal.id === 'event_02'
                  ? 120000
                  : selectedEventModal.id === 'event_05'
                  ? 45000
                  : selectedEventModal.id === 'event_03'
                  ? 35000
                  : selectedEventModal.budget > 5000
                  ? selectedEventModal.budget
                  : 50000;

              const eventExpensesList = expenses.filter(
                (e) =>
                  e.eventId === selectedEventModal.id ||
                  (e.eventTitle && e.eventTitle.toLowerCase() === selectedEventModal.title.toLowerCase())
              );

              const eventSpent = eventExpensesList.reduce((sum, e) => sum + e.amount, 0);
              const eventRemaining = Math.max(0, eventAllocated - eventSpent);
              const eventUsedPct = Math.min(100, Math.round((eventSpent / eventAllocated) * 100));

              return (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={16} className="text-emerald-600" />
                      <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider">
                        Event Budget & Fiscal Status
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEventExpTitle('');
                        setEventExpAmount('');
                        setEventExpVendor('');
                        setIsEventExpenseModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer active:scale-95"
                    >
                      <Plus size={12} />
                      <span>Add Expense</span>
                    </button>
                  </div>

                  {/* 3 Metric Tiles */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500">Allocated</span>
                      <span className="text-xs font-extrabold text-slate-900 font-mono mt-0.5">
                        {formatINR(eventAllocated)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex flex-col">
                      <span className="text-[10px] font-bold text-amber-700">Spent</span>
                      <span className="text-xs font-extrabold text-amber-950 font-mono mt-0.5">
                        {formatINR(eventSpent)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-700">Remaining</span>
                      <span className="text-xs font-extrabold text-emerald-950 font-mono mt-0.5">
                        {formatINR(eventRemaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Burn Rate</span>
                      <span className="font-bold text-slate-900">{eventUsedPct}% used</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          eventUsedPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${eventUsedPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Expense Line Items List */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Event Expenses Logged ({eventExpensesList.length})
                    </span>
                    {eventExpensesList.length === 0 ? (
                      <div className="p-3 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                        No expenses logged yet. Tap "+ Add Expense" to record a voucher.
                      </div>
                    ) : (
                      eventExpensesList.map((exp) => (
                        <div
                          key={exp.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{exp.title}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {exp.vendorName} • {exp.category} • {exp.buyingDate}
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-emerald-950 shrink-0">
                            {formatINR(exp.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 5. Meetings & Standups for this Event */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Associated Chapter Meetings & MoM
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEventModal(null);
                    setActiveTab('meetings');
                  }}
                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  View All ({meetings.length})
                </button>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {meetings
                  .filter((m) => m.eventId === selectedEventModal.id || m.title.toLowerCase().includes(selectedEventModal.title.toLowerCase().split(' ')[0]))
                  .slice(0, 2)
                  .map((m) => (
                    <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{m.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{m.venue} • {new Date(m.dateTime).toLocaleDateString()}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                        {m.status === 'completed' ? 'MoM Filed ✓' : 'Scheduled'}
                      </span>
                    </div>
                  ))}
                {meetings.filter((m) => m.eventId === selectedEventModal.id || m.title.toLowerCase().includes(selectedEventModal.title.toLowerCase().split(' ')[0])).length === 0 && (
                  <div className="text-[11px] text-slate-500 p-2 bg-slate-50 rounded-xl">
                    Pre-event briefing standup scheduled with Core Committee.
                  </div>
                )}
              </div>
            </div>

            {/* 6. Documentation Checklist (7 items with status chips: Missing, Draft, Submitted) */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Documentation & Archival Checklist
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tap chip to cycle
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { key: 'report', label: 'Event report', icon: <FileText size={14} className="text-emerald-600" /> },
                  { key: 'photos', label: 'Photos (geotagged or normal)', icon: <Camera size={14} className="text-blue-600" /> },
                  { key: 'videos', label: 'Videos (as links)', icon: <Video size={14} className="text-purple-600" /> },
                  { key: 'dailyNews', label: 'Daily news', icon: <Newspaper size={14} className="text-amber-600" /> },
                  { key: 'mom', label: 'MoM (Minutes of Meeting)', icon: <Calendar size={14} className="text-indigo-600" /> },
                  { key: 'feedback', label: 'Feedback summary', icon: <Star size={14} className="text-teal-600" /> },
                  { key: 'attendanceSheet', label: 'Attendance sheet', icon: <FileSpreadsheet size={14} className="text-emerald-600" /> },
                ].map((item) => {
                  const status = getDocItemStatus(selectedEventModal.id, item.key);
                  const chipClass =
                    status === 'submitted'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                      : status === 'draft'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                      : 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';

                  return (
                    <div
                      key={item.key}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0">{item.icon}</span>
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {item.label}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCycleEventDocStatus(selectedEventModal.id, item.key, item.label)}
                        className={`px-2.5 py-1 rounded-full text-[10px] border shadow-2xs transition-all cursor-pointer active:scale-95 uppercase tracking-wide shrink-0 ${chipClass}`}
                        title="Tap to toggle: Missing → Draft → Submitted"
                      >
                        {status === 'submitted' ? '✓ Submitted' : status === 'draft' ? '✎ Draft' : '✗ Missing'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6B. Promotion Section (Posts per platform and status + Campaign Tasks) */}
            {(() => {
              const eventCampaign = campaigns.find(
                (c) =>
                  c.eventId === selectedEventModal.id ||
                  c.eventTitle.toLowerCase().includes(selectedEventModal.title.toLowerCase().split(' ')[0])
              );
              const eventPosts = posts.filter(
                (p) =>
                  p.eventId === selectedEventModal.id ||
                  (p.eventTitle &&
                    p.eventTitle.toLowerCase().includes(selectedEventModal.title.toLowerCase().split(' ')[0]))
              );

              return (
                <div className="p-3.5 rounded-2xl bg-white border border-purple-100 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Megaphone size={16} className="text-purple-600" />
                      <span className="text-[10px] font-extrabold text-purple-950 uppercase tracking-wider">
                        Promotion & Social Broadcasts
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventModal(null);
                        setActiveTab('campaigns');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      <span>Campaign Studio</span>
                    </button>
                  </div>

                  {/* Campaign tasks / checklist */}
                  {eventCampaign ? (
                    <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-900">
                          Campaign Tasks: {eventCampaign.title}
                        </span>
                        <span className="text-[10px] font-extrabold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                          {Object.values(eventCampaign.checklist).filter(Boolean).length}/5 Done
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 mt-1">
                        {[
                          { key: 'poster', label: 'Official Promotional Poster' },
                          { key: 'teaser', label: 'Teaser Post & Story Sequence' },
                          { key: 'regLink', label: 'Registration Link Active in Bio' },
                          { key: 'reel', label: 'Short-Form Reel / Teaser Video' },
                          { key: 'postEvent', label: 'Post-Event Highlight & Recaps' },
                        ].map((t) => {
                          const done = eventCampaign.checklist[t.key as keyof CampaignChecklist];
                          return (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => {
                                updateCampaignChecklist(eventCampaign.id, t.key as keyof CampaignChecklist, !done);
                                showToast(`✓ Toggled ${t.label}`);
                              }}
                              className={`p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                                done
                                  ? 'bg-purple-100/60 border-purple-300 text-purple-900 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                                    done ? 'bg-purple-600 text-white' : 'border border-slate-300'
                                  }`}
                                >
                                  {done ? '✓' : ''}
                                </span>
                                <span>{t.label}</span>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-extrabold ${
                                  done ? 'text-purple-700' : 'text-slate-400'
                                }`}
                              >
                                {done ? 'Done' : 'Pending'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium">
                      No standalone campaign chartered yet.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventModal(null);
                          setActiveTab('campaigns');
                        }}
                        className="font-bold text-purple-700 hover:underline inline cursor-pointer"
                      >
                        Launch Campaign in Studio
                      </button>
                    </div>
                  )}

                  {/* Posts per platform & status */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Social Posts ({eventPosts.length})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {eventPosts.filter((p) => p.status === 'Posted').length} posted •{' '}
                        {eventPosts.filter((p) => p.status === 'Scheduled').length} scheduled •{' '}
                        {eventPosts.filter((p) => p.status === 'Draft').length} drafts
                      </span>
                    </div>

                    {eventPosts.length === 0 ? (
                      <div className="p-3 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                        No promotional posts created for this event yet.
                      </div>
                    ) : (
                      eventPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  post.platform === 'Instagram'
                                    ? 'bg-pink-100 text-pink-700'
                                    : post.platform === 'LinkedIn'
                                    ? 'bg-blue-100 text-blue-700'
                                    : post.platform === 'WhatsApp'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
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
                            <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                              {post.caption}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                              post.status === 'Posted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : post.status === 'Scheduled'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 7. Feedback & Ratings */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Participant & Faculty Feedback
                </span>
                <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600">
                  <Star size={13} className="fill-amber-400 text-amber-500" />
                  <span>{selectedEventModal.completedData?.feedbackRating || 4.9} / 5.0</span>
                </div>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                "{selectedEventModal.completedData?.feedbackNotes || 'Exemplary fieldwork execution. All scholars demonstrated GPS data collection and GIS map compilation.'}"
              </p>
            </div>

            {/* 8. Event Geotagged Gallery Preview */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Expedition Media Gallery
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEventModal(null);
                    setActiveTab('archives');
                  }}
                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Open Archive
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                {(gallery.filter((g) => g.eventId === selectedEventModal.id).length > 0
                  ? gallery.filter((g) => g.eventId === selectedEventModal.id)
                  : gallery.slice(0, 2)
                ).map((g) => (
                  <div key={g.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    <img src={g.url} alt={g.title} className="w-full h-20 object-cover" style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                    <div className="p-1.5 bg-white text-[10px] font-bold text-slate-800 truncate">
                      {g.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RSVP / Registration Toggle for Member */}
            <button
              type="button"
              onClick={() => {
                registerForEvent(selectedEventModal.id);
                showToast(`✓ RSVP Updated for ${selectedEventModal.title}`);
                setSelectedEventModal(null);
              }}
              className="w-full py-3 rounded-full font-bold text-xs bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all"
            >
              Toggle Personal RSVP
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Cancel Reason Dialog (requires minimum 10 characters) */}
      <BottomSheet
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        title="Confirm Event Cancellation"
        subtitle="Requires written institutional cancellation reason (min 10 characters)"
      >
        <form onSubmit={handleConfirmCancel} className="flex flex-col gap-3 py-1">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            Warning: Cancellation will notify all registered scholars and revoke turnstile check-in tokens.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cancellation Reason (Minimum 10 chars)
            </label>
            <textarea
              rows={3}
              required
              value={cancelReasonText}
              onChange={(e) => setCancelReasonText(e.target.value)}
              placeholder="e.g. Inclement weather conditions causing postponement of field expedition..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-red-500 outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Character count: {cancelReasonText.trim().length} / 10 required
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(false)}
              className="px-4 py-2.5 rounded-full font-bold text-xs text-slate-600 hover:bg-slate-100"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={cancelReasonText.trim().length < 10}
              className="px-5 py-2.5 rounded-full font-bold text-xs bg-red-600 text-white disabled:opacity-50 shadow-sm"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Assign Duties Modal */}
      <BottomSheet
        isOpen={isAssignDutiesOpen}
        onClose={() => setIsAssignDutiesOpen(false)}
        title="Assign Event Operational Duties"
        subtitle={selectedEventModal?.title}
      >
        <form onSubmit={handleAssignDutiesSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Documentation Lead</label>
            <input
              type="text"
              value={docVolunteer}
              onChange={(e) => setDocVolunteer(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Signage & Badges</label>
            <input
              type="text"
              value={signageVolunteer}
              onChange={(e) => setSignageVolunteer(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Refreshments & Food</label>
            <input
              type="text"
              value={foodVolunteer}
              onChange={(e) => setFoodVolunteer(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 mt-2"
          >
            Confirm Assignments
          </button>
        </form>
      </BottomSheet>

      {/* New Event Modal */}
      <BottomSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Charter New Event"
        subtitle="Schedule an official chapter workshop, lab, or field trip"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Remote Sensing & Drone Mapping Workshop"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none bg-white"
            >
              <option value="GIS Expedition">GIS Expedition</option>
              <option value="Map Lab Workshop">Map Lab Workshop</option>
              <option value="Geo Symposium">Geo Symposium</option>
              <option value="Eco Conservation Drive">Eco Conservation Drive</option>
              <option value="Core Committee Meeting">Core Committee Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Venue / Location
            </label>
            <input
              type="text"
              required
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
              placeholder="e.g. Science Block Seminar Hall 3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Key activities, guest speakers, learning outcomes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-2"
          >
            Create & Publish Event
          </button>
        </form>
      </BottomSheet>

      {/* Edit Event Modal */}
      <BottomSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Event Details"
        subtitle={selectedEventModal?.title}
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none bg-white"
              >
                <option value="GIS Expedition">GIS Expedition</option>
                <option value="Map Lab Workshop">Map Lab Workshop</option>
                <option value="Geo Symposium">Geo Symposium</option>
                <option value="Eco Conservation Drive">Eco Conservation Drive</option>
                <option value="Core Committee Meeting">Core Committee Meeting</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Location</label>
            <input
              type="text"
              required
              value={editVenue}
              onChange={(e) => setEditVenue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Budget (₹)</label>
              <input
                type="number"
                value={editBudget}
                onChange={(e) => setEditBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attendee Capacity</label>
              <input
                type="number"
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Scope</label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-2"
          >
            Save Event Changes
          </button>
        </form>
      </BottomSheet>

      {/* Add Expense Modal for Event */}
      <BottomSheet
        isOpen={isEventExpenseModalOpen}
        onClose={() => setIsEventExpenseModalOpen(false)}
        title="Add Event Expense"
        subtitle={selectedEventModal ? `Log bill or voucher for ${selectedEventModal.title}` : 'Record expense voucher'}
      >
        <form onSubmit={handleAddEventExpense} className="flex flex-col gap-3 py-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title / Item</label>
            <input
              type="text"
              required
              value={eventExpTitle}
              onChange={(e) => setEventExpTitle(e.target.value)}
              placeholder="e.g. Refreshment Boxes or Sound Rigging"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={eventExpCategory}
                onChange={(e) => setEventExpCategory(e.target.value as any)}
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
                  value={eventExpAmount}
                  onChange={(e) => setEventExpAmount(e.target.value)}
                  placeholder="5000"
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
                value={eventExpVendor}
                onChange={(e) => setEventExpVendor(e.target.value)}
                placeholder="e.g. Apex Audio & Stage"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={eventExpDate}
                onChange={(e) => setEventExpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Purpose</label>
            <textarea
              rows={2}
              value={eventExpNotes}
              onChange={(e) => setEventExpNotes(e.target.value)}
              placeholder="e.g. Microphone batteries and stage truss safety clamps."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all mt-1 cursor-pointer"
          >
            Record Event Expense
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};
