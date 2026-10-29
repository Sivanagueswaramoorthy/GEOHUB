import React from 'react';

export type MascotName =
  | 'leaf'
  | 'globe'
  | 'tree'
  | 'drone'
  | 'gps-pin'
  | 'gps_pin'
  | 'qr-code'
  | 'qr_code'
  | 'camera'
  | 'notebook'
  | 'coin'
  | 'wallet'
  | 'megaphone'
  | 'calendar'
  | 'trophy'
  | 'clipboard'
  | 'shield'
  | 'magnifier'
  | 'lock';

export type MascotSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;

interface MascotProps {
  name: MascotName;
  size?: MascotSize;
  className?: string;
  style?: React.CSSProperties;
  floating?: boolean;
}

const SIZE_MAP: Record<string, number> = {
  sm: 36,
  md: 52,
  lg: 72,
  xl: 96,
  hero: 120,
};

export const Mascot: React.FC<MascotProps> = ({
  name,
  size = 'md',
  className = '',
  style,
  floating = false,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 52;
  const normalizedName = name.replace(/_/g, '-');

  // Friendly Kawaii Clay Face: two cute dot eyes with glints and a smile
  const renderFace = (cx: number, cy: number, scale = 1) => (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      {/* Left eye with shine */}
      <circle cx="-10" cy="-2" r="3.2" fill="#051F20" />
      <circle cx="-11" cy="-3.5" r="1.1" fill="#FFFFFF" />

      {/* Right eye with shine */}
      <circle cx="10" cy="-2" r="3.2" fill="#051F20" />
      <circle cx="9" cy="-3.5" r="1.1" fill="#FFFFFF" />

      {/* Sweet smile */}
      <path
        d="M -5 4 Q 0 8 5 4"
        stroke="#051F20"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Rosy blush cheeks */}
      <ellipse cx="-16" cy="3" rx="3.5" ry="2" fill="rgba(242, 184, 75, 0.45)" />
      <ellipse cx="16" cy="3" rx="3.5" ry="2" fill="rgba(242, 184, 75, 0.45)" />
    </g>
  );

  const renderGraphic = () => {
    switch (normalizedName) {
      case 'leaf':
        return (
          <g>
            <path
              d="M 50 12 C 78 22 90 52 80 82 C 68 94 42 94 24 78 C 12 56 22 24 50 12 Z"
              fill="url(#clayMintGradient)"
              filter="url(#clayShadow)"
            />
            {/* Highlight */}
            <path
              d="M 48 20 C 66 28 76 48 70 68 C 64 64 54 48 48 20 Z"
              fill="rgba(255, 255, 255, 0.55)"
            />
            {/* Stem */}
            <path
              d="M 50 35 Q 46 65 30 92"
              stroke="#235347"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            {renderFace(50, 62, 0.9)}
          </g>
        );

      case 'globe':
        return (
          <g>
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="url(#claySageGradient)"
              filter="url(#clayShadow)"
            />
            {/* Continents in Mint */}
            <path
              d="M 28 38 C 34 32 44 32 46 40 C 44 48 34 50 30 46 Z"
              fill="#DAF1DE"
              opacity="0.9"
            />
            <path
              d="M 56 32 C 66 28 74 36 72 46 C 68 54 58 52 56 42 Z"
              fill="#DAF1DE"
              opacity="0.9"
            />
            <path
              d="M 38 64 C 48 60 58 64 54 74 C 44 78 36 72 38 64 Z"
              fill="#DAF1DE"
              opacity="0.9"
            />
            {/* Gloss highlight */}
            <ellipse
              cx="40"
              cy="30"
              rx="18"
              ry="10"
              transform="rotate(-25 40 30)"
              fill="rgba(255, 255, 255, 0.5)"
            />
            {renderFace(50, 52, 0.95)}
          </g>
        );

      case 'tree':
        return (
          <g>
            {/* Trunk */}
            <rect
              x="44"
              y="60"
              width="12"
              height="30"
              rx="6"
              fill="#235347"
            />
            {/* Foliage layers */}
            <circle cx="50" cy="46" r="32" fill="url(#clayDarkGradient)" filter="url(#clayShadow)" />
            <circle cx="38" cy="38" r="22" fill="url(#claySageGradient)" />
            <circle cx="62" cy="38" r="22" fill="url(#clayMintGradient)" />
            <circle cx="50" cy="30" r="22" fill="url(#clayMintGradient)" />
            {/* Gloss */}
            <ellipse cx="44" cy="24" rx="10" ry="5" fill="rgba(255,255,255,0.6)" />
            {renderFace(50, 46, 0.85)}
          </g>
        );

      case 'drone':
        return (
          <g>
            {/* Rotor arms */}
            <line x1="20" y1="30" x2="80" y2="70" stroke="#163832" strokeWidth="6" strokeLinecap="round" />
            <line x1="20" y1="70" x2="80" y2="30" stroke="#163832" strokeWidth="6" strokeLinecap="round" />
            {/* 4 Rotors */}
            <ellipse cx="20" cy="30" rx="14" ry="4" fill="#8EB69B" />
            <ellipse cx="80" cy="30" rx="14" ry="4" fill="#8EB69B" />
            <ellipse cx="20" cy="70" rx="14" ry="4" fill="#8EB69B" />
            <ellipse cx="80" cy="70" rx="14" ry="4" fill="#8EB69B" />
            {/* Body */}
            <rect
              x="34"
              y="36"
              width="32"
              height="28"
              rx="14"
              fill="url(#clayMintGradient)"
              filter="url(#clayShadow)"
            />
            <ellipse cx="45" cy="42" rx="7" ry="4" fill="rgba(255,255,255,0.6)" />
            {renderFace(50, 50, 0.75)}
          </g>
        );

      case 'gps-pin':
        return (
          <g>
            <path
              d="M 50 14 C 32 14 20 28 20 44 C 20 62 46 88 50 90 C 54 88 80 62 80 44 C 80 28 68 14 50 14 Z"
              fill="url(#claySageGradient)"
              filter="url(#clayShadow)"
            />
            <circle cx="50" cy="42" r="20" fill="#DAF1DE" />
            <ellipse cx="42" cy="24" rx="8" ry="4" fill="rgba(255,255,255,0.6)" />
            {renderFace(50, 44, 0.8)}
          </g>
        );

      case 'qr-code':
        return (
          <g>
            <rect
              x="16"
              y="16"
              width="68"
              height="68"
              rx="20"
              fill="url(#clayMintGradient)"
              filter="url(#clayShadow)"
            />
            {/* Corner Markers */}
            <rect x="26" y="26" width="16" height="16" rx="5" fill="#163832" />
            <rect x="29" y="29" width="10" height="10" rx="3" fill="#DAF1DE" />
            <rect x="58" y="26" width="16" height="16" rx="5" fill="#163832" />
            <rect x="61" y="29" width="10" height="10" rx="3" fill="#DAF1DE" />
            <rect x="26" y="58" width="16" height="16" rx="5" fill="#163832" />
            <rect x="29" y="61" width="10" height="10" rx="3" fill="#DAF1DE" />
            {renderFace(56, 62, 0.75)}
          </g>
        );

      case 'camera':
        return (
          <g>
            {/* Camera Body */}
            <rect x="18" y="30" width="64" height="48" rx="16" fill="url(#clayDarkGradient)" filter="url(#clayShadow)" />
            {/* Flash bump */}
            <rect x="30" y="22" width="20" height="10" rx="4" fill="#235347" />
            {/* Lens */}
            <circle cx="50" cy="54" r="20" fill="url(#claySageGradient)" />
            <circle cx="50" cy="54" r="14" fill="#DAF1DE" />
            <ellipse cx="45" cy="46" rx="5" ry="3" fill="rgba(255,255,255,0.7)" />
            {renderFace(50, 54, 0.7)}
          </g>
        );

      case 'notebook':
        return (
          <g>
            <rect x="24" y="16" width="54" height="68" rx="12" fill="url(#claySageGradient)" filter="url(#clayShadow)" />
            <rect x="20" y="16" width="12" height="68" rx="6" fill="#163832" />
            {/* Rings */}
            <circle cx="20" cy="28" r="3" fill="#DAF1DE" />
            <circle cx="20" cy="44" r="3" fill="#DAF1DE" />
            <circle cx="20" cy="60" r="3" fill="#DAF1DE" />
            <circle cx="20" cy="74" r="3" fill="#DAF1DE" />
            {/* Gloss highlight */}
            <rect x="36" y="22" width="34" height="12" rx="6" fill="rgba(255,255,255,0.4)" />
            {renderFace(54, 52, 0.85)}
          </g>
        );

      case 'coin':
      case 'wallet':
        return (
          <g>
            <circle cx="50" cy="50" r="36" fill="url(#clayAmberGradient)" filter="url(#clayShadow)" />
            <circle cx="50" cy="50" r="30" fill="#F2B84B" stroke="#051F20" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
            <ellipse cx="40" cy="32" rx="16" ry="8" fill="rgba(255,255,255,0.55)" transform="rotate(-30 40 32)" />
            {renderFace(50, 50, 0.9)}
          </g>
        );

      case 'megaphone':
        return (
          <g>
            {/* Cone */}
            <path
              d="M 32 40 L 70 20 L 76 80 L 32 60 Z"
              fill="url(#clayMintGradient)"
              filter="url(#clayShadow)"
            />
            {/* Back bulb */}
            <circle cx="32" cy="50" r="14" fill="url(#claySageGradient)" />
            {/* Bell rim */}
            <ellipse cx="73" cy="50" rx="6" ry="30" fill="#163832" />
            <ellipse cx="73" cy="50" rx="3" ry="24" fill="#DAF1DE" />
            {/* Handle */}
            <rect x="38" y="58" width="10" height="22" rx="5" fill="#235347" />
            {renderFace(48, 50, 0.75)}
          </g>
        );

      case 'calendar':
        return (
          <g>
            {/* Calendar card */}
            <rect x="18" y="24" width="64" height="60" rx="18" fill="#FFFFFF" filter="url(#clayShadow)" />
            <rect x="18" y="24" width="64" height="22" rx="14" fill="url(#claySageGradient)" />
            {/* Rings */}
            <rect x="30" y="16" width="6" height="14" rx="3" fill="#163832" />
            <rect x="64" y="16" width="6" height="14" rx="3" fill="#163832" />
            {/* Highlight */}
            <rect x="22" y="28" width="56" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
            {renderFace(50, 62, 0.85)}
          </g>
        );

      case 'trophy':
        return (
          <g>
            {/* Cup */}
            <path
              d="M 28 22 L 72 22 C 72 46 62 60 50 62 C 38 60 28 46 28 22 Z"
              fill="url(#clayAmberGradient)"
              filter="url(#clayShadow)"
            />
            {/* Handles */}
            <path
              d="M 28 28 C 16 28 16 44 28 46"
              stroke="#F2B84B"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 72 28 C 84 28 84 44 72 46"
              stroke="#F2B84B"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Stem & Base */}
            <rect x="46" y="62" width="8" height="14" fill="#0B2B26" />
            <rect x="34" y="74" width="32" height="12" rx="6" fill="#163832" />
            <ellipse cx="44" cy="30" rx="10" ry="4" fill="rgba(255,255,255,0.6)" />
            {renderFace(50, 42, 0.75)}
          </g>
        );

      case 'clipboard':
        return (
          <g>
            <rect x="22" y="20" width="56" height="66" rx="14" fill="url(#claySageGradient)" filter="url(#clayShadow)" />
            <rect x="28" y="28" width="44" height="50" rx="8" fill="#FFFFFF" />
            {/* Top clip */}
            <rect x="38" y="14" width="24" height="10" rx="4" fill="#163832" />
            <circle cx="50" cy="18" r="2.5" fill="#DAF1DE" />
            {renderFace(50, 54, 0.8)}
          </g>
        );

      case 'shield':
        return (
          <g>
            <path
              d="M 50 14 C 70 14 80 24 80 44 C 80 66 50 88 50 88 C 50 88 20 66 20 44 C 20 24 30 14 50 14 Z"
              fill="url(#clayDarkGradient)"
              filter="url(#clayShadow)"
            />
            {/* Inner Crest */}
            <path
              d="M 50 20 C 66 20 74 28 74 44 C 74 62 50 80 50 80 C 50 80 26 62 26 44 C 26 28 34 20 50 20 Z"
              fill="url(#claySageGradient)"
            />
            <ellipse cx="42" cy="28" rx="8" ry="4" fill="rgba(255,255,255,0.5)" />
            {renderFace(50, 46, 0.85)}
          </g>
        );

      case 'magnifier':
        return (
          <g>
            {/* Handle */}
            <line x1="62" y1="62" x2="84" y2="84" stroke="#163832" strokeWidth="10" strokeLinecap="round" />
            {/* Glass Rim */}
            <circle cx="44" cy="44" r="28" fill="url(#clayMintGradient)" filter="url(#clayShadow)" stroke="#235347" strokeWidth="6" />
            <ellipse cx="36" cy="32" rx="12" ry="6" fill="rgba(255,255,255,0.6)" transform="rotate(-30 36 32)" />
            {renderFace(44, 46, 0.85)}
          </g>
        );

      case 'lock':
      default:
        return (
          <g>
            {/* Shackle */}
            <path
              d="M 34 40 L 34 26 C 34 16 66 16 66 26 L 66 40"
              stroke="#235347"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Body */}
            <rect x="22" y="38" width="56" height="48" rx="18" fill="url(#claySageGradient)" filter="url(#clayShadow)" />
            <ellipse cx="40" cy="46" rx="14" ry="6" fill="rgba(255,255,255,0.55)" />
            {renderFace(50, 60, 0.85)}
          </g>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${floating ? 'mascot-float' : ''} ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        ...style,
      }}
      aria-label={`${name} mascot`}
    >
      <svg
        viewBox="0 0 100 100"
        width={pixelSize}
        height={pixelSize}
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Gradients tailored to brand palette */}
          <linearGradient id="clayMintGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#DAF1DE" />
            <stop offset="100%" stopColor="#8EB69B" />
          </linearGradient>

          <linearGradient id="claySageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DAF1DE" />
            <stop offset="50%" stopColor="#8EB69B" />
            <stop offset="100%" stopColor="#235347" />
          </linearGradient>

          <linearGradient id="clayDarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#235347" />
            <stop offset="60%" stopColor="#163832" />
            <stop offset="100%" stopColor="#051F20" />
          </linearGradient>

          <linearGradient id="clayAmberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2D6" />
            <stop offset="40%" stopColor="#F2B84B" />
            <stop offset="100%" stopColor="#D9822B" />
          </linearGradient>

          {/* Soft Clay Diffused Shadow */}
          <filter id="clayShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="6"
              floodColor="#051F20"
              floodOpacity="0.16"
            />
          </filter>
        </defs>

        {renderGraphic()}
      </svg>
    </div>
  );
};

export default Mascot;
