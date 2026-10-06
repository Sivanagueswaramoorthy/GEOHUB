import React from 'react';
import { ArrowUpRight } from 'lucide-react';

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
      className={`relative overflow-hidden flex flex-col justify-between p-4 sm:p-[18px] rounded-[22px] bg-white border border-[#E2E8F0] cursor-pointer group transition-all duration-250 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 active:translate-y-0 text-left select-none ${className}`}
      style={{
        aspectRatio: '1 / 0.95',
        minHeight: '144px',
        background: `radial-gradient(180px 140px at 15% 15%, ${accentColor}12 0%, transparent 80%), #FFFFFF`,
        ...style,
      }}
    >
      {/* Top subtle ambient highlight line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-250"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
        }}
      />

      {/* Top Row: Floating Squircle Icon and Modern Pill Badge */}
      <div className="flex items-start justify-between relative z-10 w-full">
        {/* Modern Elevated Squircle Icon */}
        <div
          className="flex items-center justify-center shrink-0 transition-transform duration-250 group-hover:scale-105"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${iconBg} 0%, #FFFFFF 100%)`,
            border: `1.5px solid ${iconBorder}`,
            color: accentColor,
            boxShadow: `0 4px 12px ${accentColor}18`,
          }}
        >
          {icon}
        </div>

        {/* Live Status Pill Badge with glowing dot */}
        {badge && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full truncate max-w-[105px] shadow-xs backdrop-blur-xs"
            style={{
              backgroundColor: iconBg,
              color: accentColor,
              border: `1px solid ${iconBorder}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span className="truncate">{badge}</span>
          </span>
        )}
      </div>

      {/* Bottom Area: Title and Sleek Action Button */}
      <div className="relative z-10 mt-3 w-full">
        <h4
          className="font-extrabold text-slate-900 text-[15px] sm:text-base leading-snug mb-2 line-clamp-2 tracking-tight"
          style={{ fontFamily: 'var(--font-family)', wordBreak: 'break-word' }}
        >
          {title}
        </h4>

        <div className="flex items-center justify-between pt-0.5">
          <span
            className="font-bold text-xs sm:text-[13px] tracking-tight group-hover:text-slate-900 transition-colors"
            style={{ color: accentColor }}
          >
            Open module
          </span>

          {/* Sleek Circular Arrow Launch Button */}
          <div
            className="flex items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
            style={{
              width: '26px',
              height: '26px',
              backgroundColor: `${accentColor}14`,
              color: accentColor,
              border: `1px solid ${accentColor}25`,
            }}
          >
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
};
