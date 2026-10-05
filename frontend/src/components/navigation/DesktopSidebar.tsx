import React from 'react';
import {
  LayoutDashboard,
  Home,
  Users2,
  Calendar,
  CheckSquare,
  QrCode,
  Scan,
  UserCheck,
  FileText,
  ShieldCheck,
  Shield,
  User,
  LogOut,
  Image,
  Smartphone,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Search,
  BookOpen,
  MessageSquare,
  DollarSign,
  Camera,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { AppAvatar } from '../common/AppAvatar';

export const DesktopSidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    switchRole,
    setIsRoleSwitcherOpen,
    setIsPhoneFrame,
    logout,
    notifications,
    approvals,
    forumMessages,
  } = useApp();

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const rolesList: { role: UserRole; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { role: 'faculty', label: 'Faculty Advisor', icon: <ShieldCheck size={14} />, color: '#B45309', bg: '#FEF3C7' },
    { role: 'coordinator', label: 'Coordinator', icon: <Shield size={14} />, color: '#4338CA', bg: '#EEF2FF' },
    { role: 'treasurer', label: 'Treasurer', icon: <DollarSign size={14} />, color: '#047857', bg: '#ECFDF5' },
    { role: 'documentation', label: 'Documentation', icon: <FileText size={14} />, color: '#D97706', bg: '#FFFBEB' },
    { role: 'social_media', label: 'Social Media', icon: <Share2 size={14} />, color: '#E11D48', bg: '#FFF1F2' },
    { role: 'volunteer', label: 'Volunteer', icon: <QrCode size={14} />, color: '#BE185D', bg: '#FCE7F3' },
    { role: 'member', label: 'Member', icon: <User size={14} />, color: '#15803D', bg: '#DCFCE7' },
  ];

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    roles?: UserRole[];
  }

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'OVERVIEW & HUB',
      items: [
        {
          id: currentUser.role === 'super_admin' || currentUser.role === 'faculty' ? 'dashboard' : currentUser.role === 'team_admin' ? 'team_home' : currentUser.role === 'member' ? 'home' : 'dashboard',
          label: currentUser.role === 'faculty' ? 'Faculty Command' : currentUser.role === 'coordinator' ? 'Executive Dashboard' : currentUser.role === 'team_admin' ? 'Squad Command' : currentUser.role === 'member' ? 'Scholar Portal' : 'Club Dashboard',
          icon: <LayoutDashboard size={18} />,
        },
        {
          id: 'events',
          label: 'Events & Operations',
          icon: <Calendar size={18} />,
        },
        {
          id: 'memories',
          label: 'Memories Hub (GeoTag)',
          icon: <Camera size={18} />,
          badge: 'GPS',
        },
        {
          id: 'forum',
          label: 'Communication Forum',
          icon: <MessageSquare size={18} />,
          badge: forumMessages.length > 0 ? `${forumMessages.length}` : undefined,
        },
      ],
    },
    {
      title: 'GOVERNANCE & RECORDS',
      items: [
        {
          id: 'meetings',
          label: 'Meetings & MoM Hub',
          icon: <BookOpen size={18} />,
        },
        {
          id: 'treasurer',
          label: 'Treasurer & Budget Ledger',
          icon: <DollarSign size={18} />,
        },
        {
          id: 'members',
          label: 'Student Directory & Posts',
          icon: <Layers size={18} />,
        },
        {
          id: 'teams',
          label: 'Squads & Teams',
          icon: <Users2 size={18} />,
        },
        {
          id: 'approvals',
          label: 'Requests & Approvals',
          icon: <ShieldCheck size={18} />,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        },
      ],
    },
    {
      title: 'QR PASS & GATES',
      items: [
        {
          id: 'my_qr',
          label: currentUser.role === 'faculty' || currentUser.role === 'coordinator' || currentUser.role === 'super_admin' || currentUser.role === 'admin' ? 'Smart Dynamic QR (20s)' : 'My QR Attendance Pass',
          icon: <QrCode size={18} />,
        },
        {
          id: 'scan_qr',
          label: 'Volunteer Gate Terminal',
          icon: <Scan size={18} />,
          badge: currentUser.isVolunteer || currentUser.role === 'volunteer' ? 'Active' : undefined,
        },
        {
          id: 'attendance',
          label: 'Attendance Rosters',
          icon: <UserCheck size={18} />,
        },
      ],
    },
    {
      title: 'CREATIVE & DOCS ENGINE',
      items: [
        {
          id: 'doc_studio',
          label: 'Documentation & Templates',
          icon: <FileText size={18} />,
          badge: 'PDF/Word/XLS',
        },
        {
          id: 'ai_social',
          label: 'AI Social Media Studio',
          icon: <Share2 size={18} />,
          badge: 'AI',
        },
        {
          id: 'tasks',
          label: 'Tasks & Milestones',
          icon: <CheckSquare size={18} />,
        },
        {
          id: 'gallery',
          label: 'Chapter Gallery',
          icon: <Image size={18} />,
        },
        {
          id: 'reports',
          label: 'Analytics & Reports',
          icon: <FileText size={18} />,
        },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '280px',
        minWidth: '280px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E8ECF2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        zIndex: 40,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Top Header & Brand */}
      <div style={{ padding: '20px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <img
              src="/app-logo.png"
              alt="GeoHub Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '18px', color: '#0F172A', letterSpacing: '-0.4px' }}>
                GeoHub
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  border: '1px solid #A7F3D0',
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
              Green Eco Organization
            </div>
          </div>
        </div>

        {/* User Card with Role Badge */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <AppAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                {currentUser.role.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsRoleSwitcherOpen(true)}
            title="Switch Role"
            style={{
              padding: '6px 10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            Switch
          </button>
        </div>

        {/* 1-Click Role Switcher Quick Bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px', marginBottom: '6px' }}>
            QUICK ROLE DEMO
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {rolesList.map((r) => {
              const isSelected = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? r.color : r.bg,
                    color: isSelected ? '#FFFFFF' : r.color,
                    border: `1px solid ${isSelected ? r.color : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r.icon}
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Links Scrollable Section */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.6px',
                padding: '0 10px 6px',
              }}
            >
              {sec.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                      color: isActive ? '#059669' : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13.5px',
                      border: isActive ? '1px solid #A7F3D0' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: isActive ? '#059669' : '#64748B' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isActive ? '#059669' : '#E2E8F0',
                          color: isActive ? '#FFFFFF' : '#475569',
                          padding: '1px 7px',
                          borderRadius: '10px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Section */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid #E8ECF2',
          backgroundColor: '#FAFCFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setIsPhoneFrame(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#334155',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Smartphone size={16} />
          <span>Simulate Mobile Frame</span>
        </button>

        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
