import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  style,
}) => {
  return (
    <div
      className={`relative flex items-center w-full transition-all duration-150 ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EEF1F5',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        padding: '0 14px',
        height: '46px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <Search size={18} color="#94A3B8" className="shrink-0 mr-2.5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium text-sm"
        style={{
          fontFamily: 'inherit',
          height: '100%',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
