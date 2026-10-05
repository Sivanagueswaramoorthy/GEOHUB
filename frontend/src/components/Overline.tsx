import React from 'react';

export interface OverlineProps {
  children: React.ReactNode;
  dot?: boolean;
  pill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Overline: React.FC<OverlineProps> = ({
  children,
  dot = false,
  pill = false,
  className = '',
  style,
}) => {
  if (pill) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${className}`}
        style={{
          backgroundColor: '#E7F9F1',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1,
          ...style,
        }}
      >
        {dot && (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block',
            }}
          />
        )}
        {children}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{
        color: '#10B981',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        lineHeight: 1.2,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </div>
  );
};
