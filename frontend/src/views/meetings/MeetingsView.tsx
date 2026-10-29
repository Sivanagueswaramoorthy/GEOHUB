import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MeetingModel } from '../../types';
import {
  PillButton,
  StatusChip,
  BottomSheet,
  EmptyState,
  SegmentedTabs,
  Avatar,
} from '../../components/shared';

export const MeetingsView: React.FC = () => {
  const {
    meetings,
    events,
    currentUser,
    createMeeting,
    updateMeetingMoM,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pre_event' | 'post_event' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingModel | null>(null);

  // New Meeting Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'pre_event' | 'post_event' | 'general'>('pre_event');
  const [newEventId, setNewEventId] = useState('');
  const [newDateTime, setNewDateTime] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [newVenue, setNewVenue] = useState('Seminar Hall 3B');
  const [newAgenda, setNewAgenda] = useState('');

  // MoM Editor Modal
  const [isMoMModalOpen, setIsMoMModalOpen] = useState(false);
  const [momNotesText, setMomNotesText] = useState('');

  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        if (activeFilter !== 'all' && m.type !== activeFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchVenue = m.venue.toLowerCase().includes(q);
          const matchAgenda = (m.agenda || '').toLowerCase().includes(q);
          if (!matchTitle && !matchVenue && !matchAgenda) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [meetings, activeFilter, searchQuery]);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const eventObj = events.find((ev) => ev.id === newEventId);
    createMeeting({
      title: newTitle,
      type: newType,
      eventId: newEventId || undefined,
      eventTitle: eventObj ? eventObj.title : undefined,
      dateTime: new Date(newDateTime).toISOString(),
      venue: newVenue,
      organizerName: currentUser.name,
      attendeeIds: [currentUser.uid],
      agenda: newAgenda,
      status: 'scheduled',
    });
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewAgenda('');
  };

  const handleOpenMoMEditor = (meeting: MeetingModel) => {
    setSelectedMeeting(meeting);
    setMomNotesText(meeting.momNotes || '');
    setIsMoMModalOpen(true);
  };

  const handleSaveMoM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    updateMeetingMoM(selectedMeeting.id, momNotesText, selectedMeeting.actionItems || []);
    setIsMoMModalOpen(false);
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pre_event', label: 'Pre-Event Briefings' },
    { key: 'post_event', label: 'Post-Event Reviews' },
    { key: 'general', label: 'General Syncs' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }} className="select-none">
      {/* Micro-copy: 1 headline (2-4 words), 1 subtitle (< 6 words) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1
            style={{
              fontSize: '28px',
              lineHeight: '32px',
              fontWeight: 800,
              color: '#051F20',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Meetings & MoM
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Official syncs & minutes
          </p>
        </div>

        <PillButton
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Schedule
        </PillButton>
      </div>

      {/* Tabs and Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeFilter}
          onChange={(k) => setActiveFilter(k as any)}
        />

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            style={{
              width: '100%',
              height: '44px',
              boxSizing: 'border-box',
              paddingLeft: '40px',
              paddingRight: '14px',
              fontSize: '13px',
              color: '#051F20',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DAF1DE',
              borderRadius: '16px',
              outline: 'none',
              boxShadow: '0 4px 14px rgba(5,31,32,0.03)',
            }}
            placeholder="Search meetings by title or agenda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={18}
            strokeWidth={2}
            color="#8EB69B"
            style={{ position: 'absolute', left: 14, top: 13 }}
          />
        </div>
      </div>

      {/* Meetings List: 24px cards with linked event pill, time, attendee count, StatusChip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredMeetings.length === 0 ? (
          <EmptyState
            mascot="calendar"
            title="No meetings"
            description="Scheduled briefings and minutes appear here"
            actionLabel="Schedule"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          filteredMeetings.map((m) => {
            const hasMom = Boolean(m.momNotes && m.momNotes.trim());
            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #DAF1DE',
                  padding: '20px',
                  boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    {m.eventTitle && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: '#DAF1DE',
                          color: '#0B2B26',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          border: '1px solid #8EB69B',
                          display: 'inline-block',
                          marginBottom: '6px',
                        }}
                      >
                        {m.eventTitle}
                      </span>
                    )}
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: 0 }}>
                      {m.title}
                    </h3>
                  </div>

                  <StatusChip
                    status={hasMom ? 'done' : 'live'}
                    label={hasMom ? 'Published' : 'Scheduled'}
                  />
                </div>

                {/* Metadata Row: time, venue, attendee count */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#235347', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={14} color="#163832" />
                    <span>
                      {new Date(m.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                      {new Date(m.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} color="#163832" />
                    <span>{m.venue}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={14} color="#163832" />
                    <span>{(m.attendeeIds || []).length} Attendees</span>
                  </div>
                </div>

                {m.agenda && (
                  <p style={{ fontSize: '13px', color: '#051F20', margin: 0, lineHeight: 1.45 }}>
                    {m.agenda}
                  </p>
                )}

                {/* MoM preview / action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid #DAF1DE',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>
                    {hasMom ? 'Minutes recorded' : 'Pending minutes'}
                  </span>

                  <PillButton
                    variant={hasMom ? 'secondary' : 'primary'}
                    size="sm"
                    icon={<FileText size={14} />}
                    onClick={() => handleOpenMoMEditor(m)}
                  >
                    {hasMom ? 'View MoM' : 'Submit MoM'}
                  </PillButton>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Meeting BottomSheet */}
      <BottomSheet
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Meeting"
        subtitle="Book briefing or review"
      >
        <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Meeting Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Volunteer Pre-Briefing"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Type
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
            >
              <option value="pre_event">Pre-Event Briefing</option>
              <option value="post_event">Post-Event Review</option>
              <option value="general">General Sync</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Linked Event
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newEventId}
              onChange={(e) => setNewEventId(e.target.value)}
            >
              <option value="">-- No Linked Event --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Venue
            </label>
            <input
              type="text"
              required
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Agenda
            </label>
            <textarea
              rows={3}
              placeholder="Key discussion points..."
              style={{
                width: '100%',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '10px 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'none',
              }}
              value={newAgenda}
              onChange={(e) => setNewAgenda(e.target.value)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Schedule
          </PillButton>
        </form>
      </BottomSheet>

      {/* MoM Editor BottomSheet */}
      <BottomSheet
        isOpen={isMoMModalOpen}
        onClose={() => setIsMoMModalOpen(false)}
        title="Minutes of Meeting"
        subtitle={selectedMeeting?.title || 'Sync Minutes'}
      >
        <form onSubmit={handleSaveMoM} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#051F20', display: 'block', marginBottom: '4px' }}>
              Official Minutes
            </label>
            <textarea
              required
              rows={6}
              placeholder="Record official decisions, duties assigned, and deliberations..."
              style={{
                width: '100%',
                borderRadius: '16px',
                border: '1px solid #DAF1DE',
                padding: '12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.5,
              }}
              value={momNotesText}
              onChange={(e) => setMomNotesText(e.target.value)}
            />
          </div>

          <PillButton type="submit" variant="primary" fullWidth>
            Submit
          </PillButton>
        </form>
      </BottomSheet>
    </div>
  );
};

export default MeetingsView;
