import React from 'react';

export interface ShortcutTileProps {
  label: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconBorder?: string;
  iconColor?: string;
  badge?: string | number;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ShortcutTile: React.FC<ShortcutTileProps> = ({
  label,
  icon,
  iconBg = '#E7F9F1',
  iconBorder = '#A7F3D0',
  iconColor = '#065F46',
  badge,
  onClick,
  className = '',
  style,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-[#EEF1F5] shadow-[0_2px_8px_rgba(15,23,42,0.03)] cursor-pointer hover:border-[#10B981] hover:scale-105 transition-all duration-150 ${className}`}
      style={{
        minWidth: '72px',
        ...style,
      }}
    >
      {badge !== undefined && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center px-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold bg-[#EF4444] text-white shadow-sm"
        >
          {badge}
        </span>
      )}

      {/* Icon Square */}
      <div
        className="flex items-center justify-center mb-1.5"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          backgroundColor: iconBg,
          border: `1px solid ${iconBorder}`,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className="text-[11.5px] font-bold text-slate-800 text-center leading-tight line-clamp-1"
        style={{ fontFamily: 'var(--font-family)' }}
      >
        {label}
      </span>
    </button>
  );
};
