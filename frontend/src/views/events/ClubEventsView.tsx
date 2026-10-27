import React, { useState, useMemo, useEffect } from 'react';
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
  Megaphone,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Layers,
  Sparkles,
  Check,
  ShieldCheck,
  ChevronRight,
  BadgeCheck,
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
    posts,
    campaigns,
    updateCampaignChecklist,
    selectedEventId,
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

  // Sync selectedEventId from context if user was navigated here with a specific event
  useEffect(() => {
    if (selectedEventId && !selectedEventModal) {
      const found = events.find((e) => e.id === selectedEventId);
      if (found) {
        setSelectedEventModal(found);
      }
    }
  }, [selectedEventId, events]);



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
  const [newBudget, setNewBudget] = useState('5000');
  const [newCapacity, setNewCapacity] = useState('250');

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
      capacity: Number(newCapacity) || 250,
      budget: Number(newBudget) || 5000,
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
    setSelectedEventId(null);
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

  // =========================================================================
  // VIEW 1: FULL PAGE CHARTER NEW EVENT (NO BOTTOM SHEET POPUP)
  // =========================================================================
  if (isCreateOpen) {
    return (
      <div className="flex flex-col gap-4 pb-20 animate-fadeIn">
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

        {/* Top Navigation Bar with Back Button */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
              <span>Back to Club Events</span>
            </button>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Charter Studio
            </span>
          </div>

          <div className="mt-1">
            <Overline pill dot className="mb-1">
              CHAPTER ADMINISTRATION • CHARTER STUDIO
            </Overline>
            <h1
              className="text-2xl font-black text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              Charter New Event
            </h1>
          </div>
        </div>

        {/* Full-Page Form Container */}
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {/* Section 1: Core Event Identity */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Core Event Identity
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Remote Sensing & Drone Mapping Workshop"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category Track <span className="text-rose-500">*</span>
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
              >
                <option value="GIS Expedition">GIS Expedition</option>
                <option value="Map Lab Workshop">Map Lab Workshop</option>
                <option value="Geo Symposium">Geo Symposium</option>
                <option value="Eco Conservation Drive">Eco Conservation Drive</option>
                <option value="Core Committee Meeting">Core Committee Meeting</option>
              </select>
            </div>
          </div>

          {/* Section 2: Venue & Schedule Logistics */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                2. Venue & Schedule Logistics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Venue / Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="e.g. Science Block Seminar Hall 3"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Scheduled Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Scope & Academic Objectives */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                3. Scope & Academic Objectives
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Description & Objectives
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Key activities, guest speakers, learning outcomes, and technical equipment required..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registration / External Google Form URL (Optional)
              </label>
              <input
                type="url"
                value={newGoogleForm}
                onChange={(e) => setNewGoogleForm(e.target.value)}
                placeholder="https://forms.gle/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Section 4: Resource & Capacity Parameters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                4. Resource & Capacity Parameters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Allocated Budget (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="5000"
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Attendee Capacity
                </label>
                <div className="relative">
                  <Users size={16} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="10"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    placeholder="250"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 px-6 rounded-full font-bold text-xs text-white shadow-md hover:bg-emerald-600 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: '#235347',
                boxShadow: '0 4px 14px rgba(35, 83, 71, 0.35)',
              }}
            >
              <Plus size={16} strokeWidth={1.75} />
              <span>Create & Publish Event</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="w-full sm:w-auto py-3 px-6 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer text-center"
            >
              Cancel & Discard
            </button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL PAGE EVENT DETAILS & OPERATIONS (NO BOTTOM SHEET POPUP)
  // =========================================================================
  if (selectedEventModal) {
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

    const statusBadgeColor =
      selectedEventModal.status === 'live'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : selectedEventModal.status === 'approved'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : selectedEventModal.status === 'completed'
        ? 'bg-blue-50 text-blue-800 border-blue-200'
        : selectedEventModal.status === 'archived'
        ? 'bg-slate-100 text-slate-700 border-slate-300'
        : 'bg-amber-50 text-amber-800 border-amber-200';

    return (
      <div className="flex flex-col gap-5 pb-24 animate-fadeIn">
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setSelectedEventModal(null);
              setSelectedEventId(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-xs hover:bg-[#DAF1DE]/40 hover:border-[#8EB69B] transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            <span>Back to Club Events</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs inline-flex items-center gap-1.5"
              style={{
                backgroundColor:
                  selectedEventModal.status === 'live'
                    ? '#FFF1F2'
                    : selectedEventModal.status === 'approved'
                    ? '#DAF1DE'
                    : selectedEventModal.status === 'completed'
                    ? '#EFF6FF'
                    : '#FFFBEB',
                color:
                  selectedEventModal.status === 'live'
                    ? '#BE123C'
                    : selectedEventModal.status === 'approved'
                    ? '#0B2B26'
                    : selectedEventModal.status === 'completed'
                    ? '#1E40AF'
                    : '#B45309',
                borderColor:
                  selectedEventModal.status === 'live'
                    ? '#FECDD3'
                    : selectedEventModal.status === 'approved'
                    ? '#8EB69B'
                    : selectedEventModal.status === 'completed'
                    ? '#BFDBFE'
                    : '#FDE68A',
              }}
            >
              {selectedEventModal.status === 'live' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              )}
              {selectedEventModal.status === 'approved' && <ShieldCheck size={13} color="#235347" />}
              <span>{selectedEventModal.status}</span>
            </span>
          </div>
        </div>

        {/* Executive Event Dossier Hero Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #051F20 0%, #0B2B26 48%, #163832 100%)',
            borderRadius: '26px',
            padding: '24px 26px',
            color: '#FFFFFF',
            border: '1px solid rgba(142, 182, 155, 0.28)',
            boxShadow: '0 14px 36px -4px rgba(5, 31, 32, 0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient radial glow decorations */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(142, 182, 155, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '10%',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(35, 83, 71, 0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#DAF1DE',
                    backgroundColor: 'rgba(218, 241, 222, 0.14)',
                    border: '1px solid rgba(142, 182, 155, 0.35)',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Sparkles size={11} color="#DAF1DE" />
                  <span>{selectedEventModal.category || 'CULTURAL & ACADEMIC'}</span>
                </span>
                <span style={{ fontSize: '11px', color: '#8EB69B', fontWeight: 600 }}>
                  Created by {selectedEventModal.createdBy || 'Core Team'}
                </span>
              </div>

              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                }}
              >
                {selectedEventModal.title}
              </h1>

              <p
                style={{
                  fontSize: '13px',
                  color: '#DAF1DE',
                  opacity: 0.88,
                  margin: '8px 0 0 0',
                  lineHeight: 1.6,
                  maxWidth: '680px',
                }}
              >
                {selectedEventModal.description}
              </p>
            </div>

            {/* Frosted Metadata Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <MapPin size={16} color="#DAF1DE" className="shrink-0" />
                <span style={{ color: '#FFFFFF', fontWeight: 600 }} className="truncate">
                  {selectedEventModal.venue}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <Calendar size={16} color="#DAF1DE" className="shrink-0" />
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {selectedEventModal.startDate
                    ? new Date(selectedEventModal.startDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Date TBA'}
                </span>
              </div>

              {selectedEventModal.capacity && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <Users size={16} color="#DAF1DE" className="shrink-0" />
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                    Target Capacity: {selectedEventModal.capacity} Scholars
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1. Event Lifecycle Pipeline */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            border: '1px solid #E5EBE7',
            padding: '20px 22px',
            boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={13} color="#235347" />
              <span>Event Lifecycle Progress</span>
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: '#DAF1DE',
                color: '#0B2B26',
                border: '1px solid #8EB69B',
              }}
            >
              Phase: {selectedEventModal.status.toUpperCase()}
            </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', overflowX: 'auto', padding: '6px 2px' }}>
            {/* Connecting baseline */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '24px',
                right: '24px',
                height: '3px',
                backgroundColor: '#E2E8F0',
                zIndex: 0,
              }}
            />

            {lifecycleStages.map((stage, idx) => {
              const isCurrent = selectedEventModal.status === stage.key;
              const isPassed =
                lifecycleStages.findIndex((s) => s.key === selectedEventModal.status) >= idx;

              return (
                <div key={stage.key} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '56px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      transition: 'all 0.2s ease',
                      backgroundColor: isCurrent ? '#0B2B26' : isPassed ? '#235347' : '#FFFFFF',
                      color: isCurrent ? '#DAF1DE' : isPassed ? '#FFFFFF' : '#94A3B8',
                      border: isCurrent
                        ? '3px solid #8EB69B'
                        : isPassed
                        ? '2px solid #235347'
                        : '2px solid #CBD5E1',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(218, 241, 222, 0.7), 0 2px 6px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    {isPassed && !isCurrent ? <Check size={14} strokeWidth={2.5} /> : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isCurrent ? 800 : isPassed ? 700 : 500,
                      marginTop: '6px',
                      color: isCurrent ? '#0B2B26' : isPassed ? '#334155' : '#94A3B8',
                      textAlign: 'center',
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Executive Governance Actions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            border: '1px solid #E5EBE7',
            padding: '18px 20px',
            boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#64748B',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={13} color="#235347" />
            <span>{isFaculty ? 'Faculty Governance Actions' : 'Event Management Actions'}</span>
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleOpenEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              <Edit3 size={14} strokeWidth={2} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAssignDutiesOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0B2B26 0%, #235347 100%)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(11, 43, 38, 0.25)',
                transition: 'all 0.15s ease',
              }}
              className="hover:opacity-95 active:scale-95"
            >
              <UserCheck size={14} strokeWidth={2} />
              <span>Assign Duties</span>
            </button>

            {selectedEventModal.status !== 'live' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('live')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: '#FFFBEB',
                  color: '#B45309',
                  border: '1px solid #FDE68A',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className="hover:bg-amber-100/60 active:scale-95"
              >
                <Play size={14} strokeWidth={2} />
                <span>Start Live Event</span>
              </button>
            )}

            {selectedEventModal.status !== 'completed' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('completed')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: '#DAF1DE',
                  color: '#0B2B26',
                  border: '1px solid #8EB69B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className="hover:bg-[#cbe8d0] active:scale-95"
              >
                <CheckCircle2 size={14} strokeWidth={2} />
                <span>Mark Completed</span>
              </button>
            )}

            {canArchive && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('archived')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className="hover:bg-slate-200 active:scale-95"
              >
                <Archive size={14} strokeWidth={2} />
                <span>Archive</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#FFFFFF',
                color: '#DC2626',
                border: '1px solid #FECACA',
                cursor: 'pointer',
                marginLeft: 'auto',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-red-50 active:scale-95"
            >
              <Ban size={14} strokeWidth={2} />
              <span>Cancel Event</span>
            </button>
          </div>
        </div>

        {/* 3. Operational Duties Checklist */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            border: '1px solid #E5EBE7',
            padding: '20px 22px',
            boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Users size={13} color="#235347" />
              <span>Operational Duties Roster</span>
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#0B2B26',
                backgroundColor: '#DAF1DE',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #8EB69B',
              }}
            >
              Verified Roster
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { role: '1. Documentation & MoM', officer: 'Priya Sharma', status: 'Done ✓', statusColor: '#0B2B26', statusBg: '#DAF1DE', statusBorder: '#8EB69B' },
              { role: '2. Signage & Badges', officer: 'Kiran Kumar', status: 'Ready ✓', statusColor: '#0B2B26', statusBg: '#DAF1DE', statusBorder: '#8EB69B' },
              { role: '3. Shortlisted Students', officer: 'Vikram Patel (45 Scholars)', status: 'Active', statusColor: '#1E40AF', statusBg: '#EFF6FF', statusBorder: '#BFDBFE' },
              { role: '4. Food & Refreshments', officer: 'Ananya Sen', status: 'Arranged', statusColor: '#92400E', statusBg: '#FEF3C7', statusBorder: '#FDE68A' },
            ].map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ minWidth: 0, paddingRight: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }} className="truncate">
                    {d.role}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }} className="truncate">
                    {d.officer}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    color: d.statusColor,
                    backgroundColor: d.statusBg,
                    border: `1px solid ${d.statusBorder}`,
                    flexShrink: 0,
                  }}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>



        {/* 5. Associated Chapter Meetings & MoMs */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            border: '1px solid #E5EBE7',
            padding: '20px 22px',
            boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Calendar size={13} color="#235347" />
              <span>Associated Chapter Meetings & MoM</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedEventModal(null);
                setActiveTab('meetings');
              }}
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#235347',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              className="hover:underline"
            >
              View All ({meetings.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            {meetings
              .filter(
                (m) =>
                  m.eventId === selectedEventModal.id ||
                  m.title.toLowerCase().includes(selectedEventModal.title.toLowerCase().split(' ')[0])
              )
              .slice(0, 2)
              .map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{m.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      {m.venue} • {new Date(m.dateTime).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: m.status === 'completed' ? '#DAF1DE' : '#F3E8FF',
                      color: m.status === 'completed' ? '#0B2B26' : '#6B21A8',
                      border: m.status === 'completed' ? '1px solid #8EB69B' : '1px solid #E9D5FF',
                    }}
                  >
                    {m.status === 'completed' ? 'MoM Filed ✓' : 'Scheduled'}
                  </span>
                </div>
              ))}
            {meetings.filter(
              (m) =>
                m.eventId === selectedEventModal.id ||
                m.title.toLowerCase().includes(selectedEventModal.title.toLowerCase().split(' ')[0])
            ).length === 0 && (
              <div style={{ fontSize: '11.5px', color: '#64748B', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                Pre-event briefing standup scheduled with Core Committee.
              </div>
            )}
          </div>
        </div>

        {/* 6. Documentation Checklist */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            border: '1px solid #E5EBE7',
            padding: '20px 22px',
            boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileText size={13} color="#235347" />
              <span>Documentation & Archival Checklist</span>
            </span>

            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#235347',
                backgroundColor: '#DAF1DE',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #8EB69B',
              }}
            >
              Tap chip to cycle
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { key: 'report', label: 'Event report', icon: <FileText size={15} color="#235347" /> },
              { key: 'photos', label: 'Photos (geotagged or normal)', icon: <Camera size={15} color="#2563EB" /> },
              { key: 'videos', label: 'Videos (as links)', icon: <Video size={15} color="#7C3AED" /> },
              { key: 'dailyNews', label: 'Daily news', icon: <Newspaper size={15} color="#D97706" /> },
              { key: 'mom', label: 'MoM (Minutes of Meeting)', icon: <Calendar size={15} color="#4F46E5" /> },
              { key: 'feedback', label: 'Feedback summary', icon: <Star size={15} color="#0D9488" /> },
              { key: 'attendanceSheet', label: 'Attendance sheet', icon: <FileSpreadsheet size={15} color="#235347" /> },
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
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                  className="hover:bg-slate-100/70 transition-colors"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span className="shrink-0">{item.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }} className="truncate">
                      {item.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCycleEventDocStatus(selectedEventModal.id, item.key, item.label)}
                    className={`px-3 py-1 rounded-full text-[11px] border shadow-2xs transition-all cursor-pointer active:scale-95 uppercase tracking-wide shrink-0 ${chipClass}`}
                    title="Tap to toggle: Missing → Draft → Submitted"
                  >
                    {status === 'submitted' ? '✓ Submitted' : status === 'draft' ? '✎ Draft' : '✗ Missing'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Promotion & Social Broadcasts */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            border: '1px solid #E5EBE7',
            padding: '20px 22px',
            boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Megaphone size={16} color="#7C3AED" />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Promotion & Social Broadcasts
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedEventModal(null);
                setActiveTab('campaigns');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: '#F5F3FF',
                color: '#6D28D9',
                border: '1px solid #DDD6FE',
                cursor: 'pointer',
              }}
              className="hover:bg-purple-100 transition-colors"
            >
              <span>Campaign Studio</span>
            </button>
          </div>

          {/* Campaign checklist */}
          {eventCampaign ? (
            <div
              style={{
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#581C87' }} className="truncate">
                  Campaign: {eventCampaign.title}
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: '#6D28D9',
                    backgroundColor: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid #DDD6FE',
                    flexShrink: 0,
                  }}
                >
                  {Object.values(eventCampaign.checklist).filter(Boolean).length}/5 Done
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', marginTop: '4px' }}>
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
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: done ? '1px solid #C084FC' : '1px solid #E2E8F0',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        backgroundColor: done ? 'rgba(243, 232, 255, 0.7)' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 800,
                            backgroundColor: done ? '#7C3AED' : '#FFFFFF',
                            color: '#FFFFFF',
                            border: done ? 'none' : '1px solid #CBD5E1',
                          }}
                        >
                          {done ? '✓' : ''}
                        </span>
                        <span style={{ fontWeight: done ? 700 : 500, color: done ? '#581C87' : '#334155' }}>
                          {t.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: done ? '#7C3AED' : '#94A3B8',
                        }}
                      >
                        {done ? 'Done' : 'Pending'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '14px',
                textAlign: 'center',
                borderRadius: '14px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              No standalone campaign chartered yet.{' '}
              <button
                type="button"
                onClick={() => {
                  setSelectedEventModal(null);
                  setActiveTab('campaigns');
                }}
                style={{ fontWeight: 800, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer' }}
                className="hover:underline"
              >
                Launch Campaign in Studio
              </button>
            </div>
          )}
        </div>

        {/* 8. Participant & Faculty Feedback */}
        <div
          style={{
            backgroundColor: '#F0FDF4',
            borderRadius: '22px',
            border: '1px solid #BBF7D0',
            padding: '18px 22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#166534',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Participant & Faculty Feedback
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 900, color: '#D97706' }}>
              <Star size={15} className="fill-amber-400 text-amber-500" />
              <span>{selectedEventModal.completedData?.feedbackRating || 4.9} / 5.0</span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: '#14532D', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
            "{selectedEventModal.completedData?.feedbackNotes || 'Exemplary fieldwork execution. All scholars demonstrated GPS data collection and GIS map compilation.'}"
          </p>
        </div>

        {/* 9. Expedition Media Gallery Preview */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            border: '1px solid #E5EBE7',
            padding: '20px 22px',
            boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Camera size={13} color="#235347" />
              <span>Expedition Media Gallery</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedEventModal(null);
                setActiveTab('archives');
              }}
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#235347',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              className="hover:underline"
            >
              Open Archive
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {(gallery.filter((g) => g.eventId === selectedEventModal.id).length > 0
              ? gallery.filter((g) => g.eventId === selectedEventModal.id)
              : gallery.slice(0, 2)
            ).map((g) => (
              <div
                key={g.id}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <img
                  src={g.url}
                  alt={g.title}
                  style={{ width: '100%', height: '88px', objectFit: 'cover' }}
                />
                <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#1E293B' }} className="truncate">
                  {g.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10. RSVP / Registration Toggle for Member */}
        <button
          type="button"
          onClick={() => {
            registerForEvent(selectedEventModal.id);
            showToast(`✓ RSVP Updated for ${selectedEventModal.title}`);
          }}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0B2B26 0%, #163832 100%)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(11, 43, 38, 0.25)',
            transition: 'all 0.15s ease',
          }}
          className="hover:opacity-95 active:scale-98"
        >
          Toggle Personal RSVP
        </button>

        {/* ================================================================= */}
        {/* SECONDARY MODALS (TRIGGERED ONLY BY SPECIFIC ACTIONS) */}
        {/* ================================================================= */}

        {/* Cancel Reason Dialog */}
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
              <span className="text-[11px] text-slate-400 mt-1 block">
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

            <div
              className="grid grid-cols-2 gap-2"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}
            >
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

            <div
              className="grid grid-cols-2 gap-2"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}
            >
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


      </div>
    );
  }

  // =========================================================================
  // VIEW 3: MAIN EVENTS DIRECTORY LIST (NO POPUPS)
  // =========================================================================
  return (
    <div className="flex flex-col gap-5 pb-20">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header Area */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <Overline pill dot className="mb-1.5">
            GEO EXPEDITIONS & LABS
          </Overline>

          <h1
            className="font-display text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            Club Events
          </h1>
        </div>

        {/* Green + New Event pill button */}
        {perms.canCreateEditEvents && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-button text-white min-h-[44px] shadow-sm transition-all hover:bg-emerald-600 active:scale-95 shrink-0 mt-1 cursor-pointer"
            style={{
              backgroundColor: '#235347',
              boxShadow: '0 2px 10px rgba(35, 83, 71, 0.3)',
            }}
          >
            <Plus size={16} strokeWidth={1.75} />
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
          icon={<Calendar size={20} strokeWidth={1.75} />}
        />
        <StatTile
          label="Live Sessions"
          value={liveEvents > 0 ? liveEvents : 1}
          footnote="Auditorium Entry Active"
          tint="lavender"
          icon={<Radio size={20} strokeWidth={1.75} className="animate-pulse" />}
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
          resultsCount={filteredEvents.length}
          suggestions={[
            'GEO FEST 2026',
            'GIS & Satellite Telemetry',
            'Campus Biodiversity Drone',
            'Territory Orienteering',
            'LiDAR Terrain Mapping',
            'GNSS Field Survey',
          ]}
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
            gridTemplateColumns: isPhoneFrame ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
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
    </div>
  );
};
export default ClubEventsView;
