import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mascot } from './shared/Mascot';
import {
  WifiOff,
  Activity,
  CheckCircle2,
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
  const [statusText, setStatusText] = useState('Checking device network interface...');
  const [errorResult, setErrorResult] = useState<NetworkStabilityResult | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  const runVerification = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsRetrying(true);
    setStatus('checking');
    setErrorResult(null);
    setProgress(15);
    setStatusText('Checking device network interface...');

    try {
      const result = await checkNetworkStability((percent, text) => {
        if (!mountedRef.current) return;
        setProgress(percent);
        setStatusText(text);
      });

      if (!mountedRef.current) return;

      if (result.isStable) {
        setStatus('stable');
        setProgress(100);
        setStatusText(result.message);
        if (result.latencyMs) setLatency(result.latencyMs);

        // Allow user to briefly see 100% completion before smooth transition
        finishTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setIsClosing(true);

          finishTimerRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            setIsMounted(false);
            onFinish?.();
          }, 380);
        }, 500);
      } else {
        // Unstable or Offline -> Stop progress, display error, and BLOCK entry to app
        setStatus('error');
        setErrorResult(result);
        setStatusText(result.message);
        setProgress(result.stage === 'offline' ? 0 : 40);
      }
    } catch {
      if (!mountedRef.current) return;
      setStatus('error');
      setErrorResult({
        isStable: false,
        stage: 'unreachable',
        message: 'Network Verification Failed',
        details: 'Unable to complete network diagnostic. Please verify connection.',
      });
      setStatusText('Network Verification Failed');
      setProgress(0);
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
      if (status === 'error') {
        runVerification();
      }
    };

    const handleOffline = () => {
      if (status === 'checking') {
        setStatus('error');
        setProgress(0);
        setStatusText('Network disconnected');
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
  }, [status, runVerification]);

  if (!isMounted) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="GeoHub Network Verification & Splash"
      className={`splash-overlay ${isClosing ? 'splash-closing' : ''}`}
    >
      {/* Ambient Breathing Radial Glow Disc */}
      <div className="splash-glow-disc" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm">
        {/* Floating Mascot Leaf */}
        <div className="relative mb-5 flex items-center justify-center">
          <Mascot name="leaf" size={106} floating />
        </div>

        {/* Brand Wordmark with Diamond dot */}
        <div className="flex items-center gap-1.5 mb-2">
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '34px',
              fontWeight: 800,
              color: '#051F20',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            GEO
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: '#8EB69B',
              margin: '0 4px',
              boxShadow: '0 0 10px rgba(142, 182, 155, 0.8)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '34px',
              fontWeight: 800,
              color: '#235347',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            HUB
          </span>
        </div>

        {/* Subtitle Pill Badge */}
        <div
          className="inline-flex items-center px-3.5 py-1 rounded-full mb-8 border"
          style={{
            backgroundColor: 'rgba(218, 241, 222, 0.75)',
            borderColor: 'rgba(142, 182, 155, 0.4)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#163832',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Green Eco Organization Hub
          </span>
        </div>

        {/* Glassmorphic Network Stability Dock */}
        <div
          className={`w-full rounded-[26px] p-5 ${
            status === 'error' ? 'splash-glass-dock-error' : 'splash-glass-dock'
          }`}
        >
          {/* Header Row: Stage Indicator & Percentage */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {status === 'checking' && (
                <Activity size={16} className="text-[#235347] splash-pulse-dot" />
              )}
              {status === 'stable' && (
                <CheckCircle2 size={16} className="text-[#235347]" />
              )}
              {status === 'error' && (
                <WifiOff size={16} className="text-[#D9534F]" />
              )}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: status === 'error' ? '#D9534F' : '#051F20',
                  letterSpacing: '-0.01em',
                }}
              >
                {status === 'checking' && 'Verifying Network...'}
                {status === 'stable' && 'Network Verified'}
                {status === 'error' && 'Connection Required'}
              </span>
            </div>

            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: status === 'error' ? '#D9534F' : '#235347',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {progress}%
            </span>
          </div>

          {/* Shimmering Progress Bar Track */}
          <div className="splash-progress-track mb-3">
            <div
              className={`splash-progress-fill ${
                status === 'error'
                  ? 'splash-progress-fill-error'
                  : status === 'stable'
                  ? 'splash-progress-fill-success'
                  : 'splash-progress-fill-active'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Message Text & State Badge */}
          <div className="flex items-center justify-between text-left">
            <p
              className="truncate mr-2 m-0"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: status === 'error' ? '#D9534F' : '#235347',
              }}
            >
              {statusText}
            </p>
            <span
              className="px-2 py-0.5 rounded-full shrink-0"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor:
                  status === 'error'
                    ? 'rgba(217, 83, 79, 0.12)'
                    : status === 'stable'
                    ? '#DAF1DE'
                    : 'rgba(218, 241, 222, 0.8)',
                color:
                  status === 'error'
                    ? '#D9534F'
                    : '#163832',
              }}
            >
              {status === 'checking' && 'Active'}
              {status === 'stable' && 'Stable'}
              {status === 'error' && 'Offline'}
            </span>
          </div>

          {/* Error Message Box & Block Screen Guard */}
          {status === 'error' && (
            <div
              className="mt-3 p-3.5 rounded-2xl text-left border"
              style={{
                backgroundColor: 'rgba(217, 83, 79, 0.08)',
                borderColor: 'rgba(217, 83, 79, 0.28)',
              }}
            >
              <div className="flex items-start gap-2.5 mb-2.5">
                <WifiOff size={18} className="text-[#D9534F] shrink-0 mt-0.5" />
                <div>
                  <h4
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#D9534F',
                      margin: 0,
                    }}
                  >
                    {errorResult?.message || 'No Stable Connection'}
                  </h4>
                  <p
                    className="mt-1"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#051F20',
                      lineHeight: '1.4',
                    }}
                  >
                    {errorResult?.details ||
                      'GeoHub requires an active, stable internet connection to sync records and verify authentication.'}
                  </p>
                </div>
              </div>

              {/* High-Contrast Interactive Retry Button */}
              <button
                type="button"
                onClick={runVerification}
                disabled={isRetrying}
                className="w-full mt-2 h-10 px-4 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60 shadow-md"
                style={{
                  backgroundColor: '#163832',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  minHeight: '40px',
                }}
              >
                <RefreshCw
                  size={14}
                  className={isRetrying ? 'animate-spin' : ''}
                />
                <span>{isRetrying ? 'Checking Again...' : 'Retry Connection'}</span>
              </button>

              <p
                className="mt-2 text-center m-0"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#235347',
                }}
              >
                Auto-reconnects when network is available
              </p>
            </div>
          )}

          {/* Success Latency Confirmation */}
          {status === 'stable' && (
            <div
              className="mt-3 px-3 py-1.5 rounded-xl flex items-center justify-between border"
              style={{
                backgroundColor: '#DAF1DE',
                borderColor: 'rgba(142, 182, 155, 0.35)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#163832',
                }}
              >
                Latency
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#163832',
                }}
              >
                {latency ? `${latency}ms · Optimal` : 'Connected & Ready'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SplashScreen;
