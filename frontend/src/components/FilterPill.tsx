import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterPillProps {
  label: string;
  count?: number;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  count,
  icon,
  isActive = false,
  onClick,
  className = '',
  style,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-150 cursor-pointer ${className}`}
      style={{
        backgroundColor: isActive ? '#E7F9F1' : '#FFFFFF',
        border: isActive ? '1px solid #A7F3D0' : '1px solid #EEF1F5',
        color: isActive ? '#065F46' : '#0F172A',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        fontSize: '12.5px',
        fontWeight: 600,
        height: '38px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon && <span className="inline-flex shrink-0 text-slate-500">{icon}</span>}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className="inline-flex items-center justify-center font-bold px-1.5 py-0.2 rounded-full"
          style={{
            backgroundColor: isActive ? '#10B981' : '#F1F5F9',
            color: isActive ? '#FFFFFF' : '#64748B',
            fontSize: '10.5px',
            minWidth: '18px',
            height: '18px',
          }}
        >
          {count}
        </span>
      )}
      <ChevronDown size={14} className="text-slate-400 shrink-0" />
    </button>
  );
};
