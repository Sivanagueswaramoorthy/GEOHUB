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
      ? 'bg-blue-600 border-blue-700 shadow-[0_2px_8px_rgba(37,99,235,0.35)]'
      : color === 'amber'
      ? 'bg-amber-500 border-amber-600 shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
      : 'bg-emerald-600 border-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.35)]';

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
      className={`min-w-[48px] w-[48px] min-h-[28px] h-[28px] p-0.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 cursor-pointer relative shrink-0 border select-none active:scale-95 ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-300'
          : checked
          ? `${activeBg} shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]`
          : 'bg-slate-200 border-slate-300 hover:bg-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none flex items-center justify-center w-[22px] h-[22px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.22)] transform transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          checked ? 'translate-x-[20px]' : 'translate-x-0'
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
