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
          bg: '#E3F1E8',
          color: '#1E9E63',
          border: '1px solid #DCE6E0',
          footnoteColor: '#1E9E63',
          valueColor: '#1E9E63',
        };
      case 'teal':
        return {
          bg: '#E3F1E8',
          color: '#1B6B7A',
          border: '1px solid #DCE6E0',
          footnoteColor: '#1B6B7A',
          valueColor: '#11241B',
        };
      case 'amber':
        return {
          bg: '#E3F1E8',
          color: '#D99B26',
          border: '1px solid #DCE6E0',
          footnoteColor: '#D99B26',
          valueColor: '#11241B',
        };
      case 'mint':
        return {
          bg: '#E3F1E8',
          color: '#183A2B',
          border: '1px solid #DCE6E0',
          footnoteColor: '#183A2B',
        };
      case 'sage':
        return {
          bg: '#E3F1E8',
          color: '#183A2B',
          border: '1px solid #DCE6E0',
          footnoteColor: '#52665C',
        };
      case 'white':
      default:
        return {
          bg: '#E3F1E8',
          color: '#183A2B',
          border: '1px solid #DCE6E0',
          footnoteColor: '#52665C',
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
        onClick ? 'pressable cursor-pointer hover:border-[#183A2B]/40 hover:shadow-md' : ''
      } ${className}`}
      style={{
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #DCE6E0',
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
            className="text-xs font-semibold max-w-[90px] truncate text-right px-2 py-0.5 rounded-full border border-[#DCE6E0]"
            style={{
              backgroundColor: '#F6F9F7',
              color: badgeStyles.footnoteColor || '#52665C',
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
            color: badgeStyles.valueColor || '#11241B',
          }}
        >
          <AnimatedNumber value={value} />
        </div>
        <div
          className="text-xs font-semibold text-[#52665C] mt-0.5 truncate"
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatTile;
