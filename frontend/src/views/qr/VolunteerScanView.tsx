import React, { useState, useEffect } from 'react';
import {
  Scan,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  Camera,
  MapPin,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Mascot,
  EmptyState,
  StatusChip,
  BottomSheet,
  Avatar,
  PillButton,
} from '../../components/shared';

export const VolunteerScanView: React.FC = () => {
  const {
    currentUser,
    events,
    users,
    attendance,
    recordAttendance,
    showToast,
  } = useApp();

  const isAssigned =
    currentUser.role === 'coordinator' ||
    currentUser.role === 'faculty' ||
    currentUser.role === 'super_admin' ||
    currentUser.post?.toLowerCase().includes('scanner') ||
    currentUser.teamRole?.toLowerCase().includes('scanner') ||
    currentUser.role === 'volunteer';

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || 'event_01');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scannedCount, setScannedCount] = useState(24);

  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'failure';
    name?: string;
    rollNo?: string;
    avatarUrl?: string;
    reason?: 'Expired' | 'Already Checked In' | 'Not Registered';
  } | null>(null);

  // Auto-dismiss result sheet after 1.5s with haptic vibration feedback
  useEffect(() => {
    if (!scanResult) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(scanResult.status === 'success' ? [40] : [80, 40, 80]);
    }
    const timer = setTimeout(() => {
      setScanResult(null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [scanResult]);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0] || {
    id: 'event_01',
    title: 'QGIS Remote Sensing Workshop',
    venue: 'Grand Auditorium',
  };

  const handleSimulateScan = (roll: string) => {
    const matchedUser = users.find((u) => u.rollNo === roll || u.email?.includes(roll.toLowerCase())) || {
      id: 'usr_mock',
      name: 'Maya Patel',
      rollNo: roll || '21GEO001',
      avatarUrl: undefined,
    };

    if (roll === 'EXPIRED') {
      setScanResult({
        status: 'failure',
        reason: 'Expired',
      });
      return;
    }
    if (roll === 'UNREGISTERED') {
      setScanResult({
        status: 'failure',
        reason: 'Not Registered',
      });
      return;
    }

    setScannedCount((prev) => prev + 1);
    setScanResult({
      status: 'success',
      name: matchedUser.name,
      rollNo: matchedUser.rollNo,
      avatarUrl: matchedUser.avatarUrl,
    });
  };

  if (!isAssigned) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center select-none">
        <EmptyState
          mascot="lock"
          title="No scanner access"
          subtitle="Assignment required by chapter coordinator"
          actionLabel="View events"
          onAction={() => window.location.hash = 'events'}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 select-none animate-fadeIn">
      {/* 1) Header: 1 headline "Gate Scanner", 1 subtitle "Scan attendee badges" */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#051F20]"
            style={{ fontSize: '28px', lineHeight: '32px' }}
          >
            Gate Scanner
          </h1>
          <p className="text-xs font-semibold text-[#235347] mt-1">
            Scan attendee badges
          </p>
        </div>

        {/* Counter badge: "Scanned: 24" */}
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
          Scanned: {scannedCount}
        </span>
      </div>

      {/* Event Title Chip */}
      <div className="flex items-center gap-2">
        <StatusChip status="live" label={activeEvent.title} />
      </div>

      {/* 2) Full-screen Viewfinder in a 28px rounded frame on #051F20 */}
      <div
        className="relative w-full overflow-hidden flex flex-col items-center justify-between p-6 shadow-[0_16px_40px_rgba(5,31,32,0.2)]"
        style={{
          borderRadius: '28px',
          backgroundColor: '#051F20',
          minHeight: '380px',
        }}
      >
        {/* Subtle camera lens glare */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(142, 182, 155, 0.4) 0%, transparent 70%)',
          }}
        />

        {/* Viewfinder Target Box with sage-400 corner brackets */}
        <div className="relative my-auto w-56 h-56 flex items-center justify-center">
          {/* Top-Left Corner */}
          <div
            className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4"
            style={{ borderColor: '#8EB69B', borderTopLeftRadius: '12px' }}
          />
          {/* Top-Right Corner */}
          <div
            className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4"
            style={{ borderColor: '#8EB69B', borderTopRightRadius: '12px' }}
          />
          {/* Bottom-Left Corner */}
          <div
            className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4"
            style={{ borderColor: '#8EB69B', borderBottomLeftRadius: '12px' }}
          />
          {/* Bottom-Right Corner */}
          <div
            className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4"
            style={{ borderColor: '#8EB69B', borderBottomRightRadius: '12px' }}
          />

          {/* Pulsing Scan Laser line */}
          <div
            className="w-48 h-0.5 rounded-full animate-pulse shadow-[0_0_8px_#8EB69B]"
            style={{ backgroundColor: '#8EB69B' }}
          />
        </div>

        {/* Controls row: 40px white torch and flip buttons */}
        <div className="relative z-10 flex items-center gap-4 mt-auto">
          <button
            type="button"
            onClick={() => setIsTorchOn(!isTorchOn)}
            className="flex items-center justify-center rounded-full bg-white text-[#163832] shadow-[0_4px_14px_rgba(5,31,32,0.12)] border border-[#DAF1DE] transition-transform active:scale-95 cursor-pointer"
            style={{ width: '40px', height: '40px' }}
            title={isTorchOn ? 'Turn torch off' : 'Turn torch on'}
            aria-label="Torch"
          >
            <Zap size={18} strokeWidth={2.2} className={isTorchOn ? 'fill-current text-[#F2B84B]' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="flex items-center justify-center rounded-full bg-white text-[#163832] shadow-[0_4px_14px_rgba(5,31,32,0.12)] border border-[#DAF1DE] transition-transform active:scale-95 cursor-pointer"
            style={{ width: '40px', height: '40px' }}
            title="Switch camera"
            aria-label="Switch camera"
          >
            <RotateCcw size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Quick Simulation / Manual Entry Bar */}
      <div className="flex items-center gap-2 p-3 bg-white border border-[#DAF1DE] rounded-2xl" style={{ borderRadius: '16px' }}>
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Enter Scholar Roll No (e.g. 21GEO001)..."
          className="flex-1 bg-transparent text-xs text-[#051F20] outline-none font-medium px-2"
        />
        <PillButton
          variant="primary"
          size="sm"
          onClick={() => {
            if (manualInput.trim()) {
              handleSimulateScan(manualInput.trim());
              setManualInput('');
            } else {
              handleSimulateScan('21GEO001');
            }
          }}
        >
          Check In
        </PillButton>
      </div>

      {/* 3) Result Bottom Sheet (Auto-dismiss 1.5s) */}
      <BottomSheet
        isOpen={Boolean(scanResult)}
        onClose={() => setScanResult(null)}
        title={scanResult?.status === 'success' ? 'Verified Entry' : 'Verification Issue'}
      >
        <div className="flex flex-col items-center text-center py-2 select-none">
          {scanResult?.status === 'success' ? (
            /* Mint Card with Check, Avatar, Student Name */
            <div
              className="w-full p-5 flex flex-col items-center bg-[#DAF1DE] border border-[#8EB69B] shadow-[0_4px_14px_rgba(5,31,32,0.06)]"
              style={{ borderRadius: '24px' }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#163832] text-white mb-3">
                <CheckCircle2 size={24} strokeWidth={2.4} />
              </div>

              <Avatar name={scanResult.name || 'Scholar'} src={scanResult.avatarUrl} size={48} />

              <h2 className="text-base font-bold text-[#051F20] mt-2">
                {scanResult.name}
              </h2>
              <span className="text-xs font-semibold text-[#163832] mt-0.5">
                {scanResult.rollNo} • Gate Verified
              </span>
            </div>
          ) : (
            /* Red-tint Card with Reason: Expired / Already Checked In / Not Registered */
            <div
              className="w-full p-5 flex flex-col items-center bg-[rgba(217,83,79,0.12)] border border-[rgba(217,83,79,0.35)] shadow-[0_4px_14px_rgba(5,31,32,0.06)]"
              style={{ borderRadius: '24px' }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#D9534F] text-white mb-3">
                <XCircle size={24} strokeWidth={2.4} />
              </div>

              <h2 className="text-base font-bold text-[#D9534F]">
                Access Denied
              </h2>
              <span className="text-xs font-bold text-[#051F20] mt-1">
                Reason: {scanResult?.reason || 'Not Registered'}
              </span>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default VolunteerScanView;
