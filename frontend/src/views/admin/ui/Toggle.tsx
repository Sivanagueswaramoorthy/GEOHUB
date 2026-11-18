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
  // Prototype accurate styling matching user screenshots:
  // - TiDB ON: emerald-600, OFF: slate-400
  // - Gateway ON: blue-600, OFF: amber-500 (Maintenance Mode)
  let trackClass = '';
  let dotClass = '';

  if (checked) {
    if (color === 'blue') {
      trackClass = 'bg-blue-600 border border-blue-700/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]';
      dotClass = 'bg-blue-600';
    } else if (color === 'amber') {
      trackClass = 'bg-amber-500 border border-amber-600/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]';
      dotClass = 'bg-amber-500';
    } else {
      trackClass = 'bg-emerald-600 border border-emerald-700/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]';
      dotClass = 'bg-emerald-600';
    }
  } else {
    if (color === 'blue') {
      // Offline/Maintenance mode for Gateway is radiant amber
      trackClass = 'bg-amber-500 border border-amber-600/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]';
      dotClass = 'bg-amber-500';
    } else {
      // Disconnected state for TiDB is muted slate-400
      trackClass = 'bg-slate-400 border border-slate-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]';
      dotClass = 'bg-slate-400';
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-12 min-w-12 h-7 min-h-7 rounded-full p-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shrink-0 select-none active:scale-95 transition-all duration-200 ease-in-out ${
        disabled ? 'opacity-40 cursor-not-allowed bg-slate-700 border-slate-600' : trackClass
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${dotClass}`}
        />
      </span>
    </button>
  );
};

export default Toggle;
