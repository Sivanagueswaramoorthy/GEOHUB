import React from 'react';

export type StatTileTint = 'mint' | 'lavender' | 'amber' | 'teal';

export interface StatTileProps {
  label: string;
  value: string | number;
  footnote?: string;
  footnoteTrend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  tint?: StatTileTint;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  footnote,
  icon,
  tint = 'mint',
  className = '',
  style,
  onClick,
}) => {
  const tintConfig: Record<
    StatTileTint,
    {
      bg: string;
      border: string;
      labelColor: string;
      numColor: string;
      iconBg: string;
      pillBg: string;
      pillBorder: string;
      pillText: string;
    }
  > = {
    mint: {
      bg: '#E7F9F1',
      border: '#A7F3D0',
      labelColor: '#065F46',
      numColor: '#064E3B',
      iconBg: '#D1FAE5',
      pillBg: '#FFFFFF',
      pillBorder: '#A7F3D0',
      pillText: '#065F46',
    },
    lavender: {
      bg: '#F3EEFF',
      border: '#DDD1FF',
      labelColor: '#5B21B6',
      numColor: '#4C1D95',
      iconBg: '#E9D5FF',
      pillBg: '#FFFFFF',
      pillBorder: '#DDD1FF',
      pillText: '#5B21B6',
    },
    amber: {
      bg: '#FFF8E6',
      border: '#FDE68A',
      labelColor: '#92400E',
      numColor: '#7C2D12',
      iconBg: '#FEF3C7',
      pillBg: '#FFFFFF',
      pillBorder: '#FDE68A',
      pillText: '#92400E',
    },
    teal: {
      bg: '#E8FBF8',
      border: '#99F6E4',
      labelColor: '#0F766E',
      numColor: '#115E59',
      iconBg: '#CCFBF1',
      pillBg: '#FFFFFF',
      pillBorder: '#99F6E4',
      pillText: '#0F766E',
    },
  };

  const cfg = tintConfig[tint];

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between p-4 transition-all duration-150 ${className}`}
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '20px',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {/* Top Row: Uppercase label left, tinted icon square top-right */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: cfg.labelColor,
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: cfg.iconBg,
              color: cfg.numColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Large number */}
      <div
        className="font-extrabold tracking-tight"
        style={{
          fontSize: '26px',
          lineHeight: 1.1,
          color: cfg.numColor,
          fontFamily: 'var(--font-family)',
          margin: '2px 0 10px 0',
        }}
      >
        {value}
      </div>

      {/* Pill footnote chip */}
      {footnote && (
        <div className="flex items-center">
          <span
            className="inline-flex items-center font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: cfg.pillBg,
              border: `1px solid ${cfg.pillBorder}`,
              color: cfg.pillText,
              fontSize: '10.5px',
              lineHeight: 1.2,
              letterSpacing: '0.01em',
            }}
          >
            {footnote}
          </span>
        </div>
      )}
    </div>
  );
};
