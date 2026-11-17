import React, { useState, useEffect } from 'react';
import {
  Home,
  ShieldCheck,
  PlusCircle,
  ClipboardList,
  User,
  Sliders,
  GraduationCap,
  Users,
  Key,
  Database,
} from 'lucide-react';
import { DeckKey } from '../../views/admin/types';

export interface SuperAdminBottomNavProps {
  activeDeck?: DeckKey;
  onSelectDeck?: (deck: DeckKey) => void;
  className?: string;
  forceMode?: 'modern' | 'legacy';
}

interface NavItem {
  id: DeckKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const MODERN_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'access', label: 'Access', icon: ShieldCheck },
  { id: 'features', label: 'Features', icon: PlusCircle },
  { id: 'logs', label: 'Logs', icon: ClipboardList },
  { id: 'profile', label: 'Profile', icon: User },
];

const LEGACY_NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Cockpit', icon: Sliders },
  { id: 'faculty', label: 'Faculty', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'matrix', label: 'Roles', icon: Key },
  { id: 'maintenance', label: 'System', icon: Database },
];

export const SuperAdminBottomNav: React.FC<SuperAdminBottomNavProps> = ({
  activeDeck: propActiveDeck,
  onSelectDeck,
  className = '',
  forceMode,
}) => {
  const [activeDeck, setActiveDeck] = useState<DeckKey>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace('#', '') as DeckKey;
      if (
        [
          'home',
          'access',
          'features',
          'logs',
          'profile',
          'hub',
          'faculty',
          'students',
          'matrix',
          'maintenance',
        ].includes(h)
      ) {
        return h;
      }
    }
    return propActiveDeck || 'home';
  });

  // Determine which nav items to display
  const isLegacy =
    forceMode === 'legacy' ||
    (forceMode !== 'modern' &&
      ['hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(activeDeck));

  const navItems = isLegacy ? LEGACY_NAV_ITEMS : MODERN_NAV_ITEMS;

  // Sync with prop if passed
  useEffect(() => {
    if (propActiveDeck && propActiveDeck !== 'all') {
      setActiveDeck(propActiveDeck);
    }
  }, [propActiveDeck]);

  // Sync with window.location.hash and external events
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.replace('#', '') as DeckKey;
      if (
        [
          'home',
          'access',
          'features',
          'logs',
          'profile',
          'hub',
          'faculty',
          'students',
          'matrix',
          'maintenance',
        ].includes(h)
      ) {
        setActiveDeck(h);
      }
    };

    const handleCustom = (e: any) => {
      const deck = e.detail?.deck;
      if (
        deck &&
        [
          'home',
          'access',
          'features',
          'logs',
          'profile',
          'hub',
          'faculty',
          'students',
          'matrix',
          'maintenance',
        ].includes(deck)
      ) {
        setActiveDeck(deck);
      }
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('geohub_superadmin_deck_change', handleCustom);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('geohub_superadmin_deck_change', handleCustom);
    };
  }, []);

  const handleTabClick = (deckId: DeckKey) => {
    setActiveDeck(deckId);
    if (typeof window !== 'undefined') {
      window.location.hash = '#' + deckId;
      window.dispatchEvent(
        new CustomEvent('geohub_superadmin_deck_change', { detail: { deck: deckId } })
      );
    }
    if (onSelectDeck) {
      onSelectDeck(deckId);
    }
  };

  return (
    <nav
      className={`fixed z-50 left-1/2 -translate-x-1/2 select-none ${className}`}
      style={{
        bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        width: 'calc(100% - 24px)',
        maxWidth: '430px',
        height: '64px',
      }}
      aria-label="SuperAdmin Operations Navigation"
    >
      <div
        className="w-full h-full rounded-[28px] px-2 flex items-center justify-around shadow-xl shadow-slate-300/40 border border-slate-200/90"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeDeck === item.id;
          const Icon = item.icon;

          if (isActive) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current="page"
                className="min-h-[44px] h-10 px-4 rounded-full bg-emerald-600 text-white flex items-center gap-1.5 transition-all duration-200 shadow-sm shadow-emerald-600/30 cursor-pointer shrink-0"
              >
                <Icon size={18} strokeWidth={2.4} />
                <span className="text-xs font-bold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              title={item.label}
              aria-label={item.label}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Icon size={20} strokeWidth={1.8} />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default SuperAdminBottomNav;
