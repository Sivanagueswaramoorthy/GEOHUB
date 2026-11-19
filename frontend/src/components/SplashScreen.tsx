import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WifiOff,
  RefreshCw,
  Leaf,
  Sparkles,
  Globe,
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

/**
 * Panoramic Living Biosphere Vector Canvas
 * Renders an immersive, serene nature sanctuary background featuring:
 * - Gentle dawn sun glow and atmospheric elevation contours
 * - Misty rolling mountain ridges and pine tree groves
 * - A meandering pristine river stream
 * - Graceful wildlife silhouettes: A proud noble stag with antlers, grazing deer, and meadow wildlife
 * - Soaring birds in peaceful V-formation and fluttering butterflies
 */
const NatureSanctuaryCanvas: React.FC = () => {
  return (
    <div className="nature-sanctuary-canvas" aria-hidden="true">
      <svg
        className="nature-sanctuary-svg"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dawn Sun Glow Gradient */}
          <radialGradient id="natureSunGlow" cx="50%" cy="22%" r="55%">
            <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#DAF1DE" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#8EB69B" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F6FBF7" stopOpacity="0" />
          </radialGradient>

          {/* Distant Mountain Shading */}
          <linearGradient id="mistRidge1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8EB69B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#DAF1DE" stopOpacity="0.15" />
          </linearGradient>

          {/* Mid-Ground Forest Shading */}
          <linearGradient id="mistRidge2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#235347" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#8EB69B" stopOpacity="0.2" />
          </linearGradient>

          {/* Foreground Meadow Shading */}
          <linearGradient id="meadowRidge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#163832" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#235347" stopOpacity="0.5" />
          </linearGradient>

          {/* Meandering River Stream */}
          <linearGradient id="waterStream" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#DAF1DE" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#8EB69B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#DAF1DE" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* Ambient Dawn Sun Orb */}
        <circle cx="500" cy="180" r="280" fill="url(#natureSunGlow)" />

        {/* Topographic Mindful Elevation Contours */}
        <g opacity="0.32" stroke="#8EB69B" strokeWidth="1" fill="none">
          <path d="M-100 240 C 200 260, 350 180, 580 230 C 760 270, 920 210, 1100 240" strokeDasharray="6 6" />
          <path d="M-100 300 C 180 330, 400 240, 640 290 C 820 330, 960 270, 1100 310" />
          <path d="M-100 370 C 150 410, 380 320, 680 360 C 860 390, 990 340, 1100 380" strokeDasharray="8 6" />
        </g>

        {/* Distant Flock of Soaring Birds in Peaceful Formation */}
        <g className="animate-nature-soar" opacity="0.45" fill="#163832">
          {/* Bird 1 (Leader) */}
          <path d="M 460 210 Q 468 202 476 207 Q 484 202 492 210 Q 484 206 476 211 Q 468 206 460 210 Z" />
          {/* Bird 2 */}
          <path d="M 430 224 Q 437 217 444 221 Q 451 217 458 224 Q 451 220 444 225 Q 437 220 430 224 Z" />
          {/* Bird 3 */}
          <path d="M 496 226 Q 503 219 510 223 Q 517 219 524 226 Q 517 222 510 227 Q 503 222 496 226 Z" />
          {/* Bird 4 */}
          <path d="M 405 240 Q 411 234 417 237 Q 423 234 429 240 Q 423 237 417 241 Q 411 237 405 240 Z" />
          {/* Bird 5 */}
          <path d="M 526 242 Q 532 236 538 239 Q 544 236 550 242 Q 544 239 538 243 Q 532 239 526 242 Z" />
        </g>

        {/* Layer 1: Distant Misty Mountains / Hills */}
        <path
          d="M-50 540 Q 180 430 420 490 T 900 450 Q 1020 470 1100 510 L 1100 800 L -50 800 Z"
          fill="url(#mistRidge1)"
        />

        {/* Distant Pines along Ridge */}
        <g fill="#8EB69B" opacity="0.45">
          <polygon points="340,490 348,460 356,490" />
          <polygon points="344,480 350,450 356,480" />
          <polygon points="352,492 360,458 368,492" />
          <polygon points="364,495 371,465 378,495" />
          <polygon points="610,480 617,452 624,480" />
          <polygon points="619,484 626,456 633,484" />
          <polygon points="628,482 635,448 642,482" />
          <polygon points="638,485 644,458 650,485" />
        </g>

        {/* Layer 2: Mid-Ground Forest Ridges & Rolling Meadow */}
        <path
          d="M-50 610 C 140 530, 320 610, 520 560 C 720 510, 880 570, 1100 530 L 1100 800 L -50 800 Z"
          fill="url(#mistRidge2)"
        />

        {/* Gentle Meandering River Stream */}
        <path
          d="M 480 565 C 500 610, 440 660, 480 710 C 510 750, 470 780, 460 800 L 520 800 C 530 770, 560 740, 520 700 C 490 660, 540 610, 510 562 Z"
          fill="url(#waterStream)"
        />

        {/* Layer 3: Foreground Knolls & Meadow Sanctuary */}
        {/* Left Hillock */}
        <path
          d="M-50 670 Q 180 610 440 700 Q 320 800 -50 800 Z"
          fill="url(#meadowRidge)"
          opacity="0.75"
        />
        {/* Right Crest (Where Stag & Fawn stand) */}
        <path
          d="M 510 730 Q 680 610 1050 640 L 1050 800 L 450 800 Z"
          fill="url(#meadowRidge)"
          opacity="0.88"
        />

        {/* Pine Tree Grove on Left Hillock */}
        <g fill="#163832" opacity="0.65">
          <polygon points="120,680 145,580 170,680" />
          <polygon points="125,650 145,595 165,650" />
          <polygon points="130,620 145,580 160,620" />
          <rect x="142" y="680" width="6" height="25" />

          <polygon points="175,690 195,605 215,690" />
          <polygon points="179,665 195,618 211,665" />
          <polygon points="183,640 195,605 207,640" />
          <rect x="192" y="690" width="6" height="20" />

          <polygon points="85,695 102,630 119,695" />
          <polygon points="89,675 102,640 115,675" />
          <rect x="100" y="695" width="4" height="15" />
        </g>

        {/* Oak Foliage Canopy Silhouette */}
        <g fill="#235347" opacity="0.55">
          <circle cx="230" cy="670" r="24" />
          <circle cx="245" cy="655" r="28" />
          <circle cx="265" cy="670" r="22" />
          <rect x="244" y="680" width="6" height="22" fill="#163832" />
        </g>

        {/* Peaceful Grazing Deer on Left Slope */}
        <g transform="translate(290, 660) scale(0.65)" fill="#163832" opacity="0.88">
          <path d="M 68 38 C 65 30 55 24 44 24 C 36 24 28 28 22 34 L 14 42 C 10 46 6 52 4 58 L 2 64 C 1 66 3 67 5 66 L 10 61 L 14 53 L 20 54 L 20 78 C 20 80 22 80 23 78 L 25 55 L 36 55 L 36 78 C 36 80 38 80 39 78 L 41 53 C 48 53 54 51 57 47 L 60 76 C 60 78 62 78 63 76 L 65 44 C 68 42 70 40 68 38 Z" />
          <ellipse cx="66" cy="36" rx="3" ry="2" />
          <path d="M 12 40 L 15 34 L 17 38 Z" />
        </g>

        {/* Majestic Noble Stag on the Right Hillock Crest */}
        <g transform="translate(710, 550) scale(0.92)" fill="#0B2B26" opacity="0.95">
          {/* Stag Body, Neck, Head, Legs */}
          <path d="
            M 48 95
            C 47 92, 46 82, 46 72
            C 46 60, 48 54, 52 48
            C 55 43, 56 36, 54 28
            C 53 22, 54 18, 57 16
            C 59 15, 62 16, 63 18
            C 64 21, 62 25, 60 28
            L 58 35
            C 62 42, 68 47, 74 50
            C 84 50, 96 52, 105 56
            C 112 59, 116 64, 118 72
            C 119 75, 122 75, 122 78
            C 121 82, 117 84, 115 82
            C 114 88, 112 96, 110 112
            C 110 115, 108 115, 107 112
            L 105 88
            C 101 88, 98 90, 96 98
            L 94 112
            C 94 115, 92 115, 91 112
            L 93 84
            C 86 85, 78 86, 70 85
            L 66 112
            C 66 115, 64 115, 63 112
            L 64 82
            C 60 82, 57 85, 55 96
            L 53 112
            C 53 115, 51 115, 50 112
            L 48 95 Z
          " />
          {/* Ears */}
          <path d="M 56 16 L 50 10 C 49 9, 52 12, 54 15 Z" />
          <path d="M 59 17 L 65 11 C 66 10, 64 13, 61 16 Z" />
          {/* Antler Rack (Proud Branched Antlers) */}
          <path d="
            M 56 15
            C 54 10, 50 6, 45 3
            C 42 1, 41 2, 43 4
            C 46 7, 49 10, 51 14
            Z
          " />
          <path d="
            M 51 10
            C 48 7, 42 4, 38 1
            C 37 0, 36 1, 38 3
            C 42 5, 46 8, 48 11
            Z
          " />
          <path d="
            M 53 7
            C 52 3, 48 -2, 44 -7
            C 43 -8, 42 -7, 43 -5
            C 46 -1, 49 3, 51 6
            Z
          " />
          <path d="
            M 58 15
            C 60 9, 65 5, 70 1
            C 72 -1, 73 0, 71 2
            C 67 6, 63 10, 61 14
            Z
          " />
          <path d="
            M 62 9
            C 66 5, 72 2, 77 -2
            C 78 -3, 79 -2, 77 0
            C 73 4, 68 8, 64 11
            Z
          " />
          <path d="
            M 60 6
            C 61 1, 65 -4, 69 -10
            C 70 -11, 71 -10, 70 -8
            C 67 -3, 63 2, 61 6
            Z
          " />
        </g>

        {/* Gentle Doe / Grazing Fawn beside Stag */}
        <g transform="translate(825, 595) scale(0.7)" fill="#163832" opacity="0.88">
          <path d="
            M 20 85
            C 19 80, 18 72, 20 64
            C 22 55, 26 48, 29 42
            C 32 36, 33 28, 30 20
            C 29 16, 30 14, 32 12
            C 34 11, 37 12, 38 14
            C 39 17, 38 21, 36 24
            L 34 30
            C 38 36, 44 41, 50 44
            C 58 44, 68 46, 75 50
            C 80 53, 83 58, 85 65
            C 86 68, 88 68, 88 71
            C 87 74, 84 76, 82 74
            C 81 79, 79 87, 78 100
            C 78 102, 76 102, 75 100
            L 74 78
            C 70 78, 68 80, 66 88
            L 65 100
            C 65 102, 63 102, 62 100
            L 64 74
            C 58 75, 52 76, 46 75
            L 42 100
            C 42 102, 40 102, 39 100
            L 40 72
            C 36 72, 33 75, 31 85
            L 29 100
            C 29 102, 27 102, 26 100
            L 20 85 Z
          " />
          <path d="M 31 12 L 26 7 C 25 6, 28 9, 30 11 Z" />
          <path d="M 33 13 L 38 8 C 39 7, 37 9, 35 12 Z" />
        </g>

        {/* Curious Hare / Rabbit Silhouette in Meadow Grass */}
        <g transform="translate(440, 710) scale(0.42)" fill="#163832" opacity="0.82">
          <ellipse cx="28" cy="32" rx="18" ry="12" />
          <circle cx="16" cy="22" r="9" />
          <path d="M 14 15 C 13 8, 11 3, 10 0 C 9 0, 11 5, 13 14 Z" />
          <path d="M 17 15 C 18 8, 20 3, 21 0 C 22 0, 20 5, 18 14 Z" />
          <circle cx="44" cy="32" r="4" />
          <ellipse cx="20" cy="42" rx="7" ry="3" />
          <ellipse cx="36" cy="42" rx="8" ry="3" />
        </g>

        {/* Wild Prairie Grasses & Botanical Reeds along Bottom Edge */}
        <g stroke="#0B2B26" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" fill="none">
          <path d="M 10 800 Q 15 760 12 730" />
          <path d="M 18 800 Q 25 750 20 720" />
          <path d="M 28 800 Q 32 760 38 735" />
          <path d="M 40 800 Q 38 755 48 725" />
          <path d="M 52 800 Q 60 765 58 740" />

          <path d="M 640 800 Q 645 765 642 740" />
          <path d="M 650 800 Q 658 755 655 730" />
          <path d="M 662 800 Q 665 768 672 745" />

          <path d="M 940 800 Q 945 760 940 730" />
          <path d="M 952 800 Q 960 750 955 722" />
          <path d="M 965 800 Q 968 762 978 735" />
          <path d="M 980 800 Q 985 755 990 730" />
        </g>

        {/* Fluttering Butterflies / Natural Pollinators */}
        <g className="animate-butterfly-float" fill="#235347" opacity="0.65">
          <g transform="translate(260, 510) scale(0.55)">
            <path d="M 0 0 C -8 -10 -15 -4 -12 4 C -10 10 -4 6 0 2 Z" />
            <path d="M 0 0 C 8 -10 15 -4 12 4 C 10 10 4 6 0 2 Z" />
            <path d="M 0 2 C -6 4 -10 10 -6 14 C -2 16 0 10 0 4 Z" />
            <path d="M 0 2 C 6 4 10 10 6 14 C 2 16 0 10 0 4 Z" />
            <line x1="0" y1="-2" x2="0" y2="12" stroke="#051F20" strokeWidth="1" />
          </g>
          <g transform="translate(680, 480) scale(0.45)">
            <path d="M 0 0 C -8 -10 -15 -4 -12 4 C -10 10 -4 6 0 2 Z" />
            <path d="M 0 0 C 8 -10 15 -4 12 4 C 10 10 4 6 0 2 Z" />
            <path d="M 0 2 C -6 4 -10 10 -6 14 C -2 16 0 10 0 4 Z" />
            <path d="M 0 2 C 6 4 10 10 6 14 C 2 16 0 10 0 4 Z" />
            <line x1="0" y1="-2" x2="0" y2="12" stroke="#051F20" strokeWidth="1" />
          </g>
        </g>
      </svg>
    </div>
  );
};

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
      {/* 1. Ambient Living Biosphere Background Sun Aura */}
      <div className="nature-sun-aura" />

      {/* 2. Floating Natural Spores & Bioluminescent Dust */}
      <div className="nature-spore" style={{ width: 4, height: 4, left: '18%', bottom: '28%', animationDelay: '0s' }} />
      <div className="nature-spore" style={{ width: 5, height: 5, left: '42%', bottom: '22%', animationDelay: '2.5s' }} />
      <div className="nature-spore" style={{ width: 3, height: 3, left: '68%', bottom: '32%', animationDelay: '4.2s' }} />
      <div className="nature-spore" style={{ width: 4, height: 4, left: '85%', bottom: '25%', animationDelay: '1.2s' }} />

      {/* 3. Layered Natural Sanctuary & Wildlife Vector Canvas */}
      <NatureSanctuaryCanvas />

      {/* 4. Center Branding Group (Emblem, Wordmark, Tagline & Mindful Eco Pill) */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full mt-2 sm:mt-4">
        {/* Emblem 104dp with soft green drop shadow and 4.2s float animation */}
        <div className="w-[104px] h-[104px] mb-3.5 emblem-shadow animate-float flex items-center justify-center">
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
          className="nature-mindful-pill mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-2xs backdrop-blur-xs"
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
      </div>

      {/* 5. Bottom Floating Glassmorphic Status Sheet */}
      <div className="w-full max-w-sm z-20 px-4 mb-2">
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

        {/* Footer Watermark */}
        <div
          className="mt-3.5 text-center tracking-[0.18em] uppercase font-bold text-xs flex items-center justify-center gap-1.5"
          style={{ color: '#235347' }}
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
