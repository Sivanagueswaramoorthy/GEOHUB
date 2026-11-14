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
          bg: 'rgba(22, 56, 50, 0.08)',
          color: '#163832',
          border: '1px solid rgba(22, 56, 50, 0.12)',
        };
      case 'amber':
        return {
          bg: 'rgba(212, 163, 89, 0.15)',
          color: '#D4A359',
          border: '1px solid rgba(212, 163, 89, 0.25)',
        };
      case 'sage':
        return {
          bg: 'rgba(142, 182, 155, 0.15)',
          color: '#235347',
          border: '1px solid rgba(142, 182, 155, 0.25)',
        };
      case 'white':
      default:
        return {
          bg: '#F6FBF7',
          color: '#163832',
          border: '1px solid #DAF1DE',
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
        onClick ? 'pressable cursor-pointer hover:border-[#163832]/30 hover:shadow-md' : ''
      } ${className}`}
      style={{
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #DAF1DE',
        boxShadow: '0 4px 16px -2px rgba(5, 31, 32, 0.05)',
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
            className="text-[11px] font-semibold text-[#235347] max-w-[90px] truncate text-right px-2 py-0.5 rounded-full bg-[#F6FBF7] border border-[#DAF1DE]"
          >
            {footnote}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div
          className="font-extrabold tracking-tight text-[#051F20]"
          style={{ fontSize: '24px', lineHeight: '28px' }}
        >
          <AnimatedNumber value={value} />
        </div>
        <div
          className="text-xs font-semibold text-[#235347] mt-0.5 truncate"
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatTile;
