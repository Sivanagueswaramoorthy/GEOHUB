import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import {
  checkNetworkStability,
  NetworkStabilityResult,
} from '../core/networkStability';
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
    if (st === 'stable' || pct >= 95) return { text: 'Ready', bg: '#D7EFE3', color: '#143527' };
    return { text: 'Active', bg: '#E7F6EE', color: '#0F6B47' };
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
          // Provide friendly helper copy matching the active step
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

        // Enforce Minimum Display Time of 1.2s to prevent flash-of-content
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
        // Unstable or Offline -> Stop progress and show retry state
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
      {/* 1. One Soft Radial Emerald Glow (16% Opacity) Behind Emblem */}
      <div className="splash-glow-disc" />

      {/* Center Branding Group (Emblem, Wordmark, Tagline) */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full mt-4">
        {/* Emblem 104dp with soft green drop shadow and 4s float animation */}
        <div className="w-[104px] h-[104px] mb-4 emblem-shadow animate-float flex items-center justify-center">
          <img
            src="/geohub-emblem.svg"
            width={104}
            height={104}
            alt="GeoHub Emblem"
            className="w-[104px] h-[104px] object-contain select-none"
          />
        </div>

        {/* Wordmark "GeoHub": Inter ExtraBold 34sp, tracking -2%, "Geo" in ink, "Hub" in Emerald 700. No dot separator. */}
        <div
          className="flex items-center justify-center leading-none mb-1.5"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '34px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: '#0B2A1F' }}>Geo</span>
          <span style={{ color: '#0F6B47' }}>Hub</span>
        </div>

        {/* Tagline: GREEN ECO ORGANIZATION, 10sp SemiBold, letter-spacing 0.28em, muted color, no pill outline. */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.28em',
            color: '#6B7F75',
            textTransform: 'uppercase',
          }}
        >
          GREEN ECO ORGANIZATION
        </div>
      </div>

      {/* Bottom Status Sheet (16dp side margins, 28dp from bottom, 22dp radius, white, 1dp border, soft shadow) */}
      <div className="w-full max-w-sm z-10 px-4 mb-2">
        {status !== 'error' ? (
          <div className="splash-status-sheet">
            {/* Row 1: Step Label and Percentage in Emerald 700 */}
            <div className="flex items-center justify-between mb-2.5">
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0B2A1F',
                  letterSpacing: '-0.01em',
                }}
              >
                {currentStep}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#0F6B47',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {progress}%
              </span>
            </div>

            {/* Row 2: 6dp rounded progress bar (track #E7F1EC, fill gradient Emerald 700 to Emerald 400) */}
            <div className="splash-progress-track mb-2.5">
              <div
                className={`splash-progress-fill ${
                  status === 'stable'
                    ? 'splash-progress-fill-success'
                    : 'splash-progress-fill-active'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Row 3: Helper text and Active mint chip */}
            <div className="flex items-center justify-between">
              <span
                className="truncate mr-2"
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6B7F75',
                }}
              >
                {helperText}
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full shrink-0 border"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: chipInfo.bg,
                  color: chipInfo.color,
                  borderColor: 'rgba(94, 175, 128, 0.3)',
                }}
              >
                {chipInfo.text}
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
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
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
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#6B7F75',
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
                backgroundColor: '#0F6B47',
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

        {/* Footer: "v1.0 · GEO CLUB", 9sp, letter-spaced, very light grey */}
        <div
          className="mt-4 text-center tracking-[0.15em] uppercase font-semibold text-[9px]"
          style={{ color: '#BAC7C0' }}
        >
          v1.6.8 · GEO CLUB
        </div>
      </div>
    </aside>
  );
};

export default SplashScreen;
