import React, { useState, useEffect } from 'react';
import { Sliders, GraduationCap, Users, Key, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface SuperAdminBottomNavProps {
  activeDeck?: 'all' | 'hub' | 'faculty' | 'students' | 'matrix' | 'maintenance';
  onSelectDeck?: (deck: 'all' | 'hub' | 'faculty' | 'students' | 'matrix' | 'maintenance') => void;
  facultyCount?: number;
  studentCount?: number;
  activeModulesCount?: number;
  dbLatencyMs?: number;
  className?: string;
}

export const SuperAdminBottomNav: React.FC<SuperAdminBottomNavProps> = ({
  activeDeck: propActiveDeck,
  onSelectDeck,
  facultyCount,
  studentCount,
  activeModulesCount,
  dbLatencyMs,
  className = '',
}) => {
  const { isPhoneFrame, activeTab, setActiveTab, platformModules } = useApp();

  const [deck, setDeck] = useState<'all' | 'hub' | 'faculty' | 'students' | 'matrix' | 'maintenance'>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace('#', '');
      if (['all', 'hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(h)) {
        return h as any;
      }
    }
    return propActiveDeck || 'hub';
  });

  // Listen to external deck change events
  useEffect(() => {
    const handleDeckChange = (e: any) => {
      const targetDeck = e.detail?.deck;
      if (targetDeck && ['all', 'hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(targetDeck)) {
        setDeck(targetDeck);
      }
    };
    window.addEventListener('geohub_superadmin_deck_change', handleDeckChange);
    return () => window.removeEventListener('geohub_superadmin_deck_change', handleDeckChange);
  }, []);

  useEffect(() => {
    if (propActiveDeck) {
      setDeck(propActiveDeck);
    }
  }, [propActiveDeck]);

  const currentActiveDeck = propActiveDeck || deck;

  // Compute live active modules count if not passed
  const liveActiveModulesCount =
    activeModulesCount !== undefined
      ? activeModulesCount
      : Object.values(platformModules || {}).filter(Boolean).length;

  const handleTabClick = (targetDeck: 'all' | 'hub' | 'faculty' | 'students' | 'matrix' | 'maintenance') => {
    setDeck(targetDeck);
    if (activeTab !== 'home') {
      setActiveTab('home');
    }
    if (typeof window !== 'undefined') {
      window.location.hash = '#' + targetDeck;
      window.dispatchEvent(
        new CustomEvent('geohub_superadmin_deck_change', { detail: { deck: targetDeck } })
      );
    }
    if (onSelectDeck) {
      onSelectDeck(targetDeck);
    }
  };

  const decks = [
    {
      id: 'hub' as const,
      label: 'Cockpit',
      icon: Sliders,
      badge: `${liveActiveModulesCount}/9`,
    },
    {
      id: 'faculty' as const,
      label: 'Faculty',
      icon: GraduationCap,
      badge: facultyCount !== undefined ? `${facultyCount}` : 'Advisors',
    },
    {
      id: 'students' as const,
      label: 'Students',
      icon: Users,
      badge: studentCount !== undefined ? `${studentCount}` : 'Scholars',
    },
    {
      id: 'matrix' as const,
      label: 'Roles',
      icon: Key,
      badge: 'RBAC',
    },
    {
      id: 'maintenance' as const,
      label: 'System',
      icon: Database,
      badge: dbLatencyMs !== undefined ? `${dbLatencyMs}ms` : 'TiDB',
    },
  ];

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
        gap: '8px',
        boxSizing: 'border-box',
        zIndex: 40,
      }}
      aria-label="SuperAdmin Executive Navigation"
    >
      <div
        className="flex-1 flex items-center justify-around min-w-0"
        style={{
          height: '58px',
          minHeight: '58px',
          maxHeight: '58px',
          backgroundColor: '#FFFFFF',
          borderRadius: '9999px',
          border: '1px solid #DCE6E0',
          boxShadow: '0 12px 36px rgba(5, 31, 32, 0.14)',
          padding: '0 6px',
          boxSizing: 'border-box',
        }}
      >
        {decks.map((d) => {
          const isActive = currentActiveDeck === d.id;
          const Icon = d.icon;

          return (
            <button
              key={d.id}
              type="button"
              onClick={() => handleTabClick(d.id)}
              title={d.label}
              aria-label={d.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center justify-center rounded-full cursor-pointer touch-target-44 shrink-0 transition-all duration-200 focus:outline-none ${
                isActive ? 'px-3 py-1.5' : 'w-10 h-10 hover:bg-[#F6FBF7]'
              }`}
              style={{
                height: '42px',
                minHeight: '42px',
                backgroundColor: isActive ? '#163832' : 'transparent',
                color: isActive ? '#DAF1DE' : '#235347',
              }}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.9} />
                {isActive && (
                  <span className="text-xs font-bold whitespace-nowrap tracking-tight animate-fadeIn">
                    {d.label}
                  </span>
                )}
              </div>

              {/* High-density pill badge */}
              <span
                className={`absolute -top-1 -right-1 text-[9px] font-mono font-extrabold px-1 rounded-full border leading-tight ${
                  isActive
                    ? 'bg-[#DAF1DE] text-[#051F20] border-[#8EB69B]'
                    : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE]'
                }`}
              >
                {d.badge}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default SuperAdminBottomNav;
