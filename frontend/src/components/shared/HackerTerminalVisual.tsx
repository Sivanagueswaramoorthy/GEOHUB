import React from 'react';

export interface HackerTerminalVisualProps {
  className?: string;
  size?: number;
  isPinging?: boolean;
}

export const HackerTerminalVisual: React.FC<HackerTerminalVisualProps> = ({
  className = '',
  size = 56,
  isPinging = false,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 select-none ${className}`}
      title="SuperAdmin Cyber Terminal Engine"
    >
      {/* Outer Radar Sonar Pulse Ring */}
      <div
        style={{
          borderColor: '#8EB69B',
          backgroundColor: 'rgba(218, 241, 222, 0.18)',
        }}
        className={`absolute -inset-1.5 rounded-2xl border ${
          isPinging ? 'animate-ping' : 'animate-pulse'
        } opacity-40 pointer-events-none`}
      />

      {/* SVG Hacker Visual */}
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-xs"
      >
        {/* Cyber Shield Outer Hexagon Background */}
        <rect
          x="2"
          y="2"
          width="76"
          height="76"
          rx="18"
          fill="#0B2B26"
          stroke="#8EB69B"
          strokeWidth="1.8"
        />

        {/* Subtle Matrix Circuit Grid Lines */}
        <path
          d="M10 20 H70 M10 40 H70 M10 60 H70 M20 10 V70 M40 10 V70 M60 10 V70"
          stroke="#163832"
          strokeWidth="0.8"
          strokeDasharray="2 4"
        />

        {/* Floating Matrix Code Glyphs */}
        <text
          x="10"
          y="25"
          fill="#8EB69B"
          fontSize="12"
          fontFamily="monospace"
          fontWeight="bold"
          opacity="0.5"
          className="animate-pulse"
        >
          01
        </text>
        <text
          x="60"
          y="25"
          fill="#8EB69B"
          fontSize="12"
          fontFamily="monospace"
          fontWeight="bold"
          opacity="0.5"
        >
          &gt;_
        </text>

        {/* Hacker Hoodie Outline / Shoulders */}
        <path
          d="M16 68 C18 56, 26 48, 32 46 C35 45, 45 45, 48 46 C54 48, 62 56, 64 68 Z"
          fill="#051F20"
          stroke="#163832"
          strokeWidth="1.5"
        />

        {/* Hacker Hood / Cowl */}
        <path
          d="M24 48 C24 30, 32 20, 40 20 C48 20, 56 30, 56 48 C52 50, 48 51, 40 51 C32 51, 28 50, 24 48 Z"
          fill="#163832"
          stroke="#8EB69B"
          strokeWidth="1.2"
        />

        {/* Cyber Visor Mask / Screen */}
        <path
          d="M28 34 C28 32, 52 32, 52 34 C52 40, 48 43, 40 43 C32 43, 28 40, 28 34 Z"
          fill="#051F20"
          stroke="#DAF1DE"
          strokeWidth="1.2"
        />

        {/* Glowing Cyan/Mint Visor Display Beam */}
        <rect
          x="30"
          y="35"
          width="20"
          height="5"
          rx="2.5"
          fill="#DAF1DE"
          className="animate-pulse"
        />

        {/* Cyber Laser Scanline running across Visor */}
        <line
          x1="30"
          y1="37.5"
          x2="50"
          y2="37.5"
          stroke="#163832"
          strokeWidth="1.2"
          strokeDasharray="3 2"
        />

        {/* SA Root Authority Chestplate Emblem */}
        <rect
          x="30"
          y="54"
          width="20"
          height="14"
          rx="4"
          fill="#DAF1DE"
          stroke="#163832"
          strokeWidth="1"
        />
        <text
          x="40"
          y="65"
          textAnchor="middle"
          fill="#051F20"
          fontSize="12"
          fontFamily="monospace"
          fontWeight="900"
          letterSpacing="0.5"
        >
          SA
        </text>

        {/* Antenna / Status Cyber Beacon Node */}
        <circle cx="56" cy="22" r="2.5" fill="#DAF1DE" />
        <circle
          cx="56"
          cy="22"
          r="5"
          fill="#DAF1DE"
          className="animate-ping"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};

export default HackerTerminalVisual;
