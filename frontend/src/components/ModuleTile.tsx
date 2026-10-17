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
      className={`relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 rounded-[22px] bg-white border border-[#E2E8F0] cursor-pointer group transition-all duration-250 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 active:translate-y-0 text-left select-none ${className}`}
      style={{
        minHeight: leadUpdate ? '210px' : '168px',
        background: `radial-gradient(180px 140px at 15% 15%, ${accentColor}12 0%, transparent 80%), #FFFFFF`,
        ...style,
      }}
    >
      {/* Top subtle ambient highlight line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-250"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
        }}
      />

      {/* Top Row: Floating Squircle Icon + Badge / Metric */}
      <div className="flex items-start justify-between relative z-10 w-full mb-2.5">
        {/* Modern Elevated Squircle Icon (module 44x44 r12 per spec) */}
        <div
          className="flex items-center justify-center shrink-0 transition-transform duration-250 group-hover:scale-105"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${iconBg} 0%, #FFFFFF 100%)`,
            border: `1px solid ${iconBorder}`,
            color: accentColor,
            boxShadow: `0 4px 12px ${accentColor}18`,
          }}
        >
          {icon}
        </div>

        {/* Status Badge / Metric Pill */}
        {(metric || badge || leadUpdate?.badge) && (
          <span
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs tracking-tight"
            style={{
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}30`,
              color: accentColor,
            }}
          >
            {leadUpdate?.badge || metric || badge}
          </span>
        )}
      </div>

      {/* Title */}
      <div className="relative z-10 w-full">
        <h4
          className="font-extrabold text-slate-900 font-subtitle mb-2 line-clamp-2 tracking-tight"
          style={{ fontFamily: 'var(--font-family)', wordBreak: 'break-word' }}
        >
          {title}
        </h4>

        {/* Respective Team Lead Live Update Box */}
        {leadUpdate && (
          <div
            onClick={(e) => {
              if (onAuditClick) {
                e.stopPropagation();
                onAuditClick(e);
              }
            }}
            className="p-2.5 rounded-[14px] border mb-3 transition-all hover:bg-slate-100/90 active:scale-[0.99] cursor-pointer"
            style={{
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
            }}
            title={`Lead Update: ${leadUpdate.leadName} (${leadUpdate.leadRole}) - Click to inspect`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="text-[11px] font-extrabold text-slate-800 truncate">
                  {leadUpdate.leadName}
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0"
                  style={{
                    backgroundColor: '#E2E8F0',
                    color: '#475569',
                  }}
                >
                  {leadUpdate.leadRole}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                {leadUpdate.timeAgo}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-700 line-clamp-2 leading-snug m-0">
              "{leadUpdate.updateText}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Area: Action Button */}
      <div className="relative z-10 w-full mt-auto pt-1 flex items-center justify-between">
        <span
          className="font-bold font-small tracking-tight group-hover:text-slate-900 transition-colors"
          style={{ color: accentColor }}
        >
          {leadUpdate ? 'Open portal' : 'Open module'}
        </span>

        {/* Sleek Circular Arrow Launch Button */}
        <div
          className="flex items-center justify-center rounded-full shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: `${accentColor}14`,
            color: accentColor,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
};

