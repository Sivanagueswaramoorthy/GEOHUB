import React from 'react';
import {
  House,
  Calendar,
  Layers,
  MessagesSquare,
  Images,
  Scan,
  Wallet,
  UserCheck,
  FolderArchive,
  Megaphone,
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

  const tabs = getRoleNavTabs(currentUser.role, currentUser.post, currentUser.team);
  const scannerTab = tabs.find(
    (tab) => tab.key === 'scan_qr' || tab.key === 'qrscanner' || tab.iconName === 'scan'
  );
  const primaryTabs = tabs.filter((tab) => tab !== scannerTab).slice(0, 5);

  const getLucideIcon = (iconName: string, size = 20, color = 'currentColor') => {
    switch (iconName) {
      case 'house':
        return <House size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'calendar':
        return <Calendar size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'layers':
        return <Layers size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'messages-square':
        return <MessagesSquare size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'images':
        return <Images size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'scan':
        return <Scan size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'wallet':
        return <Wallet size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'user-check':
        return <UserCheck size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'folder-archive':
        return <FolderArchive size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'megaphone':
        return <Megaphone size={size} strokeWidth={1.75} color={color} className="lucide" />;
      case 'user':
      default:
        return <User size={size} strokeWidth={1.75} color={color} className="lucide" />;
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
      case 'community':
        setActiveTab('community');
        break;
      case 'gallery':
        setActiveTab('gallery');
        break;
      case 'scan_qr':
      case 'qrscanner':
        setActiveTab('scan_qr');
        break;
      case 'ledger':
        setActiveTab('ledger');
        break;
      case 'members':
        setActiveTab('operations');
        break;
      case 'archives':
        setActiveTab('gallery');
        break;
      case 'finance':
        setActiveTab('ledger');
        break;
      case 'campaigns':
        setActiveTab('operations');
        break;
      case 'memories':
        setActiveTab('gallery');
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
        activeTab === 'doc_studio' ||
        activeTab === 'campaigns' ||
        activeTab === 'members' ||
        activeTab === 'add_students'
      );
    }
    if (key === 'community') {
      return activeTab === 'community' || activeTab === 'forum';
    }
    if (key === 'gallery') {
      return activeTab === 'gallery' || activeTab === 'archives' || activeTab === 'memories';
    }
    if (key === 'scan_qr' || key === 'qrscanner') {
      return activeTab === 'scan_qr' || activeTab === 'my_qr';
    }
    if (key === 'ledger') {
      return activeTab === 'ledger' || activeTab === 'treasurer' || activeTab === 'finance';
    }
    if (key === 'profile') {
      return activeTab === 'profile';
    }
    return activeTab === key;
  };

  const isScannerActive = scannerTab ? isTabActive(scannerTab.key) : false;

  return (
    <nav
      className={`fixed select-none ${className}`}
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: isPhoneFrame ? '430px' : '560px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxSizing: 'border-box',
        zIndex: 40,
        ...style,
      }}
      aria-label="Floating Navigation"
    >
      {/* Primary Floating Nav Bar Pill (White / Mint Container) */}
      <div
        className="flex-1 flex items-center justify-around min-w-0"
        style={{
          height: '58px',
          minHeight: '58px',
          maxHeight: '58px',
          backgroundColor: '#FFFFFF',
          borderRadius: '9999px',
          border: '1px solid var(--card-border, #DAF1DE)',
          boxShadow: '0 12px 36px rgba(15, 54, 56, 0.12)',
          padding: '0 6px',
          boxSizing: 'border-box',
        }}
      >
        {primaryTabs.map((tab) => {
          const active = isTabActive(tab.key);
          const labelText =
            tab.key === 'operations'
              ? 'Hub'
              : tab.key === 'community'
              ? 'Chat'
              : tab.shortLabel || tab.label;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              title={tab.label}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center justify-center rounded-full cursor-pointer pressable touch-target-44 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EB69B] transition-all duration-260 ${
                active ? 'px-3.5 py-1.5' : 'w-10 h-10'
              }`}
              style={{
                height: '42px',
                minHeight: '42px',
                backgroundColor: active ? 'var(--pine-800, #163832)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--pine-700, #235347)',
                boxShadow: active ? '0 4px 14px rgba(22, 56, 50, 0.28)' : 'none',
                boxSizing: 'border-box',
                transition: 'all 260ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span
                className={`shrink-0 flex items-center justify-center transition-transform duration-200 ${
                  active ? 'animate-nav-pop' : ''
                }`}
              >
                {getLucideIcon(tab.iconName, active ? 18 : 20, active ? '#FFFFFF' : 'var(--pine-700, #235347)')}
              </span>

              {/* Smooth expanding label text */}
              <div
                style={{
                  maxWidth: active ? '70px' : '0px',
                  opacity: active ? 1 : 0,
                  marginLeft: active ? '6px' : '0px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  transition: 'all 260ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {labelText}
                </span>
              </div>

              {/* Notification update dot when inactive */}
              {!active && tab.hasUpdates && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#163832] animate-badge-pop" />
              )}
            </button>
          );
        })}
      </div>

      {/* Strictly Fixed Scanner Circle Button (Zero Resizing Across Navigation States) */}
      {scannerTab && (
        <button
          type="button"
          onClick={() => handleTabClick(scannerTab.key)}
          className={`relative flex items-center justify-center rounded-full cursor-pointer pressable touch-target-44 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EB69B] focus-visible:ring-offset-2 active:scale-95 transition-all duration-200 ${
            isScannerActive ? 'animate-scanner-ring' : ''
          }`}
          style={{
            width: '56px',
            height: '56px',
            minWidth: '56px',
            minHeight: '56px',
            maxWidth: '56px',
            maxHeight: '56px',
            flexShrink: 0,
            flexGrow: 0,
            backgroundColor: isScannerActive ? 'var(--pine-950, #051F20)' : 'var(--pine-800, #163832)',
            border: isScannerActive ? '2px solid var(--mint-100, #DAF1DE)' : '2px solid var(--sage-400, #8EB69B)',
            boxShadow: isScannerActive
              ? '0 8px 24px rgba(5, 31, 32, 0.32)'
              : '0 6px 20px rgba(5, 31, 32, 0.18)',
            color: '#FFFFFF',
            boxSizing: 'border-box',
          }}
          title={scannerTab.label}
          aria-label={scannerTab.label}
          aria-current={isScannerActive ? 'page' : undefined}
        >
          <span className="shrink-0 flex items-center justify-center">
            {getLucideIcon(scannerTab.iconName, 22, '#FFFFFF')}
          </span>
          {scannerTab.hasUpdates && (
            <span
              className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full animate-badge-pop"
              style={{ backgroundColor: 'var(--red-danger, #D9534F)', border: '1.5px solid #FFFFFF' }}
            />
          )}
        </button>
      )}
    </nav>
  );
};

export default FloatingNav;
