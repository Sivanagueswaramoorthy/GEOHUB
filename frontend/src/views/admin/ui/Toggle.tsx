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
      className={`min-w-[52px] w-[52px] min-h-[30px] h-[30px] p-0.5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer relative shrink-0 ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-200'
          : checked
          ? 'bg-[#235347]'
          : 'bg-[#DCE6E0]'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block w-[26px] h-[26px] rounded-full bg-white shadow-md transform transition ease-in-out duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default Toggle;
