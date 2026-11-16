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
      className={`min-h-[44px] h-[44px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all cursor-pointer focus:outline-none ${
        active
          ? 'bg-[#DAF1DE] text-[#051F20] border-[#8EB69B] shadow-xs'
          : 'bg-white text-[#051F20] border-[#E3EEE6] hover:bg-[#F7FAF8] hover:border-[#DCE6E0]'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default StatChip;
