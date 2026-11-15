import React from 'react';
import { House, Sliders, Users, Key, Database } from 'lucide-react';
import { SuperAdminCockpitTab } from '../types';
import { botanicalTheme } from '../theme';

export interface CockpitBottomNavProps {
  activeTab: SuperAdminCockpitTab;
  onTabChange: (tab: SuperAdminCockpitTab) => void;
}

export const CockpitBottomNav: React.FC<CockpitBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: Array<{
    id: SuperAdminCockpitTab;
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  }> = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'control', label: 'Control', icon: Sliders },
    { id: 'people', label: 'People', icon: Users },
    { id: 'access', label: 'Access', icon: Key },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <nav
      aria-label="SuperAdmin Master Navigation"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#DAF1DE] shadow-[0_12px_36px_rgba(5,31,32,0.14)] flex items-center justify-between select-none"
      style={{
        boxShadow: botanicalTheme.shadows.elevated,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${tab.label} Screen`}
            onClick={() => onTabChange(tab.id)}
            className={`transition-all duration-200 flex items-center justify-center cursor-pointer select-none ${
              isActive
                ? 'px-3.5 py-2 rounded-full text-white font-bold text-xs gap-1.5 shadow-sm'
                : 'w-11 h-11 rounded-full text-[#235347] hover:bg-[#DAF1DE]/60'
            }`}
            style={{
              backgroundColor: isActive ? botanicalTheme.colors.emeraldSlate : 'transparent',
              minHeight: '44px',
            }}
          >
            <IconComponent size={18} strokeWidth={isActive ? 2.3 : 1.9} />
            {isActive && <span className="text-xs tracking-tight">{tab.label}</span>}
          </button>
        );
      })}
    </nav>
  );
};

export default CockpitBottomNav;
