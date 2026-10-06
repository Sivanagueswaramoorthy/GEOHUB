import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users2,
  DollarSign,
  TrendingUp,
  FileText,
  Scan,
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Check,
  X,
  Radio,
  UserPlus,
  BarChart3,
  Layers,
  Image,
  Sun,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppAvatar } from '../../components/common/AppAvatar';
import { Modal } from '../../components/common/Modal';

export const SuperAdminDashboardView: React.FC = () => {
  const {
    currentUser,
    events,
    teams,
    users,
    tasks,
    approvals,
    attendance,
    report,
    approveItem,
    rejectItem,
    setActiveTab,
    setSelectedEventId,
  } = useApp();

  // State
  const [selectedDate, setSelectedDate] = useState('2026-10-03');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review Approval Modal State
  const [reviewItem, setReviewItem] = useState<{
    id: string;
    title: string;
    submittedBy: string;
    amount?: string;
    type: string;
    details: string;
  } | null>(null);

  // Greeting logic
  const hour = new Date().getHours();
  const greetingText = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const displayName = currentUser?.role === 'super_admin'
    ? (currentUser.name.startsWith('Dr.') ? currentUser.name : `Dr. ${currentUser.name}`)
    : (currentUser?.name || 'Admin');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Week Strip Data (Mon 28 Sep to Sun 4 Oct 2026)
  const weekDays = [
    { dateStr: '2026-09-28', dayName: 'Mon', dayNum: 28, hasDot: false },
    { dateStr: '2026-09-29', dayName: 'Tue', dayNum: 29, hasDot: true },
    { dateStr: '2026-09-30', dayName: 'Wed', dayNum: 30, hasDot: false },
    { dateStr: '2026-10-01', dayName: 'Thu', dayNum: 1, hasDot: true },
    { dateStr: '2026-10-02', dayName: 'Fri', dayNum: 2, hasDot: false },
    { dateStr: '2026-10-03', dayName: 'Sat', dayNum: 3, hasDot: true, isToday: true },
    { dateStr: '2026-10-04', dayName: 'Sun', dayNum: 4, hasDot: false },
  ];

  // Agendas mapped by date
  const agendaByDate: Record<string, { time: string; item: string }[]> = {
    '2026-10-03': [
      { time: '10:00 AM', item: 'Core committee meeting, Seminar Hall' },
      { time: '2:00 PM', item: 'Poster review (Promotion team)' },
      { time: '5:00 PM', item: 'Venue booking deadline (Management)' },
    ],
    '2026-09-29': [
      { time: '11:00 AM', item: 'GIS Map Lab Equipment Inspection' },
      { time: '4:00 PM', item: 'Dean of Sciences Quarterly Consultation' },
    ],
    '2026-10-01': [
      { time: '3:00 PM', item: 'Auditorium Audio-Visual Testing for GEO FEST' },
    ],
  };

  const currentAgenda = agendaByDate[selectedDate] || [];

  // 2. Needs Your Attention Approvals (Specification Data)
  const [attentionItems, setAttentionItems] = useState([
    {
      id: 'att_1',
      title: 'Event proposal: Map Making Workshop',
      submittedBy: 'President',
      type: 'Event Charter',
      amount: '₹3,500',
      details: 'Hands-on QGIS & remote sensing mapping workshop for 45 participants.',
    },
    {
      id: 'att_2',
      title: 'Budget approval: GEO FEST (₹12,000)',
      submittedBy: 'Vice President',
      type: 'Budget Requisition',
      amount: '₹12,000',
      details: 'Disbursement allocation for stage fabrication, banners and sound console.',
    },
    {
      id: 'att_3',
      title: 'Join request: Anjali R. (Promotion)',
      submittedBy: 'Team admin',
      type: 'Member Induction',
      amount: undefined,
      details: 'Anjali R. (2nd Year Cartography) applying for Social Media Graphics role.',
    },
  ]);

  const handleReviewAction = (item: typeof attentionItems[0]) => {
    setReviewItem(item);
  };

  const handleConfirmApproval = (approved: boolean) => {
    if (!reviewItem) return;
    if (approved) {
      showToast(`✓ Approved: ${reviewItem.title}`);
      setAttentionItems((prev) => prev.filter((i) => i.id !== reviewItem.id));
    } else {
      showToast(`Declined: ${reviewItem.title}`);
      setAttentionItems((prev) => prev.filter((i) => i.id !== reviewItem.id));
    }
    setReviewItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="executive-toast">
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Greeting Header with HD Official Logo on the Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '4px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <Sun size={15} color="#F59E0B" />
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{greetingText}</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {displayName}
          </h1>
        </div>

        {/* Clear & HD Official Logo (Enlarged) */}
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '18px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8ECF2',
            boxShadow: '0 6px 18px rgba(16, 185, 129, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            flexShrink: 0,
          }}
        >
          <img
            src="/geo-hub-logo-hd.png"
            alt="Green Eco Organization Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Summary Cards — Premium Rebuild */}

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E8ECF2',
          padding: '14px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

          {/* Card 1: Total Members — Mint */}
          <div style={{
            backgroundColor: '#ECFDF5',
            borderRadius: '18px',
            border: '1.5px solid #A7F3D0',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#047857',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                lineHeight: 1.3,
              }}>
                Total<br />Members
              </span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '10px',
                backgroundColor: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}>
                <Users2 size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#064E3B', lineHeight: 1, letterSpacing: '-0.02em' }}>
              128
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              fontSize: '11px',
              fontWeight: 700,
              color: '#047857',
              backgroundColor: '#FFFFFF',
              border: '1px solid #6EE7B7',
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              +12 this month
            </div>
          </div>

          {/* Card 2: Squad Team Leads — Royal Purple */}
          <div style={{
            backgroundColor: '#F5F3FF',
            borderRadius: '18px',
            border: '1.5px solid #DDD6FE',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#6D28D9',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                lineHeight: 1.3,
              }}>
                Squad<br />Leads
              </span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '10px',
                backgroundColor: '#EDE9FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C3AED',
              }}>
                <Award size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#4C1D95', lineHeight: 1, letterSpacing: '-0.02em' }}>
              5
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              fontSize: '11px',
              fontWeight: 700,
              color: '#6D28D9',
              backgroundColor: '#FFFFFF',
              border: '1px solid #C4B5FD',
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              4 Squads
            </div>
          </div>

          {/* Card 3: Active Events — Amber */}
          <div style={{
            backgroundColor: '#FFFBEB',
            borderRadius: '18px',
            border: '1.5px solid #FDE68A',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#B45309',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                lineHeight: 1.3,
              }}>
                Active<br />Events
              </span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
              }}>
                <Calendar size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#78350F', lineHeight: 1, letterSpacing: '-0.02em' }}>
              3
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              fontSize: '11px',
              fontWeight: 700,
              color: '#92400E',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FCD34D',
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              1 live soon
            </div>
          </div>

          {/* Card 4: Completed This Year — Teal */}
          <div style={{
            backgroundColor: '#F0FDFA',
            borderRadius: '18px',
            border: '1.5px solid #99F6E4',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#0F766E',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                lineHeight: 1.3,
              }}>
                Completed<br />This Year
              </span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '10px',
                backgroundColor: '#CCFBF1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0D9488',
              }}>
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#134E4A', lineHeight: 1, letterSpacing: '-0.02em' }}>
              7
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              fontSize: '11px',
              fontWeight: 600,
              color: '#0F766E',
              backgroundColor: '#FFFFFF',
              border: '1px solid #5EEAD4',
              padding: '2px 8px',
              borderRadius: '999px',
            }}>
              Across all squads
            </div>
          </div>

        </div>
      </div>


      {/* Members per team (Donut Chart) - Positioned Above Calendar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Members per team
          </h4>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
            128 Total
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
          {/* SVG Donut */}
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
              {/* Promotion 34 (26.5%) */}
              <circle
                cx="20"
                cy="20"
                r="15.915"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="26.5 73.5"
                strokeDashoffset="25"
              />
              {/* Entertainment 34 (26.5%) */}
              <circle
                cx="20"
                cy="20"
                r="15.915"
                fill="transparent"
                stroke="#34D399"
                strokeWidth="4"
                strokeDasharray="26.5 73.5"
                strokeDashoffset="-1.5"
              />
              {/* Management 32 (25%) */}
              <circle
                cx="20"
                cy="20"
                r="15.915"
                fill="transparent"
                stroke="#6EE7B7"
                strokeWidth="4"
                strokeDasharray="25 75"
                strokeDashoffset="-28"
              />
              {/* Documentation 28 (22%) */}
              <circle
                cx="20"
                cy="20"
                r="15.915"
                fill="transparent"
                stroke="#A7F3D0"
                strokeWidth="4"
                strokeDasharray="22 78"
                strokeDashoffset="-53"
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>128</span>
              <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 600 }}>Scholars</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>Promotion: <strong>34</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34D399' }} />
              <span>Entertainment: <strong>34</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6EE7B7' }} />
              <span>Management: <strong>32</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#A7F3D0' }} />
              <span>Documentation: <strong>28</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Week Strip (Calendar) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
            October 2026
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E8ECF2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E8ECF2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 7-Day Week Pill List (Mon 28 to Sun 4) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
          {weekDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <div
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  {d.dayName}
                </span>

                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#10B981' : d.isToday ? '#ECFDF5' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : d.isToday ? '#047857' : '#0F172A',
                    border: d.isToday && !isSelected ? '1.5px solid #10B981' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                    transition: 'all 150ms ease',
                  }}
                >
                  {d.dayNum}
                </div>

                {/* Dot under dates that have an agenda item */}
                <div style={{ height: '5px', display: 'flex', alignItems: 'center' }}>
                  {d.hasDot && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#10B981' : '#059669',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Today's Agenda Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {selectedDate === '2026-10-03'
              ? 'Saturday, 3 October'
              : new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
          </h2>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '999px' }}>
            {currentAgenda.length} Items
          </span>
        </div>

        {currentAgenda.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
            Nothing scheduled. Enjoy a clear day.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentAgenda.map((ag, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#047857',
                    backgroundColor: '#ECFDF5',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    marginTop: '1px',
                  }}
                >
                  {ag.time}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1.35 }}>
                  {ag.item}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* 4. Needs Your Attention */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Needs your attention
          </h2>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: attentionItems.length > 0 ? '#92400E' : '#15803D',
              backgroundColor: attentionItems.length > 0 ? '#FEF3C7' : '#DCFCE7',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            {attentionItems.length > 0 ? `${attentionItems.length + 2} pending` : 'All caught up'}
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
            No pending approvals. You're all caught up.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attentionItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E8ECF2',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Submitted by: <strong style={{ color: '#0F172A' }}>{item.submittedBy}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleReviewAction(item)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#047857',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#10B981',
              textDecoration: 'none',
            }}
          >
            View all approvals &rarr;
          </button>
        </div>
      </div>



      {/* 9. Recent Activity */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Recent activity
          </h4>
          <button
            onClick={() => setActiveTab('gallery')}
            style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}
          >
            See all
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            {
              desc: 'Documentation team uploaded 12 photos to Alumni Talk',
              time: '2h ago',
              icon: '🖼️',
            },
            {
              desc: 'Promotion submitted the GEO FEST poster for review',
              time: '4h ago',
              icon: '📋',
            },
            {
              desc: 'Ravi K. scanned 42 check-ins at Geo Quiz',
              time: 'yesterday',
              icon: '🎟️',
            },
            {
              desc: 'New join request from Anjali R.',
              time: 'yesterday',
              icon: '👤',
            },
          ].map((act, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '8px 10px',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                fontSize: '12px',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span>{act.icon}</span>
                <span style={{ color: '#0F172A', fontWeight: 600, lineHeight: 1.35 }}>
                  {act.desc}
                </span>
              </div>
              <span style={{ color: '#94A3B8', fontSize: '11px', whiteSpace: 'nowrap' }}>
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal for Needs Your Attention */}
      <Modal
        isOpen={reviewItem !== null}
        onClose={() => setReviewItem(null)}
        title={reviewItem?.title || 'Review Charter'}
        subtitle={`Submitted by ${reviewItem?.submittedBy} • ${reviewItem?.type}`}
      >
        <div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E8ECF2', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              PROPOSAL SUMMARY
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', lineHeight: 1.45 }}>
              "{reviewItem?.details}"
            </div>
            {reviewItem?.amount && (
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#047857', marginTop: '8px' }}>
                Requested Allocation: {reviewItem.amount}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleConfirmApproval(true)}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Check size={16} /> Seal & Approve
            </button>
            <button
              onClick={() => handleConfirmApproval(false)}
              style={{
                height: '42px',
                padding: '0 16px',
                borderRadius: '999px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Decline
            </button>
          </div>
        </div>
      </Modal>


    </div>
  );
};
