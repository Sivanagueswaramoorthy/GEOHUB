import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  color?: 'emerald' | 'blue' | 'amber';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
  color = 'emerald',
}) => {
  const activeBg =
    color === 'blue'
      ? 'bg-blue-600 border-blue-700/60 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
      : color === 'amber'
      ? 'bg-amber-500 border-amber-600/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
      : 'bg-emerald-600 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]';

  const dotColor =
    color === 'blue' ? 'bg-blue-600' : color === 'amber' ? 'bg-amber-500' : 'bg-emerald-600';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`min-w-[52px] w-[52px] min-h-[30px] h-[30px] p-0.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 cursor-pointer relative shrink-0 border select-none active:scale-95 ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-800 border-slate-700'
          : checked
          ? `${activeBg} shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]`
          : 'bg-[#1e2430] border-slate-700/80 hover:bg-[#252d3d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none flex items-center justify-center w-[24px] h-[24px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] transform transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          checked ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
            checked ? dotColor : 'bg-slate-400'
          }`}
        />
      </span>
    </button>
  );
};

export default Toggle;
