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
      className={`relative flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_2px_8px_rgba(15,23,42,0.03)] cursor-pointer hover:border-[#10B981] hover:scale-105 transition-all duration-150 ${className}`}
      style={{
        minWidth: '72px',
        ...style,
      }}
    >
      {badge !== undefined && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center px-2 min-w-[20px] h-[20px] rounded-full text-[11px] font-bold bg-[#EF4444] text-white shadow-sm"
        >
          {badge}
        </span>
      )}

      {/* Icon Square (44px container, radius 12px) */}
      <div
        className="flex items-center justify-center mb-1"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: iconBg,
          border: `1px solid ${iconBorder}`,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      {/* Label (Caption 12px) */}
      <span
        className="font-caption font-semibold text-slate-800 text-center line-clamp-1"
        style={{ fontFamily: 'var(--font-family)' }}
      >
        {label}
      </span>
    </button>
  );
};
