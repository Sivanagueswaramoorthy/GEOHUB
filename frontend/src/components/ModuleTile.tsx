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
      className={`relative overflow-hidden flex flex-col justify-between p-4 rounded-[20px] bg-white border border-[#EEF1F5] shadow-[0_4px_16px_rgba(15,23,42,0.04)] cursor-pointer group transition-all duration-150 hover:border-[#10B981] hover:scale-[1.01] ${className}`}
      style={{
        minHeight: '132px',
        ...style,
      }}
    >
      {/* Faint concentric-circle decoration in the top-right corner */}
      <div
        className="absolute -top-6 -right-6 pointer-events-none opacity-40"
        style={{ width: '80px', height: '80px' }}
      >
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="80" cy="0" r="70" stroke={accentColor} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          <circle cx="80" cy="0" r="50" stroke={accentColor} strokeWidth="1" opacity="0.3" />
          <circle cx="80" cy="0" r="30" stroke={accentColor} strokeWidth="1.2" opacity="0.5" />
        </svg>
      </div>

      {/* Top Row: Tinted Icon Square and Optional Badge */}
      <div className="flex items-start justify-between z-10">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: iconBg,
            border: `1px solid ${iconBorder}`,
            color: accentColor,
          }}
        >
          {icon}
        </div>

        {badge && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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
      <div className="z-10 mt-3">
        <h4
          className="font-extrabold text-slate-900 text-sm leading-tight mb-1.5"
          style={{ fontFamily: 'var(--font-family)' }}
        >
          {title}
        </h4>

        <div
          className="inline-flex items-center gap-1 font-bold text-xs group-hover:translate-x-0.5 transition-transform"
          style={{ color: accentColor }}
        >
          <span>Open module</span>
          <ChevronRight size={13} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
