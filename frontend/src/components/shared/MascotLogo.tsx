import React, { useState, useEffect, useId } from 'react';

export type MascotLogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type MascotMood =
  | 'idle'
  | 'look-down'
  | 'eyes-closed'
  | 'peek'
  | 'happy'
  | 'worried'
  | 'wave'
  | 'sleep';

export interface MascotLogoProps {
  size?: MascotLogoSize | number;
  mood?: MascotMood;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  unreadCount?: number;
  isNodding?: boolean;
  isHopping?: boolean;
  headTilt?: boolean;
}

const SIZE_MAP: Record<MascotLogoSize, number> = {
  sm: 32,
  md: 44,
  lg: 72,
  xl: 120,
};

export const MascotLogo: React.FC<MascotLogoProps> = ({
  size = 'md',
  mood = 'idle',
  animated = true,
  className = '',
  style,
  onClick,
  unreadCount = 0,
  isNodding = false,
  isHopping = false,
  headTilt = false,
}) => {
  const gradId = useId().replace(/:/g, '_');
  const dimension = typeof size === 'number' ? size : SIZE_MAP[size] || 44;

  const [isBouncing, setIsBouncing] = useState(false);
  const [isSquished, setIsSquished] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [prevUnread, setPrevUnread] = useState(unreadCount);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger page-load pop on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Notification wiggle when unread count increases
  useEffect(() => {
    if (unreadCount > prevUnread && prevUnread !== 0 && animated) {
      setIsWiggling(true);
      const timer = setTimeout(() => setIsWiggling(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevUnread(unreadCount);
  }, [unreadCount, prevUnread, animated]);

  // Happy bounce on click/tap
  const handleInteraction = () => {
    if (!isBouncing && animated) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 600);
    }
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInteraction();
    }
  };

  // Determine active mood
  const activeMood: MascotMood = isBouncing ? 'happy' : mood;

  // Determine animation classes
  let animationClass = '';
  if (animated) {
    if (isBouncing || activeMood === 'happy') {
      animationClass = 'animate-mascot-bounce';
    } else if (isHopping) {
      animationClass = 'animate-mascot-hop';
    } else if (isNodding) {
      animationClass = 'animate-mascot-nod';
    } else if (activeMood === 'worried') {
      animationClass = 'animate-mascot-worry';
    } else if (isWiggling) {
      animationClass = 'animate-mascot-wiggle';
    } else if (activeMood !== 'sleep') {
      animationClass = 'animate-mascot-float';
    }
  }

  // Head tilt for looking down or roll number focus
  const effectiveTilt = headTilt || activeMood === 'look-down' ? 6 : 0;

  const renderFace = () => {
    switch (activeMood) {
      case 'look-down':
        return (
          <>
            {/* Left eye looking downward toward input field */}
            <g style={{ transformOrigin: '41px 52px' }}>
              <ellipse cx="41" cy="52" rx="3.2" ry="4" fill="var(--pine-900)" />
              <circle cx="40" cy="51" r="1.2" fill="var(--card-white)" />
            </g>

            {/* Right eye looking downward toward input field */}
            <g style={{ transformOrigin: '59px 52px' }}>
              <ellipse cx="59" cy="52" rx="3.2" ry="4" fill="var(--pine-900)" />
              <circle cx="58" cy="51" r="1.2" fill="var(--card-white)" />
            </g>

            {/* Inquisitive little smile */}
            <path
              d="M 47 58 Q 50 61 53 58"
              stroke="var(--pine-900)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mint blush cheeks */}
            <ellipse cx="35" cy="55" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
            <ellipse cx="65" cy="55" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
          </>
        );

      case 'eyes-closed':
        return (
          <>
            {/* Closed curved eye lines */}
            <path
              d="M 37 50 Q 41 53 45 50"
              stroke="var(--pine-900)"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 55 50 Q 59 53 63 50"
              stroke="var(--pine-900)"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Privacy Peek: Cute little mitten hands covering the eyes */}
            <path
              d="M 33 46 C 33 41 45 41 45 47 C 45 52 35 52 33 46 Z"
              fill="var(--mint-100)"
              stroke="var(--pine-900)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M 67 46 C 67 41 55 41 55 47 C 55 52 65 52 67 46 Z"
              fill="var(--mint-100)"
              stroke="var(--pine-900)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Shy sweet mouth */}
            <path
              d="M 48 57 Q 50 59.5 52 57"
              stroke="var(--pine-900)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mint blush cheeks */}
            <ellipse cx="34" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
            <ellipse cx="66" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
          </>
        );

      case 'peek':
        return (
          <>
            {/* Left eye covered by little paw */}
            <path
              d="M 37 50 Q 41 53 45 50"
              stroke="var(--pine-900)"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 33 46 C 33 41 45 41 45 47 C 45 52 35 52 33 46 Z"
              fill="var(--mint-100)"
              stroke="var(--pine-900)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Right eye peeking openly through fingers */}
            <ellipse cx="59" cy="49" rx="3.6" ry="4.8" fill="var(--pine-900)" />
            <circle cx="57.6" cy="47.2" r="1.4" fill="var(--card-white)" />

            {/* Playful tilted smile */}
            <path
              d="M 47 56 Q 51 61 55 57"
              stroke="var(--pine-900)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mint blush cheeks */}
            <ellipse cx="35" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
            <ellipse cx="65" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
          </>
        );

      case 'worried':
        return (
          <>
            {/* Worried tilted eyebrows */}
            <path
              d="M 37 43 Q 41 46 45 43"
              stroke="var(--pine-900)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 55 43 Q 59 46 63 43"
              stroke="var(--pine-900)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Wide concerned eyes */}
            <ellipse cx="41" cy="50" rx="3.4" ry="4.4" fill="var(--pine-900)" />
            <circle cx="40" cy="48.5" r="1.3" fill="var(--card-white)" />

            <ellipse cx="59" cy="50" rx="3.4" ry="4.4" fill="var(--pine-900)" />
            <circle cx="58" cy="48.5" r="1.3" fill="var(--card-white)" />

            {/* Small worried frown */}
            <path
              d="M 46 59 Q 50 55 54 59"
              stroke="var(--pine-900)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 'sleep':
        return (
          <>
            {/* Sleeping curved eyes */}
            <path
              d="M 37 50 Q 41 54 45 50"
              stroke="var(--pine-900)"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 55 50 Q 59 54 63 50"
              stroke="var(--pine-900)"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sleeping small mouth */}
            <path
              d="M 48 57 Q 50 58.5 52 57"
              stroke="var(--pine-900)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Floating z sleep letter */}
            <text
              x="63"
              y="38"
              fill="var(--pine-700)"
              fontSize="12"
              fontWeight="700"
              className={animated ? 'animate-mascot-sleep-z' : ''}
              style={{ fontFamily: 'var(--font-family)' }}
            >
              z
            </text>
          </>
        );

      case 'happy':
        return (
          <>
            {/* Happy squint arcs */}
            <path
              d="M 37 51 Q 41 45 45 51"
              stroke="var(--pine-900)"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 55 51 Q 59 45 63 51"
              stroke="var(--pine-900)"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Wide happy smile */}
            <path
              d="M 44 55 Q 50 64 56 55 Z"
              fill="var(--pine-900)"
            />
            {/* Mint blush cheeks */}
            <ellipse cx="35" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
            <ellipse cx="65" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
          </>
        );

      case 'wave':
        return (
          <>
            {/* Left open eye */}
            <ellipse cx="41" cy="49" rx="3.2" ry="4.5" fill="var(--pine-900)" />
            <circle cx="39.8" cy="47.5" r="1.3" fill="var(--card-white)" />
            {/* Right winking eye */}
            <path
              d="M 55 50 Q 59 46 63 50"
              stroke="var(--pine-900)"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Friendly smile */}
            <path
              d="M 46 56 Q 50 61 54 56"
              stroke="var(--pine-900)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cute waving hand */}
            <path
              d="M 75 52 Q 83 45 81 39"
              stroke="var(--pine-900)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Mint blush cheeks */}
            <ellipse cx="35" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
            <ellipse cx="65" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
          </>
        );

      case 'idle':
      default:
        return (
          <>
            {/* Left eye with glint and blink animation */}
            <g
              className={animated ? 'animate-mascot-blink' : ''}
              style={{ transformOrigin: '41px 49px' }}
            >
              <ellipse cx="41" cy="49" rx="3.2" ry="4.5" fill="var(--pine-900)" />
              <circle cx="39.8" cy="47.5" r="1.3" fill="var(--card-white)" />
            </g>

            {/* Right eye with glint and blink animation */}
            <g
              className={animated ? 'animate-mascot-blink' : ''}
              style={{ transformOrigin: '59px 49px' }}
            >
              <ellipse cx="59" cy="49" rx="3.2" ry="4.5" fill="var(--pine-900)" />
              <circle cx="57.8" cy="47.5" r="1.3" fill="var(--card-white)" />
            </g>

            {/* Sweet short smile */}
            <path
              d="M 46 56 Q 50 60 54 56"
              stroke="var(--pine-900)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mint 100 blush cheeks */}
            <ellipse cx="35" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
            <ellipse cx="65" cy="54" rx="3.5" ry="2" fill="var(--mint-100)" opacity="0.6" />
          </>
        );
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
      onPointerDown={() => setIsSquished(true)}
      onPointerUp={() => setIsSquished(false)}
      onPointerLeave={() => setIsSquished(false)}
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EB69B] focus-visible:ring-offset-2 rounded-2xl ${
        animated && isLoaded ? 'animate-mascot-pop' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        minWidth: `${dimension}px`,
        minHeight: `${dimension}px`,
        ...style,
      }}
    >
      <svg
        role="img"
        aria-label="GeoHub logo"
        viewBox="0 0 100 100"
        width={dimension}
        height={dimension}
        style={{
          display: 'block',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Soft Sage 400 to Pine 700 gradient with Mint 100 top highlight */}
          <linearGradient id={gradId} x1="0.2" y1="0.1" x2="0.8" y2="0.95">
            <stop offset="0%" stopColor="var(--mint-100)" />
            <stop offset="42%" stopColor="var(--sage-400)" />
            <stop offset="100%" stopColor="var(--pine-700)" />
          </linearGradient>
        </defs>

        {/* Faint bottom breathing shadow ellipse */}
        <ellipse
          cx="50"
          cy="90"
          rx="22"
          ry="4.5"
          fill="var(--pine-950)"
          className={animated && activeMood !== 'sleep' ? 'animate-mascot-shadow' : ''}
          aria-hidden="true"
        />

        {/* Mascot Body Group (float, bounce, wiggle, squish, tilt) */}
        <g
          className={animationClass}
          style={{
            transformOrigin: '50% 80%',
            willChange: 'transform',
            transform: `${isSquished ? 'scale(1.06, 0.92)' : ''} ${
              effectiveTilt ? `rotate(${effectiveTilt}deg)` : ''
            }`.trim() || undefined,
            transition: 'transform 180ms ease',
          }}
        >
          {/* Teardrop / Pin shape (tilted -12 degrees, round bottom, soft apex) */}
          <g transform="rotate(-12, 50, 52)">
            {/* Outer body with dark Pine 900 outline */}
            <path
              d="M 50 18 C 55 18 75 35 75 54 C 75 69 64 80 50 80 C 36 80 25 69 25 54 C 25 35 45 18 50 18 Z"
              fill={`url(#${gradId})`}
              stroke="var(--pine-900)"
              strokeWidth="6.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Lighter highlight patch on upper left for clay finish */}
            <ellipse
              cx="37"
              cy="34"
              rx="13"
              ry="6.5"
              transform="rotate(-30 37 34)"
              fill="var(--card-white)"
              opacity="0.45"
              aria-hidden="true"
            />
          </g>

          {/* Face Elements (eyes, smile, blush, privacy paws) */}
          <g aria-hidden="true">
            {renderFace()}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default MascotLogo;
