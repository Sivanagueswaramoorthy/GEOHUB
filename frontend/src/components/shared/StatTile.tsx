import React from 'react';
import { AnimatedNumber } from './AnimatedNumber';

export interface StatTileProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  footnote?: string;
  tint?: 'mint' | 'amber' | 'sage' | 'white' | 'lavender' | 'teal';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const StatTile: React.FC<StatTileProps> = ({
  icon,
  value,
  label,
  footnote,
  tint = 'white',
  onClick,
  className = '',
  style,
}) => {
  const getBadgeStyles = () => {
    switch (tint) {
      case 'mint':
      case 'teal':
        return {
          bg: 'rgba(24, 78, 80, 0.08)',
          color: '#184E50',
          border: '1px solid rgba(24, 78, 80, 0.12)',
        };
      case 'amber':
        return {
          bg: 'rgba(212, 163, 89, 0.15)',
          color: '#D4A359',
          border: '1px solid rgba(212, 163, 89, 0.25)',
        };
      case 'sage':
        return {
          bg: 'rgba(107, 142, 120, 0.15)',
          color: '#52705E',
          border: '1px solid rgba(107, 142, 120, 0.25)',
        };
      case 'white':
      default:
        return {
          bg: '#F8FAF9',
          color: '#184E50',
          border: '1px solid #E5ECE8',
        };
    }
  };

  const badgeStyles = getBadgeStyles();

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`p-4 flex flex-col justify-between select-none transition-all ${
        onClick ? 'pressable cursor-pointer hover:border-[#184E50]/30 hover:shadow-md' : ''
      } ${className}`}
      style={{
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5ECE8',
        boxShadow: '0 4px 16px -2px rgba(15, 54, 56, 0.05)',
        minHeight: '110px',
        ...style,
      }}
    >
      <div className="flex items-center justify-between">
        {/* 40px Circular Icon Container with Botanical Badge Accent */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-transform"
          style={{
            backgroundColor: badgeStyles.bg,
            color: badgeStyles.color,
            border: badgeStyles.border,
          }}
        >
          {icon}
        </div>

        {footnote && (
          <span
            className="text-[11px] font-semibold text-[#52705E] max-w-[90px] truncate text-right px-2 py-0.5 rounded-full bg-[#F8FAF9] border border-[#E5ECE8]"
          >
            {footnote}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div
          className="font-extrabold tracking-tight text-[#0F3638]"
          style={{ fontSize: '24px', lineHeight: '28px' }}
        >
          <AnimatedNumber value={value} />
        </div>
        <div
          className="text-xs font-semibold text-[#52705E] mt-0.5 truncate"
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatTile;
