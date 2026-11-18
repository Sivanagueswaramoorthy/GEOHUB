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
  // Vibrant tactile colors matching the approved prototype
  let activeTrackColor = '#163832'; // Vibrant emerald green
  if (color === 'blue') {
    activeTrackColor = '#163832'; // Vibrant royal blue
  } else if (color === 'amber') {
    activeTrackColor = '#F2B84B'; // Vibrant amber
  }

  // Soft muted track when inactive / disabled
  const inactiveTrackColor = '#DAF1DE';
  const inactiveDotColor = '#8EB69B';

  const currentTrackColor = checked ? activeTrackColor : inactiveTrackColor;
  const currentDotColor = checked ? activeTrackColor : inactiveDotColor;

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
        width: '50px',
        minWidth: '50px',
        maxWidth: '50px',
        height: '28px',
        minHeight: '28px',
        maxHeight: '28px',
        borderRadius: '9999px',
        padding: '3px',
        backgroundColor: currentTrackColor,
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.18)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        flexShrink: 0,
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'background-color 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
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
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.1)',
          transform: checked ? 'translateX(22px)' : 'translateX(0px)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      >
        {/* Donut bullseye center dot matching the prototype */}
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '9999px',
            backgroundColor: currentDotColor,
            transition: 'background-color 0.2s ease',
          }}
        />
      </span>
    </button>
  );
};

export default Toggle;
