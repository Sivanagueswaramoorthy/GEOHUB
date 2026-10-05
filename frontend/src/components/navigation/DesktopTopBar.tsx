import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  QrCode,
  ShieldCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppAvatar } from '../common/AppAvatar';

export const DesktopTopBar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    notifications,
    markAllNotificationsAsRead,
    setIsRoleSwitcherOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Command Dashboard';
      case 'home':
        return 'Scholar Hub & Attendance';
      case 'events':
        return 'Club Events & Chapter Activities';
      case 'teams':
        return 'Squads, Committees & Workgroups';
      case 'team_home':
        return `${currentUser.team || 'Squad'} Leadership Console`;
      case 'add_students':
        return 'Enroll New Chapter Scholars';
      case 'documents':
        return 'Minutes & Chapter Documentation';
      case 'my_qr':
        return 'Dynamic Smart QR Terminal';
      case 'scan_qr':
        return 'Gate Scanner & Attendance Terminal';
      case 'attendance':
        return 'Comprehensive Attendance Records';
      case 'tasks':
        return 'Squad Milestones & Assignments';
      case 'approvals':
        return 'Pending Requests & Approvals Queue';
      case 'gallery':
        return 'Event Media & Chapter Archive';
      case 'reports':
        return 'Analytics & Compliance Reports';
      case 'members':
        return 'Verified Scholar Directory';
      case 'profile':
        return 'Scholar Profile & Credentials';
      default:
        return 'GeoHub Portal';
    }
  };

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8ECF2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Left: Breadcrumbs & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            GeoHub Portal • {currentUser.role.replace('_', ' ')}
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', margin: 0 }}>
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Universal Search Bar */}
      <div
        style={{
          position: 'relative',
          width: '380px',
        }}
      >
        <Search
          size={16}
          color="#94A3B8"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search scholars, events, squads, tasks..."
          style={{
            width: '100%',
            height: '38px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            paddingLeft: '38px',
            paddingRight: '14px',
            fontSize: '13px',
            color: '#0F172A',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#10B981';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.12)';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.backgroundColor = '#F8FAFC';
          }}
        />
      </div>

      {/* Right Controls: Quick Actions, Role Badge, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick QR Action */}
        <button
          onClick={() => setActiveTab('my_qr')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            padding: '7px 12px',
            borderRadius: '9px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Open Smart QR Terminal"
        >
          <QrCode size={15} />
          <span>Smart QR</span>
        </button>

        {/* Quick Event Action */}
        {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
          <button
            onClick={() => setActiveTab('events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              padding: '7px 13px',
              borderRadius: '9px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={15} />
            <span>New Event</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifs.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}
              >
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
                padding: '12px',
                zIndex: 100,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>Notifications</span>
                <button
                  onClick={markAllNotificationsAsRead}
                  style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark all as read
                </button>
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: n.isRead ? '#F8FAFC' : '#ECFDF5',
                      border: n.isRead ? '1px solid #F1F5F9' : '1px solid #A7F3D0',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{n.title}</div>
                    <div style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Button Pill */}
        <button
          onClick={() => setIsRoleSwitcherOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '5px 10px 5px 6px',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Switch Active Role"
        >
          <AppAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size={28} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              {currentUser.name.split(' ')[0]}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', lineHeight: 1.2 }}>
              {currentUser.role.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          <ChevronDown size={14} color="#94A3B8" />
        </button>
      </div>
    </header>
  );
};
