import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SEARCH_AND_FILTER } from '../styles/tokens';

export interface FilterPillProps {
  label: string;
  count?: number;
  icon?: React.ReactNode;
  isActive?: boolean;
  hasChevron?: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  count,
  icon,
  isActive = false,
  hasChevron = false,
  onClick,
  className = '',
  style,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full cursor-pointer transition-all duration-150 select-none shrink-0 ${className}`}
      style={{
        height: `${SEARCH_AND_FILTER.filterPill.touchTargetHeight}px`,
        padding: '0 16px',
        backgroundColor: isActive ? '#E7F9F1' : '#FFFFFF',
        border: isActive ? '1px solid #A7F3D0' : '1px solid #EEF1F5',
        color: isActive ? '#065F46' : '#0F172A',
        boxShadow: isActive
          ? '0 2px 8px rgba(16, 185, 129, 0.16)'
          : '0 2px 6px rgba(15, 23, 42, 0.03)',
        borderRadius: '999px',
        fontSize: `${SEARCH_AND_FILTER.filterPill.fontSize}px`,
        lineHeight: '20px',
        fontWeight: SEARCH_AND_FILTER.filterPill.fontWeight,
        fontFamily: 'var(--font-family)',
        gap: '8px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {/* 16px Icon */}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}

      {/* Label 14/600 */}
      <span>{label}</span>

      {/* Count badge 12px in a 22px pill */}
      {typeof count === 'number' && (
        <span
          className="inline-flex items-center justify-center font-bold px-2 rounded-full"
          style={{
            backgroundColor: isActive ? '#10B981' : '#F1F5F9',
            color: isActive ? '#FFFFFF' : '#64748B',
            fontSize: `${SEARCH_AND_FILTER.filterPill.badgeFontSize}px`,
            minWidth: `${SEARCH_AND_FILTER.filterPill.badgePillSize}px`,
            height: `${SEARCH_AND_FILTER.filterPill.badgePillSize}px`,
            lineHeight: 1,
            borderRadius: '999px',
          }}
        >
          {count}
        </span>
      )}

      {/* 16px Chevron if dropdown */}
      {hasChevron && (
        <ChevronDown
          size={SEARCH_AND_FILTER.filterPill.chevronSize}
          strokeWidth={1.75}
          className="shrink-0 text-slate-400"
        />
      )}
    </button>
  );
};

export interface FilterRowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const FilterRow: React.FC<FilterRowProps> = ({ children, className = '', style }) => {
  return (
    <div
      className={`relative w-full overflow-x-auto no-scrollbar flex items-center gap-2 ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${SEARCH_AND_FILTER.filterPill.gap}px`,
        overflowX: 'auto',
        flexWrap: 'nowrap',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingTop: '2px',
        paddingBottom: '2px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
