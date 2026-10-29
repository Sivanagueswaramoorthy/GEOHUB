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
  LogOut,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRoleNavTabs, NavTabKey } from '../../core/nav';
import { Avatar } from '../shared/Avatar';

export const DesktopSidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setIsPhoneFrame,
    setIsRoleSwitcherOpen,
    logout,
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
    if (key === 'home') return activeTab === 'home' || activeTab === 'dashboard';
    if (key === 'events') return activeTab === 'events';
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
    if (key === 'members') return activeTab === 'members' || activeTab === 'add_students';
    if (key === 'archives') return activeTab === 'gallery' || activeTab === 'doc_studio';
    if (key === 'finance') return activeTab === 'treasurer' || activeTab === 'finance';
    if (key === 'campaigns') return activeTab === 'campaigns' || activeTab === 'ai_social';
    if (key === 'memories') return activeTab === 'memories';
    if (key === 'profile') return activeTab === 'profile';
    return activeTab === key;
  };

  const canSwitchRole =
    currentUser.role === 'faculty' ||
    currentUser.role === 'super_admin' ||
    Boolean(import.meta.env?.DEV);

  return (
    <aside
      className="hidden lg:flex flex-col justify-between w-64 bg-white border-r border-[#DAF1DE] p-5 select-none shrink-0"
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        boxShadow: '0 4px 20px rgba(5, 31, 32, 0.04)',
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Wordmark */}
        <div
          className="flex items-center gap-2 cursor-pointer pt-2"
          onClick={() => setActiveTab('home')}
        >
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '22px',
              fontWeight: 800,
              color: '#051F20',
              letterSpacing: '-0.02em',
            }}
          >
            GEO
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#8EB69B',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '22px',
              fontWeight: 800,
              color: '#235347',
              letterSpacing: '-0.02em',
            }}
          >
            HUB
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-2" aria-label="Desktop Sidebar Navigation">
          {tabs.map((tab) => {
            const active = isTabActive(tab.key);
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition-all cursor-pointer pressable ${
                  active
                    ? 'bg-[#163832] text-white shadow-[0_4px_14px_rgba(22,56,50,0.25)]'
                    : 'text-[#235347] hover:bg-[#DAF1DE]/40 hover:text-[#051F20]'
                }`}
                style={{
                  borderRadius: '9999px',
                  minHeight: '44px',
                }}
              >
                <span>{getLucideIcon(tab.iconName, 18, active ? '#FFFFFF' : '#235347')}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls & user profile */}
      <div className="flex flex-col gap-3 pt-4 border-t border-[#DAF1DE]">
        <button
          type="button"
          onClick={() => setIsPhoneFrame(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-[#235347] hover:bg-[#DAF1DE]/40 transition-colors cursor-pointer"
        >
          <Smartphone size={16} strokeWidth={2} />
          <span>Mobile frame</span>
        </button>

        {canSwitchRole && (
          <button
            type="button"
            onClick={() => setIsRoleSwitcherOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-[#163832] hover:bg-[#DAF1DE]/40 transition-colors cursor-pointer"
          >
            <ShieldAlert size={16} strokeWidth={2} />
            <span>Switch preview role</span>
          </button>
        )}

        <div className="flex items-center justify-between p-2 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={currentUser.name} src={currentUser.avatarUrl} size={36} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#051F20] truncate">
                {currentUser.name}
              </span>
              <span className="text-xs font-medium text-[#235347] capitalize truncate">
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center w-8 h-8 rounded-full text-[#D9534F] hover:bg-[rgba(217,83,79,0.12)] cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
