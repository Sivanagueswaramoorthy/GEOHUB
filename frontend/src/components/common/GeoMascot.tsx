import React from 'react';

interface GeoMascotProps {
  size?: number;
  className?: string;
  waving?: boolean;
}

export const GeoMascot: React.FC<GeoMascotProps> = ({ size = 64, className = '', waving = true }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        filter: 'drop-shadow(0 8px 16px rgba(16, 185, 129, 0.25))',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Body Gradient: Vibrant Lightgreen / Emerald to Mint */}
          <linearGradient id="mascotBodyGrad" x1="20" y1="15" x2="100" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Belly Soft Glow Gradient */}
          <linearGradient id="bellyGlow" x1="60" y1="60" x2="60" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ECFDF5" stopOpacity="0.8" />
          </linearGradient>

          {/* Cheek Blush Gradient */}
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
          </radialGradient>

          {/* Leaf / Sprout Gradient */}
          <linearGradient id="leafGrad" x1="60" y1="2" x2="75" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Little Sprout / Antenna on Head */}
        <path
          d="M60 28 C60 14, 68 8, 76 6 C76 16, 68 24, 60 28 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M60 28 C56 16, 48 12, 42 12 C44 22, 54 26, 60 28 Z"
          fill="#86EFAC"
        />
        <circle cx="60" cy="27" r="2.5" fill="#047857" />

        {/* Waving Left Hand (Right Arm visually) */}
        {waving ? (
          <g>
            <path
              d="M92 65 C104 55, 114 42, 110 38 C105 34, 96 46, 88 56 Z"
              fill="url(#mascotBodyGrad)"
            />
            {/* Hand wave sparkle */}
            <circle cx="112" cy="36" r="3" fill="#FDE047" opacity="0.9" />
          </g>
        ) : (
          <path
            d="M90 68 C98 72, 104 80, 102 85 C99 88, 92 82, 88 76 Z"
            fill="url(#mascotBodyGrad)"
          />
        )}

        {/* Resting Left Arm */}
        <path
          d="M30 68 C22 72, 16 80, 18 85 C21 88, 28 82, 32 76 Z"
          fill="url(#mascotBodyGrad)"
        />

        {/* Cute Mascot Main Body: Round Chubby Gumdrop / Blob Shape */}
        <path
          d="M60 25 C32 25, 20 50, 20 75 C20 98, 38 108, 60 108 C82 108, 100 98, 100 75 C100 50, 88 25, 60 25 Z"
          fill="url(#mascotBodyGrad)"
        />

        {/* Soft Belly Light Highlight */}
        <ellipse cx="60" cy="80" rx="26" ry="20" fill="url(#bellyGlow)" />

        {/* Cheeks: Soft Rosy Glow */}
        <ellipse cx="38" cy="67" rx="6" ry="4" fill="url(#cheekBlush)" />
        <ellipse cx="82" cy="67" rx="6" ry="4" fill="url(#cheekBlush)" />

        {/* Eyes: Glossy, Friendly Big Anime/Kawaii Eyes */}
        {/* Left Eye */}
        <ellipse cx="46" cy="57" rx="6.5" ry="8" fill="#064E3B" />
        <ellipse cx="44.5" cy="54" rx="2.5" ry="3.5" fill="#FFFFFF" />
        <circle cx="48" cy="60" r="1.2" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="74" cy="57" rx="6.5" ry="8" fill="#064E3B" />
        <ellipse cx="72.5" cy="54" rx="2.5" ry="3.5" fill="#FFFFFF" />
        <circle cx="76" cy="60" r="1.2" fill="#FFFFFF" />

        {/* Mouth: Cheerful Happy Smile */}
        <path
          d="M54 67 Q60 74 66 67"
          stroke="#064E3B"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tiny Star / Sparkle in Top Corner */}
        <path
          d="M32 38 L34 32 L36 38 L42 40 L36 42 L34 48 L32 42 L26 40 Z"
          fill="#FEF08A"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};
