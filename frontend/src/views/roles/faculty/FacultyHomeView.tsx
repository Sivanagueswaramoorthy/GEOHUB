import React, { useState, useEffect } from 'react';
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
  FileCheck,
  ArrowRight,
  X,
  ShieldCheck,
  FileText,
  UserCheck,
  Landmark,
  Coins,
  Layers,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatTile } from '../../../components/StatTile';
import { SectionCard } from '../../../components/SectionCard';
import { DonutCard } from '../../../components/DonutCard';
import { WeekStrip } from '../../../components/WeekStrip';
import { NextEventSpotlight } from '../../../components/NextEventSpotlight';

export interface FacultyHomeViewProps {
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
  onPrevWeek,
  onNextWeek,
  onToday,
  allMonthActivities = [],
  onApproveAttention,
  onDeclineAttention,
}) => {
  const { users, setActiveTab, approveItem, rejectItem } = useApp();
  const [isFullPageOpen, setIsFullPageOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deskReviewItem, setDeskReviewItem] = useState<any>(null);

  useEffect(() => {
    if (isFullPageOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isFullPageOpen]);

  const dutiesCount = attentionItems.filter((i) => i.category.toLowerCase().includes('duties') || i.category.toLowerCase().includes('duty')).length;
  const momsCount = attentionItems.filter((i) => i.category.toLowerCase().includes('mom')).length;
  const joinCount = attentionItems.filter((i) => i.category.toLowerCase().includes('join')).length;
  const budgetCount = attentionItems.filter((i) => i.category.toLowerCase().includes('budget')).length;
  const postCount = attentionItems.filter((i) => i.category.toLowerCase().includes('post')).length;

  const getCategoryConfig = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('mom')) {
      return {
        label: 'MoMs Pending',
        icon: <FileText size={13} strokeWidth={2.4} />,
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FDE68A',
        accent: '#D97706',
        badge: 'Action Required',
        badgeBg: '#FFFBEB',
        badgeText: '#B45309',
        badgeBorder: '#FDE68A',
      };
    }
    if (cat.includes('budget')) {
      return {
        label: 'Budget Disbursement',
        icon: <Landmark size={13} strokeWidth={2.4} />,
        bg: '#DAF1DE',
        text: '#0B2B26',
        border: '#8EB69B',
        accent: '#235347',
        badge: 'Financial Sanction',
        badgeBg: '#F0FDF4',
        badgeText: '#15803D',
        badgeBorder: '#BBF7D0',
      };
    }
    if (cat.includes('join')) {
      return {
        label: 'Squad Induction',
        icon: <UserCheck size={13} strokeWidth={2.4} />,
        bg: '#EFF6FF',
        text: '#1E40AF',
        border: '#BFDBFE',
        accent: '#3B82F6',
        badge: 'Membership Review',
        badgeBg: '#F0F9FF',
        badgeText: '#0369A1',
        badgeBorder: '#BAE6FD',
      };
    }
    if (cat.includes('duty') || cat.includes('duties')) {
      const isOverdue = cat.includes('overdue');
      return {
        label: isOverdue ? 'Overdue Duty' : 'Duty Assignment',
        icon: <CheckSquare size={13} strokeWidth={2.4} />,
        bg: isOverdue ? '#FEE2E2' : '#F1F5F9',
        text: isOverdue ? '#991B1B' : '#334155',
        border: isOverdue ? '#FECACA' : '#CBD5E1',
        accent: isOverdue ? '#DC2626' : '#64748B',
        badge: isOverdue ? 'Critical Notice' : 'Roster Compliance',
        badgeBg: isOverdue ? '#FEF2F2' : '#F8FAFC',
        badgeText: isOverdue ? '#B91C1C' : '#475569',
        badgeBorder: isOverdue ? '#FECACA' : '#E2E8F0',
      };
    }
    if (cat.includes('post')) {
      return {
        label: 'Executive Appointment',
        icon: <Award size={13} strokeWidth={2.4} />,
        bg: '#F5F3FF',
        text: '#5B21B6',
        border: '#DDD6FE',
        accent: '#7C3AED',
        badge: 'Official Elevation',
        badgeBg: '#FAF5FF',
        badgeText: '#6D28D9',
        badgeBorder: '#E9D5FF',
      };
    }
    return {
      label: category,
      icon: <AlertCircle size={13} strokeWidth={2.4} />,
      bg: '#F1F5F9',
      text: '#334155',
      border: '#CBD5E1',
      accent: '#235347',
      badge: 'Executive Review',
      badgeBg: '#F8FAFC',
      badgeText: '#475569',
      badgeBorder: '#E2E8F0',
    };
  };

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

  const handleApproveInDesk = () => {
    if (!deskReviewItem) return;
    if (onApproveAttention) {
      onApproveAttention(deskReviewItem);
    } else {
      approveItem(deskReviewItem.id);
    }
    setDeskReviewItem(null);
  };

  const handleDeclineInDesk = () => {
    if (!deskReviewItem) return;
    if (onDeclineAttention) {
      onDeclineAttention(deskReviewItem);
    } else {
      rejectItem(deskReviewItem.id, 'Declined by Faculty In-Charge');
    }
    setDeskReviewItem(null);
  };

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

      {/* 5) Executive Approvals Launch Button */}
      <div
        onClick={() => setIsFullPageOpen(true)}
        className="w-full p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-[#235347] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: '#DAF1DE',
              border: '1px solid #8EB69B',
              color: '#235347',
            }}
          >
            <CheckSquare size={22} strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0B2B26] transition-colors">
                Executive Approvals
              </h3>
              <span
                className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: attentionItems.length > 0 ? '#DAF1DE' : '#F1F5F9',
                  color: attentionItems.length > 0 ? '#163832' : '#64748B',
                  border: attentionItems.length > 0 ? '1px solid #8EB69B' : '1px solid #CBD5E1',
                }}
              >
                {attentionItems.length} Sanctions Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {attentionItems.length > 0
                ? 'Tap to open full sanction desk and review all pending items'
                : 'All executive items and budgets sanctioned'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all flex items-center gap-1 shadow-xs"
            style={{
              backgroundColor: '#235347',
            }}
          >
            <span>Review</span>
            <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {/* Full Page Approvals Desk Overlay */}
      {isFullPageOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Sticky Full Page Top Navigation Bar */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(11, 43, 38, 0.08)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px -2px rgba(5, 31, 32, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsFullPageOpen(false)}
                className="flex items-center justify-center rounded-xl bg-slate-50 hover:bg-[#DAF1DE]/50 border border-slate-200 hover:border-[#8EB69B] transition-all cursor-pointer shadow-2xs"
                style={{ width: '40px', height: '40px' }}
                title="Back to Dashboard"
              >
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Executive Approvals & Sanctions
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 9px',
                    borderRadius: '999px',
                    backgroundColor: '#DAF1DE',
                    color: '#0B2B26',
                    border: '1px solid #8EB69B',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#235347', display: 'inline-block' }} />
                  <span>{attentionItems.length} Pending</span>
                </span>
              </div>
            </div>
          </div>

          {/* Full Page Content Container */}
          <div style={{ padding: '20px', maxWidth: '840px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px' }}>
            {/* Filter Tabs (Horizontal, scrollbar-free) */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '4px 2px',
              }}
              className="[&::-webkit-scrollbar]:hidden"
            >
              {[
                { key: 'all', label: 'All Sanctions', count: attentionItems.length, icon: <Layers size={13} /> },
                { key: 'duties', label: 'Duties', count: dutiesCount, icon: <CheckSquare size={13} /> },
                { key: 'moms', label: 'MoMs', count: momsCount, icon: <FileText size={13} /> },
                { key: 'join', label: 'Join Requests', count: joinCount, icon: <UserCheck size={13} /> },
                { key: 'budget', label: 'Budgets', count: budgetCount, icon: <Landmark size={13} /> },
                { key: 'post', label: 'Appointments', count: postCount, icon: <Award size={13} /> },
              ].map((tab) => {
                const isActive = filterCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterCategory(tab.key)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #163832' : '1px solid #E2E8F0',
                      backgroundColor: isActive ? '#0B2B26' : '#FFFFFF',
                      color: isActive ? '#DAF1DE' : '#475569',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isActive ? '0 2px 8px rgba(11, 43, 38, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '999px',
                        backgroundColor: isActive ? 'rgba(218, 241, 222, 0.22)' : '#F1F5F9',
                        color: isActive ? '#DAF1DE' : '#64748B',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* List of Approval Items */}
            {attentionItems.filter((item) => {
              if (filterCategory === 'duties') return item.category.toLowerCase().includes('duties') || item.category.toLowerCase().includes('duty');
              if (filterCategory === 'moms') return item.category.toLowerCase().includes('mom');
              if (filterCategory === 'join') return item.category.toLowerCase().includes('join');
              if (filterCategory === 'budget') return item.category.toLowerCase().includes('budget');
              if (filterCategory === 'post') return item.category.toLowerCase().includes('post');
              return true;
            }).length === 0 ? (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px dashed #CBD5E1',
                  padding: '48px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '18px',
                    backgroundColor: '#DAF1DE',
                    border: '1px solid #8EB69B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#163832',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    All Sanctions Cleared!
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', maxWidth: '380px' }}>
                    No pending items match this category. All executive decisions and budget disbursements have been officially recorded.
                  </p>
                </div>
                {filterCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFilterCategory('all')}
                    style={{
                      padding: '7px 18px',
                      borderRadius: '999px',
                      backgroundColor: '#DAF1DE',
                      color: '#163832',
                      border: '1px solid #8EB69B',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Show All Categories ({attentionItems.length})
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {attentionItems
                  .filter((item) => {
                    if (filterCategory === 'duties') return item.category.toLowerCase().includes('duties') || item.category.toLowerCase().includes('duty');
                    if (filterCategory === 'moms') return item.category.toLowerCase().includes('mom');
                    if (filterCategory === 'join') return item.category.toLowerCase().includes('join');
                    if (filterCategory === 'budget') return item.category.toLowerCase().includes('budget');
                    if (filterCategory === 'post') return item.category.toLowerCase().includes('post');
                    return true;
                  })
                  .map((item) => {
                    const cfg = getCategoryConfig(item.category);
                    const initials = item.submittedBy.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'EX';

                    return (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '22px',
                          border: '1px solid #E5EBE7',
                          padding: '20px 22px',
                          boxShadow: '0 4px 16px -2px rgba(11, 43, 38, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.15s ease',
                        }}
                        className="hover:border-[#8EB69B] hover:shadow-md"
                      >
                        {/* Top Category & Status Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                color: cfg.text,
                                backgroundColor: cfg.bg,
                                padding: '3px 10px',
                                borderRadius: '999px',
                                border: `1px solid ${cfg.border}`,
                              }}
                            >
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </span>

                            {/* Urgency Badge */}
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: cfg.badgeText,
                                backgroundColor: cfg.badgeBg,
                                padding: '2px 8px',
                                borderRadius: '999px',
                                border: `1px solid ${cfg.badgeBorder}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: cfg.accent, display: 'inline-block' }} />
                              <span>{cfg.badge}</span>
                            </span>
                          </div>

                          {/* Disbursement Amount if applicable */}
                          {item.amount && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                fontWeight: 800,
                                color: '#0B2B26',
                                backgroundColor: '#DAF1DE',
                                padding: '3px 12px',
                                borderRadius: '999px',
                                border: '1px solid #8EB69B',
                                boxShadow: '0 1px 3px rgba(11, 43, 38, 0.08)',
                              }}
                            >
                              <Coins size={13} color="#163832" />
                              <span>Disbursement: <strong>{item.amount}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Title & Detailed Synopsis */}
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                            {item.title}
                          </h3>
                          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                            {item.details}
                          </p>
                        </div>

                        {/* Originator Metadata Plate */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            border: '1px solid #F1F5F9',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#DAF1DE',
                                color: '#0B2B26',
                                fontSize: '10px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #8EB69B',
                              }}
                            >
                              {initials}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              Originator: <strong style={{ color: '#1E293B', fontWeight: 700 }}>{item.submittedBy}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 700, color: '#163832' }}>
                            <BadgeCheck size={13} color="#235347" />
                            <span>Institutional Sanction Tracked</span>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '12px',
                            borderTop: '1px solid #F1F5F9',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                            Direct authority of Faculty In-Charge
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setDeskReviewItem(item);
                            }}
                            style={{
                              padding: '9px 22px',
                              borderRadius: '999px',
                              background: 'linear-gradient(135deg, #0B2B26 0%, #235347 100%)',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(11, 43, 38, 0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.15s ease',
                            }}
                            className="hover:opacity-95 active:scale-95"
                          >
                            <span>Review & Decide</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* In-Desk Sanction & Review Modal */}
          {deskReviewItem && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10001,
                backgroundColor: 'rgba(5, 31, 32, 0.72)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
              onClick={() => setDeskReviewItem(null)}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '26px',
                  maxWidth: '540px',
                  width: '100%',
                  boxShadow: '0 24px 48px -12px rgba(5, 31, 32, 0.35)',
                  overflow: 'hidden',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 24px',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        backgroundColor: '#DAF1DE',
                        border: '1px solid #8EB69B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0B2B26',
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Sanction & Review Item
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                        {deskReviewItem.category} • Official Executive Action
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeskReviewItem(null)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#F1F5F9',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748B',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:bg-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      padding: '18px',
                      borderRadius: '18px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#163832',
                          backgroundColor: '#DAF1DE',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          border: '1px solid #8EB69B',
                        }}
                      >
                        {deskReviewItem.category}
                      </span>

                      {deskReviewItem.amount && (
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: '13px',
                            color: '#0B2B26',
                            backgroundColor: '#DAF1DE',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            border: '1px solid #8EB69B',
                          }}
                        >
                          Disbursement: {deskReviewItem.amount}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                      {deskReviewItem.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      {deskReviewItem.details}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: '1px solid #E2E8F0',
                        fontSize: '11.5px',
                        color: '#64748B',
                      }}
                    >
                      <span>
                        Submitted by: <strong style={{ color: '#1E293B', fontWeight: 700 }}>{deskReviewItem.submittedBy}</strong>
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Verified Proposal</span>
                    </div>
                  </div>

                  {/* Statutory Policy Affirmation */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '11.5px',
                      color: '#1E40AF',
                      lineHeight: 1.45,
                    }}
                  >
                    <BadgeCheck size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Sanctioning will commit this executive action to the official institutional audit ledger under Faculty In-Charge authority.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      paddingTop: '6px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleDeclineInDesk}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '999px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        backgroundColor: '#FFFFFF',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:bg-red-50"
                    >
                      Decline Request
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveInDesk}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '999px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #0B2B26 0%, #235347 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(11, 43, 38, 0.25)',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      className="hover:opacity-95 active:scale-95"
                    >
                      <CheckCircle2 size={16} />
                      <span>Confirm & Sanction</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6) Next Event Spotlight */}
      <NextEventSpotlight timeLeft={timeLeft} />
    </>
  );
};
