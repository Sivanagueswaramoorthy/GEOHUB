import React, { useState, useEffect } from 'react';
import { Sliders, GraduationCap, Users, Key, Database } from 'lucide-react';
import { DeckKey } from '../../views/admin/types';

export interface SuperAdminBottomNavProps {
  activeDeck?: DeckKey;
  onSelectDeck?: (deck: DeckKey) => void;
  className?: string;
}

interface NavItem {
  id: DeckKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItem[] = [
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
}) => {
  const [activeDeck, setActiveDeck] = useState<DeckKey>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace('#', '') as DeckKey;
      if (['hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(h)) {
        return h;
      }
    }
    return propActiveDeck || 'hub';
  });

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
      if (['hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(h)) {
        setActiveDeck(h);
      }
    };

    const handleCustom = (e: any) => {
      const deck = e.detail?.deck;
      if (deck && ['hub', 'faculty', 'students', 'matrix', 'maintenance'].includes(deck)) {
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
        maxWidth: '406px',
        height: '64px',
      }}
      aria-label="SuperAdmin Cockpit Navigation"
    >
      <div
        className="w-full h-full rounded-[28px] px-2 flex items-center justify-around shadow-2xl border border-white/10"
        style={{
          backgroundColor: 'rgba(5, 31, 32, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {NAV_ITEMS.map((item) => {
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
                className="min-h-[44px] h-10 px-3.5 rounded-full bg-[#DAF1DE] text-[#051F20] flex items-center gap-1.5 transition-all duration-200 shadow-sm cursor-pointer shrink-0"
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
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full text-[#8EB69B] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
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

