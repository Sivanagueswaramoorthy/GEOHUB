import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  resultsCount?: number;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  onClear?: () => void;
  id?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
  style,
  resultsCount,
  onFilterClick,
  activeFilterCount = 0,
  onClear,
  id,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

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
        borderRadius: '16px',
        boxShadow: isFocused
          ? '0 0 0 3px rgba(22, 56, 50, 0.08), 0 2px 8px rgba(5, 31, 32, 0.04)'
          : '0 2px 6px rgba(5, 31, 32, 0.02)',
        height: style?.height || '46px',
        padding: '0 8px 0 10px',
        boxSizing: 'border-box',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {/* Icon Capsule */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          backgroundColor: isFocused ? '#DAF1DE' : '#F6FBF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginRight: '8px',
          transition: 'all 0.2s ease-out',
        }}
      >
        <Search
          size={16}
          strokeWidth={2.2}
          color={isFocused ? '#163832' : '#235347'}
        />
      </div>

      {/* Input Field */}
      <input
        id={id}
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
          fontWeight: 600,
          color: '#051F20',
          fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, sans-serif",
          padding: 0,
          margin: 0,
        }}
      />

      {/* Trailing Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
        {/* Results Count Chip */}
        {resultsCount !== undefined && value.trim().length > 0 && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#DAF1DE',
              color: '#0B2B26',
              whiteSpace: 'nowrap',
            }}
          >
            {resultsCount} found
          </span>
        )}

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '9999px',
              backgroundColor: '#F6FBF7',
              color: '#163832',
              border: '1px solid #DAF1DE',
              outline: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              padding: 0,
              transition: 'all 0.15s ease-out',
            }}
            aria-label="Clear search"
            title="Clear search"
          >
            <X size={13} strokeWidth={2.4} />
          </button>
        )}

        {/* Optional Filter Button */}
        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              padding: '0 10px',
              borderRadius: '10px',
              backgroundColor: activeFilterCount > 0 ? '#163832' : '#F6FBF7',
              color: activeFilterCount > 0 ? '#FFFFFF' : '#235347',
              border: activeFilterCount > 0 ? '1px solid #163832' : '1px solid #DAF1DE',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.15s ease-out',
            }}
            aria-label="Filter options"
            title="Filter options"
          >
            <SlidersHorizontal size={13} strokeWidth={2.2} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  color: '#163832',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '2px',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchField;
