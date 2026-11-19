import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WifiOff,
  RefreshCw,
  Leaf,
  Sparkles,
} from 'lucide-react';
import {
  checkNetworkStability,
  NetworkStabilityResult,
} from '../core/networkStability';
import { APP_VERSION } from '../config/version';
import './SplashScreen.css';

interface SplashScreenProps {
  onFinish?: () => void;
  autoCheck?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  autoCheck = true,
}) => {
  const [status, setStatus] = useState<'checking' | 'stable' | 'error'>('checking');
  const [progress, setProgress] = useState(15);
  const [helperText, setHelperText] = useState('Measuring connection stability');
  const [errorResult, setErrorResult] = useState<NetworkStabilityResult | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minTimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const startTimeRef = useRef<number>(Date.now());
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    mountedRef.current = true;
    startTimeRef.current = Date.now();
    return () => {
      mountedRef.current = false;
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (minTimeTimerRef.current) clearTimeout(minTimeTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, []);

  // Compute 4 real steps
  const getStepLabel = (pct: number, st: 'checking' | 'stable' | 'error') => {
    if (st === 'error') return 'Connection Required';
    if (st === 'stable' || pct >= 95) return 'Ready';
    if (pct < 35) return 'Checking network…';
    if (pct < 65) return 'Syncing roles…';
    return 'Loading club data…';
  };

  const getChipInfo = (pct: number, st: 'checking' | 'stable' | 'error') => {
    if (st === 'error') return { text: 'Offline', bg: 'rgba(217, 83, 79, 0.12)', color: '#D9534F' };
    if (st === 'stable' || pct >= 95) return { text: 'Ready', bg: '#DAF1DE', color: '#051F20' };
    return { text: 'Active', bg: '#DAF1DE', color: '#163832' };
  };

  const runVerification = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsRetrying(true);
    setStatus('checking');
    setErrorResult(null);
    setProgress(15);
    setHelperText('Measuring connection stability');
    startTimeRef.current = Date.now();

    // 4s Safety timeout: if still not finished after 4s, trigger offline retry state
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      if (statusRef.current === 'checking') {
        setStatus('error');
        setErrorResult({
          isStable: false,
          stage: 'timeout',
          message: 'Connection Timed Out',
          details: 'Network verification timed out after 4 seconds. Please check your connection.',
        });
        setProgress(0);
      }
    }, 4000);

    try {
      const result = await checkNetworkStability((percent, text) => {
        if (!mountedRef.current) return;
        setProgress(percent);
        if (text) {
          if (percent < 35) setHelperText('Measuring connection stability');
          else if (percent < 65) setHelperText('Verifying institutional security context');
          else if (percent < 90) setHelperText('Synchronizing events, duties & budgets');
          else setHelperText('Connection stable · Launching GeoHub');
        }
      });

      if (!mountedRef.current) return;
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

      if (result.isStable) {
        setStatus('stable');
        setProgress(100);
        setHelperText('Connection stable · Launching GeoHub');

        // Minimum Display Time of 1.2s to prevent flash-of-content
        const elapsed = Date.now() - startTimeRef.current;
        const remainingMinDisplay = Math.max(0, 1200 - elapsed);

        finishTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setIsClosing(true);

          finishTimerRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            setIsMounted(false);
            onFinish?.();
          }, 380); // Smooth 380ms fade-cross
        }, remainingMinDisplay + 200);
      } else {
        setStatus('error');
        setErrorResult(result);
        setProgress(result.stage === 'offline' ? 0 : 35);
        setHelperText(result.message || 'No active network');
      }
    } catch {
      if (!mountedRef.current) return;
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      setStatus('error');
      setErrorResult({
        isStable: false,
        stage: 'unreachable',
        message: 'No Internet Connection',
        details: 'Unable to reach internet gateway. Please verify your connection.',
      });
      setProgress(0);
      setHelperText('Network verification failed');
    } finally {
      if (mountedRef.current) {
        setIsRetrying(false);
      }
    }
  }, [onFinish]);

  // Initial check on mount
  useEffect(() => {
    if (autoCheck) {
      runVerification();
    }
  }, [autoCheck, runVerification]);

  // Real-time automatic reconnection when network state changes
  useEffect(() => {
    const handleOnline = () => {
      if (statusRef.current === 'error') {
        runVerification();
      }
    };

    const handleOffline = () => {
      if (statusRef.current === 'checking') {
        setStatus('error');
        setProgress(0);
        setErrorResult({
          isStable: false,
          stage: 'offline',
          message: 'No Internet Connection',
          details: 'Device network interface disconnected.',
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [runVerification]);

  if (!isMounted) return null;

  const currentStep = getStepLabel(progress, status);
  const chipInfo = getChipInfo(progress, status);

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="GeoHub Network Verification & Splash"
      className={`splash-overlay ${isClosing ? 'splash-closing' : ''}`}
    >
      {/* 1. Realistic Photographic Mountain, Trees & Wildlife Backdrop */}
      <div className="nature-realistic-backdrop" aria-hidden="true">
        <img
          src="/nature-splash-realistic.jpg"
          alt="Realistic Mountain Sanctuary Landscape with Stag and Evergreen Pines"
          className="nature-realistic-img"
        />
        <div className="nature-mist-overlay" />
      </div>

      {/* 2. Soft Ambient Radial Sun Glow Behind Emblem */}
      <div className="nature-sun-aura" />

      {/* 3. Floating Nature Spores & Bioluminescent Dust */}
      <div className="nature-spore" style={{ width: 4, height: 4, left: '20%', bottom: '38%', animationDelay: '0s' }} />
      <div className="nature-spore" style={{ width: 5, height: 5, left: '46%', bottom: '42%', animationDelay: '2.5s' }} />
      <div className="nature-spore" style={{ width: 3, height: 3, left: '72%', bottom: '36%', animationDelay: '4.2s' }} />
      <div className="nature-spore" style={{ width: 4, height: 4, left: '84%', bottom: '44%', animationDelay: '1.2s' }} />

      {/* 4. Central Content Column: Packs Branding and Loading Card in the Center Little Down */}
      <div className="splash-content-column">
        {/* Emblem 104dp with soft green drop shadow and 4.2s float animation */}
        <div className="w-[104px] h-[104px] mb-3 emblem-shadow animate-float flex items-center justify-center">
          <img
            src="/geohub-emblem.svg"
            width={104}
            height={104}
            alt="GeoHub Emblem"
            className="w-[104px] h-[104px] object-contain select-none"
          />
        </div>

        {/* Wordmark "GeoHub": Inter ExtraBold 34sp, tracking -2%, "Geo" in ink, "Hub" in dark forest */}
        <div
          className="flex items-center justify-center leading-none mb-1.5"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '34px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: '#051F20' }}>Geo</span>
          <span style={{ color: '#163832' }}>Hub</span>
        </div>

        {/* Tagline: GREEN ECO ORGANIZATION, 12sp Bold, letter-spacing 0.24em */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: '#235347',
            textTransform: 'uppercase',
          }}
        >
          GREEN ECO ORGANIZATION
        </div>

        {/* Mindful Earth & Biosphere Pill Badge */}
        <div
          className="nature-mindful-pill mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-2xs backdrop-blur-xs"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            borderColor: '#DAF1DE',
            color: '#163832',
          }}
        >
          <Leaf size={12} className="text-[#235347] animate-pulse shrink-0" />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em' }}>
            Living Biosphere • Earth Sanctuary
          </span>
        </div>

        {/* 5. Center-Down Floating Glassmorphic Status Sheet Card */}
        {status !== 'error' ? (
          <div className="splash-status-sheet">
            {/* Row 1: Step Label and Tabular Percentage */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles size={13} className="text-[#235347] shrink-0" />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#051F20',
                    letterSpacing: '-0.01em',
                  }}
                  className="truncate"
                >
                  {currentStep}
                </span>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#163832',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {progress}%
              </span>
            </div>

            {/* Row 2: 8dp rounded botanical progress bar with glowing leading particle */}
            <div className="splash-progress-track mb-2.5">
              <div
                className={`splash-progress-fill ${
                  status === 'stable'
                    ? 'splash-progress-fill-success'
                    : 'splash-progress-fill-active'
                }`}
                style={{ width: `${progress}%` }}
              >
                <span className="splash-progress-particle" />
              </div>
            </div>

            {/* Row 3: Helper text and Active mint status chip */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="truncate mr-2"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#235347',
                }}
              >
                {helperText}
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full shrink-0 border inline-flex items-center gap-1.5"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: chipInfo.bg,
                  color: chipInfo.color,
                  borderColor: '#8EB69B',
                }}
              >
                {status === 'checking' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#163832] animate-pulse" />
                )}
                <span>{chipInfo.text}</span>
              </span>
            </div>
          </div>
        ) : (
          /* Offline / Retry State Sheet */
          <div className="splash-status-sheet-error">
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#D9534F',
                  letterSpacing: '-0.01em',
                }}
              >
                Connection Required
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(217, 83, 79, 0.12)',
                  color: '#D9534F',
                }}
              >
                Offline
              </span>
            </div>

            <div className="flex items-start gap-2.5 mb-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(217, 83, 79, 0.1)' }}
              >
                <WifiOff size={16} className="text-[#D9534F]" />
              </div>
              <div className="flex-1">
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#D9534F',
                    margin: 0,
                  }}
                >
                  {errorResult?.message || 'No Internet Connection'}
                </h4>
                <p
                  className="mt-0.5"
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#235347',
                    lineHeight: '1.4',
                    margin: 0,
                  }}
                >
                  {errorResult?.details ||
                    'Device has no active network. Please connect to Wi-Fi or mobile data.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={runVerification}
              disabled={isRetrying}
              className="w-full h-9 rounded-full text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm pressable cursor-pointer disabled:opacity-60"
              style={{
                backgroundColor: '#163832',
                border: 'none',
              }}
            >
              <RefreshCw
                size={13}
                className={isRetrying ? 'animate-spin' : ''}
              />
              <span>{isRetrying ? 'Checking Again...' : 'Retry Connection'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Lower Landscape Sanctuary is completely visible and unobstructed below the card */}

      {/* 7. Bottom Elegant Watermark Pill */}
      <div className="splash-bottom-watermark">
        <div
          className="px-3 py-1 rounded-full border shadow-2xs backdrop-blur-md tracking-[0.16em] uppercase font-bold text-xs flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderColor: '#DAF1DE',
            color: '#163832',
          }}
        >
          <span>v{APP_VERSION}</span>
          <span>•</span>
          <span>GEO CLUB</span>
        </div>
      </div>
    </aside>
  );
};

export default SplashScreen;
