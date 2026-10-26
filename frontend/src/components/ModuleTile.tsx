import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface LeadUpdateInfo {
  leadName: string;
  leadRole: string;
  updateText: string;
  timeAgo: string;
  badge?: string;
  statusColor?: string;
}

export interface ModuleTileProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  accentColor: string;
  badge?: string;
  metric?: string;
  leadUpdate?: LeadUpdateInfo;
  onClick: () => void;
  onAuditClick?: (e: React.MouseEvent) => void;
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
  metric,
  leadUpdate,
  onClick,
  onAuditClick,
  className = '',
  style,
}) => {
  const handleTileClick = (e: React.MouseEvent) => {
    if (onAuditClick) {
      onAuditClick(e);
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleTileClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onAuditClick) {
            onAuditClick(e as unknown as React.MouseEvent);
          } else {
            onClick();
          }
        }
      }}
      className={`relative overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-white border border-[#E2E8F0] cursor-pointer group transition-all duration-200 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 active:translate-y-0 text-left select-none ${className}`}
      style={{
        aspectRatio: '1 / 1',
        minHeight: '142px',
        background: `radial-gradient(130px 100px at 15% 15%, ${accentColor}10 0%, transparent 80%), #FFFFFF`,
        ...style,
      }}
    >
      {/* Top subtle ambient highlight line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
        }}
      />

      {/* Top Row: Floating Squircle Icon */}
      <div className="flex items-start justify-between relative z-10 w-full mb-1">
        {/* Modern Elevated Squircle Icon (38x38) */}
        <div
          className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: `linear-gradient(135deg, ${iconBg} 0%, #FFFFFF 100%)`,
            border: `1px solid ${iconBorder}`,
            color: accentColor,
            boxShadow: `0 3px 10px ${accentColor}18`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Center Title */}
      <div className="relative z-10 w-full my-auto py-1">
        <h4
          className="font-extrabold text-slate-900 tracking-tight text-[12.5px] sm:text-[13.5px] leading-snug line-clamp-2"
          style={{ fontFamily: 'var(--font-family)', wordBreak: 'break-word' }}
        >
          {title}
        </h4>
      </div>

      {/* Bottom Area: Action Button */}
      <div className="relative z-10 w-full pt-1 flex items-center justify-between">
        <span
          className="font-bold text-[10.5px] sm:text-[11px] tracking-tight group-hover:text-slate-900 transition-colors truncate pr-1"
          style={{ color: accentColor }}
        >
          {leadUpdate ? 'Open portal' : 'Open module'}
        </span>

        {/* Sleek Circular Arrow Launch Button */}
        <div
          className="flex items-center justify-center rounded-full shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          style={{
            width: '26px',
            height: '26px',
            backgroundColor: `${accentColor}14`,
            color: accentColor,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <ArrowUpRight size={14} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

