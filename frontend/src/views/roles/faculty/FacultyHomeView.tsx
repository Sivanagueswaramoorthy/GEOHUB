import React from 'react';
import {
  Users2,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckSquare,
  Radio,
  BarChart3,
  Clock,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatTile } from '../../../components/StatTile';
import { SectionCard } from '../../../components/SectionCard';
import { DonutCard } from '../../../components/DonutCard';
import { WeekStrip } from '../../../components/WeekStrip';

export interface FacultyHomeViewProps {
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  weekDays: { dateStr: string; dayName: string; dayNum: number; hasDot: boolean }[];
  currentAgenda: { time: string; item: string; venue: string; tag: string }[];
  attentionItems: any[];
  handleReviewAttention: (item: any) => void;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
}

export const FacultyHomeView: React.FC<FacultyHomeViewProps> = ({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  weekDays,
  currentAgenda,
  attentionItems,
  handleReviewAttention,
  timeLeft,
}) => {
  const { users, setActiveTab } = useApp();

  return (
    <>
      {/* 1) Four StatTiles in 2x2 grid */}
      <div className="stat-tiles-grid">
        <StatTile
          label="Total Members"
          value="128"
          footnote="+12 this month"
          tint="mint"
          icon={<Users2 size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('members')}
        />

        <StatTile
          label="Squad Leads"
          value="5"
          footnote="4 Squads"
          tint="lavender"
          icon={<Award size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('teams')}
        />

        <StatTile
          label="Active Events"
          value="3"
          footnote="1 live soon"
          tint="amber"
          icon={<Calendar size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('events')}
        />

        <StatTile
          label="Completed This Year"
          value="7"
          footnote="Across all squads"
          tint="teal"
          icon={<CheckCircle2 size={20} strokeWidth={1.75} />}
          onClick={() => setActiveTab('gallery')}
        />
      </div>

      {/* 2) DonutCard: Members per team */}
      <DonutCard
        title="Members per team"
        subtitle="128 Total active chapter scholars"
        centerTotal="128"
        centerLabel="Scholars"
        segments={[
          { label: 'Promotion', count: 34, color: '#A855F7' },
          { label: 'Entertainment', count: 34, color: '#F59E0B' },
          { label: 'Management', count: 32, color: '#3B82F6' },
          { label: 'Documentation', count: 28, color: '#10B981' },
        ]}
      />

      {/* 3) Calendar Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(currentMonth === 'October 2026' ? 'September 2026' : 'October 2026')
              }
              className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 touch-target-44"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-extrabold text-sm text-slate-900">{currentMonth}</span>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(currentMonth === 'October 2026' ? 'November 2026' : 'October 2026')
              }
              className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 touch-target-44"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDate('2026-10-03')}
            className="px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Today
          </button>
        </div>

        <WeekStrip
          days={weekDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </SectionCard>

      {/* 4) Agenda Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600" />
            <span className="font-extrabold text-sm text-slate-900">
              Agenda for{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {currentAgenda.length} Items
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {currentAgenda.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="font-extrabold text-xs text-emerald-700 bg-white px-2 py-1 rounded-md border border-slate-200 shrink-0">
                  {item.time}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    {item.item}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                    <MapPin size={16} strokeWidth={1.75} className="text-slate-400" />
                    <span className="truncate">{item.venue}</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shrink-0">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5) Executive Approvals / Needs Attention */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare size={20} strokeWidth={1.75} className="text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Executive Approvals</h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {attentionItems.length} Sanctions Pending
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ✓ All executive sanctions and budget items have been decided.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {item.category}
                  </span>
                  {item.amount && (
                    <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      {item.amount}
                    </span>
                  )}
                </div>

                <span className="font-extrabold text-xs text-slate-900 leading-snug mt-1 mb-1">
                  {item.title}
                </span>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2.5">
                  <span>By: {item.submittedBy}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleReviewAttention(item)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all"
                  >
                    Review & Decide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 6) Next Event Spotlight */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-red-500 animate-pulse" />
            <h3 className="font-extrabold text-sm text-slate-900">Next Event Spotlight</h3>
          </div>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
            Starts in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 mb-3.5">
          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
            QGIS & Satellite Remote Sensing Workshop
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <MapPin size={16} strokeWidth={1.75} className="text-emerald-600 shrink-0" />
            <span>Grand Auditorium • Oct 5, 10:00 AM</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-emerald-100/60">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">RSVP Registration</span>
              <div className="font-extrabold text-xs text-slate-900 mt-0.5">
                185 / 200 (92%)
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Budget Sanction</span>
              <div className="font-extrabold text-xs text-slate-900 mt-0.5">
                ₹8,400 / ₹10,000 (84%)
              </div>
            </div>
          </div>
        </div>

        {/* Duty Readiness */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Operational Duty Readiness
          </span>

          {[
            { label: 'Documentation', percent: 85, color: '#10B981' },
            { label: 'Signage & Badges', percent: 100, color: '#10B981' },
            { label: 'Shortlisting Attendees', percent: 70, color: '#3B82F6' },
            { label: 'Refreshments & Food', percent: 60, color: '#F59E0B' },
            { label: 'Gate Attendance Terminals', percent: 100, color: '#10B981' },
          ].map((duty, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">{duty.label}</span>
                <span className="text-slate-900 font-bold">{duty.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${duty.percent}%`, backgroundColor: duty.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 7) Attendance Per Event Bar Chart */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} strokeWidth={1.75} className="text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Attendance per Event</h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Past 4 Events</span>
        </div>

        <div className="flex items-end justify-between gap-3 h-32 pt-4 px-2 border-b border-slate-100">
          {[
            { name: 'GIS Mapping', rate: 96, height: '96%' },
            { name: 'Drone Lab', rate: 92, height: '92%' },
            { name: 'Eco Field', rate: 88, height: '88%' },
            { name: 'Hackathon', rate: 94, height: '94%' },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[11px] font-extrabold text-emerald-800">{bar.rate}%</span>
              <div className="w-full bg-emerald-100 rounded-t-lg relative overflow-hidden" style={{ height: bar.height }}>
                <div className="w-full h-full bg-emerald-500 rounded-t-lg transition-all" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 text-center truncate w-full">
                {bar.name}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2">
          <span>Overall Chapter Average</span>
          <span className="font-bold text-emerald-600">92.5% Attendance</span>
        </div>
      </SectionCard>

      {/* 8) Recent Chapter Activity Feed */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={20} strokeWidth={1.75} className="text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Recent Chapter Activity</h3>
          </div>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            94% On-time Duty Rate
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { time: '10m ago', text: 'Elena Rostova verified 42 students at Gate A turnstile terminal', squad: 'Management' },
            { time: '45m ago', text: 'Aarav Patel uploaded Minutes of Meeting for Core Committee', squad: 'Documentation' },
            { time: '2h ago', text: 'David Chen published promotional banner for Geo Fest', squad: 'Promotion' },
            { time: '4h ago', text: 'Ananya Sen logged ₹1,200 refreshment invoice with receipt', squad: 'Entertainment' },
          ].map((act, idx) => (
            <div key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 leading-snug">
                  {act.text}
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {act.time} • {act.squad} Squad
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 9) Executive Post Holders */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={20} strokeWidth={1.75} className="text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Executive Post Holders</h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Read-only
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {users
            .filter(
              (u) =>
                u.role === 'super_admin' ||
                u.role === 'admin' ||
                u.role === 'team_admin' ||
                (u.post && u.post.toLowerCase().includes('lead')) ||
                (u.teamRole && u.teamRole.toLowerCase().includes('lead')) ||
                (u.teamRole && u.teamRole.toLowerCase().includes('president'))
            )
            .slice(0, 5)
            .map((holder) => (
              <div
                key={holder.uid}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold"
                    style={{
                      backgroundColor: '#E7F9F1',
                      border: '1px solid #A7F3D0',
                      color: '#064E3B',
                    }}
                  >
                    {holder.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{holder.name}</div>
                    <div className="text-[11px] text-slate-500">{holder.department || 'Geosciences'}</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  {holder.post || holder.teamRole || 'Officer'}
                </span>
              </div>
            ))}
        </div>
      </SectionCard>
    </>
  );
};
