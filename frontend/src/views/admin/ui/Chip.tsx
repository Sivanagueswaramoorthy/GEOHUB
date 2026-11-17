import React from 'react';

export interface ChipProps {
  label: string;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  count,
  selected = false,
  onClick,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] inline-flex items-center justify-center px-0.5 py-1 focus:outline-none cursor-pointer shrink-0 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <span
        className={`h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all border ${
          selected
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        } ${className}`}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span
            className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
              selected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {count}
          </span>
        )}
      </span>
    </button>
  );
};

export default Chip;
