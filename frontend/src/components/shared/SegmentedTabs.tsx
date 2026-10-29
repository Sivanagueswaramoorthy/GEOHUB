import React from 'react';

export interface TabOption<T extends string = string> {
  key: T;
  label: string;
  badge?: string | number;
}

export interface SegmentedTabsProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (key: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SegmentedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  style,
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={`inline-flex items-center p-1 bg-[#FFFFFF] border border-[#DAF1DE] select-none shadow-[0_2px_8px_rgba(5,31,32,0.04)] overflow-x-auto no-scrollbar max-w-full ${className}`}
      style={{
        borderRadius: '9999px',
        minHeight: '44px',
        ...style,
      }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 font-bold text-xs rounded-full whitespace-nowrap cursor-pointer transition-all duration-180 pressable"
            style={{
              minHeight: '36px',
              backgroundColor: isActive ? '#163832' : 'transparent',
              color: isActive ? '#FFFFFF' : '#235347',
              boxShadow: isActive ? '0 2px 8px rgba(5, 31, 32, 0.22)' : 'none',
              borderRadius: '9999px',
              border: 'none',
              outline: 'none',
            }}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#DAF1DE',
                  color: isActive ? '#051F20' : '#235347',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;
