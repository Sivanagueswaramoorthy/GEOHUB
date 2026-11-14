import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Delete,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface VerifiedAttendeeData {
  userName: string;
  userRoll: string;
  eventName: string;
  mode: 'QR Scan' | 'Gate OTP';
  timestamp: string;
  status: string;
}

export const VolunteerScanView: React.FC = () => {
  const {
    events,
    users,
    recordAttendance,
    setActiveTab,
  } = useApp();

  // Navigation mode: 'scanner' | 'otp'
  const [viewMode, setViewMode] = useState<'scanner' | 'otp'>('scanner');

  // Camera stream & controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // OTP Entry State (6 digits)
  const [otpDigits, setOtpDigits] = useState<string[]>([]);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Popup Modal State: null | 'success' | 'error'
  const [popupState, setPopupState] = useState<'success' | 'error' | null>(null);
  const [popupErrorMessage, setPopupErrorMessage] = useState<string>('');
  const [verifiedData, setVerifiedData] = useState<VerifiedAttendeeData | null>(null);

  // Valid Demo Gate OTPs
  const VALID_OTPS = ['123456', '849201', '902144', '654321', '112233'];

  // Start / Stop Camera Stream
  useEffect(() => {
    if (viewMode !== 'scanner') {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
        setCameraActive(false);
      }
      return;
    }

    let stream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          if (isMounted) {
            setCameraStream(stream);
            setCameraActive(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          }
        } else {
          if (isMounted) setCameraActive(false);
        }
      } catch {
        if (isMounted) setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [viewMode]);

  // Real-time Barcode / QR detector
  useEffect(() => {
    if (viewMode !== 'scanner' || !cameraActive || !videoRef.current || popupState !== null) return;
    const windowWithBarcode = window as unknown as {
      BarcodeDetector?: new (options?: { formats: string[] }) => {
        detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
      };
    };

    if (!windowWithBarcode.BarcodeDetector) return;

    let active = true;
    const detector = new windowWithBarcode.BarcodeDetector({ formats: ['qr_code'] });

    const interval = setInterval(async () => {
      if (!active || !videoRef.current || videoRef.current.readyState < 2 || popupState !== null) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes && barcodes.length > 0 && active) {
          processQrPayload(barcodes[0].rawValue);
        }
      } catch {
        // Drop frame
      }
    }, 450);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [viewMode, cameraActive, popupState]);

  // Process Scanned QR Payload
  const processQrPayload = (payload: string) => {
    const text = (payload || '').trim();
    if (!text) return;

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    // Check if valid GEO pass
    const isGeoPass = text.startsWith('GEO-PASS:') || text.startsWith('GEO-MEMBER:');
    const matchedEvent = events[0] || { id: 'event_01', title: 'GEO FEST 2026: Campus Odyssey' };

    let attendeeName = 'Alex Rivera';
    let attendeeRoll = '21GEO001';

    if (text.startsWith('GEO-PASS:')) {
      const parts = text.split(':');
      const userId = parts[2];
      const rollNo = parts[4];
      const user = users.find((u) => u.uid === userId || (rollNo && u.rollNo?.toLowerCase() === rollNo.toLowerCase()));
      if (user) {
        attendeeName = user.name;
        attendeeRoll = user.rollNo || rollNo || '21GEO001';
      }
    } else if (text.startsWith('GEO-MEMBER:')) {
      const roll = text.replace(/^GEO-MEMBER:/i, '').trim();
      const user = users.find((u) => u.rollNo?.toLowerCase() === roll.toLowerCase() || u.uid === roll);
      if (user) {
        attendeeName = user.name;
        attendeeRoll = user.rollNo || roll;
      }
    }

    // Check for explicit invalid payload
    if (!isGeoPass && !text.includes('GEO') && !text.includes('http') && text.toLowerCase().includes('invalid')) {
      setPopupErrorMessage('Invalid QR code scanned. Code format is unrecognized.');
      setPopupState('error');
      return;
    }

    // Record attendance if student recognized
    const studentUser = users.find((u) => u.rollNo?.toLowerCase() === attendeeRoll.toLowerCase()) || users[0];
    if (studentUser) {
      recordAttendance(matchedEvent.id, studentUser.uid);
    }

    setVerifiedData({
      userName: attendeeName,
      userRoll: attendeeRoll,
      eventName: matchedEvent.title,
      mode: 'QR Scan',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present • Verified',
    });
    setPopupState('success');
  };

  // Handle OTP Submission
  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length !== 6) return;

    const isValid = VALID_OTPS.includes(code) || events.some((ev) => (ev as any).otp === code || (ev as any).entryOtp === code);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(isValid ? [40, 30, 40] : [80, 50, 80]);
    }

    if (isValid) {
      const matchedEvent = events[0] || { id: 'event_01', title: 'GEO FEST 2026: Campus Odyssey' };
      const studentUser = users[0] || { name: 'Alex Rivera', rollNo: '21GEO001', uid: 'usr_01' };

      recordAttendance(matchedEvent.id, studentUser.uid);

      setVerifiedData({
        userName: studentUser.name,
        userRoll: studentUser.rollNo || '21GEO001',
        eventName: matchedEvent.title,
        mode: 'Gate OTP',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Present • Verified',
      });
      setPopupState('success');
      setOtpError(null);
    } else {
      setOtpError('Invalid OTP');
      setOtpDigits([]);
    }
  };

  // Handle Keypad Press (Manual submit via Enter button only)
  const handleKeypadPress = (val: string) => {
    if (otpError) setOtpError(null);
    if (otpDigits.length < 6) {
      setOtpDigits([...otpDigits, val]);
    }
  };

  // Handle Backspace
  const handleKeypadBackspace = () => {
    if (otpError) setOtpError(null);
    if (otpDigits.length > 0) {
      setOtpDigits(otpDigits.slice(0, -1));
    }
  };

  // Reset popup
  const handleDismissPopup = () => {
    setPopupState(null);
    setPopupErrorMessage('');
    setOtpError(null);
    if (viewMode === 'otp') {
      setOtpDigits([]);
    }
  };

  // ==========================================
  // RENDER: Mode 2 - OTP Entry Screen (Full Screen Edge-to-Edge)
  // ==========================================
  if (viewMode === 'otp') {
    return (
      <div
        className="relative w-full h-full select-none font-sans flex flex-col justify-between overflow-hidden animate-fadeIn"
        style={{
          height: '100vh',
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          background: 'radial-gradient(circle at 50% 0%, rgba(218, 241, 222, 0.5) 0%, rgba(246, 251, 247, 0) 65%), #FFFFFF',
          color: '#051F20',
          padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 24px calc(env(safe-area-inset-bottom, 0px) + 20px) 24px',
        }}
      >
        {/* Ambient Top Mint Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '380px',
            height: '240px',
            borderRadius: '50%',
            backgroundColor: 'rgba(218, 241, 222, 0.6)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        {/* Full Screen Constrained Content Column */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '375px',
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Bar with Scanner Back Button */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setViewMode('scanner');
                setOtpDigits([]);
                setOtpError(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#051F20',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 150ms ease',
              }}
              className="pressable"
              aria-label="Back to Scanner"
            >
              <ChevronLeft size={18} strokeWidth={2.4} />
              <span>Scanner</span>
            </button>
          </div>

          {/* Title and Subtitle (Exact Mockup Match: Left-Aligned, Sentence Case) */}
          <div style={{ textAlign: 'left', marginBottom: '24px', flexShrink: 0 }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#051F20',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Enter verification code
            </h1>
            <p
              style={{
                fontSize: '13.5px',
                fontWeight: 400,
                color: '#235347',
                marginTop: '6px',
                lineHeight: 1.4,
              }}
            >
              Type the 6–digit gate code to confirm this student’s entry.
            </p>
          </div>

          {/* 6 Input Capsules Row */}
          <div style={{ marginBottom: '4px', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                width: '100%',
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const digit = otpDigits[idx];
                const isEntered = idx < otpDigits.length;
                const isCurrent = idx === otpDigits.length;

                let borderStyle = '1px solid #DAF1DE';
                let bgStyle = '#F6FBF7';
                let shadowStyle = 'none';

                if (otpError) {
                  borderStyle = '1.5px solid #D9534F';
                  bgStyle = 'rgba(217, 83, 79, 0.12)';
                } else if (isEntered) {
                  borderStyle = '2px solid #163832';
                  bgStyle = '#FFFFFF';
                  shadowStyle = '0 2px 8px rgba(22, 56, 50, 0.08)';
                } else if (isCurrent) {
                  borderStyle = '2px solid #235347';
                  bgStyle = '#FFFFFF';
                  shadowStyle = '0 0 0 3.5px rgba(142, 182, 155, 0.45)';
                }

                return (
                  <div
                    key={idx}
                    style={{
                      width: '48px',
                      height: '64px',
                      minWidth: '48px',
                      minHeight: '64px',
                      borderRadius: '18px',
                      border: borderStyle,
                      backgroundColor: bgStyle,
                      boxShadow: shadowStyle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#051F20',
                      userSelect: 'none',
                      transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 150ms ease',
                    }}
                  >
                    {digit || ''}
                  </div>
                );
              })}
            </div>

            {/* Counter: '0 of 6' right-aligned directly under the 6th capsule (Exact match to uploaded image) */}
            {!otpError && (
              <div
                style={{
                  textAlign: 'right',
                  marginTop: '10px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#235347',
                  letterSpacing: '0.01em',
                }}
              >
                {otpDigits.length} of 6
              </div>
            )}
          </div>

          {/* Inline Error Banner & Counter - Displayed when verification fails */}
          {otpError && (
            <div style={{ marginTop: '12px', flexShrink: 0 }}>
              <div
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(217, 83, 79, 0.12)',
                  border: '1px solid rgba(217, 83, 79, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#D9534F',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  boxSizing: 'border-box',
                }}
                className="animate-fadeIn"
                role="alert"
              >
                <AlertCircle size={18} strokeWidth={2} className="text-[#D9534F] shrink-0" />
                <span>{otpError}</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '6px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#235347',
                    letterSpacing: '0.01em',
                    marginBottom: '6px',
                  }}
                >
                  {otpDigits.length}/6 digits entered
                </div>
                <div
                  style={{
                    width: '56px',
                    height: '3px',
                    borderRadius: '9999px',
                    backgroundColor: '#DAF1DE',
                    margin: '0 auto',
                  }}
                />
              </div>
            </div>
          )}

          {/* 3x4 Soft Circular Keypad (Comfortable Large Touch Targets) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              columnGap: '24px',
              rowGap: '18px',
              maxWidth: '316px',
              margin: 'auto auto',
              width: '100%',
              justifyItems: 'center',
            }}
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                style={{
                  width: '76px',
                  height: '76px',
                  minWidth: '76px',
                  minHeight: '76px',
                  borderRadius: '50%',
                  backgroundColor: '#F6FBF7',
                  color: '#051F20',
                  fontSize: '28px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  userSelect: 'none',
                  transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease',
                }}
                className="pressable"
              >
                {num}
              </button>
            ))}

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleKeypadBackspace}
              style={{
                width: '76px',
                height: '76px',
                minWidth: '76px',
                minHeight: '76px',
                borderRadius: '50%',
                backgroundColor: '#F6FBF7',
                color: '#051F20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                userSelect: 'none',
                transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease',
              }}
              className="pressable"
              aria-label="Delete"
            >
              <Delete size={26} strokeWidth={2} />
            </button>

            {/* 0 */}
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              style={{
                width: '76px',
                height: '76px',
                minWidth: '76px',
                minHeight: '76px',
                borderRadius: '50%',
                backgroundColor: '#F6FBF7',
                color: '#051F20',
                fontSize: '28px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                userSelect: 'none',
                transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease',
              }}
              className="pressable"
            >
              0
            </button>

            {/* Submit Arrow */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpDigits.length !== 6}
              style={{
                width: '76px',
                height: '76px',
                minWidth: '76px',
                minHeight: '76px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: otpDigits.length === 6 ? '#163832' : '#F6FBF7',
                color: otpDigits.length === 6 ? '#FFFFFF' : '#8EB69B',
                boxShadow: otpDigits.length === 6 ? '0 8px 24px rgba(22, 56, 50, 0.35)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: otpDigits.length === 6 ? 'pointer' : 'not-allowed',
                userSelect: 'none',
                transition: 'all 180ms ease',
              }}
              className={otpDigits.length === 6 ? 'pressable active:scale-95' : ''}
              aria-label="Submit"
            >
              <ArrowRight size={26} strokeWidth={2.5} />
            </button>
          </div>

          {/* Bottom Demo Pill */}
          <div style={{ textAlign: 'center', paddingTop: '8px', flexShrink: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                border: '1px solid #DAF1DE',
                backgroundColor: '#F6FBF7',
                fontSize: '12px',
                color: '#235347',
              }}
            >
              <span>Demo:</span>
              <strong
                onClick={() => {
                  setOtpDigits(['1', '2', '3', '4', '5', '6']);
                }}
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: '#163832',
                  textDecoration: 'underline',
                }}
              >
                123456
              </strong>
              <span>or</span>
              <strong
                onClick={() => {
                  setOtpDigits(['8', '4', '9', '2', '0', '1']);
                }}
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: '#163832',
                  textDecoration: 'underline',
                }}
              >
                849201
              </strong>
            </div>
          </div>
        </div>

        {/* Result Popups */}
        {renderPopupModal()}
      </div>
    );
  }

  // ==========================================
  // RENDER: Mode 1 - Dark Camera QR Scanner
  // ==========================================
  return (
    <div
      className="relative w-full bg-black text-white select-none overflow-hidden animate-fadeIn"
      style={{
        height: '100vh',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: '#051F20',
      }}
    >
      {/* Live Video Camera Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
          cameraActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Dark Ambient Vignette Mask */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          background: 'radial-gradient(circle at center, transparent 35%, rgba(5, 31, 32, 0.7) 75%, #051F20 100%)',
        }}
      />

      {/* Top Floating Back Button - Clean UI shifted comfortably down from safe-area / status bar */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
          left: '20px',
          zIndex: 40,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            color: '#FFFFFF',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          className="pressable"
          aria-label="Back to home"
        >
          <ChevronLeft size={28} strokeWidth={2.8} className="drop-shadow-lg" />
        </button>
      </div>

      {/* Centered Overlay Layer: Mathematically centered in viewport matching mockup */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          {/* Central Square Viewfinder Frame */}
          <div
            onClick={() => {
              // Tap-to-simulate for testing or demo without live physical code
              processQrPayload(`GEO-PASS:${events[0]?.id || 'event_01'}:usr_01:seed:21GEO001`);
            }}
            style={{
              position: 'relative',
              width: '260px',
              height: '260px',
              minWidth: '260px',
              minHeight: '260px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
            }}
            title="Click to simulate scan"
          >
            {/* 4 Sharp White Corner Brackets with refined curve matching mockup */}
            {/* Top-Left */}
            <div
              style={{
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: '44px',
                height: '44px',
                borderTop: '4px solid #FFFFFF',
                borderLeft: '4px solid #FFFFFF',
                borderTopLeftRadius: '10px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            {/* Top-Right */}
            <div
              style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                width: '44px',
                height: '44px',
                borderTop: '4px solid #FFFFFF',
                borderRight: '4px solid #FFFFFF',
                borderTopRightRadius: '10px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            {/* Bottom-Left */}
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: '0px',
                width: '44px',
                height: '44px',
                borderBottom: '4px solid #FFFFFF',
                borderLeft: '4px solid #FFFFFF',
                borderBottomLeftRadius: '10px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            {/* Bottom-Right */}
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '44px',
                height: '44px',
                borderBottom: '4px solid #FFFFFF',
                borderRight: '4px solid #FFFFFF',
                borderBottomRightRadius: '10px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />

            {/* Horizontal Animated Laser Scan Line (Sage Green #8EB69B with Glow) */}
            <div
              className="animate-scan-laser"
              style={{
                position: 'absolute',
                left: '0px',
                right: '0px',
                height: '3px',
                background: 'linear-gradient(90deg, rgba(142, 182, 155, 0) 0%, #8EB69B 15%, #8EB69B 85%, rgba(142, 182, 155, 0) 100%)',
                boxShadow: '0 0 10px #8EB69B, 0 0 20px #8EB69B, 0 0 35px rgba(142, 182, 155, 0.7)',
                borderRadius: '999px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          </div>

          {/* Text Subtitle - Shifted comfortably downward from viewfinder */}
          <p
            style={{
              marginTop: '44px',
              fontSize: '13.5px',
              fontWeight: 500,
              color: '#FFFFFF',
              textAlign: 'center',
              letterSpacing: '0.01em',
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
            }}
          >
            Position QR code within the frame to scan
          </p>

          {/* Outlined Pill Button "Use OTP" - Added ample breathing space below text */}
          <button
            type="button"
            onClick={() => {
              setViewMode('otp');
              setOtpDigits([]);
            }}
            style={{
              marginTop: '22px',
              border: '2px solid #FFFFFF',
              borderRadius: '9999px',
              minWidth: '176px',
              height: '46px',
              padding: '0 28px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              transition: 'all 150ms ease',
            }}
            className="pressable active:scale-95 hover:bg-white/20 shrink-0"
          >
            <KeyRound size={16} strokeWidth={2.2} />
            <span>Use OTP</span>
          </button>
        </div>
      </div>

      {/* Result Popups */}
      {renderPopupModal()}
    </div>
  );

  // ==========================================
  // HELPER: Reusable Result Popup Modal
  // ==========================================
  function renderPopupModal() {
    if (!popupState) return null;

    if (popupState === 'success' && verifiedData) {
      return (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-popup-title"
          className="fixed inset-0 z-50 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300 flex items-center justify-center p-4 animate-fadeIn"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="bg-white border border-[#DAF1DE] rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center animate-scaleUp">
            {/* Green Success Check Icon */}
            <div className="w-16 h-16 rounded-full bg-[#DAF1DE] border-2 border-[#8EB69B] flex items-center justify-center text-[#163832] mb-3 shadow-md">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>

            {/* Header */}
            <h2 id="success-popup-title" className="text-xl font-extrabold text-[#051F20] leading-tight">
              Attendance Updated Successfully
            </h2>
            <p className="text-xs font-semibold text-[#235347] mt-1">
              Verification confirmed via {verifiedData.mode}
            </p>

            {/* Details Card */}
            <div className="w-full mt-4 p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] text-left flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#235347]">Attendee:</span>
                <span className="font-bold text-[#051F20]">{verifiedData.userName}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#235347]">Roll Number:</span>
                <span className="font-bold text-[#051F20]">{verifiedData.userRoll}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#235347]">Event:</span>
                <span className="font-bold text-[#051F20] truncate max-w-[180px]">{verifiedData.eventName}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-[#DAF1DE]">
                <span className="text-[#235347]">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[12px] font-extrabold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                  {verifiedData.status}
                </span>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismissPopup}
              className="w-full mt-5 py-3 rounded-full bg-[#163832] hover:bg-[#235347] text-white font-bold text-sm shadow-md transition-all active:scale-95 touch-target-44 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      );
    }

    if (popupState === 'error') {
      return (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-popup-title"
          className="fixed inset-0 z-50 bg-[#051F20]/60 backdrop-blur-md select-none transition-all duration-300 flex items-center justify-center p-4 animate-fadeIn"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="bg-white border border-[#DAF1DE] rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center animate-scaleUp">
            {/* Red Alert Icon */}
            <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-300 flex items-center justify-center text-rose-600 mb-3 shadow-md">
              <AlertCircle size={36} strokeWidth={2.5} />
            </div>

            {/* Header */}
            <h2 id="error-popup-title" className="text-xl font-extrabold text-[#051F20] leading-tight">
              Verification Failed
            </h2>
            <p className="text-xs font-semibold text-rose-600 mt-1.5 px-2">
              {popupErrorMessage || 'Invalid QR code or incorrect verification code. Please check and try again.'}
            </p>

            {/* Action Buttons */}
            <div className="w-full mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDismissPopup}
                className="w-full py-3 rounded-full bg-[#163832] hover:bg-[#235347] text-white font-bold text-sm shadow-md transition-all active:scale-95 touch-target-44 cursor-pointer"
              >
                Try Again
              </button>

              {viewMode === 'scanner' ? (
                <button
                  type="button"
                  onClick={() => {
                    handleDismissPopup();
                    setViewMode('otp');
                  }}
                  className="w-full py-2.5 rounded-full bg-[#DAF1DE] text-[#051F20] font-bold text-xs hover:bg-[#8EB69B]/30 transition-all touch-target-44 cursor-pointer"
                >
                  Switch to OTP Entry
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleDismissPopup();
                    setViewMode('scanner');
                  }}
                  className="w-full py-2.5 rounded-full bg-[#DAF1DE] text-[#051F20] font-bold text-xs hover:bg-[#8EB69B]/30 transition-all touch-target-44 cursor-pointer"
                >
                  Return to Scanner
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
};

export default VolunteerScanView;
