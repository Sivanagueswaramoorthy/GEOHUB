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
      className={`min-h-[44px] inline-flex items-center justify-center px-1 py-1 focus:outline-none cursor-pointer shrink-0 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <span
        className={`h-9 px-3.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
          selected
            ? 'bg-[#051F20] text-white shadow-xs'
            : 'bg-white text-[#235347] border border-[#E3EEE6] hover:bg-[#F7FAF8]'
        } ${className}`}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span
            className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded-full ${
              selected ? 'bg-white/20 text-white' : 'bg-[#F0F5F2] text-[#235347]'
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
