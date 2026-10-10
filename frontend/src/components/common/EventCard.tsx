import React from 'react';
import { Calendar, MapPin, Users, Check, ArrowRight, Clock, Sparkles, ExternalLink } from 'lucide-react';
import { EventModel } from '../../types';
import { StatusChip } from './StatusChip';

interface EventCardProps {
  event: EventModel;
  onClick: () => void;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, isRegistered }) => {
  const startDate = new Date(event.startDate);
  const monthStr = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = startDate.getDate();
  const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const isLive = event.status === 'live';

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E8ECF2',
        overflow: 'hidden',
        marginBottom: '16px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(16, 185, 129, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.borderColor = '#A7F3D0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.03)';
        e.currentTarget.style.borderColor = '#E8ECF2';
      }}
    >
      {/* Poster Image / Cover */}
      <div
        style={{
          height: '154px',
          width: '100%',
          position: 'relative',
          backgroundColor: '#0F172A',
          overflow: 'hidden',
        }}
      >
        <img
          src={
            event.posterUrl ||
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
          }
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.92,
          }}
        />

        {/* Gradient Scrim for Contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.1) 50%, rgba(0, 0, 0, 0.25) 100%)',
          }}
        />

        {/* Floating Calendar Ticket Chip (Top Left) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '4px 9px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            minWidth: '42px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#059669',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {monthStr}
          </span>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.1,
            }}
          >
            {dayNum}
          </span>
        </div>

        {/* Status / Live / Registered Badges (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isLive && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                letterSpacing: '0.04em',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  animation: 'pulse 1.5s infinite',
                }}
              />
              LIVE NOW
            </span>
          )}

          {isRegistered && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Check size={16} strokeWidth={3} />
              PASS READY
            </span>
          )}

          {!isLive && !isRegistered && <StatusChip status={event.status} />}
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '16px' }}>
        {/* Title */}
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.3,
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
          }}
        >
          {event.title}
        </h3>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '12px',
            color: '#64748B',
            lineHeight: 1.45,
            margin: '0 0 12px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>

        {/* Key Logistics: Time & Venue */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '10px 12px',
            border: '1px solid #F1F5F9',
            marginBottom: '12px',
            fontSize: '11px',
            color: '#475569',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Clock size={16} strokeWidth={1.75} color="#10B981" />
            <span style={{ fontWeight: 600, color: '#1E293B' }}>
              {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {timeStr}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <MapPin size={16} strokeWidth={1.75} color="#10B981" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.venue}
            </span>
          </div>
        </div>

        {/* Card Footer Action Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '10px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {event.googleFormUrl ? (
              <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={16} strokeWidth={1.75} /> Google Form Sign-up
              </span>
            ) : (
              'Open to all club members'
            )}
          </span>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#10B981',
            }}
          >
            View Details
            <ArrowRight size={16} strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </div>
  );
};
