import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  QrCode,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  StatusChip,
  ProgressRing,
  PillButton,
} from '../../components/shared';

export const MyQrView: React.FC = () => {
  const { currentUser, events, selectedEventId, setSelectedEventId, setActiveTab, showToast } = useApp();

  const [chosenEventId, setChosenEventId] = useState<string>(() => {
    if (selectedEventId) return selectedEventId;
    const live = events.find((e) => e.status === 'live');
    if (live) return live.id;
    return events[0]?.id || 'event_01';
  });

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(20);
  const [tokenSeed, setTokenSeed] = useState(() => Date.now().toString(36));
  const [otp, setOtp] = useState<string>(() => Math.floor(100000 + Math.random() * 900000).toString());

  const chosenEvent =
    events.find((e) => e.id === chosenEventId) ||
    events[0] || {
      id: 'event_01',
      title: 'GEO FEST 2026: Campus Odyssey',
      venue: 'University Grand Auditorium',
      startDate: new Date().toISOString(),
      category: 'Flagship Event',
    };

  // Generate 6-digit OTP
  const generateNewOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 20-second validity countdown timer (only runs when popup is open)
  useEffect(() => {
    if (!isPopupOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTokenSeed(Date.now().toString(36));
          setOtp(generateNewOtp());
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPopupOpen]);

  const handleOpenQrPopup = () => {
    setTokenSeed(Date.now().toString(36));
    setOtp(generateNewOtp());
    setSecondsLeft(20);
    setIsPopupOpen(true);
    showToast('✓ Attendance QR & 6-digit OTP generated (valid 20s)');
  };

  const handleCloseQrPopup = () => {
    setIsPopupOpen(false);
  };

  const handleRefresh = () => {
    setTokenSeed(Date.now().toString(36));
    setOtp(generateNewOtp());
    setSecondsLeft(20);
    showToast('✓ Token & OTP refreshed (valid 20s)');
  };

  const handleEventChange = (newId: string) => {
    setChosenEventId(newId);
    if (setSelectedEventId) {
      setSelectedEventId(newId);
    }
    const target = events.find((e) => e.id === newId);
    showToast(`✓ Selected event: ${target?.title || 'Selected Event'}`);
  };

  const dynamicQrPayload = `GEO-PASS:${chosenEvent.id}:${currentUser.uid}:${tokenSeed}:${currentUser.rollNo || '21GEO001'}:${otp}`;
  const progressPercent = Math.round((secondsLeft / 20) * 100);

  return (
    <div
      className="flex flex-col items-center gap-3.5 px-3 sm:px-4 py-3 select-none animate-fadeIn pb-32"
      style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(218, 241, 222, 0.7) 0%, rgba(246, 251, 247, 0) 65%), #F6FBF7',
        minHeight: '100vh',
      }}
    >
      {/* 1) Top Bar: Premium Back Button (top left) + Live Security Chip */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.06)] hover:border-[#8EB69B] active:scale-95 text-[13px] font-bold text-[#163832] transition-all cursor-pointer touch-target-44"
          aria-label="Back to Home"
          data-testid="btn-back-qr"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Back</span>
        </button>

        <StatusChip status="live" label="Live Token" />
      </div>

      {/* 2) Header: Title "Attendance" (no subtitle) */}
      <div className="text-center max-w-sm">
        <h1
          className="font-heading font-bold text-[#051F20] tracking-tight"
          style={{ fontSize: '24px', lineHeight: '28px' }}
        >
          Attendance
        </h1>
      </div>

      {/* 3) Event Selector Card: Choose event + Generate QR Button */}
      <div
        className="w-full max-w-sm bg-white p-4 rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] flex flex-col gap-3"
      >
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-bold text-[#051F20] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#163832]" />
            Choose Event:
          </span>
          <span className="text-[#235347] font-semibold">
            {events.length} Available
          </span>
        </div>

        <select
          value={chosenEventId}
          onChange={(e) => handleEventChange(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-[#8EB69B] text-[13px] font-semibold text-[#051F20] bg-[#F6FBF7] outline-none focus:ring-1 focus:ring-[#163832] cursor-pointer"
          data-testid="event-selector-qr"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({ev.status.toUpperCase()})
            </option>
          ))}
        </select>

        {/* Generate QR Button directly below Choosing Event */}
        <button
          type="button"
          onClick={handleOpenQrPopup}
          className="w-full h-11 px-5 rounded-full bg-[#163832] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(22,56,50,0.2)] hover:bg-[#0B2B26] active:scale-[0.98] transition-all cursor-pointer touch-target-44"
          aria-label="Generate QR"
          data-testid="btn-generate-qr"
        >
          <QrCode size={18} strokeWidth={2} />
          <span>Generate QR</span>
        </button>
      </div>

      {/* 4) Information & Scholar Verification Card (on main screen) */}
      <div
        className="w-full max-w-sm bg-white p-4 sm:p-5 flex flex-col items-center border border-[#DAF1DE] shadow-[0_8px_24px_rgba(5,31,32,0.05)] rounded-3xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] text-[#163832] flex items-center justify-center mb-3 shadow-xs">
          <ShieldCheck size={26} strokeWidth={2} />
        </div>

        <h3 className="text-base font-bold text-[#051F20] text-center mb-1">
          Attendance Pass Ready
        </h3>
        <p className="text-[12px] font-medium text-[#235347] text-center max-w-[280px] mb-4">
          Tap <strong className="text-[#051F20]">Generate QR</strong> above to open your 20-second dynamic attendance code and 6-digit verification OTP.
        </p>

        {/* Active Selected Event Indicator */}
        <div className="w-full p-2.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex items-center justify-between text-[12px] mb-3">
          <span className="text-[#235347] font-medium">Selected Event:</span>
          <span className="font-bold text-[#051F20] truncate max-w-[180px] text-right">
            {chosenEvent.title}
          </span>
        </div>

        {/* Scholar Identification Strip */}
        <div className="w-full pt-3 border-t border-[#DAF1DE] flex items-center justify-between text-[12px]">
          <div className="flex flex-col text-left">
            <span className="font-bold text-[#051F20] tracking-wide">
              {currentUser.rollNo || '21GEO001'}
            </span>
            <span className="text-[12px] text-[#235347] font-medium">
              {currentUser.department || 'Geoinformatics'}
            </span>
          </div>

          <div className="flex flex-col text-right items-end">
            <span className="font-bold text-[#051F20]">
              {currentUser.name}
            </span>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[12px] font-bold bg-[#DAF1DE] text-[#051F20]">
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 5) QR Code & OTP Modal Popup */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/70 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Attendance QR Code and OTP"
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#DAF1DE] shadow-[0_24px_60px_rgba(5,31,32,0.25)] flex flex-col items-center animate-scaleUp relative max-h-[92vh] overflow-y-auto no-scrollbar"
          >
            {/* Modal Header: Event Badge + Close Button */}
            <div className="w-full flex items-center justify-between mb-3 gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#163832] text-white shadow-xs max-w-[240px] truncate">
                <span className="w-2 h-2 rounded-full bg-[#DAF1DE] animate-pulse shrink-0" />
                <span className="truncate">{chosenEvent.title}</span>
              </span>

              <button
                type="button"
                onClick={handleCloseQrPopup}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] border border-[#DAF1DE] text-[#163832] flex items-center justify-center hover:bg-[#DAF1DE] active:scale-95 transition-all cursor-pointer touch-target-44"
                aria-label="Close QR Modal"
                data-testid="btn-close-qr-modal"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            {/* QR Code Frame */}
            <div className="relative p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.05)] mb-3">
              <QRCodeSVG
                value={dynamicQrPayload}
                size={180}
                level="H"
                fgColor="#051F20"
                bgColor="transparent"
              />
            </div>

            {/* 6-Digit OTP Section */}
            <div className="w-full flex flex-col items-center p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] mb-3 text-center">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#235347] mb-1.5">
                6-Digit Attendance OTP
              </span>

              <div className="flex items-center justify-center gap-1.5 my-0.5">
                {otp.split('').map((digit, idx) => (
                  <span
                    key={idx}
                    className="w-9 h-11 flex items-center justify-center rounded-xl bg-white border border-[#8EB69B] text-[#051F20] font-mono font-extrabold text-xl shadow-xs"
                  >
                    {digit}
                  </span>
                ))}
              </div>

              <span className="text-[12px] font-medium text-[#235347] mt-1.5">
                Provide to scanner or enter on check-in desk
              </span>
            </div>

            {/* 20-Second Countdown & Refresh Row */}
            <div className="w-full flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] mb-3">
              <div className="flex items-center gap-3">
                <ProgressRing
                  progress={progressPercent}
                  size={42}
                  strokeWidth={4}
                  label={`${secondsLeft}s`}
                />
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-bold text-[#051F20]">
                    20-Second Validity
                  </span>
                  <span className="text-[12px] font-medium text-[#235347]">
                    {secondsLeft > 0 ? `Refreshes in ${secondsLeft}s` : 'Token expired • Refreshing'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="p-2.5 rounded-xl bg-white border border-[#8EB69B]/50 text-[#163832] hover:bg-[#DAF1DE] active:scale-95 transition-all shadow-xs touch-target-44 flex items-center justify-center"
                title="Refresh Token & OTP"
                aria-label="Refresh token and OTP"
              >
                <RefreshCw size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Scholar Identity in Modal */}
            <div className="w-full pt-2.5 border-t border-[#DAF1DE] flex items-center justify-between text-[12px] mb-3">
              <div className="flex flex-col text-left">
                <span className="font-bold text-[#051F20]">
                  {currentUser.rollNo || '21GEO001'}
                </span>
                <span className="text-[12px] text-[#235347]">
                  {currentUser.name}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-[#DAF1DE] text-[#051F20]">
                {currentUser.role.toUpperCase()}
              </span>
            </div>

            {/* Done / Dismiss Button */}
            <PillButton
              variant="secondary"
              fullWidth
              onClick={handleCloseQrPopup}
              aria-label="Done"
            >
              Done
            </PillButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQrView;
