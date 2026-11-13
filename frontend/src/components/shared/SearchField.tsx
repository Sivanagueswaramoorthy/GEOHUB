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
        border: `1.5px solid ${isFocused ? '#163832' : '#DAF1DE'}`,
        borderRadius: '14px',
        boxShadow: isFocused
          ? '0 0 0 3px rgba(35, 83, 71, 0.12), 0 2px 8px rgba(5, 31, 32, 0.04)'
          : '0 2px 6px rgba(5, 31, 32, 0.02)',
        height: style?.height || '44px',
        padding: '0 12px',
        boxSizing: 'border-box',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      <Search
        size={16}
        strokeWidth={2.2}
        color={isFocused ? '#163832' : '#235347'}
        style={{
          flexShrink: 0,
          marginRight: '8px',
          opacity: isFocused ? 1 : 0.75,
          transition: 'all 0.2s ease-out',
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
          height: '100%',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          fontSize: '13px',
          fontWeight: 500,
          color: '#051F20',
          fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, sans-serif",
          padding: 0,
          margin: 0,
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
            width: '24px',
            height: '24px',
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
          <X size={13} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
};

export default SearchField;
