import React, { useState } from 'react';
import {
  Users2,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileCheck,
  CheckSquare,
  Radio,
  Clock,
  FileText,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatTile } from '../../../components/StatTile';
import { SectionCard } from '../../../components/SectionCard';
import { DonutCard } from '../../../components/DonutCard';
import { WeekStrip } from '../../../components/WeekStrip';
import { NextEventSpotlight } from '../../../components/NextEventSpotlight';

export interface CoordinatorHomeViewProps {
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  weekDays: { dateStr: string; dayName: string; dayNum: number; hasDot: boolean; isToday?: boolean }[];
  currentAgenda: { id?: string; time: string; item: string; venue: string; tag: string; dateStr?: string; status?: string; squad?: string }[];
  attentionItems: any[];
  handleReviewAttention: (item: any) => void;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  allMonthActivities?: { id?: string; time: string; item: string; venue: string; tag: string; dateStr?: string; status?: string; squad?: string }[];
  onApproveAttention?: (item: any) => void;
  onDeclineAttention?: (item: any) => void;
}

export const CoordinatorHomeView: React.FC<CoordinatorHomeViewProps> = ({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  weekDays,
  currentAgenda,
  attentionItems,
  handleReviewAttention,
  timeLeft,
  onPrevWeek,
  onNextWeek,
  onToday,
  allMonthActivities = [],
  onApproveAttention,
  onDeclineAttention,
}) => {
  const { users, setActiveTab } = useApp();

  const executivePostHolders = users
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
    .map((holder) => ({
      name: holder.name,
      department: holder.department || 'Geosciences',
      position: holder.post || holder.teamRole || 'Officer',
      avatarInitials: holder.name.slice(0, 2).toUpperCase(),
    }));

  return (
    <>
      {/* 1) Four StatTiles */}
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

      {/* 2) DonutCard: Members per team & Leadership */}
      <DonutCard
        title="Members per team"
        subtitle="128 Total active chapter scholars"
        centerTotal="128"
        centerLabel="Scholars"
        segments={[
          { label: 'Promotion', count: 34, color: '#0B2B26' },
          { label: 'Entertainment', count: 34, color: '#235347' },
          { label: 'Management', count: 32, color: '#163832' },
          { label: 'Documentation', count: 28, color: '#8EB69B' },
        ]}
        postHolders={executivePostHolders.length > 0 ? executivePostHolders : undefined}
      />

      {/* 3) Calendar Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevWeek}
              className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 touch-target-44 cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-extrabold text-sm text-slate-900">{currentMonth}</span>
            <button
              type="button"
              onClick={onNextWeek}
              className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 touch-target-44 cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onToday}
            className="px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-90"
            style={{
              color: '#163832',
              backgroundColor: '#DAF1DE',
              border: '1px solid #8EB69B',
            }}
          >
            Today
          </button>
        </div>

        <WeekStrip
          days={weekDays}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
        />
      </SectionCard>

      {/* 4) Agenda Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={18} style={{ color: '#235347' }} />
            <span className="font-extrabold text-sm text-slate-900">
              Agenda for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            {weekDays.find((w) => w.dateStr === selectedDate)?.isToday && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: '#DAF1DE',
                  color: '#163832',
                  border: '1px solid #8EB69B',
                }}
              >
                Today
              </span>
            )}
          </div>
        </div>

        {/* Day Agenda List */}
        <div className="flex flex-col gap-2.5">
            {currentAgenda.length === 0 ? (
              <div
                style={{
                  padding: '28px 16px',
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#DAF1DE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#235347',
                  }}
                >
                  <Calendar size={18} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  No activities scheduled for this date
                </div>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0, maxWidth: '280px' }}>
                  Select another day from the calendar strip above.
                </p>
                {onToday && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={onToday}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#235347',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Jump to Today
                    </button>
                  </div>
                )}
              </div>
            ) : (
              currentAgenda.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="font-extrabold text-xs px-2.5 py-1 rounded-md shrink-0"
                      style={{
                        backgroundColor: '#DAF1DE',
                        color: '#163832',
                        border: '1px solid #8EB69B',
                      }}
                    >
                      {item.time}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {item.item}
                        </span>
                        {item.status === 'live' && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: '#DAF1DE',
                              color: '#0B2B26',
                              border: '1px solid #235347',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#235347',
                              }}
                            />
                            Live Now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                        <MapPin size={14} strokeWidth={1.75} style={{ color: '#235347' }} />
                        <span className="truncate">{item.venue}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shrink-0 mt-0.5"
                  >
                    {item.tag}
                  </span>
                </div>
              ))
            )}
          </div>
      </SectionCard>

      {/* 5) Needs Your Attention */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck size={20} strokeWidth={1.75} className="text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Needs Your Attention</h3>
          </div>
          {attentionItems.length > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {attentionItems.length} Actionable
            </span>
          )}
        </div>

        {attentionItems.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            ✓ All duties, requests, and sanctions have been cleared!
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
                    <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
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

      {/* 6) Coordinator Tasks Card */}
      <SectionCard padding="18px">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare size={20} strokeWidth={1.75} className="text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Coordinator Tasks</h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            3 Pending
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-extrabold text-xs text-slate-900 leading-snug">
                  Prepare pre-event meeting for GEO FEST
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Due Tomorrow, 10:00 AM • Seminar Hall B
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                Priority
              </span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Core committee standup</span>
              <button
                type="button"
                onClick={() => setActiveTab('meetings')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <FileText size={16} strokeWidth={1.75} />
                <span>Prepare MoM</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="font-extrabold text-xs text-slate-900 leading-snug">
                Review turnstile checkpoints for Grand Auditorium
              </span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Due Oct 5, 09:00 AM • Terminal 1 & 2
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Gate Prep
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="font-extrabold text-xs text-slate-900 leading-snug">
                Confirm volunteer refreshment & meal allocations
              </span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Due Oct 5, 08:30 AM • Canteen Annex
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Logistics
            </span>
          </div>
        </div>
      </SectionCard>

      {/* 7) Next Event Spotlight */}
      <NextEventSpotlight timeLeft={timeLeft} />
    </>
  );
};
