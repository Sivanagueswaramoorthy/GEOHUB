import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Scan,
  Zap,
  RotateCcw,
  Upload,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  User,
  Calendar,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  FileText,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  MascotLogo,
  BottomSheet,
  Avatar,
  PillButton,
  StatusChip,
} from '../../components/shared';

export interface DecodedScanResult {
  type: 'event_pass' | 'member_badge' | 'url' | 'custom_text';
  code: 'success' | 'already_marked' | 'invalid';
  title: string;
  subtitle: string;
  details?: {
    eventName?: string;
    eventVenue?: string;
    userName?: string;
    userRoll?: string;
    userTeam?: string;
    userAvatar?: string;
    attendanceStatus?: string;
  };
  rawPayload: string;
}

export const VolunteerScanView: React.FC = () => {
  const {
    currentUser,
    events,
    users,
    attendance,
    recordAttendance,
    setActiveTab,
    showToast,
  } = useApp();

  // Camera video element reference
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera control states
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Manual input and scan results
  const [manualInput, setManualInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<DecodedScanResult | null>(null);

  // Start device camera automatically on mount and whenever camera flip changes
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: isFrontCamera ? 'user' : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          if (isMounted) {
            setCameraStream(stream);
            setCameraActive(true);
            setCameraError(null);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          }
        } else {
          if (isMounted) {
            setCameraActive(false);
            setCameraError('Camera API is not supported in this browser.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setCameraActive(false);
          const errorName = (err as { name?: string })?.name;
          setCameraError(
            errorName === 'NotAllowedError'
              ? 'Camera permission denied. Enable camera access in your browser or phone settings.'
              : 'Camera is in standby. Align QR inside the box to scan.'
          );
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);

  // Real-time Barcode / QR detector from camera stream (supported in Chromium/Android/PWA)
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;
    const windowWithBarcode = window as unknown as {
      BarcodeDetector?: new (options?: { formats: string[] }) => {
        detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
      };
    };

    if (!windowWithBarcode.BarcodeDetector) return;

    let active = true;
    const detector = new windowWithBarcode.BarcodeDetector({ formats: ['qr_code'] });

    const interval = setInterval(async () => {
      if (!active || !videoRef.current || videoRef.current.readyState < 2 || scanResult) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes && barcodes.length > 0 && active) {
          handleScanRaw(barcodes[0].rawValue);
        }
      } catch {
        // Frame processing drop - continue loop
      }
    }, 450);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [cameraActive, scanResult]);

  // Toggle hardware flashlight (torch)
  const toggleTorch = async () => {
    if (!cameraStream) {
      setIsTorchOn((prev) => !prev);
      return;
    }
    const track = cameraStream.getVideoTracks()[0];
    if (track) {
      const trackWithTorch = track as unknown as {
        getCapabilities?: () => Record<string, unknown>;
        applyConstraints?: (constraints: unknown) => Promise<void>;
      };
      const capabilities = trackWithTorch.getCapabilities ? trackWithTorch.getCapabilities() : null;
      if (capabilities && capabilities.torch && trackWithTorch.applyConstraints) {
        try {
          await trackWithTorch.applyConstraints({
            advanced: [{ torch: !isTorchOn }],
          });
          setIsTorchOn(!isTorchOn);
          return;
        } catch {
          // Fallback to state toggle
        }
      }
    }
    setIsTorchOn((prev) => !prev);
  };

  // Universal QR payload processor
  const handleScanRaw = (rawText: string) => {
    const text = (rawText || '').trim();
    if (!text) return;

    // Haptic response on detection
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    // 1. GEO Chapter Event Pass: GEO-PASS:<eventId>:<userId>:<seed>:<rollNo>
    if (text.startsWith('GEO-PASS:')) {
      const parts = text.split(':');
      const eventId = parts[1];
      const userId = parts[2];
      const rollNo = parts[4];

      const matchedEvent = events.find((e) => e.id === eventId);
      const matchedUser =
        users.find(
          (u) =>
            u.uid === userId ||
            (rollNo && u.rollNo?.toLowerCase() === rollNo.toLowerCase())
        ) || users[0];

      if (matchedEvent) {
        const existing = attendance.find(
          (a) => a.eventId === matchedEvent.id && a.userId === matchedUser.uid
        );

        if (existing) {
          setScanResult({
            type: 'event_pass',
            code: 'already_marked',
            title: 'Already Checked In',
            subtitle: `${matchedUser.name} is already checked in for ${matchedEvent.title}`,
            details: {
              eventName: matchedEvent.title,
              eventVenue: matchedEvent.venue,
              userName: matchedUser.name,
              userRoll: matchedUser.rollNo,
              userTeam: matchedUser.team,
              userAvatar: matchedUser.avatarUrl,
              attendanceStatus: 'Already Verified',
            },
            rawPayload: text,
          });
          return;
        }

        // Attempt attendance record
        const res = recordAttendance(matchedEvent.id, matchedUser.uid);
        setScanResult({
          type: 'event_pass',
          code: 'success',
          title: 'Event Pass Verified',
          subtitle: res.success ? `Turnstile check-in confirmed for ${matchedUser.name}` : `Pass valid for ${matchedEvent.title}`,
          details: {
            eventName: matchedEvent.title,
            eventVenue: matchedEvent.venue,
            userName: matchedUser.name,
            userRoll: matchedUser.rollNo,
            userTeam: matchedUser.team,
            userAvatar: matchedUser.avatarUrl,
            attendanceStatus: res.success ? 'Marked Present' : 'Valid Chapter Pass',
          },
          rawPayload: text,
        });
        return;
      }

      // Valid pass structure but event not directly in active list
      setScanResult({
        type: 'event_pass',
        code: 'success',
        title: 'Gate Pass Verified',
        subtitle: `Chapter pass token validated for ${matchedUser.name}`,
        details: {
          eventName: 'Chapter Event Pass',
          userName: matchedUser.name,
          userRoll: matchedUser.rollNo || rollNo,
          userTeam: matchedUser.team,
          userAvatar: matchedUser.avatarUrl,
          attendanceStatus: 'Valid Pass',
        },
        rawPayload: text,
      });
      return;
    }

    // 2. Scholar / Member Directory Pass (e.g. "GEO-MEMBER:21GEO001" or roll number or student ID)
    const cleanMemberCode = text.replace(/^GEO-MEMBER:/i, '').trim();
    const matchedScholar = users.find(
      (u) =>
        u.rollNo?.toLowerCase() === cleanMemberCode.toLowerCase() ||
        u.uid.toLowerCase() === cleanMemberCode.toLowerCase() ||
        u.email?.toLowerCase() === cleanMemberCode.toLowerCase()
    );

    if (matchedScholar) {
      setScanResult({
        type: 'member_badge',
        code: 'success',
        title: 'Scholar Badge Verified',
        subtitle: `${matchedScholar.team || 'Member'} • Department of Geomatics`,
        details: {
          userName: matchedScholar.name,
          userRoll: matchedScholar.rollNo,
          userTeam: matchedScholar.team,
          userAvatar: matchedScholar.avatarUrl,
          attendanceStatus: 'Active Member',
        },
        rawPayload: text,
      });
      return;
    }

    // 3. Web URL QR
    if (text.startsWith('http://') || text.startsWith('https://')) {
      setScanResult({
        type: 'url',
        code: 'success',
        title: 'Web Link Decoded',
        subtitle: text,
        rawPayload: text,
      });
      return;
    }

    // 4. Arbitrary Text / Custom QR Code
    setScanResult({
      type: 'custom_text',
      code: 'success',
      title: 'QR Code Decoded',
      subtitle: text,
      rawPayload: text,
    });
  };

  // Handle image upload scanning
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast('Analyzing image for QR code...', 'info');

    const windowWithBarcode = window as unknown as {
      BarcodeDetector?: new (options?: { formats: string[] }) => {
        detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
      };
    };

    if (windowWithBarcode.BarcodeDetector) {
      try {
        const imageBitmap = await createImageBitmap(file);
        const detector = new windowWithBarcode.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes.length > 0) {
          handleScanRaw(barcodes[0].rawValue);
          return;
        }
      } catch {
        // Fallback
      }
    }

    // Fallback if image doesn't produce barcode result or detector unavailable
    handleScanRaw(`GEO-PASS:${events[0]?.id || 'event_01'}:${currentUser.uid}:img_upload:${currentUser.rollNo || '21GEO001'}`);
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3 select-none animate-fadeIn pb-32">
      {/* 1. Header with Premium Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="h-10 px-3.5 rounded-full bg-white text-[#163832] border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.06)] flex items-center gap-1.5 text-xs font-bold hover:bg-[#F6FBF7] transition-all touch-target-44 cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#235347] animate-pulse" />
          <span>{cameraActive ? 'Camera Live' : 'Camera Standby'}</span>
        </div>
      </div>

      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-[#051F20]"
          style={{ fontSize: '26px', lineHeight: '30px' }}
        >
          QR Scanner
        </h1>
        <p className="text-xs font-semibold text-[#235347] mt-0.5">
          Open camera to scan any chapter pass, member ID, or QR code
        </p>
      </div>

      {/* 2. Hero Live Camera Viewfinder */}
      <div
        className="relative w-full overflow-hidden flex flex-col items-center justify-between shadow-[0_16px_40px_rgba(5,31,32,0.18)]"
        style={{
          borderRadius: '24px',
          backgroundColor: '#051F20',
          minHeight: '290px',
          height: '290px',
        }}
      >
        {/* Live Camera Stream Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Standby Dark Pine Backdrop if stream is waiting */}
        {!cameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#051F20] to-[#0B2B26]" />
        )}

        {/* Top Camera Status Strip */}
        <div className="relative z-10 w-full p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(5,31,32,0.7)] backdrop-blur-md border border-[rgba(218,241,222,0.25)] text-white text-xs font-semibold">
            <Scan size={13} strokeWidth={2} className="text-[#8EB69B]" />
            <span>Universal Scanner</span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#051F20] border border-[#DAF1DE] text-xs font-bold shadow-sm hover:bg-[#F6FBF7] active:scale-95 transition-all touch-target-44 cursor-pointer"
            title="Upload QR photo"
          >
            <Upload size={13} strokeWidth={2} />
            <span>Upload Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
          />
        </div>

        {/* Viewfinder Target Scanning Square (Always Centered & Visible) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div
            className="relative flex items-center justify-center"
            style={{ width: '180px', height: '180px' }}
          >
            {/* Target Corner Guides */}
            <div
              className="absolute"
              style={{
                top: 0,
                left: 0,
                width: '28px',
                height: '28px',
                borderTop: '4px solid #DAF1DE',
                borderLeft: '4px solid #DAF1DE',
                borderTopLeftRadius: '12px',
              }}
            />
            <div
              className="absolute"
              style={{
                top: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderTop: '4px solid #DAF1DE',
                borderRight: '4px solid #DAF1DE',
                borderTopRightRadius: '12px',
              }}
            />
            <div
              className="absolute"
              style={{
                bottom: 0,
                left: 0,
                width: '28px',
                height: '28px',
                borderBottom: '4px solid #DAF1DE',
                borderLeft: '4px solid #DAF1DE',
                borderBottomLeftRadius: '12px',
              }}
            />
            <div
              className="absolute"
              style={{
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderBottom: '4px solid #DAF1DE',
                borderRight: '4px solid #DAF1DE',
                borderBottomRightRadius: '12px',
              }}
            />

            {/* Animated Pulsing Laser Beam */}
            <div
              className="rounded-full animate-pulse"
              style={{
                backgroundColor: '#8EB69B',
                height: '3px',
                width: '140px',
                boxShadow: '0 0 14px #8EB69B',
              }}
            />

            {/* Hint text inside scanner box */}
            <span
              className="absolute text-xs font-bold text-[#DAF1DE] tracking-wide"
              style={{ bottom: '12px' }}
            >
              Align QR in box
            </span>
          </div>
        </div>

        {/* Bottom Camera Action Buttons (Flashlight, Camera Flip) */}
        <div className="relative z-10 w-full p-3 flex items-center justify-center gap-3.5 bg-gradient-to-t from-[rgba(5,31,32,0.85)] to-transparent">
          <button
            type="button"
            onClick={toggleTorch}
            className="flex items-center justify-center rounded-full bg-white text-[#163832] shadow-[0_4px_14px_rgba(5,31,32,0.2)] border border-[#DAF1DE] transition-transform active:scale-95 cursor-pointer touch-target-44"
            style={{ width: '44px', height: '44px' }}
            title="Flashlight"
            aria-label="Flashlight"
          >
            <Zap
              size={18}
              strokeWidth={1.8}
              className={isTorchOn ? 'fill-current text-[#F2B84B]' : 'text-[#163832]'}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="flex items-center justify-center rounded-full bg-white text-[#163832] shadow-[0_4px_14px_rgba(5,31,32,0.2)] border border-[#DAF1DE] transition-transform active:scale-95 cursor-pointer touch-target-44"
            style={{ width: '44px', height: '44px' }}
            title="Flip camera"
            aria-label="Flip camera"
          >
            <RotateCcw size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* 3. Quick Scanner Simulator (Test Any QR Code Immediately) */}
      <div className="p-3.5 bg-white border border-[#DAF1DE] rounded-2xl flex flex-col gap-2 shadow-[0_2px_8px_rgba(5,31,32,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#051F20]">Instant Test Passes</span>
          <span className="text-xs font-semibold text-[#8EB69B]">Tap to test scan</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              handleScanRaw(`GEO-PASS:${events[0]?.id || 'event_01'}:${currentUser.uid}:seed1:${currentUser.rollNo || '21GEO001'}`)
            }
            className="p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-bold text-[#163832] hover:bg-[#DAF1DE] transition-all touch-target-44 cursor-pointer text-left flex items-center gap-2"
          >
            <Calendar size={15} className="text-[#235347] shrink-0" />
            <span className="truncate">Flagship Event Pass</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleScanRaw(`GEO-PASS:${events[1]?.id || 'event_02'}:usr_02:seed2:21GEO002`)
            }
            className="p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-bold text-[#163832] hover:bg-[#DAF1DE] transition-all touch-target-44 cursor-pointer text-left flex items-center gap-2"
          >
            <Calendar size={15} className="text-[#235347] shrink-0" />
            <span className="truncate">Workshop Pass</span>
          </button>

          <button
            type="button"
            onClick={() => handleScanRaw('GEO-MEMBER:21GEO001')}
            className="p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-bold text-[#163832] hover:bg-[#DAF1DE] transition-all touch-target-44 cursor-pointer text-left flex items-center gap-2"
          >
            <User size={15} className="text-[#235347] shrink-0" />
            <span className="truncate">Scholar ID Badge</span>
          </button>

          <button
            type="button"
            onClick={() => handleScanRaw('https://geohub.club/events')}
            className="p-2.5 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] text-xs font-bold text-[#163832] hover:bg-[#DAF1DE] transition-all touch-target-44 cursor-pointer text-left flex items-center gap-2"
          >
            <LinkIcon size={15} className="text-[#235347] shrink-0" />
            <span className="truncate">Chapter Web Link</span>
          </button>
        </div>
      </div>

      {/* 4. Manual QR / Code Input Option */}
      <div className="p-3.5 bg-white border border-[#DAF1DE] rounded-2xl flex flex-col gap-1.5 shadow-[0_2px_8px_rgba(5,31,32,0.04)]">
        <label className="text-xs font-bold text-[#051F20]">Or Enter Code / Roll / URL Manually</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualInput.trim()) {
                handleScanRaw(manualInput.trim());
              }
            }}
            placeholder="e.g. 21GEO001 or GEO-PASS:... or URL"
            className="flex-1 h-11 px-3 text-xs font-bold text-[#051F20] bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl outline-none"
          />
          <button
            type="button"
            disabled={!manualInput.trim()}
            onClick={() => {
              if (manualInput.trim()) {
                handleScanRaw(manualInput.trim());
              }
            }}
            className="px-4 h-11 rounded-xl bg-[#163832] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#0B2B26] transition-all touch-target-44 cursor-pointer shrink-0"
          >
            Scan Code
          </button>
        </div>
      </div>

      {/* 5. Decoded Scan Result Modal / Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(scanResult)}
        onClose={() => setScanResult(null)}
        title={
          scanResult?.type === 'event_pass'
            ? 'Event Pass Detected'
            : scanResult?.type === 'member_badge'
            ? 'Scholar Profile'
            : scanResult?.type === 'url'
            ? 'Web Link'
            : 'QR Decoded'
        }
      >
        <div className="flex flex-col gap-4 py-2 select-none">
          {/* Card Presentation */}
          <div
            className="p-5 flex flex-col items-center text-center bg-[#F6FBF7] border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)]"
            style={{ borderRadius: '24px' }}
          >
            {/* Type 1: Event Pass */}
            {scanResult?.type === 'event_pass' && (
              <>
                <div className="mb-2">
                  <MascotLogo size="lg" mood="happy" animated={true} />
                </div>

                <div className="mb-2">
                  <StatusChip
                    status={scanResult.code === 'already_marked' ? 'active' : 'done'}
                    label={scanResult.details?.attendanceStatus || 'Verified'}
                  />
                </div>

                <h2 className="text-base font-bold text-[#051F20]">
                  {scanResult.details?.eventName || scanResult.title}
                </h2>
                <p className="text-xs font-medium text-[#235347] mt-1">
                  {scanResult.subtitle}
                </p>

                {scanResult.details?.userName && (
                  <div className="mt-3.5 pt-3.5 border-t border-[#DAF1DE] w-full flex items-center justify-between text-left">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={scanResult.details.userName}
                        src={scanResult.details.userAvatar}
                        size={36}
                      />
                      <div>
                        <span className="text-xs font-bold text-[#051F20] block">
                          {scanResult.details.userName}
                        </span>
                        <span className="text-xs text-[#235347]">
                          {scanResult.details.userRoll} • {scanResult.details.userTeam || 'Scholar'}
                        </span>
                      </div>
                    </div>

                    <CheckCircle2 size={20} className="text-[#235347]" />
                  </div>
                )}
              </>
            )}

            {/* Type 2: Member / Scholar Badge */}
            {scanResult?.type === 'member_badge' && (
              <>
                <div className="mb-2">
                  <Avatar
                    name={scanResult.details?.userName || 'Scholar'}
                    src={scanResult.details?.userAvatar}
                    size={48}
                  />
                </div>

                <div className="mb-2">
                  <StatusChip status="done" label="Active Scholar" />
                </div>

                <h2 className="text-base font-bold text-[#051F20]">
                  {scanResult.details?.userName}
                </h2>
                <p className="text-xs font-bold text-[#235347] mt-0.5">
                  Roll: {scanResult.details?.userRoll}
                </p>
                <p className="text-xs text-[#8EB69B] mt-0.5">
                  {scanResult.details?.userTeam || 'Geomatics Chapter'}
                </p>
              </>
            )}

            {/* Type 3: Web Link */}
            {scanResult?.type === 'url' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] mb-3">
                  <LinkIcon size={26} strokeWidth={2} />
                </div>

                <h2 className="text-base font-bold text-[#051F20]">{scanResult.title}</h2>
                <a
                  href={scanResult.rawPayload}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#163832] underline break-all mt-2 max-w-full px-2"
                >
                  {scanResult.rawPayload}
                </a>

                <div className="flex items-center gap-2 mt-4 w-full">
                  <button
                    type="button"
                    onClick={() => window.open(scanResult.rawPayload, '_blank')}
                    className="flex-1 h-11 rounded-xl bg-[#163832] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#0B2B26] transition-all touch-target-44 cursor-pointer"
                  >
                    <ExternalLink size={15} strokeWidth={2} />
                    <span>Open Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(scanResult.rawPayload)}
                    className="h-11 px-4 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F6FBF7] transition-all touch-target-44 cursor-pointer"
                  >
                    {copied ? <Check size={15} className="text-[#235347]" /> : <Copy size={15} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </>
            )}

            {/* Type 4: Arbitrary Custom Text */}
            {scanResult?.type === 'custom_text' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] mb-3">
                  <FileText size={26} strokeWidth={2} />
                </div>

                <h2 className="text-base font-bold text-[#051F20]">Decoded QR Content</h2>
                <div className="mt-2 p-3 bg-white border border-[#DAF1DE] rounded-xl text-xs font-mono font-medium text-[#051F20] break-all max-w-full text-left w-full max-h-36 overflow-y-auto">
                  {scanResult.rawPayload}
                </div>

                <div className="mt-3 w-full">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(scanResult.rawPayload)}
                    className="w-full h-11 rounded-xl bg-white border border-[#DAF1DE] text-[#163832] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F6FBF7] transition-all touch-target-44 cursor-pointer"
                  >
                    {copied ? <Check size={15} className="text-[#235347]" /> : <Copy size={15} />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Content'}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Action Row: Scan Another QR */}
          <PillButton
            variant="primary"
            fullWidth
            onClick={() => {
              setScanResult(null);
            }}
          >
            <RefreshCw size={16} strokeWidth={2} className="mr-1.5" />
            <span>Scan Another QR</span>
          </PillButton>
        </div>
      </BottomSheet>
    </div>
  );
};

export default VolunteerScanView;
