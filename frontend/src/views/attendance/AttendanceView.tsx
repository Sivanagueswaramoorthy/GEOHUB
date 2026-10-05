import React, { useState } from 'react';
import { Download, Search, CheckCircle2, AlertTriangle, Users, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AttendanceView: React.FC = () => {
  const { events, attendance } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>('event_01');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'flagged'>('all');

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const records = attendance.filter((a) => a.eventId === selectedEventId);

  const filteredRecords = records.filter((rec) => {
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    if (
      searchQuery &&
      !rec.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !rec.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No attendance records to export.');
      return;
    }

    const headers = ['Record ID', 'Event Title', 'Student Name', 'College Email', 'Team', 'Check-In Timestamp', 'Scanned By', 'Status'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.eventTitle}"`,
      `"${r.userName}"`,
      r.userEmail,
      r.team || 'None',
      r.checkInTime,
      `"${r.scannedByVolunteerName}"`,
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoHub_Attendance_${selectedEvent.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
            Live Attendance Desk
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Real-time terminal logs, verified timestamps & CSV audit export
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
          <Download size={16} /> Export to CSV
        </button>
      </div>

      {/* Event Selector & Stats */}
      <div className="app-card">
        <label className="input-label" style={{ marginBottom: '6px' }}>Select Target Event</label>
        <select
          className="input-field"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({ev.registeredUserIds.length} Registered)
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E8ECF2', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#64748B' }}>Verified Check-ins: </span>
            <strong style={{ color: '#0F766E' }}>{records.length}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Registered: </span>
            <strong>{selectedEvent.registeredUserIds.length}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Capacity: </span>
            <strong>{selectedEvent.capacity}</strong>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: '38px' }}
          placeholder="Filter attendees by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
      </div>

      {/* Attendance Table / List */}
      <div>
        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <Users size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>No records found</h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              No check-ins have been recorded yet for this session.
            </p>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="app-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                marginBottom: '8px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                    {rec.userName}
                  </span>
                  {rec.team && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                      }}
                    >
                      {rec.team}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  {rec.userEmail} • Verified by {rec.scannedByVolunteerName}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#16A34A',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '999px',
                  }}
                >
                  <CheckCircle2 size={12} /> VERIFIED
                </span>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  {new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
