import React from 'react';
import { AnimatedNumber } from './AnimatedNumber';

export interface StatTileProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  footnote?: string;
  tint?: 'mint' | 'amber' | 'sage' | 'white' | 'lavender' | 'teal' | 'emerald';
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
      case 'emerald':
        return {
          bg: '#DAF1DE',
          color: '#163832',
          border: '1px solid #DAF1DE',
          footnoteColor: '#163832',
          valueColor: '#163832',
        };
      case 'teal':
        return {
          bg: '#DAF1DE',
          color: '#235347',
          border: '1px solid #DAF1DE',
          footnoteColor: '#235347',
          valueColor: '#051F20',
        };
      case 'amber':
        return {
          bg: 'rgba(242, 184, 75, 0.14)',
          color: '#F2B84B',
          border: '1px solid rgba(242, 184, 75, 0.40)',
          footnoteColor: '#F2B84B',
          valueColor: '#051F20',
        };
      case 'mint':
        return {
          bg: '#DAF1DE',
          color: '#163832',
          border: '1px solid #DAF1DE',
          footnoteColor: '#163832',
          valueColor: '#051F20',
        };
      case 'sage':
        return {
          bg: '#DAF1DE',
          color: '#163832',
          border: '1px solid #DAF1DE',
          footnoteColor: '#235347',
          valueColor: '#051F20',
        };
      case 'white':
      default:
        return {
          bg: '#DAF1DE',
          color: '#163832',
          border: '1px solid #DAF1DE',
          footnoteColor: '#235347',
          valueColor: '#051F20',
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
        onClick ? 'pressable cursor-pointer hover:border-[#163832]/40 hover:shadow-md' : ''
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
        {/* 40px Circular Icon Container with Mint Wash Background */}
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
            className="text-xs font-semibold max-w-[90px] truncate text-right px-2 py-0.5 rounded-full border border-[#DAF1DE]"
            style={{
              backgroundColor: '#F6FBF7',
              color: badgeStyles.footnoteColor || '#235347',
            }}
          >
            {footnote}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div
          className="font-extrabold tracking-tight"
          style={{
            fontSize: '24px',
            lineHeight: '28px',
            color: badgeStyles.valueColor || '#051F20',
          }}
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
