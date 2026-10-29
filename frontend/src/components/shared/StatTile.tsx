import React from 'react';

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
  const getTintStyles = () => {
    switch (tint) {
      case 'mint':
      case 'teal':
        return {
          bg: '#DAF1DE',
          border: '1px solid #8EB69B',
        };
      case 'lavender':
        return {
          bg: '#DAF1DE',
          border: '1px solid #8EB69B',
        };
      case 'amber':
        return {
          bg: 'rgba(242, 184, 75, 0.14)',
          border: '1px solid rgba(242, 184, 75, 0.35)',
        };
      case 'sage':
        return {
          bg: 'rgba(142, 182, 155, 0.16)',
          border: '1px solid #8EB69B',
        };
      case 'white':
      default:
        return {
          bg: '#FFFFFF',
          border: '1px solid #DAF1DE',
        };
    }
  };

  const tintStyles = getTintStyles();

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`p-4 flex flex-col justify-between select-none transition-all ${
        onClick ? 'pressable cursor-pointer hover:shadow-md' : ''
      } ${className}`}
      style={{
        borderRadius: '24px',
        backgroundColor: tintStyles.bg,
        border: tintStyles.border,
        boxShadow: '0 8px 24px rgba(5, 31, 32, 0.06)',
        minHeight: '110px',
        ...style,
      }}
    >
      <div className="flex items-center justify-between">
        {/* 40px Circular White Icon Container with Soft Shadow */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#163832] shadow-[0_4px_12px_rgba(5,31,32,0.06)] border border-[#DAF1DE] shrink-0"
        >
          {icon}
        </div>

        {footnote && (
          <span
            className="text-xs font-semibold text-[#235347] max-w-[90px] truncate text-right"
          >
            {footnote}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div
          className="font-bold tracking-tight text-[#051F20]"
          style={{ fontSize: '24px', lineHeight: '28px' }}
        >
          {value}
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
