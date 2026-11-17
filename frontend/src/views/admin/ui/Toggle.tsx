import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`min-w-[50px] w-[50px] min-h-[28px] h-[28px] p-0.5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer relative shrink-0 border ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
          : checked
          ? 'bg-emerald-600 border-emerald-600'
          : 'bg-slate-200 border-slate-300 hover:bg-slate-300'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block w-[24px] h-[24px] rounded-full bg-white shadow-sm transform transition ease-in-out duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default Toggle;
