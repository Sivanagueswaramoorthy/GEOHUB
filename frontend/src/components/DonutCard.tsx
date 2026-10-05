import React from 'react';
import { SectionCard } from './SectionCard';
import { Overline } from './Overline';

export interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

export interface DonutCardProps {
  title: string;
  subtitle?: string;
  centerTotal: string | number;
  centerLabel: string;
  segments: DonutSegment[];
  className?: string;
  style?: React.CSSProperties;
}

export const DonutCard: React.FC<DonutCardProps> = ({
  title,
  subtitle,
  centerTotal,
  centerLabel,
  segments,
  className = '',
  style,
}) => {
  const total = segments.reduce((sum, s) => sum + s.count, 0) || 1;
  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <SectionCard className={className} style={style}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <Overline pill>{title}</Overline>
          {subtitle && (
            <div className="text-xs text-slate-500 font-medium mt-1">{subtitle}</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* SVG Donut Ring */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: '110px', height: '110px', position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="110" height="110" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg, idx) => {
              const fraction = seg.count / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += fraction * circumference;

              return (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              );
            })}
          </svg>

          {/* Center Total + Label */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              className="font-extrabold text-slate-900 tracking-tight"
              style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}
            >
              {centerTotal}
            </span>
            <span
              className="font-bold text-slate-400 uppercase tracking-wider"
              style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-semibold text-slate-700">{seg.label}</span>
              </div>
              <span className="font-bold text-slate-900">{seg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};
