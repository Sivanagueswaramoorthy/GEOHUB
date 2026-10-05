import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Users2,
  Calendar,
  CheckSquare,
  MoreHorizontal,
  User,
  Scan,
  UserCheck,
  FileText,
  QrCode,
  ShieldCheck,
  LogOut,
  Image,
  ClipboardList,
  BarChart3,
  Sparkles,
  Camera,
  FolderOpen,
  Award,
  ChevronRight,
  Shield,
  Layers,
  UserPlus,
  DollarSign,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const BottomNavBar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setSelectedEventId,
    setSelectedTaskId,
    setSelectedTeamId,
    setSelectedUserId,
    setIsRoleSwitcherOpen,
    logout,
  } = useApp();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isDocLead =
    currentUser.role === 'documentation' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('documentation'));

  const isTreasurer =
    currentUser.role === 'treasurer' ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('treasurer'));

  const isPromotion =
    currentUser.role === 'social_media' ||
    (currentUser.role === 'team_admin' && (currentUser.team === 'Promotion' || Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion')))) ||
    Boolean(currentUser.post && currentUser.post.toLowerCase().includes('promotion'));

  const handleTabClick = (tabKey: string) => {
    setSelectedEventId(null);
    setSelectedTaskId(null);
    setSelectedTeamId(null);
    setSelectedUserId(null);

    if (tabKey === 'more') {
      setIsMoreMenuOpen(true);
    } else if (tabKey === 'finance') {
      setActiveTab('treasurer');
    } else if (tabKey === 'archives') {
      setActiveTab('archives');
    } else if (tabKey === 'campaigns') {
      setActiveTab('campaigns');
    } else {
      setActiveTab(tabKey);
    }
  };

  const getPrimaryTabs = () => {
    if (isDocLead) {
      return [
        { key: 'dashboard', label: 'Home', icon: <Home size={19} /> },
        { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
        { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
        { key: 'archives', label: 'Archives', icon: <FolderOpen size={19} /> },
        { key: 'profile', label: 'Profile', icon: <User size={19} /> },
      ];
    }

    if (isTreasurer) {
      return [
        { key: 'dashboard', label: 'Home', icon: <Home size={19} /> },
        { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
        { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
        { key: 'finance', label: 'Finance', icon: <DollarSign size={19} /> },
        { key: 'profile', label: 'Profile', icon: <User size={19} /> },
      ];
    }

    if (isPromotion) {
      return [
        { key: 'dashboard', label: 'Home', icon: <Home size={19} /> },
        { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
        { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
        { key: 'campaigns', label: 'Campaigns', icon: <Megaphone size={19} /> },
        { key: 'profile', label: 'Profile', icon: <User size={19} /> },
      ];
    }

    switch (currentUser.role) {
      case 'super_admin':
        return [
          { key: 'dashboard', label: 'Home', icon: <Home size={19} /> },
          { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
          { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
          { key: 'members', label: 'Members', icon: <UserCheck size={19} /> },
          { key: 'profile', label: 'Profile', icon: <User size={19} /> },
        ];
      case 'admin':
        return [
          { key: 'dashboard', label: 'Home', icon: <Home size={19} /> },
          { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
          { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
          { key: 'members', label: 'Members', icon: <UserCheck size={19} /> },
          { key: 'profile', label: 'Profile', icon: <User size={19} /> },
        ];
      case 'team_admin':
        return [
          { key: 'team_home', label: 'Home', icon: <Home size={19} /> },
          { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
          { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
          { key: 'members', label: 'Members', icon: <UserCheck size={19} /> },
          { key: 'profile', label: 'Profile', icon: <User size={19} /> },
        ];
      case 'volunteer':
        return [
          { key: 'home', label: 'Home', icon: <Home size={19} /> },
          { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
          { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
          { key: 'scan_qr', label: 'Scanner', icon: <Scan size={19} /> },
          { key: 'profile', label: 'Profile', icon: <User size={19} /> },
        ];
      case 'member':
      default:
        return [
          { key: 'home', label: 'Home', icon: <Home size={19} /> },
          { key: 'events', label: 'Events', icon: <Calendar size={19} /> },
          { key: 'operations', label: 'Operations', icon: <Layers size={19} /> },
          { key: 'members', label: 'Members', icon: <UserCheck size={19} /> },
          { key: 'profile', label: 'Profile', icon: <User size={19} /> },
        ];
    }
  };

  const tabs = getPrimaryTabs();

  // Keys that indicate an Operations screen is active
  const operationsKeys = [
    'operations',
    'scan_qr',
    ...(!isDocLead ? ['gallery'] : []),
    ...(!isTreasurer ? ['treasurer'] : []),
    ...(!isPromotion ? ['campaigns', 'ai_social'] : []),
    'my_qr',
    'reports',
    'attendance',
    'approvals',
    'teams',
    'tasks',
  ];
  const isOperationsActive = operationsKeys.includes(activeTab);
  const isArchivesActive = isDocLead && (activeTab === 'archives' || activeTab === 'gallery');
  const isFinanceActive = isTreasurer && (activeTab === 'finance' || activeTab === 'treasurer');

  // Keys that indicate Profile screen is active
  const isProfileActive = activeTab === 'profile';

  return (
    <>
      {/* Floating Pill Dock Navigation Bar (Screen 2 Reference Model) */}
      <nav
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '430px',
          height: '62px',
          backgroundColor: '#FFFFFF',
          borderRadius: '999px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E8ECF2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          zIndex: 50,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Main Tabs */}
        {tabs.map((tab) => {
          const isActive =
            (tab.key === 'operations' && isOperationsActive) ||
            (tab.key === 'profile' && isProfileActive) ||
            (tab.key === 'archives' && isArchivesActive) ||
            (tab.key === 'finance' && isFinanceActive) ||
            activeTab === tab.key ||
            (tab.key === 'home' && activeTab === 'dashboard' && currentUser.role === 'member') ||
            (tab.key === 'dashboard' && activeTab === 'home');

          if (isActive) {
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  padding: '7px 12px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  border: '1px solid #A7F3D0',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                  transition: 'all 150ms ease',
                  flexShrink: 0,
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              title={tab.label}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                transition: 'all 150ms ease',
                flexShrink: 0,
              }}
            >
              {tab.icon}
            </button>
          );
        })}
      </nav>

      {/* Account & Profile "More" Modal */}
      <Modal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title="Settings & Account"
        subtitle="Manage your profile, system credentials and active role"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
          <div
            onClick={() => {
              setIsMoreMenuOpen(false);
              setActiveTab('profile');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '14px',
              border: activeTab === 'profile' ? '1.5px solid #10B981' : '1px solid #E8ECF2',
              backgroundColor: activeTab === 'profile' ? '#ECFDF5' : '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                }}
              >
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                  Institutional Profile
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {currentUser.name} • {currentUser.email}
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </div>

          <button
            className="btn btn-secondary btn-block"
            onClick={() => {
              setIsMoreMenuOpen(false);
              setIsRoleSwitcherOpen(true);
            }}
            style={{
              borderRadius: '999px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={18} color="#10B981" />
            <span>Switch Active Role Profile</span>
          </button>

          <button
            className="btn btn-secondary btn-block"
            onClick={() => {
              setIsMoreMenuOpen(false);
              logout();
            }}
            style={{
              borderRadius: '999px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 700,
              color: '#DC2626',
            }}
          >
            <LogOut size={18} color="#DC2626" />
            <span>Sign Out ({currentUser.name})</span>
          </button>
        </div>
      </Modal>
    </>
  );
};
