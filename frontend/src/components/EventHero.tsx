import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { EventModel } from '../types';

export interface EventHeroProps {
  event: EventModel;
  onDetailsClick: (event: EventModel) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EventHero: React.FC<EventHeroProps> = ({
  event,
  onDetailsClick,
  className = '',
  style,
}) => {
  const isLive = event.status === 'live';

  return (
    <div
      onClick={() => onDetailsClick(event)}
      className={`relative w-full overflow-hidden rounded-[24px] cursor-pointer group transition-transform duration-200 hover:scale-[1.01] ${className}`}
      style={{
        height: '240px',
        backgroundColor: '#0F172A',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
        ...style,
      }}
    >
      {/* Full-bleed Background Image */}
      <img
        src={
          event.posterUrl ||
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
        }
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      {/* Dark Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 55%, rgba(15, 23, 42, 0.95) 100%)',
        }}
      />

      {/* Content Container */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 box-border">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          {/* Red HAPPENING NOW pill or status */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider"
            style={{
              backgroundColor: isLive ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {isLive ? 'HAPPENING NOW' : 'FEATURED EVENT'}
          </span>

          {/* White Details pill */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDetailsClick(event);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-xs shadow-md transition-all hover:bg-slate-100"
          >
            <span>Details</span>
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Bottom Details */}
        <div>
          {/* Mint overline */}
          <div
            className="font-bold text-xs uppercase tracking-wider mb-1"
            style={{ color: '#A7F3D0' }}
          >
            {event.category || 'Expedition'}
          </div>

          {/* White Title */}
          <h2
            className="font-extrabold text-white text-xl leading-snug tracking-tight mb-2 line-clamp-2"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            {event.title}
          </h2>

          {/* Location row */}
          <div className="flex items-center gap-1.5 text-slate-200 text-xs font-medium">
            <MapPin size={16} strokeWidth={1.75} className="text-emerald-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
