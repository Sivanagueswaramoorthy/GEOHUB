import React, { useState, useEffect, useRef } from 'react';
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Camera,
  RotateCcw,
  UserCheck,
  UserX,
  Calendar,
  UserPlus,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { AppAvatar } from '../../components/common/AppAvatar';

export const VolunteerScanView: React.FC = () => {
  const {
    currentUser,
    events,
    meetings,
    users,
    attendance,
    recordAttendance,
    registerStudentForEvent,
  } = useApp();

  const [scanScope, setScanScope] = useState<'event' | 'meeting'>('event');
  const [selectedEventId, setSelectedEventId] = useState<string>('event_01');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meet_01');
  const [manualScanInput, setManualScanInput] = useState<string>('');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    user?: (typeof users)[0];
    time?: string;
    isRegistered?: boolean;
  } | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  const activeSessionId = scanScope === 'event' ? selectedEvent?.id : selectedMeeting?.id;
  const activeSessionTitle = scanScope === 'event' ? selectedEvent?.title : selectedMeeting?.title;
  const sessionScans = attendance.filter((a) => a.eventId === activeSessionId);
  const registeredCount = scanScope === 'event' ? (selectedEvent?.registeredUserIds.length || 0) : (selectedMeeting?.attendeeIds.length || 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Process any QR Code text, student ID, or token
  const handleProcessScan = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // Check for Event Registration QR (Auto-Enrollment on scan)
    if (
      trimmed.startsWith('GEO-EVENT-REGISTER') ||
      trimmed.startsWith('GEO-EVENT-REG') ||
      trimmed.startsWith('GEO-EVENT-SELFREG')
    ) {
      const parts = trimmed.split('-');
      const eventIdFromCode = parts[parts.length - 1];
      const ev = events.find((e) => e.id === eventIdFromCode) || selectedEvent;
      
      // Automatically add student to this respective event!
      registerStudentForEvent(ev.id, currentUser.uid);
      setScanResult({
        status: 'success',
        title: '🎉 Automatically Added to Event!',
        message: `${currentUser.name} has been successfully registered and added to "${ev.title}".`,
        user: currentUser,
        isRegistered: true,
      });
      setManualScanInput('');
      return;
    }

    // Parse student ID from various QR formats:
    // e.g. "GEO-SEC-u_member_04-...", "GEO-ATT-event_01-u_member_04-...", or raw "u_member_04", or email
    let student = users.find(
      (u) =>
        u.uid.toLowerCase() === trimmed.toLowerCase() ||
        u.email.toLowerCase() === trimmed.toLowerCase()
    );

    if (!student) {
      // Check if token contains UID
      for (const u of users) {
        if (trimmed.includes(u.uid)) {
          student = u;
          break;
        }
      }
    }

    if (!student) {
      setScanResult({
        status: 'error',
        title: 'Unrecognized QR Code',
        message: `The scanned barcode "${trimmed}" does not match any recognized scholar in the college registry.`,
      });
      setManualScanInput('');
      return;
    }

    // Meeting Session Scan Handling
    if (scanScope === 'meeting') {
      setScanResult({
        status: 'success',
        title: 'Meeting Attendance Marked!',
        message: `Verified! ${student.name} marked present for "${selectedMeeting.title}".`,
        user: student,
        time: new Date().toISOString(),
        isRegistered: true,
      });
      setManualScanInput('');
      return;
    }

    // Check if student is registered for the selected event
    const isRegistered = selectedEvent.registeredUserIds.includes(student.uid);

    if (!isRegistered) {
      setScanResult({
        status: 'warning',
        title: 'Attendance Denied: Not Registered',
        message: `${student.name} is NOT registered for "${selectedEvent.title}". Only pre-registered scholars are authorized for event entry.`,
        user: student,
        isRegistered: false,
      });
      setManualScanInput('');
      return;
    }

    // Student is registered -> record attendance
    const result = recordAttendance(selectedEvent.id, student.uid);
    if (result.success) {
      setScanResult({
        status: 'success',
        title: 'Attendance Verified & Marked!',
        message: `Welcome ${student.name}! Valid event registration confirmed for "${selectedEvent.title}".`,
        user: student,
        time: new Date().toISOString(),
        isRegistered: true,
      });
    } else {
      setScanResult({
        status: 'warning',
        title: 'Check-in Notice',
        message: result.message,
        user: student,
        isRegistered: true,
      });
    }

    setManualScanInput('');
  };

  // Preset Scanner Simulation Tests
  const handleSimulateScan = (type: 'valid' | 'unregistered' | 'duplicate' | 'invalid') => {
    if (type === 'invalid') {
      setScanResult({
        status: 'error',
        title: 'Invalid or External Barcode',
        message: 'The presented QR code is corrupted or from an unauthorized system.',
      });
      return;
    }

    if (type === 'duplicate') {
      const alreadyCheckedIn = attendance.find((a) => a.eventId === selectedEvent.id);
      const student = users.find((u) => u.uid === alreadyCheckedIn?.userId) || users[3];
      setScanResult({
        status: 'warning',
        title: 'Duplicate Check-in Attempt',
        message: `${student.name} is already checked in for this event! Verified at ${new Date(alreadyCheckedIn?.checkInTime || Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        user: student,
        time: alreadyCheckedIn?.checkInTime,
        isRegistered: true,
      });
      return;
    }

    if (type === 'unregistered') {
      // Find a student NOT registered for this event
      const unregisteredStudent = users.find((u) => !selectedEvent.registeredUserIds.includes(u.uid)) || users[users.length - 1];
      setScanResult({
        status: 'warning',
        title: 'Attendance Denied: Not Registered',
        message: `${unregisteredStudent.name} is NOT registered for "${selectedEvent.title}". Attendance cannot be marked.`,
        user: unregisteredStudent,
        isRegistered: false,
      });
      return;
    }

    // Valid scan: Pick a student registered for this event who has not checked in yet
    const checkedInUserIds = attendance.filter((a) => a.eventId === selectedEvent.id).map((a) => a.userId);
    const validCandidate =
      users.find((u) => selectedEvent.registeredUserIds.includes(u.uid) && !checkedInUserIds.includes(u.uid)) ||
      users.find((u) => selectedEvent.registeredUserIds.includes(u.uid)) ||
      users[0];

    const result = recordAttendance(selectedEvent.id, validCandidate.uid);
    if (result.success) {
      setScanResult({
        status: 'success',
        title: 'Attendance Verified & Marked!',
        message: `Welcome ${validCandidate.name}! Valid event registration confirmed for "${selectedEvent.title}".`,
        user: validCandidate,
        time: new Date().toISOString(),
        isRegistered: true,
      });
    } else {
      setScanResult({
        status: 'warning',
        title: 'Check-in Notice',
        message: result.message,
        user: validCandidate,
        isRegistered: selectedEvent.registeredUserIds.includes(validCandidate.uid),
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#065F46',
              backgroundColor: '#D1FAE5',
              padding: '3px 10px',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              border: '1px solid #A7F3D0',
              textTransform: 'uppercase',
            }}
          >
            ● Gate Terminal Scanner
          </span>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            {sessionScans.length} Checked In
          </span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          QR Gate Scanner
        </h1>
      </div>

      {/* Session Scope Tabs (Events vs Meetings) */}
      <div style={{ display: 'flex', padding: '4px', backgroundColor: '#F1F5F9', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <button
          type="button"
          onClick={() => {
            setScanScope('event');
            setIsEventDropdownOpen(false);
          }}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: scanScope === 'event' ? '#FFFFFF' : 'transparent',
            fontWeight: 700,
            fontSize: '12px',
            color: scanScope === 'event' ? '#0F172A' : '#64748B',
            cursor: 'pointer',
            boxShadow: scanScope === 'event' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          Event Checkpoints ({events.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setScanScope('meeting');
            setIsEventDropdownOpen(false);
          }}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: scanScope === 'meeting' ? '#FFFFFF' : 'transparent',
            fontWeight: 700,
            fontSize: '12px',
            color: scanScope === 'meeting' ? '#0F172A' : '#64748B',
            cursor: 'pointer',
            boxShadow: scanScope === 'meeting' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          Meeting Checkpoints ({meetings.length})
        </button>
      </div>

      {/* Target Checkpoint Selector */}
      <div className="app-card" style={{ padding: '16px 18px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active {scanScope === 'event' ? 'Event' : 'Meeting'} Checkpoint
          </label>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '999px' }}>
            {registeredCount} {scanScope === 'event' ? 'Registered' : 'Expected'}
          </span>
        </div>
        {/* Custom Dropdown */}
        <div ref={eventDropdownRef} style={{ position: 'relative', width: '100%' }}>
          <button
            type="button"
            onClick={() => setIsEventDropdownOpen((prev) => !prev)}
            style={{
              width: '100%',
              minHeight: '42px',
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              border: isEventDropdownOpen ? '1.5px solid #059669' : '1.5px solid #E2E8F0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: isEventDropdownOpen ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
              transition: 'all 0.15s ease',
              textAlign: 'left',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <Calendar size={16} color="#059669" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeSessionTitle}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {scanScope === 'event'
                    ? `${selectedEvent.registeredUserIds.length} Registered • ${selectedEvent.status.toUpperCase()}`
                    : `${selectedMeeting.venue} • ${new Date(selectedMeeting.dateTime).toLocaleDateString()}`}
                </div>
              </div>
            </div>

            <ChevronDown
              size={20} strokeWidth={1.75}
              color="#64748B"
              style={{
                transform: isEventDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                flexShrink: 0,
              }}
            />
          </button>

          {isEventDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.1)',
                zIndex: 60,
                maxHeight: '240px',
                overflowY: 'auto',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {events.map((ev) => {
                const isSelected = ev.id === selectedEventId;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      setIsEventDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isSelected ? '#ECFDF5' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#065F46' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '11px', color: isSelected ? '#047857' : '#64748B' }}>
                        {ev.category || 'Event'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '999px', backgroundColor: isSelected ? '#D1FAE5' : '#F1F5F9', color: isSelected ? '#065F46' : '#64748B' }}>
                        {ev.registeredUserIds.length} Reg
                      </span>
                      {isSelected && <Check size={16} strokeWidth={1.75} color="#059669" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Camera Viewfinder Emulator */}
      <div
        style={{
          position: 'relative',
          height: '220px',
          borderRadius: '24px',
          backgroundColor: '#0F172A',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.35)',
        }}
      >
        {/* Reticle / Viewfinder Frame */}
        <div
          style={{
            width: '160px',
            height: '160px',
            border: '2px solid rgba(16, 185, 129, 0.85)',
            borderRadius: '16px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated Laser Bar */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '3px',
              backgroundColor: '#10B981',
              boxShadow: '0 0 14px #10B981',
              animation: 'laserScan 2.4s ease-in-out infinite alternate',
            }}
          />
          <Scan size={48} strokeWidth={1.75} color="rgba(255, 255, 255, 0.25)" />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            padding: '4px 12px',
            borderRadius: '999px',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <Camera size={16} strokeWidth={1.75} />
          <span>Optical laser scanner active</span>
        </div>
      </div>

      {/* Manual / Scan ANY QR Code Bar */}
      <div className="app-card" style={{ padding: '16px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Scan or Enter Any QR Code
          </h3>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
            Barcode / UID / Token
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProcessScan(manualScanInput);
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            className="input-field"
            placeholder="Type or paste student QR code token..."
            value={manualScanInput}
            onChange={(e) => setManualScanInput(e.target.value)}
            style={{ flex: 1, height: '42px', borderRadius: '12px', fontSize: '13px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              borderRadius: '12px',
              height: '42px',
              padding: '0 16px',
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            Scan Code
          </button>
        </form>

        {/* Quick Directory Selector for testing any student */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>
            Or pick any student to scan their pass:
          </label>
          <select
            className="input-field"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleProcessScan(e.target.value);
              }
            }}
            style={{ height: '40px', borderRadius: '10px', fontSize: '12px' }}
          >
            <option value="">-- Choose student to verify attendance --</option>
            {users.map((u) => {
              const isReg = selectedEvent.registeredUserIds.includes(u.uid);
              return (
                <option key={u.uid} value={u.uid}>
                  {u.name} ({isReg ? '✅ REGISTERED' : '❌ NOT REGISTERED'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Preset Test Scenarios */}
      <div className="app-card" style={{ padding: '16px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
          One-Click Test Scenarios
        </h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>
          Verify registration validation rules:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleSimulateScan('valid')}
            style={{
              borderRadius: '10px',
              height: '38px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <UserCheck size={16} strokeWidth={1.75} /> Scan Registered
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleSimulateScan('unregistered')}
            style={{
              borderRadius: '10px',
              height: '38px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#DC2626',
              borderColor: '#FECACA',
              backgroundColor: '#FEF2F2',
            }}
          >
            <UserX size={16} strokeWidth={1.75} /> Scan Unregistered
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleSimulateScan('duplicate')}
            style={{
              borderRadius: '10px',
              height: '38px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#D97706',
              borderColor: '#FDE68A',
              backgroundColor: '#FFFBEB',
            }}
          >
            <RotateCcw size={16} strokeWidth={1.75} /> Duplicate Scan
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleSimulateScan('invalid')}
            style={{
              borderRadius: '10px',
              height: '38px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <XCircle size={16} strokeWidth={1.75} color="#94A3B8" /> Invalid Token
          </button>
        </div>
      </div>

      {/* Recent Scans Session Table */}
      <div className="app-card" style={{ padding: '16px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#059669" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Live Gate Admission Log
            </h3>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#059669',
              backgroundColor: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid #A7F3D0',
            }}
          >
            {sessionScans.length} verified
          </span>
        </div>

        {sessionScans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '18px 0', color: '#94A3B8', fontSize: '13px' }}>
            No scans recorded yet for this event terminal.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessionScans.slice(0, 5).map((att) => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  fontSize: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{att.userName}</div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>
                    {att.team ? `${att.team} Squad • ` : ''}Verified at Terminal
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      color: '#059669',
                      fontWeight: 800,
                      fontSize: '11px',
                      display: 'block',
                    }}
                  >
                    VERIFIED
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>
                    {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Bottom Sheet Modal */}
      <Modal
        isOpen={scanResult !== null}
        onClose={() => setScanResult(null)}
        title={scanResult?.title || ''}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', padding: '8px 0 4px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor:
                scanResult?.status === 'success'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : scanResult?.status === 'warning'
                  ? 'rgba(217, 119, 6, 0.12)'
                  : 'rgba(220, 38, 38, 0.12)',
              color:
                scanResult?.status === 'success'
                  ? '#059669'
                  : scanResult?.status === 'warning'
                  ? '#D97706'
                  : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {scanResult?.status === 'success' && <CheckCircle2 size={48} strokeWidth={1.75} />}
            {scanResult?.status === 'warning' && <AlertTriangle size={48} strokeWidth={1.75} />}
            {scanResult?.status === 'error' && <XCircle size={48} strokeWidth={1.75} />}
          </div>

          <div>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
              {scanResult?.message}
            </p>
          </div>

          {scanResult?.user && (
            <div
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #E8ECF2',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
              }}
            >
              <AppAvatar name={scanResult.user.name} size={48} strokeWidth={1.75} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>
                  {scanResult.user.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {scanResult.user.department || 'Geoinformatics'} • {scanResult.user.yearOfStudy || 'Undergraduate'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: scanResult.isRegistered ? '#D1FAE5' : '#FEE2E2',
                      color: scanResult.isRegistered ? '#065F46' : '#991B1B',
                      border: `1px solid ${scanResult.isRegistered ? '#A7F3D0' : '#FECACA'}`,
                    }}
                  >
                    {scanResult.isRegistered ? '✅ Registered for Event' : '❌ NOT Registered for Event'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {scanResult?.user && !scanResult.isRegistered && (
            <button
              className="btn btn-block"
              onClick={() => {
                if (!scanResult?.user || !selectedEvent) return;
                registerStudentForEvent(selectedEvent.id, scanResult.user.uid);
                const res = recordAttendance(selectedEvent.id, scanResult.user.uid);
                if (res.success) {
                  setScanResult({
                    status: 'success',
                    title: 'Enrolled & Verified!',
                    message: `${scanResult.user.name} has been enrolled in "${selectedEvent.title}" and check-in attendance marked!`,
                    user: scanResult.user,
                    time: new Date().toISOString(),
                    isRegistered: true,
                  });
                }
              }}
              style={{
                borderRadius: '999px',
                height: '46px',
                fontWeight: 800,
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              <UserPlus size={20} strokeWidth={1.75} /> Enroll & Mark Attendance Now
            </button>
          )}

          <button
            className="btn btn-primary btn-block"
            onClick={() => setScanResult(null)}
            style={{ borderRadius: '999px', height: '46px', fontWeight: 800 }}
          >
            Scan Next Attendee
          </button>
        </div>
      </Modal>

      {/* Laser Animation Style */}
      <style>{`
        @keyframes laserScan {
          0% { top: 10px; }
          100% { top: 150px; }
        }
      `}</style>
    </div>
  );
};
