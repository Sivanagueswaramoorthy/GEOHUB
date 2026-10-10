import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskModel } from '../../types';

export interface ScreenTwoMetricItem {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subtext?: string;
  bgColor?: string;
}

export interface ScreenTwoBriefItem {
  title: string;
  subtitle?: string;
  tag?: string;
  tagType?: 'due' | 'overdue' | 'active' | 'info';
}

interface ScreenTwoModelProps {
  showQuickAction?: boolean;
  quickActionTitle?: string;
  quickActionSubtitle?: string;
  quickActionIcon?: React.ReactNode;
  onQuickActionClick?: () => void;
  metrics: ScreenTwoMetricItem[];
  briefTitle?: string;
  briefItems: ScreenTwoBriefItem[];
  tasksHeader?: string;
  tasks: TaskModel[];
  onTaskToggle?: (taskId: string) => void;
  children?: React.ReactNode;
}

export const ScreenTwoModel: React.FC<ScreenTwoModelProps> = ({
  showQuickAction = false,
  quickActionTitle,
  quickActionSubtitle,
  quickActionIcon,
  onQuickActionClick,
  metrics,
  briefTitle = 'Morning Brief',
  briefItems,
  tasksHeader = "Today's Tasks",
  tasks,
  onTaskToggle,
  children,
}) => {
  const { setActiveTab } = useApp();

  const [activeDateIndex, setActiveDateIndex] = useState(2); // Default Wednesday 14
  const [isRefreshed, setIsRefreshed] = useState(false);

  // 7-day strip (exact match to May 2026 reference)
  const daysList = [
    { day: 'Mon', date: 12 },
    { day: 'Tue', date: 13 },
    { day: 'Wed', date: 14 },
    { day: 'Thu', date: 15 },
    { day: 'Fri', date: 16 },
    { day: 'Sat', date: 17 },
    { day: 'Sun', date: 18 },
  ];

  const handleRefresh = () => {
    setIsRefreshed(true);
    setTimeout(() => setIsRefreshed(false), 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Quick Action Banner Card (Optional) */}
      {showQuickAction && quickActionTitle && (
        <div
          onClick={onQuickActionClick}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E8ECF2',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: onQuickActionClick ? 'pointer' : 'default',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                flexShrink: 0,
              }}
            >
              {quickActionIcon}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {quickActionTitle}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {quickActionSubtitle}
              </div>
            </div>
          </div>
          <ChevronRight size={20} strokeWidth={1.75} color="#94A3B8" />
        </div>
      )}

      {/* 2. Horizontal Date Strip (Exact Screen 2 May 2026 Strip) */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            padding: '0 4px',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            May 2026
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveDateIndex((prev) => Math.max(0, prev - 1))}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActiveDateIndex((prev) => Math.min(daysList.length - 1, prev + 1))}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
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

        {/* 7-Day Pill List */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '6px',
            overflowX: 'auto',
            padding: '2px 0',
          }}
        >
          {daysList.map((item, index) => {
            const isActive = activeDateIndex === index;
            return (
              <div
                key={item.date}
                onClick={() => setActiveDateIndex(index)}
                style={{
                  flex: 1,
                  minWidth: '44px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                  {item.day}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#10B981' : '#F8FAFC',
                    color: isActive ? '#FFFFFF' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                    transition: 'all 150ms ease',
                  }}
                >
                  {item.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Three Metric Cards Trio (Horizontal Row with Soft Lightgreen Pastel) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={i}
            style={{
              backgroundColor: m.bgColor || '#ECFDF5',
              borderRadius: '16px',
              padding: '12px 10px',
              border: '1px solid #D1FAE5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '84px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#047857' }}>{m.icon}</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#064E3B' }}>
                {m.value}
              </span>
            </div>
            <div>
              {m.subtext && (
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  {m.subtext}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600, marginTop: '2px', lineHeight: 1.15 }}>
                {m.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Morning Brief Card (Exact Screen 2 Match with Lightgreen styling) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8ECF2',
          padding: '16px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Header with Live Status Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {briefTitle}
          </h2>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#10B981',
              backgroundColor: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            Live
          </span>
        </div>

        {/* Brief Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {briefItems.map((item, idx) => {
            const getTagStyle = () => {
              switch (item.tagType) {
                case 'due':
                  return { bg: '#FEF3C7', text: '#D97706' };
                case 'overdue':
                  return { bg: '#FEE2E2', text: '#DC2626' };
                case 'active':
                  return { bg: '#ECFDF5', text: '#059669' };
                default:
                  return { bg: '#F1F5F9', text: '#475569' };
              }
            };
            const tagStyle = getTagStyle();

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>

                {item.tag && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: tagStyle.bg,
                      color: tagStyle.text,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      flexShrink: 0,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button: Refresh Live Brief */}
        <button
          onClick={handleRefresh}
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '999px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E8ECF2',
            color: '#0F172A',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 150ms ease',
          }}
        >
          <RefreshCw
            size={16} strokeWidth={1.75}
            color="#10B981"
            style={{
              transform: isRefreshed ? 'rotate(360deg)' : 'none',
              transition: 'transform 500ms ease',
            }}
          />
          <span>Refresh Live Brief</span>
        </button>
      </div>

      {/* 5. Today's Tasks Section (Exact Screen 2 Match) */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            padding: '0 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {tasksHeader}
            </h3>
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
              }}
            >
              {tasks.length}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}
          >
            See all
          </button>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.slice(0, 4).map((t) => {
            const isDone = t.status === 'done';
            return (
              <div
                key={t.id}
                onClick={() => onTaskToggle && onTaskToggle(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E8ECF2',
                  cursor: onTaskToggle ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    style={{
                      color: isDone ? '#10B981' : '#CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isDone ? <CheckCircle2 size={20} strokeWidth={1.75} /> : <Circle size={20} strokeWidth={1.75} />}
                  </button>
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isDone ? '#94A3B8' : '#0F172A',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {t.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span>{t.team} Squad</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={16} strokeWidth={1.75} /> {t.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: t.priority === 'high' ? '#EF4444' : '#10B981',
                    backgroundColor: t.priority === 'high' ? '#FEE2E2' : '#ECFDF5',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {t.priority}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Specific Additional Content (e.g. Sanctions, Live QR Scan, Grant Ledgers) */}
      {children}
    </div>
  );
};
