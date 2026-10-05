import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { EventModel } from '../types';
import { Chip } from './Chip';

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
      className={`flex items-start gap-3.5 p-3.5 rounded-[22px] bg-white border border-[#EEF1F5] shadow-[0_4px_16px_rgba(15,23,42,0.04)] cursor-pointer hover:border-[#10B981] transition-all duration-150 ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '14px',
        borderRadius: '22px',
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
      {/* Event Image with White Date Badge inside */}
      <div
        className="relative rounded-2xl overflow-hidden shrink-0 bg-slate-100"
        style={{
          width: '96px',
          height: '96px',
          minWidth: '96px',
          maxWidth: '96px',
          borderRadius: '18px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#F1F5F9',
        }}
      >
        <img
          src={
            event.posterUrl ||
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
          }
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* White Date Badge (green uppercase month + bold day) */}
        <div
          className="absolute top-1.5 left-1.5 flex flex-col items-center justify-center px-1.5 py-0.5 rounded-lg bg-white/95 backdrop-blur-sm shadow-sm"
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            minWidth: '34px',
            padding: '3px 6px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '8.5px',
              fontWeight: 800,
              color: '#10B981',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            {monthName}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.1,
            }}
          >
            {dayNum}
          </span>
        </div>
      </div>

      {/* Details Right Column */}
      <div
        className="flex-1 flex flex-col justify-between min-w-0 py-0.5"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <div>
          {/* Top row: Category & Status Pill Top-Right */}
          <div
            className="flex items-center justify-between gap-1.5 mb-1"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate"
              style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}
            >
              {event.category || 'Expedition'}
            </span>
            <Chip label={event.status} variant="status" size="sm" />
          </div>

          {/* Title */}
          <h4
            className="font-extrabold text-slate-900 text-[14px] leading-snug tracking-tight line-clamp-2 mb-1.5"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '14px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.3,
              margin: '0 0 6px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {event.title}
          </h4>
        </div>

        {/* Clock-icon Date & Venue Row */}
        <div
          className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: '#64748B' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {timeStr}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.venue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
