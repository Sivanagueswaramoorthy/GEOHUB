import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ChevronDown,
  Check,
  Calendar,
  Sparkles,
  Clock,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppAvatar } from '../../components/common/AppAvatar';

export type QrOperation = 'add_students' | 'mark_attendance';

export const MyQrView: React.FC = () => {
  const {
    events,
    users,
    attendance,
  } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || 'event_01');
  const [activeMode, setActiveMode] = useState<QrOperation>('add_students');
  const [isQrGenerated, setIsQrGenerated] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(20);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  // Custom Event Dropdown State
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const registeredStudents = users.filter((u) =>
    selectedEvent ? selectedEvent.registeredUserIds.includes(u.uid) : false
  );

  const eventAttendanceRecords = attendance.filter((a) => a.eventId === selectedEvent?.id);

  // Rotating token for live check-in gate QR
  const [tokenSeed, setTokenSeed] = useState(() => Date.now().toString(36));

  // 20-second validity timer: reverts back to initial "Generate QR" state upon expiry
  useEffect(() => {
    if (!isQrGenerated) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsQrGenerated(false); // Automatically revert back to generate QR state!
          setFeedbackMessage({
            type: 'warning',
            text: activeMode === 'add_students'
              ? 'Add Students QR expired (20 seconds reached). Click "Generate QR to Add Students" to generate again.'
              : 'Mark Attendance QR expired (20 seconds reached). Click "Generate QR to Mark Attendance" to generate again.',
          });
          setTimeout(() => setFeedbackMessage(null), 4500);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQrGenerated, activeMode]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventDropdownRef.current &&
        !eventDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEventDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. QR to Automatically Add Students to the Event
  const eventAutoRegisterQrValue = `GEO-EVENT-REGISTER-${selectedEvent?.id}`;

  // 2. Gate Attendance Check-in QR
  const eventGateCheckinQrValue = `GEO-EVENT-CHECKIN-${selectedEvent?.id}-${tokenSeed}`;

  const handleGenerateQr = () => {
    setTokenSeed(Date.now().toString(36));
    setSecondsLeft(20);
    setIsQrGenerated(true);
    setFeedbackMessage({
      type: 'success',
      text: activeMode === 'add_students'
        ? `QR pass generated to Add Students to "${selectedEvent.title}" (Valid for 20 seconds)!`
        : `QR pass generated to Mark Attendance for "${selectedEvent.title}" (Valid for 20 seconds)!`,
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '70px' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0' }}>
          Event QR Passes
        </h1>
      </div>

      {/* Target Event Selector Card */}
      <div className="app-card" style={{ padding: '14px 16px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Target Event
          </label>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: selectedEvent?.status === 'live' ? '#DCFCE7' : '#EFF6FF',
              color: selectedEvent?.status === 'live' ? '#166534' : '#1D4ED8',
            }}
          >
            {selectedEvent?.status.toUpperCase()}
          </span>
        </div>

        {/* Custom Event Dropdown */}
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
                  {selectedEvent.title}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                  {selectedEvent.registeredUserIds.length} Registered • {selectedEvent.category || 'Event'}
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

          {/* Floating Event Options */}
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
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.12)',
                zIndex: 60,
                maxHeight: '250px',
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
                      setIsQrGenerated(false); // Reset so QR generates only when user clicks button
                      setSecondsLeft(20);
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
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#065F46' : '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '11px', color: isSelected ? '#047857' : '#64748B' }}>
                        {ev.category || 'Event'} • {ev.venue || 'Campus Hall'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '999px',
                          backgroundColor: isSelected ? '#D1FAE5' : '#F1F5F9',
                          color: isSelected ? '#065F46' : '#64748B',
                        }}
                      >
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

        {/* Quick Snapshot Metrics */}
        {selectedEvent && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              marginTop: '12px',
              padding: '8px 6px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Enrolled
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>
                {selectedEvent.registeredUserIds.length}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderLeft: '1px solid #E2E8F0',
                borderRight: '1px solid #E2E8F0',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Checked In
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginTop: '1px' }}>
                {eventAttendanceRecords.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Turnout
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB', marginTop: '1px' }}>
                {selectedEvent.registeredUserIds.length > 0
                  ? `${Math.round((eventAttendanceRecords.length / selectedEvent.registeredUserIds.length) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            backgroundColor: feedbackMessage.type === 'success' ? '#ECFDF5' : '#FEF3C7',
            border: `1.5px solid ${feedbackMessage.type === 'success' ? '#A7F3D0' : '#FDE68A'}`,
            color: feedbackMessage.type === 'success' ? '#065F46' : '#92400E',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 size={16} color="#059669" />
          ) : (
            <AlertTriangle size={16} color="#D97706" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* TWO OPERATIONS SELECTOR: 1. Add Students, 2. Mark Attendance */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', padding: '0 2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Operation
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: activeMode === 'add_students' ? '#059669' : '#2563EB' }}>
            {activeMode === 'add_students' ? '● Auto-Enrollment Pass' : '● Attendance Gate Pass'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            backgroundColor: '#F1F5F9',
            padding: '4px',
            borderRadius: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveMode('add_students');
              setIsQrGenerated(false);
              setSecondsLeft(20);
            }}
            style={{
              height: '42px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeMode === 'add_students' ? '#FFFFFF' : 'transparent',
              color: activeMode === 'add_students' ? '#065F46' : '#64748B',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: activeMode === 'add_students' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
            }}
          >
            <UserPlus size={16} color={activeMode === 'add_students' ? '#059669' : '#64748B'} />
            <span>Add Students</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('mark_attendance');
              setIsQrGenerated(false);
              setSecondsLeft(20);
            }}
            style={{
              height: '42px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeMode === 'mark_attendance' ? '#FFFFFF' : 'transparent',
              color: activeMode === 'mark_attendance' ? '#1D4ED8' : '#64748B',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: activeMode === 'mark_attendance' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
            }}
          >
            <ShieldCheck size={16} color={activeMode === 'mark_attendance' ? '#2563EB' : '#64748B'} />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* IF QR IS NOT GENERATED YET: Show the specific operation's action card */}
      {!isQrGenerated ? (
        activeMode === 'add_students' ? (
          <div
            className="app-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '30px 18px',
              borderRadius: '22px',
              border: '2px dashed #A7F3D0',
              backgroundColor: '#F0FDF4',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1.5px solid #A7F3D0',
              }}
            >
              <UserPlus size={28} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Add Students to Event
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                Auto-Enrollment Pass
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                20s Dynamic Pass
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateQr}
              style={{
                height: '44px',
                padding: '0 26px',
                borderRadius: '999px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <QrCode size={20} strokeWidth={1.75} /> Generate QR
            </button>
          </div>
        ) : (
          <div
            className="app-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '30px 18px',
              borderRadius: '22px',
              border: '2px dashed #BFDBFE',
              backgroundColor: '#EFF6FF',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#DBEAFE',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1.5px solid #93C5FD',
              }}
            >
              <ShieldCheck size={28} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Mark Event Attendance
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                Checkpoint Pass
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                20s Dynamic Pass
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateQr}
              style={{
                height: '44px',
                padding: '0 26px',
                borderRadius: '999px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <QrCode size={20} strokeWidth={1.75} /> Generate QR
            </button>
          </div>
        )
      ) : (
        <>
          {/* 20-Second Live Validity Countdown Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 14px',
              borderRadius: '14px',
              backgroundColor: secondsLeft <= 5 ? '#FEF2F2' : '#F0FDF4',
              border: `1.5px solid ${secondsLeft <= 5 ? '#FECACA' : '#BBF7D0'}`,
              color: secondsLeft <= 5 ? '#DC2626' : '#065F46',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Clock size={16} color={secondsLeft <= 5 ? '#DC2626' : '#059669'} />
              <span>
                {activeMode === 'add_students' ? 'Add Students QR' : 'Mark Attendance QR'} Valid: <b>{secondsLeft}s left</b>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '6px',
                  backgroundColor: secondsLeft <= 5 ? '#FECACA' : '#D1FAE5',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(secondsLeft / 20) * 100}%`,
                    backgroundColor: secondsLeft <= 5 ? '#DC2626' : '#059669',
                    transition: 'width 1s linear',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQrGenerated(false);
                  setSecondsLeft(20);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* OPERATION 1: ADD STUDENTS (Auto-Registration QR) */}
          {activeMode === 'add_students' && (
            <div
              className="app-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '20px 18px',
                borderRadius: '22px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '10px',
                  border: '1px solid #A7F3D0',
                }}
              >
                <Sparkles size={16} strokeWidth={1.75} />
                SCAN TO AUTOMATICALLY JOIN THIS EVENT
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                {selectedEvent.title}
              </h2>

              {/* QR Code Card */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '2.5px solid #10B981',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
                  marginBottom: '12px',
                }}
              >
                <QRCodeSVG
                  value={eventAutoRegisterQrValue}
                  size={190}
                  level="H"
                  includeMargin={false}
                  fgColor="#0F172A"
                />
              </div>

              {/* 20-Second Countdown Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  backgroundColor: secondsLeft <= 5 ? '#FEF2F2' : '#F0FDF4',
                  border: secondsLeft <= 5 ? '1px solid #FECACA' : '1px solid #BBF7D0',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: secondsLeft <= 5 ? '#DC2626' : '#065F46',
                  marginBottom: '14px',
                }}
              >
                <Clock size={16} strokeWidth={1.75} color={secondsLeft <= 5 ? '#DC2626' : '#059669'} />
                <span>Pass auto-expires in {secondsLeft}s</span>
              </div>

              {/* Enrolled Students Live Roster */}
              <div style={{ width: '100%', textAlign: 'left', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Live Registered Roster ({registeredStudents.length} Students)
                  </span>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                    ● Auto-Sync Active
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {registeredStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '12px' }}>
                      No students have scanned to join this event yet.
                    </div>
                  ) : (
                    registeredStudents.map((st) => {
                      const isCheckedIn = eventAttendanceRecords.some((a) => a.userId === st.uid);
                      return (
                        <div
                          key={st.uid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            borderRadius: '10px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <AppAvatar name={st.name} avatarUrl={st.avatarUrl} size={28} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {st.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                #{st.uid} • {st.department || 'Geoinformatics'}
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              backgroundColor: isCheckedIn ? '#DCFCE7' : '#EFF6FF',
                              color: isCheckedIn ? '#166534' : '#1D4ED8',
                              flexShrink: 0,
                            }}
                          >
                            {isCheckedIn ? 'CHECKED IN' : 'ENROLLED'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OPERATION 2: ATTENDANCE CHECK-IN GATE QR */}
          {activeMode === 'mark_attendance' && (
            <div
              className="app-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '20px 18px',
                borderRadius: '22px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '10px',
                  border: '1px solid #A7F3D0',
                }}
              >
                <ShieldCheck size={16} strokeWidth={1.75} />
                GATE TERMINAL CHECKPOINT PASS
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                {selectedEvent.title}
              </h2>

              {/* QR Code Container */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '2px solid #E2E8F0',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                  marginBottom: '14px',
                }}
              >
                <QRCodeSVG
                  value={eventGateCheckinQrValue}
                  size={190}
                  level="H"
                  includeMargin={false}
                  fgColor="#0F172A"
                />
              </div>

              {/* Countdown Refresh Ring */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  backgroundColor: secondsLeft <= 5 ? '#FEF2F2' : '#F8FAFC',
                  border: secondsLeft <= 5 ? '1px solid #FECACA' : '1px solid #E2E8F0',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: secondsLeft <= 5 ? '#DC2626' : '#64748B',
                  marginBottom: '14px',
                }}
              >
                <Clock size={16} strokeWidth={1.75} color={secondsLeft <= 5 ? '#DC2626' : '#059669'} />
                <span>Gate pass auto-expires in {secondsLeft}s</span>
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  fontSize: '12px',
                  color: '#065F46',
                  fontWeight: 600,
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                💡 <b>Advisor Rule:</b> Students must first join/register for <b>"{selectedEvent.title}"</b> before their attendance can be verified at this gate.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
