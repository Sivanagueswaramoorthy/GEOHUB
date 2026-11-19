import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Database,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  ClipboardCheck,
  Key,
  Megaphone,
  FileText,
  Lock,
  Unlock,
  ExternalLink,
} from 'lucide-react';
import { OverviewCounts, DiagnosticsData } from '../types';

interface DesktopDashboardViewProps {
  overviewCounts: OverviewCounts;
  diagnostics?: DiagnosticsData;
  latencyMs: number;
  isPinging: boolean;
  onPingDatabase: () => Promise<void>;
  onNavigateView: (view: 'dashboard' | 'team' | 'access' | 'provisioning' | 'logs' | 'database') => void;
  onOpenAddMember: () => void;
  onOpenBroadcast: () => void;
  isFreezeMode: boolean;
  onToggleFreeze: () => void;
  showToast: (message: string) => void;
}

export const DesktopDashboardView: React.FC<DesktopDashboardViewProps> = ({
  overviewCounts,
  diagnostics,
  latencyMs,
  isPinging,
  onPingDatabase,
  onNavigateView,
  onOpenAddMember,
  onOpenBroadcast,
  isFreezeMode,
  onToggleFreeze,
  showToast,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Dynamic greeting based on time of day
  const now = new Date();
  const currentHour = now.getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 18
      ? 'Good afternoon'
      : 'Good evening';

  // Format date info
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNumber = String(now.getDate()).padStart(2, '0');
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const year = now.getFullYear();

  // Generate 7-day strip centered around today
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      date: d.getDate(),
      isToday: i === 0,
    };
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* 1. Header Bar with Greeting & Quick Action Buttons */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="flex flex-col">
          <h1
            className="text-2xl md:text-3xl font-black text-[#051F20] tracking-tight"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            {greeting}, Master SuperAdmin
          </h1>
          <p className="text-xs md:text-sm font-medium text-[#235347] mt-1">
            {dayName}, {monthName} {dayNumber} · All 9 campus systems operational & monitored
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateView('logs')}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#DAF1DE] bg-white/80 hover:bg-[#DAF1DE]/60 text-[#163832] text-xs font-bold transition-all shadow-xs cursor-pointer"
            style={{ minHeight: '40px' }}
          >
            <Clock size={16} strokeWidth={2} />
            <span>Activity Logs</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddMember}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#051F20] hover:bg-[#163832] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            style={{ minHeight: '40px' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ Add Member</span>
          </button>
        </div>
      </header>

      {/* 2. Top Executive Section: Hero Banner Card (~62%) + Schedule Card (~38%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Hero Card (matching Code XR Hero card) */}
        <div
          className="lg:col-span-7 xl:col-span-8 rounded-[28px] p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, #051F20 0%, #0B2B26 35%, #163832 75%, #235347 100%)',
            boxShadow: '0 12px 36px rgba(5, 31, 32, 0.16)',
            border: '1px solid rgba(142, 182, 155, 0.25)',
            minHeight: '320px',
          }}
        >
          {/* Subtle Ambient Glowing Orbs */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(circle, #8EB69B 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Top Status Capsule */}
          <div className="flex items-center justify-between z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#DAF1DE]">
              <span className="w-2 h-2 rounded-full bg-[#DAF1DE] animate-pulse" />
              <span>Sprint 24 · {overviewCounts.online} teammates online</span>
            </div>
          </div>

          {/* Center Content & Circular Progress Donut */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4 z-10">
            {/* Headline and Metrics */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                Your campus is on a <span className="italic font-normal text-[#DAF1DE]">roll</span> this semester
              </h2>
              <p className="text-xs md:text-sm text-[#DAF1DE]/90 leading-relaxed max-w-md font-normal">
                100% of core academic microservices are healthy and campus-wide governance is fully synchronized.
              </p>

              {/* 3 Metric Counters in a row */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/15">
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black text-white">
                    {overviewCounts.students}
                  </span>
                  <span className="text-xs text-[#DAF1DE]/80 font-medium">Scholars Enrolled</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black text-white">
                    {overviewCounts.faculty}
                  </span>
                  <span className="text-xs text-[#DAF1DE]/80 font-medium">Faculty Mentors</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black text-white">
                    99.9%
                  </span>
                  <span className="text-xs text-[#DAF1DE]/80 font-medium">Cloud Uptime</span>
                </div>
              </div>
            </div>

            {/* Circular Progress Donut with Orbiting Avatars */}
            <div className="md:col-span-5 flex items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="#DAF1DE"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="326.7"
                    strokeDashoffset="75"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Donut Center Text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white tracking-tight">68%</span>
                  <span className="text-xs font-semibold text-[#DAF1DE] tracking-wide">
                    shipped
                  </span>
                </div>

                {/* Orbiting Avatar Badges along the circumference */}
                <div
                  className="absolute w-7 h-7 rounded-full bg-[#DAF1DE] border-2 border-[#163832] flex items-center justify-center text-xs font-black text-[#051F20] shadow-md"
                  style={{ top: '8px', left: '70px', transform: 'translateX(-50%)' }}
                  title="Advisor Lead"
                >
                  AL
                </div>
                <div
                  className="absolute w-7 h-7 rounded-full bg-white border-2 border-[#163832] flex items-center justify-center text-xs font-black text-[#163832] shadow-md"
                  style={{ top: '34px', right: '12px' }}
                  title="Treasurer"
                >
                  TR
                </div>
                <div
                  className="absolute w-7 h-7 rounded-full bg-[#8EB69B] border-2 border-[#163832] flex items-center justify-center text-xs font-black text-[#051F20] shadow-md"
                  style={{ bottom: '34px', right: '12px' }}
                  title="President"
                >
                  PR
                </div>
                <div
                  className="absolute w-7 h-7 rounded-full bg-[#DAF1DE] border-2 border-[#163832] flex items-center justify-center text-xs font-black text-[#163832] shadow-md"
                  style={{ bottom: '8px', left: '70px', transform: 'translateX(-50%)' }}
                  title="Webmaster"
                >
                  WM
                </div>
                <div
                  className="absolute w-7 h-7 rounded-full bg-white border-2 border-[#163832] flex items-center justify-center text-xs font-black text-[#051F20] shadow-md"
                  style={{ bottom: '34px', left: '12px' }}
                  title="Secretary"
                >
                  SC
                </div>
                <div
                  className="absolute w-7 h-7 rounded-full bg-[#8EB69B] border-2 border-[#163832] flex items-center justify-center text-xs font-black text-white shadow-md"
                  style={{ top: '34px', left: '12px' }}
                  title="Student Rep"
                >
                  SR
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Hero Action Buttons */}
          <div className="flex items-center gap-3 pt-3 z-10">
            <button
              type="button"
              onClick={() => onNavigateView('team')}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-[#DAF1DE] text-[#051F20] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Directory</span>
              <ExternalLink size={14} />
            </button>
            <button
              type="button"
              onClick={onOpenAddMember}
              className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30 backdrop-blur-md cursor-pointer"
            >
              + Add Member
            </button>
          </div>
        </div>

        {/* Right Schedule Card (matching Code XR Schedule widget) */}
        <div
          className="lg:col-span-5 xl:col-span-4 rounded-[28px] p-6 bg-white/80 backdrop-blur-xl border border-[#DAF1DE] flex flex-col justify-between shadow-xs"
          style={{ minHeight: '320px' }}
        >
          {/* Header of Calendar Widget */}
          <div className="flex items-start justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-black text-[#051F20] tracking-tight">
                {dayNumber}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#051F20]">{dayName}</span>
                <span className="text-xs text-[#235347] font-medium">
                  {monthName} {year} · 2 events
                </span>
              </div>
            </div>

            <div className="w-9 h-9 rounded-2xl bg-[#DAF1DE]/70 border border-[#8EB69B]/40 flex items-center justify-center text-[#163832] shrink-0">
              <CalendarIcon size={18} strokeWidth={2.2} />
            </div>
          </div>

          {/* 7-Day Horizontal Weekday Strip */}
          <div className="flex items-center justify-between gap-1 my-4 py-2 border-y border-[#DAF1DE]">
            {weekDays.map((item, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#051F20] text-white shadow-xs'
                      : 'text-[#163832] hover:bg-[#DAF1DE]/50'
                  }`}
                  style={{ minWidth: '38px' }}
                >
                  <span className="text-xs uppercase opacity-75">{item.name}</span>
                  <span className="text-xs font-black mt-0.5">{item.date}</span>
                </button>
              );
            })}
          </div>

          {/* Scheduled Milestones / Events */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B]/60 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-[#235347] bg-[#DAF1DE]/80 px-2 py-1 rounded-lg shrink-0">
                  09:30
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    Faculty Council Sync
                  </span>
                  <span className="text-xs text-[#235347]/80 truncate">
                    📍 Senate Hall · Governance
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#051F20] text-xs font-black uppercase tracking-wider shrink-0">
                Next
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B]/60 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-[#235347] bg-[#DAF1DE]/80 px-2 py-1 rounded-lg shrink-0">
                  12:45
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    Breakthrough Brainstorm
                  </span>
                  <span className="text-xs text-[#235347]/80 truncate">
                    📍 Geomatics Lab · Innovation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: 4 KPI Metric Cards with Sparklines (Exact match to Code XR Row 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Scholars */}
        <div
          className="rounded-[24px] p-5 flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(142, 182, 155, 0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE]/80 flex items-center justify-center text-[#163832]">
              <Users size={20} strokeWidth={2.2} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#051F20]">
              <ArrowUpRight size={14} strokeWidth={2.5} />
              <span>12%</span>
            </span>
          </div>

          <div className="my-4">
            <span className="text-3xl font-black text-[#051F20] tracking-tight">
              {overviewCounts.students}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#051F20] mt-0.5">Active people</span>
              <span className="text-xs text-[#8EB69B]">
                {overviewCounts.online || 24} online right now
              </span>
            </div>
          </div>

          {/* Botanical Sparkline SVG Curve */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0,18 Q 20,20 40,12 T 80,6 T 100,2"
                fill="none"
                stroke="#235347"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2: Open Deals / Faculty Mentors */}
        <div
          className="rounded-[24px] p-5 flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(142, 182, 155, 0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE]/80 flex items-center justify-center text-[#163832]">
              <GraduationCap size={20} strokeWidth={2.2} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#051F20]">
              <ArrowUpRight size={14} strokeWidth={2.5} />
              <span>8%</span>
            </span>
          </div>

          <div className="my-4">
            <span className="text-3xl font-black text-[#051F20] tracking-tight">
              {overviewCounts.faculty}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#051F20] mt-0.5">Faculty mentors</span>
              <span className="text-xs text-[#8EB69B]">8 departments active</span>
            </div>
          </div>

          {/* Sparkline Curve */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0,20 Q 25,16 50,14 T 75,8 T 100,4"
                fill="none"
                stroke="#235347"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: TiDB Cloud Latency */}
        <div
          className="rounded-[24px] p-5 flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(142, 182, 155, 0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE]/80 flex items-center justify-center text-[#163832]">
              <Database size={20} strokeWidth={2.2} />
            </div>
            <button
              type="button"
              onClick={onPingDatabase}
              disabled={isPinging}
              title="Ping TiDB Serverless Cloud"
              className="p-1.5 rounded-full bg-[#DAF1DE]/70 hover:bg-[#DAF1DE] text-[#051F20] transition-colors cursor-pointer"
            >
              <RotateCw size={14} className={isPinging ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#051F20] tracking-tight">
                {latencyMs}
              </span>
              <span className="text-xs font-bold text-[#235347]">ms</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#051F20] mt-0.5">TiDB Cloud Latency</span>
              <span className="text-xs text-[#8EB69B]">Serverless direct tunnel</span>
            </div>
          </div>

          {/* Sparkline Curve */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0,10 Q 20,4 40,14 T 70,16 T 100,10"
                fill="none"
                stroke="#235347"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 4: System Uptime */}
        <div
          className="rounded-[24px] p-5 flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(142, 182, 155, 0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#DAF1DE]/80 flex items-center justify-center text-[#163832]">
              <Activity size={20} strokeWidth={2.2} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#051F20]">
              <ArrowUpRight size={14} strokeWidth={2.5} />
              <span>0.4%</span>
            </span>
          </div>

          <div className="my-4">
            <span className="text-3xl font-black text-[#051F20] tracking-tight">99.96%</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#051F20] mt-0.5">System uptime</span>
              <span className="text-xs text-[#8EB69B]">Last 30 days · All green</span>
            </div>
          </div>

          {/* Sparkline Curve */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0,16 Q 30,12 60,6 T 100,2"
                fill="none"
                stroke="#235347"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: 6 Executive Action Tiles (3x2 Grid matching Code XR Row 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Tile 1: Review Requests */}
        <button
          type="button"
          onClick={() => onNavigateView('provisioning')}
          className="p-4 rounded-2xl border border-[#DAF1DE] bg-white/70 hover:bg-[#DAF1DE]/40 transition-all flex items-center gap-3 text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardCheck size={18} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#051F20] truncate">Review requests</span>
            <span className="text-xs text-[#235347] font-medium truncate">
              {overviewCounts.users} total enrolled users
            </span>
          </div>
        </button>

        {/* Tile 2: Role Permissions */}
        <button
          type="button"
          onClick={() => onNavigateView('access')}
          className="p-4 rounded-2xl border border-[#DAF1DE] bg-white/70 hover:bg-[#DAF1DE]/40 transition-all flex items-center gap-3 text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 group-hover:scale-105 transition-transform">
            <Key size={18} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#051F20] truncate">Role permissions</span>
            <span className="text-xs text-[#235347] font-medium truncate">
              {overviewCounts.modulesLive} active campus modules
            </span>
          </div>
        </button>

        {/* Tile 3: New Announcement */}
        <button
          type="button"
          onClick={onOpenBroadcast}
          className="p-4 rounded-2xl border border-[#DAF1DE] bg-white/70 hover:bg-[#DAF1DE]/40 transition-all flex items-center gap-3 text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 group-hover:scale-105 transition-transform">
            <Megaphone size={18} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#051F20] truncate">New announcement</span>
            <span className="text-xs text-[#235347] font-medium truncate">
              Dispatch push alert
            </span>
          </div>
        </button>

        {/* Tile 4: TiDB Cloud Sync */}
        <button
          type="button"
          onClick={onPingDatabase}
          className="p-4 rounded-2xl border border-[#DAF1DE] bg-white/70 hover:bg-[#DAF1DE]/40 transition-all flex items-center gap-3 text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 group-hover:scale-105 transition-transform">
            <Database size={18} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#051F20] truncate">TiDB cloud sync</span>
            <span className="text-xs text-[#235347] font-medium truncate">
              Telemetry active ({latencyMs}ms)
            </span>
          </div>
        </button>

        {/* Tile 5: Download a Report */}
        <button
          type="button"
          onClick={() => {
            showToast('Exporting campus governance report as PDF...');
          }}
          className="p-4 rounded-2xl border border-[#DAF1DE] bg-white/70 hover:bg-[#DAF1DE]/40 transition-all flex items-center gap-3 text-left shadow-2xs cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0 group-hover:scale-105 transition-transform">
            <FileText size={18} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#051F20] truncate">Download a report</span>
            <span className="text-xs text-[#235347] font-medium truncate">
              Academic audit PDF ready
            </span>
          </div>
        </button>

        {/* Tile 6: System Lock State */}
        <button
          type="button"
          onClick={onToggleFreeze}
          className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-left shadow-2xs cursor-pointer group ${
            isFreezeMode
              ? 'border-red-300 bg-red-50/70 hover:bg-red-100/70'
              : 'border-[#DAF1DE] bg-white/70 hover:bg-[#DAF1DE]/40'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isFreezeMode
                ? 'bg-red-100 border-red-300 text-[#D9534F]'
                : 'bg-white border-[#DAF1DE] text-[#163832]'
            }`}
          >
            {isFreezeMode ? (
              <Lock size={18} strokeWidth={2.2} />
            ) : (
              <Unlock size={18} strokeWidth={2.2} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#051F20] truncate">
              {isFreezeMode ? 'Freeze active' : 'System lock state'}
            </span>
            <span className="text-xs text-[#235347] font-medium truncate">
              {isFreezeMode ? 'Campus write ops locked' : 'Institutional live ops'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DesktopDashboardView;
