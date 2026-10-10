import React from 'react';
import {
  Calendar,
  ListTodo,
  CheckCircle2,
  Award,
  MapPin,
  Clock,
  QrCode,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatTile } from '../../../components/StatTile';
import { SectionCard } from '../../../components/SectionCard';
import { Overline } from '../../../components/Overline';

export interface StudentHomeViewProps {
  showToast: (msg: string) => void;
  setSelectedEventId: (id: string) => void;
  registerForEvent: (id: string) => void;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({
  showToast,
  setSelectedEventId,
  registerForEvent,
}) => {
  const { currentUser, events, tasks, setActiveTab } = useApp();

  return (
    <>
      {/* 1) Four StatTiles */}
      <div className="stat-tiles-grid">
        <StatTile
          label="Upcoming Events"
          value={String(events.filter((e) => e.status !== 'completed' && e.status !== 'cancelled').length || 3)}
          footnote="2 open for entry"
          tint="mint"
          icon={<Calendar size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('events')}
        />

        <StatTile
          label="Duties Pending"
          value={String(tasks.filter((t) => t.status !== 'done').length || 2)}
          footnote="Turnstile check-in"
          tint="amber"
          icon={<ListTodo size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('operations')}
        />

        <StatTile
          label="Events Attended"
          value="3"
          footnote="Credentials verified"
          tint="teal"
          icon={<CheckCircle2 size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('operations')}
        />

        <StatTile
          label="Volunteer Badges"
          value="16h"
          footnote="2 Squad Badges"
          tint="lavender"
          icon={<Award size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('profile')}
        />
      </div>

      {/* 2) Next Event Hero Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Overline pill>NEXT CHAPTER EVENT</Overline>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Turnstile Active
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 border border-slate-800">
            <img
              src={events[0]?.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
              alt={events[0]?.title || 'Next Event'}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3.5 flex flex-col justify-end">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                {events[0]?.category || 'Technical Workshop'}
              </span>
              <h3 className="font-extrabold text-base text-white leading-tight">
                {events[0]?.title || 'QGIS & Satellite Remote Sensing Workshop'}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={16} strokeWidth={1.75} className="text-emerald-400" />
                  <span>{events[0]?.venue || 'Grand Auditorium'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={16} strokeWidth={1.75} className="text-amber-400" />
                  <span>Starts in 2d 14h</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('my_qr')}
              className="flex-1 py-2.5 rounded-full font-bold text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode size={16} strokeWidth={1.75} className="text-purple-600" />
              <span>Show My Pass</span>
            </button>

            <button
              type="button"
              onClick={() => {
                registerForEvent(events[0]?.id || 'event_01');
                showToast('✓ Registered! Turnstile pass active.');
              }}
              className="flex-1 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={16} strokeWidth={1.75} />
              <span>{events[0]?.registeredUserIds?.includes(currentUser.uid) ? 'Registered ✓' : 'Register Now'}</span>
            </button>
          </div>
        </div>
      </SectionCard>

      {/* 3) My Assigned Duties Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListTodo size={20} strokeWidth={1.75} className="text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              My Assigned Duties
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
          >
            View Roster →
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {[
            {
              id: 'd1',
              title: 'Turnstile Gate Scanner - Entry Concourse',
              event: 'QGIS & Remote Sensing Workshop',
              time: 'Today @ 02:00 PM',
              status: 'Pending',
              chipBg: 'bg-amber-50 text-amber-800 border-amber-200',
            },
            {
              id: 'd2',
              title: 'Delegate Kit & Badge Distribution Desk',
              event: 'GEO FEST 2026 Conclave',
              time: 'Oct 12 @ 09:30 AM',
              status: 'Pending',
              chipBg: 'bg-amber-50 text-amber-800 border-amber-200',
            },
            {
              id: 'd3',
              title: 'Drone Flight Corridor Clearance Check',
              event: 'Canopy Mapping Survey',
              time: 'Oct 18 @ 07:00 AM',
              status: 'Assigned',
              chipBg: 'bg-blue-50 text-blue-800 border-blue-200',
            },
          ].map((duty) => (
            <div
              key={duty.id}
              className="p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="font-extrabold text-xs text-slate-900 truncate block">
                  {duty.title}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                  {duty.event} • {duty.time}
                </span>
              </div>

              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${duty.chipBg}`}>
                {duty.status}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4) Upcoming Chapter Events */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={20} strokeWidth={1.75} className="text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Upcoming Chapter Events
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            All Events ({events.length}) →
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {events.slice(0, 4).map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                setSelectedEventId(ev.id);
                setActiveTab('events');
              }}
              className="w-48 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-2xs overflow-hidden cursor-pointer hover:border-emerald-300 transition-all flex flex-col justify-between"
              style={{ width: '200px' }}
            >
              <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
                <img
                  src={ev.posterUrl}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 text-white">
                  {ev.category}
                </span>
              </div>
              <div className="p-2.5">
                <h4 className="font-extrabold text-xs text-slate-900 truncate">
                  {ev.title}
                </h4>
                <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                  {ev.venue}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5) Pinned Announcements Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Megaphone size={20} strokeWidth={1.75} className="text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Pinned Chapter Announcements
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('forum')}
            className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
          >
            Open Forum →
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {[
            {
              title: 'Turnstile gate passes mandatory for AY 2026-2027 entry',
              author: 'Dr. Sarah Jenkins (Faculty Advisor)',
              time: '2 hours ago',
            },
            {
              title: 'Drone flight corridors open for canopy survey volunteers',
              author: 'Alex Rivera (Chapter President)',
              time: 'Yesterday',
            },
          ].map((ann, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1"
            >
              <span className="font-bold text-xs text-slate-900 leading-snug">
                {ann.title}
              </span>
              <span className="text-[11px] text-slate-400">
                By {ann.author} • {ann.time}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
};
