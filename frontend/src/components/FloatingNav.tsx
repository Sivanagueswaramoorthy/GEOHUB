import React from 'react';
import {
  House,
  Calendar,
  Layers,
  UserCheck,
  FolderArchive,
  Wallet,
  Megaphone,
  Images,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRoleNavTabs, NavTabKey } from '../core/nav';

export interface FloatingNavProps {
  className?: string;
  style?: React.CSSProperties;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ className = '', style }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setSelectedEventId,
    setSelectedTaskId,
    setSelectedTeamId,
    setSelectedUserId,
    isPhoneFrame,
  } = useApp();

  const tabs = getRoleNavTabs(currentUser.role, currentUser.post);

  const getLucideIcon = (iconName: string, size = 20, color = 'currentColor') => {
    switch (iconName) {
      case 'house':
        return <House size={size} strokeWidth={2} color={color} />;
      case 'calendar':
        return <Calendar size={size} strokeWidth={2} color={color} />;
      case 'layers':
        return <Layers size={size} strokeWidth={2} color={color} />;
      case 'user-check':
        return <UserCheck size={size} strokeWidth={2} color={color} />;
      case 'folder-archive':
        return <FolderArchive size={size} strokeWidth={2} color={color} />;
      case 'wallet':
        return <Wallet size={size} strokeWidth={2} color={color} />;
      case 'megaphone':
        return <Megaphone size={size} strokeWidth={2} color={color} />;
      case 'images':
        return <Images size={size} strokeWidth={2} color={color} />;
      case 'user':
      default:
        return <User size={size} strokeWidth={2} color={color} />;
    }
  };

  const handleTabClick = (key: NavTabKey) => {
    setSelectedEventId(null);
    setSelectedTaskId(null);
    setSelectedTeamId(null);
    setSelectedUserId(null);

    switch (key) {
      case 'home':
        setActiveTab('home');
        break;
      case 'events':
        setActiveTab('events');
        break;
      case 'operations':
        setActiveTab('operations');
        break;
      case 'members':
        setActiveTab('members');
        break;
      case 'archives':
        setActiveTab('gallery');
        break;
      case 'finance':
        setActiveTab('treasurer');
        break;
      case 'campaigns':
        setActiveTab('campaigns');
        break;
      case 'memories':
        setActiveTab('memories');
        break;
      case 'profile':
        setActiveTab('profile');
        break;
      default:
        setActiveTab(key);
    }
  };

  const isTabActive = (key: NavTabKey) => {
    if (key === 'home') {
      return activeTab === 'home' || activeTab === 'dashboard';
    }
    if (key === 'events') {
      return activeTab === 'events';
    }
    if (key === 'operations') {
      return (
        activeTab === 'operations' ||
        activeTab === 'tasks' ||
        activeTab === 'teams' ||
        activeTab === 'team_home' ||
        activeTab === 'attendance' ||
        activeTab === 'reports' ||
        activeTab === 'approvals' ||
        activeTab === 'meetings' ||
        activeTab === 'doc_studio'
      );
    }
    if (key === 'members') {
      return activeTab === 'members' || activeTab === 'add_students';
    }
    if (key === 'archives') {
      return activeTab === 'gallery' || activeTab === 'doc_studio';
    }
    if (key === 'finance') {
      return activeTab === 'treasurer' || activeTab === 'finance';
    }
    if (key === 'campaigns') {
      return activeTab === 'campaigns' || activeTab === 'ai_social';
    }
    if (key === 'memories') {
      return activeTab === 'memories';
    }
    if (key === 'profile') {
      return activeTab === 'profile';
    }
    return activeTab === key;
  };

  return (
    <nav
      className={`fixed transition-all duration-200 select-none ${className}`}
      style={{
        bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: isPhoneFrame ? '420px' : '520px',
        height: '60px',
        backgroundColor: '#FFFFFF',
        borderRadius: '9999px',
        border: '1px solid #DAF1DE',
        boxShadow: '0 12px 36px rgba(5, 31, 32, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px',
        boxSizing: 'border-box',
        zIndex: 40,
        ...style,
      }}
      aria-label="Floating Navigation"
    >
      {tabs.slice(0, 5).map((tab) => {
        const active = isTabActive(tab.key);

        return (
          <div
            key={tab.key}
            className="flex-1 flex items-center justify-center h-full"
          >
            {active ? (
              <button
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full cursor-pointer transition-all duration-150 pressable"
                style={{
                  backgroundColor: '#163832', // pine-800
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(22, 56, 50, 0.28)',
                  height: '42px',
                  boxSizing: 'border-box',
                }}
              >
                <span className="shrink-0">{getLucideIcon(tab.iconName, 18, '#FFFFFF')}</span>
                <span
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className="relative flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer pressable"
                style={{
                  width: '44px',
                  height: '44px',
                  color: '#235347', // pine-700
                  boxSizing: 'border-box',
                }}
                title={tab.label}
                aria-label={tab.label}
              >
                {getLucideIcon(tab.iconName, 22, '#235347')}
                {tab.hasUpdates && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#163832]"
                  />
                )}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default FloatingNav;
