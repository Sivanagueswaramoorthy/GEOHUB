import React, { useState } from 'react';
import {
  Radio,
  Clock,
  MapPin,
  Calendar,
  Users2,
  ShieldCheck,
  ArrowRight,
  FileCheck,
  Tag,
  Coffee,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface NextEventSpotlightProps {
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

export const NextEventSpotlight: React.FC<NextEventSpotlightProps> = ({
  timeLeft,
  className = '',
  style,
}) => {
  const { setActiveTab, setSelectedEventId } = useApp();
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'pending' | 'ready'>('all');

  const duties = [
    {
      id: 'duty_doc',
      label: 'Documentation & MoM Dossier',
      squad: 'Documentation Squad',
      lead: 'Aarav Patel',
      percent: 85,
      status: 'In Final Review',
      icon: <FileCheck size={16} strokeWidth={2} />,
    },
    {
      id: 'duty_sign',
      label: 'Signage, Badges & Lanyards',
      squad: 'Promotion Squad',
      lead: 'Elena Rostova',
      percent: 100,
      status: 'Ready ✓',
      icon: <Tag size={16} strokeWidth={2} />,
    },
    {
      id: 'duty_attendees',
      label: 'Delegate Screening & Shortlisting',
      squad: 'Management Squad',
      lead: 'David Chen',
      percent: 70,
      status: 'In Progress',
      icon: <Users2 size={16} strokeWidth={2} />,
    },
    {
      id: 'duty_refreshments',
      label: 'Refreshments & Stage Hospitality',
      squad: 'Entertainment Squad',
      lead: 'Priya Nair',
      percent: 60,
      status: 'Scheduled',
      icon: <Coffee size={16} strokeWidth={2} />,
    },
    {
      id: 'duty_gate',
      label: 'Turnstile Gate QR Attendance Terminals',
      squad: 'Technical Squad',
      lead: 'Alex Rivera',
      percent: 100,
      status: 'Ready ✓',
      icon: <QrCode size={16} strokeWidth={2} />,
    },
  ];

  const averageReadiness = Math.round(
    duties.reduce((acc, d) => acc + d.percent, 0) / duties.length
  );

  const filteredDuties = duties.filter((d) => {
    if (activeTabFilter === 'pending') return d.percent < 100;
    if (activeTabFilter === 'ready') return d.percent === 100;
    return true;
  });

  const handleOpenEvent = () => {
    setSelectedEventId('event_02');
    setActiveTab('events');
  };

  return (
    <div
      className={`w-full rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden transition-all ${className}`}
      style={{
        padding: '20px',
        boxShadow: '0 4px 20px -2px rgba(11, 43, 38, 0.05)',
        ...style,
      }}
    >
      {/* 1. Header Bar: Live Beacon & Telemetry Countdown */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: '#DAF1DE',
              color: '#235347',
              border: '1px solid #8EB69B',
            }}
          >
            <Radio size={16} strokeWidth={2.2} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Next Event Spotlight
              </h3>
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: '#DAF1DE',
                  color: '#163832',
                  border: '1px solid #8EB69B',
                }}
              >
                Flagship
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Real-time chapter operational countdown & readiness
            </p>
          </div>
        </div>

        {/* Telemetry Countdown Ticker */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs shrink-0"
          style={{
            backgroundColor: '#051F20',
            border: '1px solid #0B2B26',
            color: '#DAF1DE',
          }}
          title="Ticking live countdown to event start"
        >
          <Clock size={13} style={{ color: '#8EB69B' }} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            T-MINUS
          </span>
          <span className="font-mono text-xs font-extrabold tracking-tight" style={{ color: '#DAF1DE' }}>
            {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h{' '}
            {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* 2. Hero Event Spotlight Card (Executive Dark Pine Gradient) */}
      <div
        className="rounded-2xl p-4 sm:p-5 relative overflow-hidden mb-4.5 transition-all group"
        style={{
          background: 'linear-gradient(135deg, #051F20 0%, #0B2B26 55%, #163832 100%)',
          border: '1px solid rgba(142, 182, 155, 0.3)',
          boxShadow: '0 8px 24px -4px rgba(5, 31, 32, 0.28)',
          color: '#FFFFFF',
        }}
      >
        {/* Subtle decorative glow orb in corner */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(142, 182, 155, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card Header Row: Category & Action Link */}
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8EB69B',
            }}
          >
            TECHNICAL WORKSHOP • HIGH-PERFORMANCE LAB
          </span>

          <button
            type="button"
            onClick={handleOpenEvent}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer group-hover:bg-white/20"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
            }}
          >
            <span>Event Dossier</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Title */}
        <h4 className="font-extrabold text-base sm:text-lg leading-snug mb-2.5 relative z-10 text-white">
          QGIS & Satellite Remote Sensing Workshop
        </h4>

        {/* Metadata Badges */}
        <div className="flex items-center flex-wrap gap-3 text-xs text-slate-300 font-medium mb-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} style={{ color: '#8EB69B' }} />
            <span>Grand Auditorium & Lab 4B</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} style={{ color: '#8EB69B' }} />
            <span>Oct 29, 2026 • 10:00 AM</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-1.5">
            <Users2 size={14} style={{ color: '#8EB69B' }} />
            <span>200 Verified Seats</span>
          </div>
        </div>

        {/* Dual High-Impact Metric Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          {/* Metric 1: RSVP Registration */}
          <div
            className="p-3 rounded-xl flex flex-col justify-between"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: '#8EB69B',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                RSVP Registration
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#DAF1DE',
                  backgroundColor: 'rgba(218, 241, 222, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '999px',
                }}
              >
                92%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="font-extrabold text-sm text-white">185 / 200</span>
              <span className="text-[11px] text-slate-300 font-medium">15 seats open</span>
            </div>

            {/* Custom Progress Bar */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: '92%',
                  background: 'linear-gradient(90deg, #8EB69B 0%, #DAF1DE 100%)',
                }}
              />
            </div>
          </div>

          {/* Metric 2: Budget Sanction */}
          <div
            className="p-3 rounded-xl flex flex-col justify-between"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: '#8EB69B',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Budget Sanction
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#DAF1DE',
                  backgroundColor: 'rgba(218, 241, 222, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '999px',
                }}
              >
                84%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="font-extrabold text-sm text-white">₹8,400 / ₹10,000</span>
              <span className="text-[11px] text-slate-300 font-medium">₹1,600 reserve</span>
            </div>

            {/* Custom Progress Bar */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: '84%',
                  background: 'linear-gradient(90deg, #235347 0%, #8EB69B 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Duty Readiness Section */}
      <div className="flex flex-col gap-3">
        {/* Readiness Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} style={{ color: '#235347' }} />
            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Operational Duty Readiness
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1"
              style={{
                backgroundColor: '#DAF1DE',
                color: '#163832',
                border: '1px solid #8EB69B',
              }}
            >
              <Sparkles size={11} />
              <span>{averageReadiness}% On Track</span>
            </span>

            {/* Mini view filter */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold">
              {(['all', 'pending', 'ready'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTabFilter(tab)}
                  className="px-2 py-0.5 rounded-md capitalize cursor-pointer transition-all"
                  style={{
                    backgroundColor: activeTabFilter === tab ? '#FFFFFF' : 'transparent',
                    color: activeTabFilter === tab ? '#0B2B26' : '#64748B',
                    boxShadow: activeTabFilter === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duty List Items */}
        <div className="flex flex-col gap-2.5">
          {filteredDuties.map((duty) => {
            const isComplete = duty.percent === 100;

            return (
              <div
                key={duty.id}
                className="p-3 rounded-2xl border transition-all hover:border-[#8EB69B] hover:shadow-2xs"
                style={{
                  backgroundColor: isComplete ? '#F8FBF9' : '#FFFFFF',
                  borderColor: isComplete ? '#DAF1DE' : '#EEF2F6',
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isComplete ? '#DAF1DE' : '#F1F5F9',
                        color: isComplete ? '#163832' : '#235347',
                        border: isComplete ? '1px solid #8EB69B' : '1px solid #E2E8F0',
                      }}
                    >
                      {duty.icon}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {duty.label}
                      </span>
                      <span className="text-[10.5px] text-slate-500 font-medium truncate">
                        {duty.squad} • Lead: <strong className="text-slate-700">{duty.lead}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isComplete ? '#DAF1DE' : '#F8FAFC',
                        color: isComplete ? '#163832' : '#475569',
                        border: isComplete ? '1px solid #8EB69B' : '1px solid #E2E8F0',
                      }}
                    >
                      {duty.status}
                    </span>
                    <span className="font-extrabold text-xs text-slate-900 w-8 text-right">
                      {duty.percent}%
                    </span>
                  </div>
                </div>

                {/* Progress Proportion Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${duty.percent}%`,
                      background: isComplete
                        ? 'linear-gradient(90deg, #163832 0%, #235347 100%)'
                        : 'linear-gradient(90deg, #235347 0%, #8EB69B 100%)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Roster Button */}
        <button
          type="button"
          onClick={() => setActiveTab('teams')}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#235347] hover:bg-[#F8FBF9] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0B2B26]"
        >
          <span>View Detailed Squad Task Checklist</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
export default NextEventSpotlight;
