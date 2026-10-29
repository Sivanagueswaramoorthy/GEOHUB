import React, { useState } from 'react';
import { Download, Search, CheckCircle2, Users, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PillButton } from '../../components/shared/PillButton';
import { StatusChip } from '../../components/shared/StatusChip';
import { ProgressRing } from '../../components/shared/ProgressRing';
import { Avatar } from '../../components/shared/Avatar';
import { Mascot } from '../../components/shared/Mascot';

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

  const percentVerified =
    selectedEvent && selectedEvent.capacity > 0
      ? Math.min(100, Math.round((records.length / selectedEvent.capacity) * 100))
      : 0;

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      return;
    }

    const headers = [
      'Record ID',
      'Event Title',
      'Student Name',
      'College Email',
      'Team',
      'Check-In Timestamp',
      'Scanned By',
      'Status',
    ];
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

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoHub_Attendance_${selectedEvent.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Attendance
          </h1>
          <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0', fontWeight: 600 }}>
            Live gate roster
          </p>
        </div>

        <PillButton
          icon={<Download size={16} />}
          variant="primary"
          onClick={handleExportCSV}
        >
          Export
        </PillButton>
      </div>

      {/* Target Event Card with Count Ring */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DAF1DE',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#235347', display: 'block', marginBottom: '6px' }}>
              Target Event
            </label>
            <select
              style={{
                width: '100%',
                height: '42px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#051F20',
                backgroundColor: '#F6FBF7',
                border: '1px solid #DAF1DE',
                borderRadius: '16px',
                padding: '0 12px',
                outline: 'none',
              }}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.registeredUserIds.length} Registered)
                </option>
              ))}
            </select>
          </div>

          {/* Count Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <ProgressRing
              progress={percentVerified}
              size={64}
              strokeWidth={6}
              label={`${records.length}`}
            />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347', marginTop: '4px' }}>
              Check-ins
            </span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            paddingTop: '12px',
            borderTop: '1px solid #DAF1DE',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>Verified</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#163832' }}>{records.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>Registered</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#051F20' }}>
              {selectedEvent ? selectedEvent.registeredUserIds.length : 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#235347', fontWeight: 600 }}>Capacity</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#235347' }}>
              {selectedEvent ? selectedEvent.capacity : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
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
          placeholder="Filter attendees by name..."
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

      {/* Attendance List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredRecords.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              padding: '36px 20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Mascot name="clipboard" size="md" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#051F20', margin: '8px 0 2px 0' }}>
              No check-ins
            </h3>
            <p style={{ fontSize: '12px', color: '#235347', margin: 0 }}>
              Scanned passes will appear here
            </p>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #DAF1DE',
                padding: '14px 18px',
                boxShadow: '0 10px 30px rgba(5,31,32,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <Avatar name={rec.userName} size={40} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#051F20' }}>
                      {rec.userName}
                    </span>
                    {rec.team && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: '#DAF1DE',
                          color: '#163832',
                          border: '1px solid #8EB69B',
                        }}
                      >
                        {rec.team}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#235347', marginTop: '2px', fontWeight: 500 }} className="truncate">
                    {rec.userEmail}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <StatusChip status="done" label="Verified" />
                <div style={{ fontSize: '12px', color: '#235347', marginTop: '4px', fontWeight: 600 }}>
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

export default AttendanceView;
