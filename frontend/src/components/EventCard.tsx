import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { EventModel } from '../types';
import { Chip } from './Chip';
import { TYPOGRAPHY } from '../styles/tokens';

export interface EventCardProps {
  event: EventModel;
  onClick: (event: EventModel) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  className = '',
  style,
}) => {
  const startDate = new Date(event.startDate);
  const monthName = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = startDate.getDate();
  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      onClick={() => onClick(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(event);
        }
      }}
      className={`flex flex-col rounded-[24px] bg-white border border-[#EEF1F5] shadow-[0_4px_16px_rgba(15,23,42,0.04)] cursor-pointer hover:border-[#10B981] transition-all duration-150 overflow-hidden w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EEF1F5',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        cursor: 'pointer',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Event Image Banner (16/9 aspect-ratio, top radius 24) */}
      <div
        className="relative w-full overflow-hidden bg-slate-100"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#F1F5F9',
        }}
      >
        <img
          src={
            event.posterUrl ||
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'
          }
          alt={event.title}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* Date Badge: Pinned 12px from top-left */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-xl bg-white shadow-md select-none"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            minWidth: '42px',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: '11px',
              lineHeight: '14px',
              fontWeight: 800,
              color: '#10B981',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {monthName}
          </span>
          <span
            style={{
              fontSize: '15px',
              lineHeight: '18px',
              fontWeight: 800,
              color: '#0F172A',
              fontFeatureSettings: '"tnum"',
            }}
          >
            {dayNum}
          </span>
        </div>

        {/* Status Pill: Pinned 12px from top-right */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 2,
          }}
        >
          <Chip
            label={event.status === 'live' ? 'Happening Now' : event.status}
            variant="status"
            size="sm"
          />
        </div>
      </div>

      {/* Card Body Content (16px padding) */}
      <div
        className="flex flex-col flex-1"
        style={{
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Category Chip */}
        <div className="flex items-center">
          <Chip label={event.category} variant="squad" size="sm" />
        </div>

        {/* Event Title (Title 18/24 700 with line-clamp 2) */}
        <h3
          style={{
            fontSize: `${TYPOGRAPHY.scale.title.fontSize}px`,
            lineHeight: `${TYPOGRAPHY.scale.title.lineHeight}px`,
            fontWeight: TYPOGRAPHY.scale.title.fontWeight,
            color: '#0F172A',
            fontFamily: 'var(--font-family)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: '2px 0 0 0',
          }}
        >
          {event.title}
        </h3>

        {/* Venue & Time (Small 13/18 500) */}
        <div
          className="flex flex-col gap-1.5 mt-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            className="flex items-center gap-2 text-slate-500"
            style={{
              fontSize: `${TYPOGRAPHY.scale.small.fontSize}px`,
              lineHeight: `${TYPOGRAPHY.scale.small.lineHeight}px`,
              fontWeight: TYPOGRAPHY.scale.small.fontWeight,
            }}
          >
            <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-slate-400" />
            <span className="truncate">{event.venue}</span>
          </div>

          <div
            className="flex items-center gap-2 text-slate-500"
            style={{
              fontSize: `${TYPOGRAPHY.scale.small.fontSize}px`,
              lineHeight: `${TYPOGRAPHY.scale.small.lineHeight}px`,
              fontWeight: TYPOGRAPHY.scale.small.fontWeight,
            }}
          >
            <Clock size={16} strokeWidth={1.75} className="shrink-0 text-slate-400" />
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
