import React from 'react';

export interface StatChipProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const StatChip: React.FC<StatChipProps> = ({
  label,
  onClick,
  icon,
  active = false,
  className = '',
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={`min-h-[44px] h-[44px] px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-2 shrink-0 transition-all cursor-pointer focus:outline-none ${
        active
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs ring-1 ring-emerald-300/50'
          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default StatChip;
