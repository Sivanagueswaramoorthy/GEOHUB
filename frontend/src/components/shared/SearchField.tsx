import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`search-field-root ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${isFocused ? '#8EB69B' : '#DAF1DE'}`,
        borderRadius: '16px',
        boxShadow: isFocused
          ? '0 0 0 2px rgba(142, 182, 155, 0.3), 0 4px 14px rgba(5, 31, 32, 0.06)'
          : '0 4px 14px rgba(5, 31, 32, 0.04)',
        height: '46px',
        padding: '0 14px',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease-out',
        ...style,
      }}
    >
      <Search
        size={18}
        strokeWidth={2}
        color="#235347"
        style={{
          flexShrink: 0,
          marginRight: '10px',
          opacity: isFocused ? 1 : 0.85,
          transition: 'opacity 0.2s ease-out',
        }}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          fontSize: '14px',
          fontWeight: 500,
          color: '#051F20',
          fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, sans-serif",
          padding: 0,
          margin: 0,
          lineHeight: '20px',
        }}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '9999px',
            backgroundColor: '#DAF1DE',
            color: '#163832',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            marginLeft: '6px',
            padding: 0,
            transition: 'background-color 0.15s ease-out',
          }}
          aria-label="Clear search"
        >
          <X size={14} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
};

export default SearchField;
