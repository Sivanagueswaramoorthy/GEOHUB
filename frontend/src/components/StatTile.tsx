import React from 'react';
import { TYPOGRAPHY, COLORS } from '../styles/tokens';

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
  const cfg = COLORS.statTiles[tint] || COLORS.statTiles.mint;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={`stat-tile-card relative flex flex-col justify-between p-4 transition-all duration-150 ${className}`}
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '20px',
        padding: '16px',
        cursor: onClick ? 'pointer' : undefined,
        minHeight: '140px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        ...style,
      }}
    >
      {/* Top Row: Label (Overline 11/14 700 uppercase) top-left, Icon Container 40px top-right */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-overline"
          style={{
            fontSize: `${TYPOGRAPHY.scale.overline.fontSize}px`,
            lineHeight: `${TYPOGRAPHY.scale.overline.lineHeight}px`,
            fontWeight: TYPOGRAPHY.scale.overline.fontWeight,
            letterSpacing: TYPOGRAPHY.scale.overline.letterSpacing,
            textTransform: 'uppercase',
            color: cfg.text,
            display: 'block',
            maxWidth: 'calc(100% - 48px)',
          }}
        >
          {label}
        </span>

        {icon && (
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${cfg.border}`,
              color: cfg.number,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Metric Row: Stat number 32/36, 800 tabular-nums with 8px gap */}
      <div
        className="font-stat-number"
        style={{
          fontSize: `${TYPOGRAPHY.scale.statNumber.fontSize}px`,
          lineHeight: `${TYPOGRAPHY.scale.statNumber.lineHeight}px`,
          fontWeight: TYPOGRAPHY.scale.statNumber.fontWeight,
          fontFeatureSettings: '"tnum"',
          color: cfg.number,
          fontFamily: 'var(--font-family)',
          marginTop: '8px',
          marginBottom: '8px',
        }}
      >
        {value}
      </div>

      {/* Bottom Row: Footnote chip bottom-left */}
      {footnote ? (
        <div className="flex items-center">
          <span
            className="inline-flex items-center font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${cfg.border}`,
              color: cfg.text,
              fontSize: '11px',
              lineHeight: '14px',
              letterSpacing: '0.04em',
              fontWeight: 700,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {footnote}
          </span>
        </div>
      ) : (
        <div style={{ height: '20px' }} />
      )}
    </div>
  );
};
