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
      className={`relative overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 rounded-[24px] bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] cursor-pointer group transition-all duration-200 hover:border-[#8EB69B] hover:shadow-[0_14px_36px_rgba(5,31,32,0.1)] hover:-translate-y-0.5 active:translate-y-0 text-left select-none ${className}`}
      style={{
        aspectRatio: '1 / 1',
        minHeight: '142px',
        background: `radial-gradient(130px 100px at 15% 15%, #DAF1DE50 0%, transparent 80%), #FFFFFF`,
        ...style,
      }}
    >
      {/* Top Row: Floating Circular Icon */}
      <div className="flex items-start justify-between relative z-10 w-full mb-1">
        <div
          className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '9999px',
            background: '#FFFFFF',
            border: '1px solid #DAF1DE',
            color: '#163832',
            boxShadow: '0 4px 12px rgba(5,31,32,0.06)',
          }}
        >
          {icon}
        </div>
      </div>

      {/* Center Title */}
      <div className="relative z-10 w-full my-auto py-1">
        <h4
          className="font-extrabold text-[#051F20] tracking-tight text-[13px] sm:text-[14px] leading-snug line-clamp-2"
          style={{ fontFamily: 'var(--font-family)', wordBreak: 'break-word' }}
        >
          {title}
        </h4>
      </div>

      {/* Bottom Area: Action Button */}
      <div className="relative z-10 w-full pt-1 flex items-center justify-between">
        <span
          className="font-bold text-[11px] tracking-tight text-[#235347] group-hover:text-[#051F20] transition-colors truncate pr-1"
        >
          {leadUpdate ? 'Open' : 'View'}
        </span>

        {/* Circular Arrow Launch Button */}
        <div
          className="flex items-center justify-center rounded-full shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: '#DAF1DE',
            color: '#163832',
            border: '1px solid #8EB69B',
          }}
        >
          <ArrowUpRight size={14} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

