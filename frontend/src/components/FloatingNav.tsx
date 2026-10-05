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

  const getLucideIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'house':
        return <House size={size} />;
      case 'calendar':
        return <Calendar size={size} />;
      case 'layers':
        return <Layers size={size} />;
      case 'user-check':
        return <UserCheck size={size} />;
      case 'folder-archive':
        return <FolderArchive size={size} />;
      case 'wallet':
        return <Wallet size={size} />;
      case 'megaphone':
        return <Megaphone size={size} />;
      case 'images':
        return <Images size={size} />;
      case 'user':
      default:
        return <User size={size} />;
    }
  };

  const handleTabClick = (key: NavTabKey) => {
    setSelectedEventId(null);
    setSelectedTaskId(null);
    setSelectedTeamId(null);
    setSelectedUserId(null);

    // Map tab key to view key
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
      return [
        'operations',
        'scan_qr',
        'attendance',
        'approvals',
        'reports',
        'teams',
        'tasks',
        'forum',
        'meetings',
      ].includes(activeTab);
    }
    if (key === 'members') {
      return activeTab === 'members';
    }
    if (key === 'archives') {
      return activeTab === 'gallery' || activeTab === 'doc_studio';
    }
    if (key === 'finance') {
      return activeTab === 'treasurer';
    }
    if (key === 'campaigns') {
      return activeTab === 'campaigns' || activeTab === 'ai_social';
    }
    if (key === 'memories') {
      return activeTab === 'memories';
    }
    if (key === 'profile') {
      return activeTab === 'profile' || activeTab === 'my_qr';
    }
    return activeTab === key;
  };

  return (
    <nav
      className={`fixed transition-all duration-200 ${className}`}
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: isPhoneFrame ? '440px' : '560px',
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        border: '1px solid #EEF1F5',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        boxSizing: 'border-box',
        zIndex: 40,
        ...style,
      }}
      aria-label="Bottom Navigation"
    >
      {tabs.map((tab) => {
        const active = isTabActive(tab.key);

        if (active) {
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full cursor-pointer overflow-hidden transition-all duration-200 ease-out shrink-0"
              style={{
                backgroundColor: '#E7F9F1',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.14)',
                height: '44px',
              }}
            >
              <span className="shrink-0">{getLucideIcon(tab.iconName, 20)}</span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#065F46',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            className="relative flex flex-col items-center justify-center p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
            style={{
              width: '44px',
              height: '44px',
            }}
            title={tab.label}
            aria-label={tab.label}
          >
            {getLucideIcon(tab.iconName, 24)}
            {tab.hasUpdates && (
              <span
                className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#10B981' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
