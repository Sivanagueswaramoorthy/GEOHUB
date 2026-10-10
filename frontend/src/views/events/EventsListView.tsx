import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Check,
  ArrowLeft,
  QrCode,
  X,
  Sparkles,
  Clock,
  DollarSign,
  UserCheck,
  Compass,
  ArrowRight,
  Share2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ExternalLink,
  BookOpen,
  FileText,
  Ban,
  CheckSquare,
  MessageSquare,
  Star,
  Camera,
  Globe,
  ThumbsUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventCard } from '../../components/common/EventCard';
import { StatusChip } from '../../components/common/StatusChip';
import { Modal } from '../../components/common/Modal';

export const EventsListView: React.FC = () => {
  const {
    currentUser,
    events,
    selectedEventId,
    setSelectedEventId,
    registerForEvent,
    createEvent,
    cancelEvent,
    updateEventVolunteerWork,
    completeEventWithData,
    meetings,
    setActiveTab,
  } = useApp();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newEventDate, setNewEventDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [newGoogleFormUrl, setNewGoogleFormUrl] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEventType, setNewEventType] = useState<'internal' | 'external'>('internal');
  const [newLat, setNewLat] = useState('16.5062');
  const [newLng, setNewLng] = useState('80.6480');

  // Cancel Event Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Complete Event Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completionFeedback, setCompletionFeedback] = useState('95% positive feedback rating from attendees.');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };


  // Selected event (if viewing details)
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Metrics
  const totalEventsCount = events.length;
  const liveEventsCount = events.filter((e) => e.status === 'live').length;

  // Imminent / Live spotlight event for showcase card
  const spotlightEvent = useMemo(() => {
    const live = events.find((e) => e.status === 'live');
    if (live) return live;
    return events
      .filter((e) => e.status === 'approved')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  }, [events]);

  // Filtered & Sorted Events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = ev.title.toLowerCase().includes(q);
          const matchVenue = ev.venue.toLowerCase().includes(q);
          const matchDesc = ev.description.toLowerCase().includes(q);
          if (!matchTitle && !matchVenue && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = newEventDate ? new Date(`${newEventDate}T09:30:00`) : new Date(Date.now() + 86400000 * 2);
    createEvent({
      title: newTitle,
      category: 'Club Event',
      venue: newVenue,
      description: newDesc,
      capacity: 500,
      budget: 0,
      googleFormUrl: newGoogleFormUrl.trim() || undefined,
      posterUrl:
        newPosterUrl ||
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      startDate: startDateTime.toISOString(),
      endDate: new Date(startDateTime.getTime() + 14400000).toISOString(),
      status: 'approved',
      createdBy: currentUser.name,
      eventType: newEventType,
      geoCoordinates: {
        lat: parseFloat(newLat) || 16.5062,
        lng: parseFloat(newLng) || 80.6480,
      },
      volunteerAssignments: {
        documentation: ['Priya Sharma'],
        signageDesign: ['Kiran Kumar'],
        shortlistedStudents: ['Vikram Patel'],
        foodRefreshments: ['Ananya Sen'],
      },
      workDoneStatus: {
        documentationDone: false,
        signageDone: false,
        shortlistingDone: false,
        foodArranged: false,
      },
    });
    setIsCreateModalOpen(false);
    showToast(`✓ Published event: "${newTitle}"`);
    setNewTitle('');
    setNewVenue('');
    setNewGoogleFormUrl('');
    setNewPosterUrl('');
    setNewDesc('');
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !cancelReason.trim()) return;
    cancelEvent(selectedEvent.id, cancelReason);
    setIsCancelModalOpen(false);
    setCancelReason('');
    showToast(`⚠️ Event marked as cancelled.`);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    completeEventWithData(selectedEvent.id, {
      feedbackRating: 4.9,
      feedbackNotes: completionFeedback,
      photos: [
        {
          url: completionPhotoUrl,
          caption: `${selectedEvent.title} Field Session`,
          isGeotagged: true,
          lat: selectedEvent.geoCoordinates?.lat || 16.5062,
          lng: selectedEvent.geoCoordinates?.lng || 80.6480,
          locationName: selectedEvent.venue,
        },
      ],
      documentationSummary: `Event ${selectedEvent.title} successfully delivered with ${selectedEvent.registeredUserIds.length || 45}+ participating scholars.`,
    });
    setIsCompleteModalOpen(false);
    showToast(`✓ Event marked as Completed! Showcase updated.`);
  };

  const handleToggleRsvp = (eventId: string, isRegistered: boolean, title: string) => {
    registerForEvent(eventId);
    if (isRegistered) {
      showToast(`Registration cancelled for: ${title}`);
    } else {
      showToast(`✓ RSVP Confirmed! Entry pass created for: ${title}`);
    }
  };

  // ==========================================
  // SINGLE EVENT DETAILS VIEW
  // ==========================================
  if (selectedEvent) {
    const isRegistered = selectedEvent.registeredUserIds.includes(currentUser.uid);
    const startDate = new Date(selectedEvent.startDate);
    const endDate = new Date(selectedEvent.endDate);
    const canManageEvent =
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'faculty' ||
      currentUser.role === 'coordinator';

    // Find pre-event MoM meeting if exists
    const preMeeting = meetings.find((m) => m.type === 'pre_event' && m.eventId === selectedEvent.id);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
        {/* Toast Alert */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Back navigation button */}
        <button
          onClick={() => setSelectedEventId(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#047857',
            backgroundColor: '#ECFDF5',
            padding: '6px 14px',
            borderRadius: '999px',
            width: 'fit-content',
            border: '1px solid #A7F3D0',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} strokeWidth={1.75} /> Back to Events List
        </button>

        {/* Hero Poster Banner */}
        <div
          style={{
            height: '240px',
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            backgroundColor: '#0F172A',
          }}
        >
          <img
            src={
              selectedEvent.posterUrl ||
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
            }
            alt={selectedEvent.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(0, 0, 0, 0.3) 100%)',
            }}
          />

          {/* Top Badges (Status, Scope, GeoCoordinates) */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <StatusChip status={selectedEvent.status} />

            {/* Scope Badge */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: selectedEvent.eventType === 'external' ? '#7C3AED' : '#047857',
                backgroundColor: selectedEvent.eventType === 'external' ? '#F5F3FF' : '#ECFDF5',
                padding: '4px 10px',
                borderRadius: '8px',
                border: `1px solid ${selectedEvent.eventType === 'external' ? '#DDD6FE' : '#A7F3D0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Globe size={16} strokeWidth={1.75} />
              {selectedEvent.eventType === 'external' ? 'INTER-COLLEGE / EXTERNAL' : 'INTERNAL CLUB'}
            </span>

            {/* GeoCoordinates GPS Badge */}
            {selectedEvent.geoCoordinates && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0369A1',
                  backgroundColor: '#F0F9FF',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={16} strokeWidth={1.75} />
                {selectedEvent.geoCoordinates.lat}° N, {selectedEvent.geoCoordinates.lng}° E
              </span>
            )}
          </div>

          {/* Title on Hero bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
            }}
          >
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.25,
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              }}
            >
              {selectedEvent.title}
            </h1>
          </div>
        </div>

        {/* Cancellation Alert Banner if Cancelled */}
        {selectedEvent.status === 'cancelled' && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              borderRadius: '16px',
              border: '2px solid #F87171',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Ban size={24} strokeWidth={1.75} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#991B1B' }}>
                Event Cancelled
              </div>
              <div style={{ fontSize: '13px', color: '#B91C1C', marginTop: '4px', lineHeight: 1.4 }}>
                <strong>Reason:</strong> {selectedEvent.cancellationReason || 'No specific reason provided.'}
              </div>
            </div>
          </div>
        )}

        {/* Completed Event Deliverables & Showcase Card */}
        {selectedEvent.status === 'completed' && selectedEvent.completedData && (
          <div
            style={{
              backgroundColor: '#F0FDF4',
              borderRadius: '20px',
              border: '2px solid #34D399',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#065F46' }}>
                  Post-Event Deliverables & News Summary
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#D1FAE5', color: '#047857', padding: '3px 8px', borderRadius: '6px' }}>
                Event Completed
              </span>
            </div>

            {/* Feedback Rating */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Star size={16} color="#EAB308" fill="#EAB308" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Feedback & Ratings</span>
              </div>
              <p style={{ fontSize: '12px', color: '#334155', margin: 0, fontStyle: 'italic' }}>
                "{selectedEvent.completedData.feedbackNotes || 'Excellent participant reception.'}"
              </p>
            </div>
          </div>
        )}

        {/* Management Controls Hub (Mark as Completed, Cancel Event) */}
        {canManageEvent && selectedEvent.status !== 'cancelled' && selectedEvent.status !== 'completed' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '12px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={() => setIsCompleteModalOpen(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#047857',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CheckSquare size={16} strokeWidth={1.75} /> Mark as Completed
            </button>

            <button
              onClick={() => setIsCancelModalOpen(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Ban size={16} strokeWidth={1.75} /> Cancel Event
            </button>
          </div>
        )}

        {/* 4 Volunteer Sub-Assignments & Work Done Status Tracker */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Volunteer Sub-Assignments & Work Done Status
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #A7F3D0',
              }}
            >
              4 STREAMS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {/* Stream 1: Documentation */}
            <div
              style={{
                backgroundColor: selectedEvent.workDoneStatus?.documentationDone ? '#F0FDF4' : '#F8FAFC',
                border: `1.5px solid ${selectedEvent.workDoneStatus?.documentationDone ? '#86EFAC' : '#E2E8F0'}`,
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    1. Documentation Wing
                  </span>
                  <FileText size={16} strokeWidth={1.75} color="#059669" />
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Assigned: <strong>{selectedEvent.volunteerAssignments?.documentation?.join(', ') || 'Priya Sharma'}</strong>
                </div>
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: selectedEvent.workDoneStatus?.documentationDone ? '#059669' : '#475569',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selectedEvent.workDoneStatus?.documentationDone}
                  onChange={(e) => {
                    const currentAssignments = selectedEvent.volunteerAssignments || {
                      documentation: ['Priya Sharma'],
                      signageDesign: ['Kiran Kumar'],
                      shortlistedStudents: ['Vikram Patel'],
                      foodRefreshments: ['Ananya Sen'],
                    };
                    const currentWork = selectedEvent.workDoneStatus || {};
                    updateEventVolunteerWork(selectedEvent.id, currentAssignments, {
                      ...currentWork,
                      documentationDone: e.target.checked,
                    });
                  }}
                  style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <span>Work Done Verified</span>
              </label>
            </div>

            {/* Stream 2: Signage / Design */}
            <div
              style={{
                backgroundColor: selectedEvent.workDoneStatus?.signageDone ? '#F0FDF4' : '#F8FAFC',
                border: `1.5px solid ${selectedEvent.workDoneStatus?.signageDone ? '#86EFAC' : '#E2E8F0'}`,
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    2. Signage & Poster Design
                  </span>
                  <Share2 size={16} strokeWidth={1.75} color="#E11D48" />
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Assigned: <strong>{selectedEvent.volunteerAssignments?.signageDesign?.join(', ') || 'Kiran Kumar'}</strong>
                </div>
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: selectedEvent.workDoneStatus?.signageDone ? '#059669' : '#475569',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selectedEvent.workDoneStatus?.signageDone}
                  onChange={(e) => {
                    const currentAssignments = selectedEvent.volunteerAssignments || {
                      documentation: ['Priya Sharma'],
                      signageDesign: ['Kiran Kumar'],
                      shortlistedStudents: ['Vikram Patel'],
                      foodRefreshments: ['Ananya Sen'],
                    };
                    const currentWork = selectedEvent.workDoneStatus || {};
                    updateEventVolunteerWork(selectedEvent.id, currentAssignments, {
                      ...currentWork,
                      signageDone: e.target.checked,
                    });
                  }}
                  style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <span>Work Done Verified</span>
              </label>
            </div>

            {/* Stream 3: Student Shortlisting */}
            <div
              style={{
                backgroundColor: selectedEvent.workDoneStatus?.shortlistingDone ? '#F0FDF4' : '#F8FAFC',
                border: `1.5px solid ${selectedEvent.workDoneStatus?.shortlistingDone ? '#86EFAC' : '#E2E8F0'}`,
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    3. Student Shortlisting
                  </span>
                  <Users size={16} strokeWidth={1.75} color="#4338CA" />
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Assigned: <strong>{selectedEvent.volunteerAssignments?.shortlistedStudents?.join(', ') || 'Vikram Patel'}</strong>
                </div>
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: selectedEvent.workDoneStatus?.shortlistingDone ? '#059669' : '#475569',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selectedEvent.workDoneStatus?.shortlistingDone}
                  onChange={(e) => {
                    const currentAssignments = selectedEvent.volunteerAssignments || {
                      documentation: ['Priya Sharma'],
                      signageDesign: ['Kiran Kumar'],
                      shortlistedStudents: ['Vikram Patel'],
                      foodRefreshments: ['Ananya Sen'],
                    };
                    const currentWork = selectedEvent.workDoneStatus || {};
                    updateEventVolunteerWork(selectedEvent.id, currentAssignments, {
                      ...currentWork,
                      shortlistingDone: e.target.checked,
                    });
                  }}
                  style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <span>Work Done Verified</span>
              </label>
            </div>

            {/* Stream 4: Food Details & Refreshments */}
            <div
              style={{
                backgroundColor: selectedEvent.workDoneStatus?.foodArranged ? '#F0FDF4' : '#F8FAFC',
                border: `1.5px solid ${selectedEvent.workDoneStatus?.foodArranged ? '#86EFAC' : '#E2E8F0'}`,
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    4. Food & Refreshment Details
                  </span>
                  <Sparkles size={16} strokeWidth={1.75} color="#D97706" />
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Assigned: <strong>{selectedEvent.volunteerAssignments?.foodRefreshments?.join(', ') || 'Ananya Sen'}</strong>
                </div>
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: selectedEvent.workDoneStatus?.foodArranged ? '#059669' : '#475569',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selectedEvent.workDoneStatus?.foodArranged}
                  onChange={(e) => {
                    const currentAssignments = selectedEvent.volunteerAssignments || {
                      documentation: ['Priya Sharma'],
                      signageDesign: ['Kiran Kumar'],
                      shortlistedStudents: ['Vikram Patel'],
                      foodRefreshments: ['Ananya Sen'],
                    };
                    const currentWork = selectedEvent.workDoneStatus || {};
                    updateEventVolunteerWork(selectedEvent.id, currentAssignments, {
                      ...currentWork,
                      foodArranged: e.target.checked,
                    });
                  }}
                  style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <span>Work Done Verified</span>
              </label>
            </div>
          </div>
        </div>

        {/* Pre-Event & Post-Event MoM Linking Cards */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Meeting Minutes (MoM) Protocol
            </h3>
            <button
              onClick={() => setActiveTab('meetings')}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#059669',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Open Meetings Hub <ArrowRight size={16} strokeWidth={1.75} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {/* Pre-Event MoM */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <BookOpen size={16} strokeWidth={1.75} color="#4338CA" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Pre-Event MoM
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#EEF2FF', color: '#4338CA', padding: '1px 6px', borderRadius: '4px' }}>
                  Recorded
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                {selectedEvent.preEventMoM?.notes || (preMeeting ? preMeeting.momNotes : 'Pre-event sync conducted to assign all 4 volunteer streams and finalize lab logistics.')}
              </p>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                Date: {selectedEvent.preEventMoM?.meetingDate || 'Prior to session'}
              </div>
            </div>

            {/* Post-Event MoM */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <BookOpen size={16} strokeWidth={1.75} color="#059669" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Post-Event MoM
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: selectedEvent.status === 'completed' ? '#DCFCE7' : '#F1F5F9', color: selectedEvent.status === 'completed' ? '#15803D' : '#64748B', padding: '1px 6px', borderRadius: '4px' }}>
                  {selectedEvent.status === 'completed' ? 'Finalized' : 'Pending Completion'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                {selectedEvent.postEventMoM?.notes || (selectedEvent.status === 'completed' ? selectedEvent.completedData?.documentationSummary : 'Post-event MoM will be logged immediately following session conclusion and feedback collection.')}
              </p>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                Target: Outcome Report & Certificate of Completion
              </div>
            </div>
          </div>
        </div>

        {/* Google Form Registration Action Card */}
        {selectedEvent.googleFormUrl && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #10B981',
              padding: '16px 18px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                  }}
                >
                  <ExternalLink size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Event Registration Form
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Official attendee sign-up via Google Forms
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#047857',
                  backgroundColor: '#ECFDF5',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #A7F3D0',
                }}
              >
                GOOGLE FORM
              </span>
            </div>

            <a
              href={selectedEvent.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
              }}
            >
              <ExternalLink size={20} strokeWidth={1.75} />
              Open Google Form Registration
            </a>
          </div>
        )}

        {/* 2x2 Logistics Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          {/* Tile 1: Date & Time */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8ECF2',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <Calendar size={16} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Date & Timings</span>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
              {startDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Tile 2: Venue */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8ECF2',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <MapPin size={16} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Location</span>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
              {selectedEvent.venue}
            </div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
              {selectedEvent.geoCoordinates ? `${selectedEvent.geoCoordinates.lat}° N, ${selectedEvent.geoCoordinates.lng}° E` : 'Main Campus'}
            </span>
          </div>

          {/* Tile 3: Organizer */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8ECF2',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <UserCheck size={16} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Organized By</span>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
              {selectedEvent.createdBy}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>GEO Hub Team</span>
          </div>

          {/* Tile 4: Event Date & Access */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8ECF2',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Access Scope</span>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#047857', lineHeight: 1.25 }}>
              {selectedEvent.eventType === 'external' ? 'Inter-College' : 'Internal Club'}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {selectedEvent.registeredUserIds.length} Registered
            </span>
          </div>
        </div>

        {/* About Section */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            padding: '18px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
            Event Overview & Objectives
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {selectedEvent.description}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid #F1F5F9',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} strokeWidth={1.75} color="#10B981" />
              <span style={{ color: '#64748B' }}>Organized by:</span>
              <strong style={{ color: '#0F172A' }}>{selectedEvent.createdBy}</strong>
            </div>
            <div style={{ color: '#64748B' }}>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedEvent.volunteerIds.length}</span> crew members
            </div>
          </div>
        </div>

        {/* Cancel Event Modal */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Club Event"
          subtitle={`Mandatory cancellation protocol for "${selectedEvent.title}"`}
        >
          <form onSubmit={handleCancelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: '#FEF2F2',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #FECACA',
                display: 'flex',
                gap: '8px',
                fontSize: '12px',
                color: '#991B1B',
              }}
            >
              <AlertCircle size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <div>
                Cancelling this event will flag all registered scholars, notify faculty/coordinators, and preserve the cancellation record.
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Reason for Cancellation (Required by handwritten notebook rules)</label>
              <textarea
                required
                rows={3}
                className="input-field"
                placeholder="e.g. Lab renovation schedule clash / Weather warning / Faculty exam schedule..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-block"
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '999px',
                height: '44px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Confirm Event Cancellation
            </button>
          </form>
        </Modal>

        {/* Complete Event Modal */}
        <Modal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          title="Mark Event as Completed"
          subtitle="Collect feedback and geotagged field photos"
        >
          <form onSubmit={handleCompleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Attendee Feedback Summary</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. 96% positive rating. Hands-on LiDAR was praised."
                value={completionFeedback}
                onChange={(e) => setCompletionFeedback(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Geotagged Photo Image URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://images.unsplash.com/..."
                value={completionPhotoUrl}
                onChange={(e) => setCompletionPhotoUrl(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{
                borderRadius: '999px',
                height: '46px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              }}
            >
              Finalize Post-Event Deliverables
            </button>
          </form>
        </Modal>
      </div>
    );
  }

  // ==========================================
  // MAIN EVENTS LISTING VIEW
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#047857',
                backgroundColor: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '999px',
                letterSpacing: '0.04em',
                border: '1px solid #A7F3D0',
              }}
            >
              GEO EXPEDITIONS & LABS
            </span>
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.15,
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Club Events
          </h1>
        </div>

        {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.28)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Plus size={16} strokeWidth={1.75} /> New Event
          </button>
        )}
      </div>

      {/* Executive Quick Stats Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8ECF2',
            padding: '12px 10px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            {totalEventsCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
            Total Events
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8ECF2',
            padding: '12px 10px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            {liveEventsCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
            Live Sessions
          </div>
        </div>
      </div>

      {/* Featured Spotlight Banner (if active) */}
      {spotlightEvent && !searchQuery && (
        <div
          onClick={() => setSelectedEventId(spotlightEvent.id)}
          style={{
            borderRadius: '22px',
            overflow: 'hidden',
            position: 'relative',
            height: '180px',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)',
            border: '1px solid #A7F3D0',
            cursor: 'pointer',
            backgroundColor: '#0F172A',
          }}
        >
          <img
            src={
              spotlightEvent.posterUrl ||
              'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
            }
            alt={spotlightEvent.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.35) 60%, rgba(0, 0, 0, 0.25) 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {spotlightEvent.status === 'live' ? (
              <span
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ● HAPPENING NOW
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={16} strokeWidth={1.75} /> FEATURED SHOWCASE
              </span>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              right: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  color: '#34D399',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                CLUB EVENT
              </span>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: '2px 0 3px 0',
                  lineHeight: 1.25,
                }}
              >
                {spotlightEvent.title}
              </h2>
              <div style={{ fontSize: '11px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} strokeWidth={1.75} color="#34D399" />
                <span>
                  {new Date(spotlightEvent.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {spotlightEvent.venue}
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 800,
                padding: '6px 12px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                flexShrink: 0,
              }}
            >
              Details
              <ArrowRight size={16} strokeWidth={1.75} />
            </div>
          </div>
        </div>
      )}

      {/* Modern Search Bar */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          style={{
            paddingLeft: '40px',
            paddingRight: searchQuery ? '36px' : '14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8ECF2',
            borderRadius: '16px',
            fontSize: '13px',
            height: '46px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
          placeholder="Search by title, venue, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search
          size={20} strokeWidth={1.75}
          color="#94A3B8"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>



      {/* Event Cards Feed */}
      <div>
        {filteredEvents.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E8ECF2',
              padding: '36px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                marginBottom: '14px',
              }}
            >
              <Calendar size={28} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              No events found
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', maxWidth: '280px' }}>
              No club events match your current search query.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              isRegistered={ev.registeredUserIds.includes(currentUser.uid)}
              onClick={() => setSelectedEventId(ev.id)}
            />
          ))
        )}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publish New Club Event"
        subtitle="Schedule executive workshop, field expedition or hackathon"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">Event Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. LiDAR Terrain Mapping Bootcamp"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Venue / Room Number</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Geomatics High-Performance Lab 4B"
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Event Date</label>
            <input
              type="date"
              required
              className="input-field"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
            />
          </div>

          {/* Scope Selector: Internal vs External */}
          <div className="input-group">
            <label className="input-label">Event Scope (Handwritten requirement)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setNewEventType('internal')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: newEventType === 'internal' ? '2px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: newEventType === 'internal' ? '#ECFDF5' : '#FFFFFF',
                  color: newEventType === 'internal' ? '#047857' : '#475569',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🏢 Internal Club</span>
              </button>
              <button
                type="button"
                onClick={() => setNewEventType('external')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: newEventType === 'external' ? '2px solid #7C3AED' : '1px solid #CBD5E1',
                  backgroundColor: newEventType === 'external' ? '#F5F3FF' : '#FFFFFF',
                  color: newEventType === 'external' ? '#7C3AED' : '#475569',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🌐 External / Inter-College</span>
              </button>
            </div>
          </div>

          {/* GPS Coordinates Geotag */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Latitude (°N)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 16.5062"
                value={newLat}
                onChange={(e) => setNewLat(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Longitude (°E)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 80.6480"
                value={newLng}
                onChange={(e) => setNewLng(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Google Form Link</span>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>(Optional Registration)</span>
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://forms.gle/... or https://docs.google.com/forms/..."
              value={newGoogleFormUrl}
              onChange={(e) => setNewGoogleFormUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Banner Image URL (Unsplash)</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://images.unsplash.com/..."
              value={newPosterUrl}
              onChange={(e) => setNewPosterUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description & Agenda</label>
            <textarea
              className="input-field"
              rows={3}
              required
              placeholder="Describe objectives, prerequisites, materials and schedule..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              height: '46px',
              fontSize: '14px',
              fontWeight: 700,
              marginTop: '6px',
            }}
          >
            Create & Publish Event
          </button>
        </form>
      </Modal>
    </div>
  );
};
