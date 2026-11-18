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
  // Determine exact colors matching the prototype in Images 1 & 2:
  // - TiDB ON: emerald (#059669), OFF: slate (#64748b)
  // - Gateway ON: cobalt blue (#2563eb), OFF: amber (#d97706) for maintenance mode
  let activeColor = '#059669';
  let inactiveColor = '#64748b';

  if (color === 'blue') {
    activeColor = '#2563eb';
    inactiveColor = '#d97706'; // Amber when offline/maintenance
  } else if (color === 'amber') {
    activeColor = '#d97706';
    inactiveColor = '#64748b';
  }

  const currentTrackColor = checked ? activeColor : inactiveColor;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        width: '48px',
        minWidth: '48px',
        maxWidth: '48px',
        height: '28px',
        minHeight: '28px',
        maxHeight: '28px',
        borderRadius: '9999px',
        padding: '2px',
        backgroundColor: currentTrackColor,
        border: '1px solid rgba(0, 0, 0, 0.25)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0,
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
      }}
      className={`shrink-0 ${className}`}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '22px',
          height: '22px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
          transform: checked ? 'translateX(20px)' : 'translateX(0px)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '9999px',
            backgroundColor: currentTrackColor,
            transition: 'background-color 0.15s ease',
          }}
        />
      </span>
    </button>
  );
};

export default Toggle;
