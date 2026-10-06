import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface ModuleTileProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  accentColor: string;
  badge?: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ModuleTile: React.FC<ModuleTileProps> = ({
  title,
  icon,
  iconBg,
  iconBorder,
  accentColor,
  badge,
  onClick,
  className = '',
  style,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative overflow-hidden flex flex-col justify-between p-4 sm:p-[18px] rounded-[22px] bg-white border border-[#E2E8F0] shadow-[0_2px_12px_rgba(15,23,42,0.03)] cursor-pointer group transition-all duration-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)] hover:scale-[1.015] active:scale-[0.985] text-left select-none ${className}`}
      style={{
        aspectRatio: '1 / 0.95',
        minHeight: '144px',
        ...style,
      }}
    >
      {/* Decorative radiating concentric pattern centered precisely at the top-left icon */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <svg
          className="absolute pointer-events-none"
          style={{
            top: '38px',
            left: '38px',
            width: '400px',
            height: '400px',
            transform: 'translate(-50%, -50%)',
          }}
          viewBox="0 0 400 400"
          fill="none"
        >
          {/* Ring 1 (Inner solid): brushes outer border of the squircle icon */}
          <circle
            cx="200"
            cy="200"
            r="34"
            stroke={accentColor}
            strokeWidth="1"
            opacity="0.32"
          />
          {/* Ring 2 (Middle solid): curves outward */}
          <circle
            cx="200"
            cy="200"
            r="58"
            stroke={accentColor}
            strokeWidth="1"
            opacity="0.28"
          />
          {/* Ring 3 (Outer solid): passes through badge zone */}
          <circle
            cx="200"
            cy="200"
            r="84"
            stroke={accentColor}
            strokeWidth="1"
            opacity="0.22"
          />
          {/* Ring 4 (DASHED / DOTTED): prominent ripple sweeping behind title */}
          <circle
            cx="200"
            cy="200"
            r="112"
            stroke={accentColor}
            strokeWidth="1.3"
            strokeDasharray="3 4"
            opacity="0.45"
          />
          {/* Ring 5 (Outer faint solid): curves near card edge */}
          <circle
            cx="200"
            cy="200"
            r="142"
            stroke={accentColor}
            strokeWidth="1"
            opacity="0.18"
          />
          {/* Ring 6 (Outer faint dashed): soft ripple in corner */}
          <circle
            cx="200"
            cy="200"
            r="176"
            stroke={accentColor}
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.12"
          />
        </svg>
      </div>

      {/* Top Row: Tinted Squircle Icon and Badge */}
      <div className="flex items-start justify-between relative z-10 w-full">
        <div
          className="flex items-center justify-center shrink-0 shadow-xs"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: iconBg,
            border: `1.5px solid ${iconBorder}`,
            color: accentColor,
          }}
        >
          {icon}
        </div>

        {badge && (
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs truncate max-w-[95px]"
            style={{
              backgroundColor: iconBg,
              color: accentColor,
              border: `1px solid ${iconBorder}`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Bottom Area: Title and Open module > link */}
      <div className="relative z-10 mt-3 w-full">
        <h4
          className="font-extrabold text-slate-900 text-[15px] sm:text-base leading-snug mb-1.5 line-clamp-2"
          style={{ fontFamily: 'var(--font-family)', wordBreak: 'break-word' }}
        >
          {title}
        </h4>

        <div
          className="inline-flex items-center gap-1 font-bold text-xs sm:text-[13px] group-hover:translate-x-1 transition-transform"
          style={{ color: accentColor }}
        >
          <span>Open module</span>
          <ChevronRight size={14} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
