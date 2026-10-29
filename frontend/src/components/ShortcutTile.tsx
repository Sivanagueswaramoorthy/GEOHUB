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
  iconBg = '#DAF1DE',
  iconBorder = '#8EB69B',
  iconColor = '#163832',
  badge,
  onClick,
  className = '',
  style,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-2.5 rounded-[20px] bg-white border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.06)] cursor-pointer hover:border-[#8EB69B] hover:scale-105 transition-all duration-150 ${className}`}
      style={{
        minWidth: '76px',
        ...style,
      }}
    >
      {badge !== undefined && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center px-2 min-w-[20px] h-[20px] rounded-full text-[11px] font-bold bg-[#D9534F] text-white shadow-sm"
        >
          {badge}
        </span>
      )}

      {/* Circular Icon (40px container) */}
      <div
        className="flex items-center justify-center mb-1.5"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '9999px',
          backgroundColor: '#FFFFFF',
          border: `1px solid #DAF1DE`,
          color: '#163832',
          boxShadow: '0 4px 12px rgba(5,31,32,0.06)',
        }}
      >
        {icon}
      </div>

      {/* Label (Caption 12px) */}
      <span
        className="text-[12px] font-bold text-[#051F20] text-center line-clamp-1"
        style={{ fontFamily: 'var(--font-family)' }}
      >
        {label}
      </span>
    </button>
  );
};
