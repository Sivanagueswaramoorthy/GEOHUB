import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MeetingModel } from '../../types';
import { Modal } from '../../components/common/Modal';

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
  const [newVenue, setNewVenue] = useState('Seminar Hall 3B / Virtual Bridge');
  const [newAgenda, setNewAgenda] = useState('');

  // MoM Editor Modal
  const [isMoMModalOpen, setIsMoMModalOpen] = useState(false);
  const [momNotesText, setMomNotesText] = useState('');
  const [actionItemsList, setActionItemsList] = useState<{ task: string; assignedTo: string; isDone: boolean }[]>([]);
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        if (activeFilter !== 'all' && m.type !== activeFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchVenue = m.venue.toLowerCase().includes(q);
          const matchAgenda = m.agenda.toLowerCase().includes(q);
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
      organizerName: `${currentUser.name} (${currentUser.role === 'super_admin' ? 'Faculty' : 'Coordinator'})`,
      attendeeIds: [currentUser.uid],
      agenda: newAgenda,
      status: 'scheduled',
    });
    setIsCreateModalOpen(false);
    showToast(`✓ Scheduled: "${newTitle}"`);
    setNewTitle('');
    setNewAgenda('');
  };

  const handleOpenMoMEditor = (meeting: MeetingModel) => {
    setSelectedMeeting(meeting);
    setMomNotesText(meeting.momNotes || '');
    setActionItemsList(meeting.actionItems || []);
    setIsMoMModalOpen(true);
  };

  const handleSaveMoM = () => {
    if (!selectedMeeting) return;
    updateMeetingMoM(selectedMeeting.id, momNotesText, actionItemsList);
    setIsMoMModalOpen(false);
    showToast(`✓ Minutes of Meeting (MoM) saved & published!`);
  };

  const handleAddActionItem = () => {
    if (!newActionTask.trim()) return;
    setActionItemsList((prev) => [
      ...prev,
      { task: newActionTask.trim(), assignedTo: newActionAssignee || 'Unassigned', isDone: false },
    ]);
    setNewActionTask('');
    setNewActionAssignee('');
  };

  const handleToggleActionDone = (index: number) => {
    setActionItemsList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, isDone: !item.isDone } : item))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '32px' }}>
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#047857',
                backgroundColor: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #A7F3D0',
                letterSpacing: '0.04em',
              }}
            >
              GOVERNANCE & PLANNING
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Meetings & Minutes of Meeting (MoM)
          </h1>
        </div>

        {(currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'team_admin') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Schedule Meeting
          </button>
        )}
      </div>

      {/* Quick Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { key: 'all', label: 'All Sessions' },
          { key: 'pre_event', label: 'Pre-Event Briefings' },
          { key: 'post_event', label: 'Post-Event Reviews' },
          { key: 'general', label: 'General Body Syncs' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              border: activeFilter === tab.key ? '1px solid #10B981' : '1px solid #E2E8F0',
              backgroundColor: activeFilter === tab.key ? '#ECFDF5' : '#FFFFFF',
              color: activeFilter === tab.key ? '#047857' : '#64748B',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          style={{
            paddingLeft: '40px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8ECF2',
            borderRadius: '16px',
            fontSize: '13px',
            height: '46px',
          }}
          placeholder="Search by meeting title, agenda, or venue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search size={20} strokeWidth={1.75} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Meetings List Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredMeetings.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E8ECF2',
              padding: '36px 20px',
              textAlign: 'center',
            }}
          >
            <Calendar size={48} strokeWidth={1.75} color="#10B981" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              No meetings found
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              No meetings currently match the selected filter.
            </p>
          </div>
        ) : (
          filteredMeetings.map((m) => {
            const mDate = new Date(m.dateTime);
            const isCompleted = m.status === 'completed';
            const actionCompletedCount = (m.actionItems || []).filter((a) => a.isDone).length;
            const totalActionCount = (m.actionItems || []).length;

            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E8ECF2',
                  padding: '18px 20px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor:
                          m.type === 'pre_event' ? '#ECFDF5' : m.type === 'post_event' ? '#EEF2FF' : '#FEF3C7',
                        color:
                          m.type === 'pre_event' ? '#047857' : m.type === 'post_event' ? '#4338CA' : '#B45309',
                        border:
                          m.type === 'pre_event' ? '1px solid #A7F3D0' : m.type === 'post_event' ? '1px solid #C7D2FE' : '1px solid #FDE68A',
                      }}
                    >
                      {m.type === 'pre_event' ? 'Pre-Event Briefing' : m.type === 'post_event' ? 'Post-Event Review' : 'General Sync'}
                    </span>

                    {m.eventTitle && (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        • Linked: {m.eventTitle}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isCompleted ? '#047857' : '#D97706',
                      backgroundColor: isCompleted ? '#ECFDF5' : '#FFFBEB',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {isCompleted ? '✓ MoM Published' : 'Scheduled'}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {m.title}
                </h3>

                {/* Date & Logistics */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} strokeWidth={1.75} color="#10B981" />
                    <strong style={{ color: '#1E293B' }}>
                      {mDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </strong>{' '}
                    at {mDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} strokeWidth={1.75} color="#10B981" />
                    {m.venue}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} strokeWidth={1.75} color="#10B981" />
                    Host: {m.organizerName}
                  </span>
                </div>

                {/* Agenda */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', fontSize: '12px', color: '#334155' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Agenda & Objectives:</div>
                  {m.agenda}
                </div>

                {/* MoM Snippet if present */}
                {m.momNotes && (
                  <div style={{ backgroundColor: '#ECFDF5', padding: '12px 14px', borderRadius: '12px', fontSize: '12px', color: '#065F46', border: '1px solid #A7F3D0' }}>
                    <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} strokeWidth={1.75} /> Recorded Minutes of Meeting (MoM):
                    </div>
                    {m.momNotes}
                  </div>
                )}

                {/* Action Items status pill */}
                {totalActionCount > 0 && (
                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} strokeWidth={1.75} color="#10B981" />
                    <span>Action Items Progress:</span>
                    <strong style={{ color: '#0F172A' }}>{actionCompletedCount} of {totalActionCount} completed</strong>
                  </div>
                )}

                {/* Action Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => handleOpenMoMEditor(m)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '999px',
                      backgroundColor: isCompleted ? '#F1F5F9' : '#10B981',
                      color: isCompleted ? '#0F172A' : '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileText size={16} strokeWidth={1.75} />
                    {isCompleted ? 'View / Edit MoM Record' : 'Record Minutes of Meeting (MoM)'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Meeting Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Club Meeting"
        subtitle="Organize pre-event briefing, volunteer alignment or post-event review"
      >
        <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">Meeting Type</label>
            <select
              className="input-field"
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
            >
              <option value="pre_event">Pre-Event Briefing (Volunteer station duties, safety)</option>
              <option value="post_event">Post-Event Review (Feedback analysis, finances)</option>
              <option value="general">General Body & Squad Sync</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Meeting Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Pre-Event Volunteer Briefing: Drone Survey"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Link to Club Event (Optional)</label>
            <select
              className="input-field"
              value={newEventId}
              onChange={(e) => setNewEventId(e.target.value)}
            >
              <option value="">-- No specific event link --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({new Date(ev.startDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Date & Time</label>
              <input
                type="datetime-local"
                required
                className="input-field"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Venue / Room</label>
              <input
                type="text"
                required
                className="input-field"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Agenda & Topics for Discussion</label>
            <textarea
              className="input-field"
              rows={3}
              required
              placeholder="1. Hardware checklist. 2. Station assignments. 3. Refreshment delivery timing..."
              value={newAgenda}
              onChange={(e) => setNewAgenda(e.target.value)}
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
            Schedule & Notify Attendees
          </button>
        </form>
      </Modal>

      {/* Record / View MoM Modal */}
      <Modal
        isOpen={isMoMModalOpen}
        onClose={() => setIsMoMModalOpen(false)}
        title="Minutes of Meeting (MoM) Editor"
        subtitle={selectedMeeting?.title || 'Formal record of deliberations and action items'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label className="input-label">Deliberations & Decisions (MoM Notes)</label>
            <textarea
              className="input-field"
              rows={5}
              placeholder="Record points discussed, decisions made, approved budget amounts, hardware permissions granted..."
              value={momNotesText}
              onChange={(e) => setMomNotesText(e.target.value)}
            />
          </div>

          {/* Action Items Checklist */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px' }}>Action Items & Assigned Scholars</label>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="input-field"
                style={{ flex: 2 }}
                placeholder="Action task description..."
                value={newActionTask}
                onChange={(e) => setNewActionTask(e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                style={{ flex: 1 }}
                placeholder="Assignee name"
                value={newActionAssignee}
                onChange={(e) => setNewActionAssignee(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {actionItemsList.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                  No action items added yet.
                </div>
              ) : (
                actionItemsList.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: item.isDone ? '#ECFDF5' : '#F8FAFC',
                      borderRadius: '10px',
                      border: item.isDone ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={item.isDone}
                        onChange={() => handleToggleActionDone(idx)}
                        style={{ width: '16px', height: '16px', accentColor: '#10B981' }}
                      />
                      <span style={{ textDecoration: item.isDone ? 'line-through' : 'none', color: item.isDone ? '#047857' : '#0F172A' }}>
                        {item.task}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                      @{item.assignedTo}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveMoM}
            style={{
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              height: '46px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
              marginTop: '8px',
            }}
          >
            Save & Publish Minutes of Meeting (MoM)
          </button>
        </div>
      </Modal>
    </div>
  );
};
