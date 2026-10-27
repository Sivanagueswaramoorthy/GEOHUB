import React, { useState } from 'react';
import { SectionCard } from './SectionCard';
import { Overline } from './Overline';

export interface DonutSegment {
  label: string;
  count: number;
  color: string;
  leadName?: string;
  position?: string;
}

export interface PostHolder {
  name: string;
  position: string;
  department?: string;
  avatarInitials?: string;
}

export interface DonutCardProps {
  title: string;
  subtitle?: string;
  centerTotal: string | number;
  centerLabel: string;
  segments: DonutSegment[];
  postHolders?: PostHolder[];
  showPostHolders?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_POST_HOLDERS: PostHolder[] = [
  {
    name: 'Dr. Sarah Jenkins',
    position: 'Faculty Advisor',
    department: 'Geography & Geomatics',
    avatarInitials: 'DR',
  },
  {
    name: 'Alex Rivera',
    position: 'Club President',
    department: 'Geoinformatics Engineering',
    avatarInitials: 'AL',
  },
  {
    name: 'David Chen',
    position: 'Promotion Lead',
    department: 'Earth Science & Media',
    avatarInitials: 'DA',
  },
  {
    name: 'Aarav Patel',
    position: 'Documentation Lead',
    department: 'Geoinformatics & Archival Science',
    avatarInitials: 'AA',
  },
  {
    name: 'Ananya Iyer',
    position: 'Treasurer Lead',
    department: 'Economics & Financial Analytics',
    avatarInitials: 'AN',
  },
];

export const DonutCard: React.FC<DonutCardProps> = ({
  title,
  subtitle,
  centerTotal,
  centerLabel,
  segments,
  postHolders,
  showPostHolders,
  className = '',
  style,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = segments.reduce((sum, s) => sum + s.count, 0) || 1;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const gap = segments.length > 1 ? 3.5 : 0;
  const totalGaps = segments.length * gap;
  const availableCircumference = Math.max(0, circumference - totalGaps);

  let currentOffset = 0;

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;
  const displayTotal = activeSegment
    ? typeof activeSegment.count === 'number'
      ? activeSegment.count.toLocaleString()
      : activeSegment.count
    : centerTotal;

  const displayLabel = activeSegment
    ? `${activeSegment.label}`
    : centerLabel;

  const activePercentage = activeSegment
    ? `${Math.round((activeSegment.count / total) * 100)}%`
    : null;

  // Decide if post holders should be displayed down below
  const shouldShowPostHolders =
    showPostHolders !== undefined
      ? showPostHolders
      : postHolders !== undefined || title.toLowerCase().includes('member');

  const effectivePostHolders = postHolders || DEFAULT_POST_HOLDERS;

  return (
    <SectionCard className={className} style={{ ...style, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <Overline pill dot>
            {title}
          </Overline>
          {subtitle && (
            <div
              style={{
                fontSize: '12px',
                color: '#64748B',
                fontWeight: 600,
                marginTop: '4px',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: '#DAF1DE',
            color: '#163832',
            border: '1px solid #8EB69B',
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
        >
          {segments.length} Squads
        </span>
      </div>

      {/* Main Chart Body: Responsive Donut on Left, Squad Text Aligned on Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        {/* Left Side: SVG Donut Ring with Integrated Center Metric */}
        <div
          style={{
            position: 'relative',
            width: '104px',
            height: '104px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
          }}
        >
          <svg
            width="104"
            height="104"
            viewBox="0 0 100 100"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              overflow: 'visible',
            }}
          >
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={10}
            />

            {/* Colored Segments */}
            {segments.map((seg, idx) => {
              const fraction = seg.count / total;
              const segmentLength = fraction * availableCircumference;
              const strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += segmentLength + gap;

              const isHovered = hoveredIndex === idx;
              const isOtherHovered = hoveredIndex !== null && !isHovered;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? 13 : 10}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease',
                    opacity: isOtherHovered ? 0.35 : 1,
                    filter: isHovered ? `drop-shadow(0 2px 8px ${seg.color}55)` : 'none',
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center Metric Display */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
              padding: '4px',
            }}
          >
            <span
              style={{
                fontSize: activePercentage ? '17px' : '20px',
                fontWeight: 800,
                color: '#0B2B26',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-family, inherit)',
                transition: 'all 0.2s ease',
              }}
            >
              {displayTotal}
            </span>

            <span
              style={{
                fontSize: '8.5px',
                fontWeight: 800,
                color: activePercentage ? '#235347' : '#163832',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '3px',
                maxWidth: '68px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
              }}
            >
              {displayLabel}
            </span>

            {activePercentage && (
              <span
                style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  color: '#235347',
                  backgroundColor: '#DAF1DE',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  marginTop: '2px',
                }}
              >
                {activePercentage}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Squad Rows (Guaranteed zero text collision) */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {segments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isHovered ? '#DAF1DE' : '#F8FAFC',
                  border: isHovered ? '1px solid #8EB69B' : '1px solid #F1F5F9',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
                  transform: isHovered ? 'translateX(2px)' : 'none',
                }}
              >
                {/* Left: Swatch & Squad Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2.5px',
                      backgroundColor: seg.color,
                      flexShrink: 0,
                      boxShadow: `0 1px 3px ${seg.color}35`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isHovered ? 800 : 700,
                      color: isHovered ? '#0B2B26' : '#1E293B',
                      letterSpacing: '-0.01em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {seg.label}
                  </span>
                </div>

                {/* Right: Count Badge */}
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: isHovered ? '#0B2B26' : '#1E293B',
                    backgroundColor: isHovered ? '#FFFFFF' : '#EDF2F7',
                    padding: '1px 6px',
                    borderRadius: '5px',
                    flexShrink: 0,
                    minWidth: '24px',
                    textAlign: 'center',
                    marginLeft: '6px',
                  }}
                >
                  {typeof seg.count === 'number' ? seg.count.toLocaleString() : seg.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Down Below: Executive Post Holders with Position and Respective Name */}
      {shouldShowPostHolders && effectivePostHolders.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {/* Subtle Section Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: '#F1F5F9',
              marginBottom: '14px',
            }}
          />

          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#235347',
                }}
              />
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Executive Post Holders
              </h4>
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748B',
              }}
            >
              {effectivePostHolders.length} Officers
            </span>
          </div>

          {/* Roster of Positions and Respective Names */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {effectivePostHolders.map((holder, idx) => {
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #EDF2F7',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#EDF2F7';
                  }}
                >
                  {/* Name on Left */}
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 750,
                      color: '#0F172A',
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {holder.name}
                  </span>

                  {/* Position Badge on Right */}
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      marginLeft: '8px',
                    }}
                  >
                    {holder.position}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
};

