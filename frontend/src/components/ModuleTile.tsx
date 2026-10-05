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
      {/* Decorative radiating arcs emanating from behind the top-left icon */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 160 144"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Inner solid arc brushing outer edge of icon box */}
          <circle
            cx="38"
            cy="40"
            r="44"
            stroke={accentColor}
            strokeWidth="1.2"
            opacity="0.38"
          />
          {/* Middle solid arc curving towards badge */}
          <circle
            cx="38"
            cy="40"
            r="70"
            stroke={accentColor}
            strokeWidth="1.2"
            opacity="0.32"
          />
          {/* Prominent dashed ripple curving behind title */}
          <circle
            cx="38"
            cy="40"
            r="98"
            stroke={accentColor}
            strokeWidth="1.4"
            strokeDasharray="3 4"
            opacity="0.45"
          />
          {/* Outer soft dashed ripple */}
          <circle
            cx="38"
            cy="40"
            r="128"
            stroke={accentColor}
            strokeWidth="1.1"
            strokeDasharray="2 4"
            opacity="0.22"
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
