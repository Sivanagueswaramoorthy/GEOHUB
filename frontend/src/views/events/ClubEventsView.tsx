import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Users,
  Compass,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRolePermissions } from '../../core/permissions';
import { EventModel, EventStatus } from '../../types';
import {
  BentoGrid,
  HeroCard,
  PillButton,
  StatusChip,
  ProgressRing,
  SearchField,
  SectionHeader,
  FormField,
  AmountInput,
  DatePickerField,
  PeoplePicker,
  BottomSheet,
  Avatar,
  EmptyState,
} from '../../components/shared';

type CategoryFilter = 'All' | 'Workshop' | 'Field' | 'Symposium';

export const ClubEventsView: React.FC = () => {
  const {
    currentUser,
    events,
    users,
    selectedEventId,
    setSelectedEventId,
    registerForEvent,
    createEvent,
    cancelEvent,
    setActiveTab,
    showToast,
  } = useApp();

  const perms = getRolePermissions(currentUser.role);
  const isCoordinator = currentUser.role === 'coordinator' || currentUser.role === 'admin';
  const isFaculty = currentUser.role === 'faculty' || currentUser.role === 'super_admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>('All');
  const [activeEvent, setActiveEvent] = useState<EventModel | null>(null);

  // Event Creation Stepper State (Step 1, 2, 3)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

  // Stepper Step 1 Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Workshop' | 'Field' | 'Symposium' | 'Other'>('Workshop');
  const [newVenue, setNewVenue] = useState('Central Campus Auditorium');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newCapacity, setNewCapacity] = useState('150');
  const [newCoordinates, setNewCoordinates] = useState('13.0102° N, 80.2337° E');

  // Stepper Step 2 Duties Roster (Signage, Food & Refreshments, MoM, Badges)
  const [rosterAssignments, setRosterAssignments] = useState<{
    signage: string[];
    refreshments: string[];
    mom: string[];
    badges: string[];
  }>({
    signage: [],
    refreshments: [],
    mom: [],
    badges: [],
  });

  // People Picker Modal State
  const [pickerTarget, setPickerTarget] = useState<'signage' | 'refreshments' | 'mom' | 'badges' | null>(null);

  // Sync selectedEventId from context
  useEffect(() => {
    if (selectedEventId) {
      const found = events.find((e) => e.id === selectedEventId);
      if (found) setActiveEvent(found);
    }
  }, [selectedEventId, events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedFilter === 'All' ||
        (ev.category && ev.category.toLowerCase().includes(selectedFilter.toLowerCase()));
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedFilter]);

  const handleOpenEvent = (ev: EventModel) => {
    setActiveEvent(ev);
    setSelectedEventId(ev.id);
  };

  const handleCloseDetail = () => {
    setActiveEvent(null);
    setSelectedEventId(null);
  };

  const handleRegister = (ev: EventModel) => {
    registerForEvent(ev.id);
    showToast('✓ Registered! Gate pass active.');
  };

  // Submit new event proposal (goes to Faculty Approvals as 'submitted')
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter an event title.', 'error');
      return;
    }

    createEvent({
      title: newTitle.trim(),
      category: newCategory,
      venue: newVenue.trim(),
      startDate: newDate,
      endDate: newDate,
      budget: 0,
      createdBy: currentUser?.uid || 'coordinator',
      capacity: parseInt(newCapacity, 10) || 100,
      description: `GeoHub Chapter Event at ${newVenue}. Duties assigned: Signage (${rosterAssignments.signage.length}), Refreshments (${rosterAssignments.refreshments.length}), MoM (${rosterAssignments.mom.length}), Badges (${rosterAssignments.badges.length}).`,
      status: 'submitted', // Coordinator cannot self-approve; goes to Faculty
    });

    showToast('✓ Proposal submitted for Faculty sanction!');
    setIsCreateOpen(false);
    setCreateStep(1);
    setNewTitle('');
  };

  // --------------------------------------------------------------------------
  // 1. EVENT DETAIL VIEW
  // --------------------------------------------------------------------------
  if (activeEvent) {
    const isRegistered = activeEvent.registeredUserIds?.includes(currentUser.uid);
    const capacityNum = activeEvent.capacity || 100;
    const registeredCount = activeEvent.registeredUserIds?.length || 42;
    const progressPercent = Math.min(100, Math.round((registeredCount / capacityNum) * 100));

    return (
      <div className="flex flex-col gap-5 select-none animate-fadeIn">
        {/* Back navigation pill */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCloseDetail}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DAF1DE] text-xs font-bold text-[#163832] shadow-[0_2px_8px_rgba(5,31,32,0.04)] hover:border-[#8EB69B] cursor-pointer pressable"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            <span>All events</span>
          </button>

          <StatusChip
            status={activeEvent.status === 'completed' ? 'done' : activeEvent.status}
          />
        </div>

        {/* 1) Dark Gradient Hero (#051F20 to #163832, 32px) */}
        <div
          className="relative overflow-hidden p-6 select-none"
          style={{
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #051F20 0%, #163832 100%)',
            boxShadow: '0 12px 36px rgba(5, 31, 32, 0.16)',
          }}
        >
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[rgba(218,241,222,0.18)] text-[#DAF1DE] border border-[rgba(218,241,222,0.3)]">
                {activeEvent.category || 'Workshop'}
              </span>
              <span className="text-xs font-semibold text-[#8EB69B]">
                {activeEvent.startDate ? new Date(activeEvent.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming'}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              {activeEvent.title}
            </h1>

            <p className="text-xs text-[#8EB69B] leading-relaxed line-clamp-2 mt-1">
              {activeEvent.description || 'Join fellow earth science & geomatics scholars for this chapter initiative.'}
            </p>
          </div>
        </div>

        {/* 2) Stacked white 24px cards with #DAF1DE border */}
        <div className="flex flex-col gap-4">
          {/* Schedule & Venue Card */}
          <div
            className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-3"
            style={{ borderRadius: '24px' }}
          >
            <div className="flex items-center gap-2">
              <MapPin size={18} strokeWidth={2.2} className="text-[#163832]" />
              <h2 className="text-sm font-bold text-[#051F20]">Schedule & Venue</h2>
            </div>

            <div className="flex flex-col gap-2 pl-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                <Clock size={14} className="text-[#8EB69B]" />
                <span>09:30 AM – 04:30 PM IST</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                <MapPin size={14} className="text-[#8EB69B]" />
                <span className="font-semibold text-[#051F20]">{activeEvent.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                <Compass size={14} className="text-[#8EB69B]" />
                <span>Geo-coordinates: 13.0102° N, 80.2337° E</span>
              </div>
            </div>
          </div>

          {/* Capacity Card (ProgressRing registered vs limit) */}
          <div
            className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex items-center justify-between gap-4"
            style={{ borderRadius: '24px' }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-[#051F20]">Chapter Capacity</h2>
              <p className="text-xs font-medium text-[#235347]">
                {registeredCount} of {capacityNum} scholars registered
              </p>
              <div className="mt-2">
                <StatusChip
                  status={progressPercent >= 95 ? 'low-stock' : 'live'}
                  label={progressPercent >= 95 ? 'Almost Full' : 'Open Gate'}
                />
              </div>
            </div>

            <div className="shrink-0">
              <ProgressRing
                progress={progressPercent}
                size={84}
                strokeWidth={8}
                label={`${progressPercent}%`}
                sublabel="Filled"
              />
            </div>
          </div>

          {/* Duties Checklist (assignments with avatars) */}
          <div
            className="p-5 bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-3"
            style={{ borderRadius: '24px' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} strokeWidth={2.2} className="text-[#163832]" />
                <h2 className="text-sm font-bold text-[#051F20]">Duties Checklist</h2>
              </div>
              <span className="text-xs font-bold text-[#235347]">4 Assigned Wings</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-1">
              {[
                { title: 'Signage & Posters', lead: 'Promotion Lead', count: 3 },
                { title: 'Refreshments', lead: 'Treasurer Squad', count: 2 },
                { title: 'MoM & Minutes', lead: 'Documentation Lead', count: 1 },
                { title: 'Gate Badges', lead: 'Volunteer Squad', count: 4 },
              ].map((duty, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-1.5"
                >
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    {duty.title}
                  </span>
                  <div className="flex items-center justify-between text-xs text-[#235347]">
                    <span className="truncate">{duty.lead}</span>
                    <span className="font-bold text-[#163832] shrink-0">
                      {duty.count} vols
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3) Sticky Bottom Bar (max 2 pills: "Register" primary, "Directions" secondary) */}
        <div
          className="sticky bottom-4 z-30 w-full p-3 bg-white/95 backdrop-blur-md border border-[#DAF1DE] shadow-[0_12px_36px_rgba(5,31,32,0.12)] flex items-center gap-3"
          style={{ borderRadius: '9999px' }}
        >
          <PillButton
            variant="primary"
            fullWidth
            disabled={isRegistered}
            onClick={() => handleRegister(activeEvent)}
          >
            {isRegistered ? 'Registered' : 'Register'}
          </PillButton>

          <PillButton
            variant="secondary"
            fullWidth
            onClick={() => showToast('Campus directions opened in GeoMap.')}
            icon={<MapPin size={16} strokeWidth={2.2} />}
          >
            Directions
          </PillButton>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. MAIN BROWSE VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn">
      {/* 1) Browse Header: 1 headline "What's happening?", 1 subtitle "Explore chapter activities" */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            What&apos;s happening?
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Explore chapter activities
          </p>
        </div>

        {(isCoordinator || isFaculty) && (
          <PillButton
            variant="primary"
            size="sm"
            icon={<Plus size={16} strokeWidth={2.4} />}
            onClick={() => setIsCreateOpen(true)}
          >
            New event
          </PillButton>
        )}
      </div>

      {/* 2) Filter Chips: All, Workshop, Field, Symposium */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '2px 0',
          WebkitOverflowScrolling: 'touch',
        }}
        className="no-scrollbar"
      >
        {(['All', 'Workshop', 'Field', 'Symposium'] as CategoryFilter[]).map((cat) => {
          const isSelected = selectedFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-out',
                backgroundColor: isSelected ? '#163832' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#235347',
                border: isSelected ? '1px solid #163832' : '1px solid #DAF1DE',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(5, 31, 32, 0.18)'
                  : '0 2px 6px rgba(5, 31, 32, 0.04)',
                minHeight: '38px',
                outline: 'none',
              }}
              className="pressable"
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3) Search Field */}
      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search chapter events by name or hall..."
      />

      {/* 4) BentoGrid of EventCards with venue chips, dates, capacity rings, StatusChips */}
      {filteredEvents.length > 0 ? (
        <BentoGrid>
          {filteredEvents.map((ev) => {
            const capacityNum = ev.capacity || 100;
            const registeredCount = ev.registeredUserIds?.length || 42;
            const progressPercent = Math.min(100, Math.round((registeredCount / capacityNum) * 100));

            return (
              <div
                key={ev.id}
                onClick={() => handleOpenEvent(ev)}
                className="bg-white border border-[#DAF1DE] p-5 shadow-[0_10px_30px_rgba(5,31,32,0.08)] hover:border-[#8EB69B] transition-all cursor-pointer pressable flex flex-col justify-between"
                style={{
                  borderRadius: '24px',
                  minHeight: '220px',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] truncate max-w-[140px]">
                      {ev.category || 'Workshop'}
                    </span>
                    <StatusChip status={ev.status === 'completed' ? 'done' : ev.status} />
                  </div>

                  <h2 className="font-bold text-base text-[#051F20] line-clamp-2 leading-snug">
                    {ev.title}
                  </h2>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#235347] mt-2">
                    <MapPin size={13} className="shrink-0 text-[#8EB69B]" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#DAF1DE]">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#235347]">
                      {ev.startDate ? new Date(ev.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Upcoming'}
                    </span>
                    <span className="text-xs font-bold text-[#051F20]">
                      {registeredCount}/{capacityNum} Scholars
                    </span>
                  </div>

                  <ProgressRing
                    progress={progressPercent}
                    size={48}
                    strokeWidth={5}
                    label={`${progressPercent}%`}
                  />
                </div>
              </div>
            );
          })}
        </BentoGrid>
      ) : (
        <div
          className="bg-white border border-[#DAF1DE] p-6 text-center"
          style={{ borderRadius: '24px' }}
        >
          <EmptyState
            mascot="calendar"
            title="No events found"
            subtitle="Try adjusting search or category filters"
            actionLabel="Reset filters"
            onAction={() => {
              setSelectedFilter('All');
              setSearchQuery('');
            }}
          />
        </div>
      )}

      {/* --------------------------------------------------------------------------
          3. EVENT CREATION STEPPER (COORDINATOR)
          Step 1: Basics
          Step 2: Duties Roster
          Step 3: Review & Submit
          -------------------------------------------------------------------------- */}
      <BottomSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Event Proposal"
        subtitle={`Step ${createStep} of 3: ${
          createStep === 1 ? 'Basics' : createStep === 2 ? 'Duties Roster' : 'Review & Submit'
        }`}
      >
        <div className="flex flex-col gap-4 select-none">
          {/* Step 1: Basics */}
          {createStep === 1 && (
            <div className="flex flex-col gap-3 py-1">
              <FormField
                label="Event Title"
                placeholder="e.g. GIS Spatial Analysis Workshop"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-[#051F20] pl-1">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Workshop', 'Field', 'Symposium'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        newCategory === cat
                          ? 'bg-[#163832] text-white border-[#163832]'
                          : 'bg-white text-[#235347] border-[#DAF1DE]'
                      }`}
                      style={{ borderRadius: '16px' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <DatePickerField
                label="Date"
                value={newDate}
                onChange={setNewDate}
              />

              <FormField
                label="Venue & Room"
                placeholder="e.g. Science Block Seminar Hall 3"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
              />

              <FormField
                label="Target Capacity"
                type="number"
                placeholder="150"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
              />

              <div className="pt-2">
                <PillButton
                  variant="primary"
                  fullWidth
                  disabled={!newTitle.trim()}
                  onClick={() => setCreateStep(2)}
                  icon={<ChevronRight size={16} strokeWidth={2.4} />}
                  iconPosition="right"
                >
                  Next: Duties Roster
                </PillButton>
              </div>
            </div>
          )}

          {/* Step 2: Duties Roster (Signage, Food & Refreshments, MoM, Badges) */}
          {createStep === 2 && (
            <div className="flex flex-col gap-3 py-1">
              <p className="text-xs font-medium text-[#235347]">
                Assign volunteers to key event operational squads.
              </p>

              {[
                { key: 'signage' as const, title: 'Signage & Stage Squad' },
                { key: 'refreshments' as const, title: 'Food & Refreshments Squad' },
                { key: 'mom' as const, title: 'Minutes of Meeting (MoM) Squad' },
                { key: 'badges' as const, title: 'Gate Badges & Scanner Squad' },
              ].map((duty) => (
                <div
                  key={duty.key}
                  className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between"
                  style={{ borderRadius: '16px' }}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#051F20]">{duty.title}</span>
                    <span className="text-xs font-medium text-[#235347]">
                      {rosterAssignments[duty.key].length} assigned
                    </span>
                  </div>

                  <PillButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setPickerTarget(duty.key)}
                  >
                    Assign
                  </PillButton>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <PillButton
                  variant="ghost"
                  onClick={() => setCreateStep(1)}
                >
                  Back
                </PillButton>
                <PillButton
                  variant="primary"
                  fullWidth
                  onClick={() => setCreateStep(3)}
                  icon={<ChevronRight size={16} strokeWidth={2.4} />}
                  iconPosition="right"
                >
                  Next: Review & Submit
                </PillButton>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit (Coordinator cannot self-approve; goes to Faculty) */}
          {createStep === 3 && (
            <div className="flex flex-col gap-3 py-1">
              <div
                className="p-4 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] flex flex-col gap-2"
                style={{ borderRadius: '16px' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#8EB69B]">Sanction Proposal</span>
                  <StatusChip status="submitted" label="Awaiting Faculty Sanction" />
                </div>
                <h3 className="text-base font-bold text-[#051F20]">{newTitle}</h3>
                <span className="text-xs font-medium text-[#235347]">
                  {newCategory} • {newVenue} • {newDate}
                </span>
                <span className="text-xs font-semibold text-[#163832]">
                  Target Capacity: {newCapacity} Scholars
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[rgba(242,184,75,0.14)] border border-[#F2B84B] text-xs font-medium text-[#051F20]">
                Institutional Governance Rule: Coordinator proposals require Faculty Advisor approval before opening gate registration.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <PillButton
                  variant="ghost"
                  onClick={() => setCreateStep(2)}
                >
                  Back
                </PillButton>
                <PillButton
                  variant="primary"
                  fullWidth
                  onClick={handleFinalSubmit}
                >
                  Submit
                </PillButton>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* People Picker for assigning volunteers */}
      {pickerTarget && (
        <PeoplePicker
          isOpen={Boolean(pickerTarget)}
          onClose={() => setPickerTarget(null)}
          title={`Assign ${pickerTarget.toUpperCase()} Squad`}
          people={users.map((u) => ({ id: u.uid, name: u.name, role: u.post || u.role }))}
          selectedIds={rosterAssignments[pickerTarget]}
          onConfirm={(selected) => {
            setRosterAssignments((prev) => ({
              ...prev,
              [pickerTarget]: selected,
            }));
          }}
        />
      )}
    </div>
  );
};

export default ClubEventsView;
