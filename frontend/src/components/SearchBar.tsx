import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Filter, CornerDownLeft } from 'lucide-react';
import { SEARCH_AND_FILTER } from '../styles/tokens';

export interface QuickFilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SearchBarFilterAction {
  label?: string;
  onClick: () => void;
  isActive?: boolean;
  badge?: number | string;
}

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  debounceMs?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  id?: string;

  // Visual & Feature Enhancements
  variant?: 'default' | 'glass' | 'elevated' | 'subtle';
  showShortcut?: boolean;
  isLoading?: boolean;
  resultsCount?: number;
  onSearchSubmit?: (val: string) => void;
  filterAction?: SearchBarFilterAction;
  quickFilters?: QuickFilterOption[];
  activeFilter?: string;
  onFilterSelect?: (id: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (item: string) => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by title, venue, or description...',
  onClear,
  debounceMs = SEARCH_AND_FILTER.searchBar.debounceMs,
  className = '',
  style,
  'aria-label': ariaLabel = 'Search',
  id,
  variant = 'default',
  showShortcut = true,
  isLoading = false,
  resultsCount,
  onSearchSubmit,
  filterAction,
  quickFilters,
  activeFilter,
  onFilterSelect,
  suggestions,
  onSelectSuggestion,
  autoFocus = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Synchronize internal value with parent
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Detect platform for modifier key symbol (⌘ vs Ctrl)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || ''));
    }
  }, []);

  // Handle outside click for suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K or "/" to focus
  useEffect(() => {
    if (!showShortcut) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside any input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showShortcut]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    setSelectedSuggestionIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(newVal);
    }, debounceMs);

    if (suggestions && suggestions.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange('');
    onClear?.();
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (localValue) {
        handleClear();
      } else {
        inputRef.current?.blur();
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        const selected = filteredSuggestions[selectedSuggestionIndex];
        setLocalValue(selected);
        onChange(selected);
        onSelectSuggestion?.(selected);
        setIsDropdownOpen(false);
      } else {
        onChange(localValue);
        onSearchSubmit?.(localValue);
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'ArrowDown' && isDropdownOpen && filteredSuggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp' && isDropdownOpen && filteredSuggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    }
  };

  const filteredSuggestions = (suggestions || []).filter((s) =>
    !localValue || s.toLowerCase().includes(localValue.toLowerCase())
  );

  return (
    <div
      ref={rootRef}
      className={`geohub-searchbar-root ${className}`}
      style={style}
    >
      {/* Main Search Input Capsule */}
      <div
        className={`geohub-searchbar-container variant-${variant} ${
          isFocused ? 'is-focused' : ''
        }`}
      >
        {/* Leading Icon Capsule */}
        <div className="geohub-searchbar-icon-capsule">
          {isLoading ? (
            <Loader2 size={18} className="geohub-searchbar-spinner" />
          ) : (
            <Search size={18} strokeWidth={2} />
          )}
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          id={id}
          type="search"
          enterKeyHint="search"
          autoFocus={autoFocus}
          value={localValue}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions && suggestions.length > 0) {
              setIsDropdownOpen(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="geohub-searchbar-input"
        />

        {/* Trailing Interactive Area */}
        <div className="geohub-searchbar-actions">
          {/* Results Count Chip */}
          {resultsCount !== undefined && localValue && (
            <span
              className="geohub-searchbar-count-badge"
              title={`${resultsCount} matches`}
            >
              {resultsCount} found
            </span>
          )}

          {/* Clear Button */}
          {localValue ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search (Esc)"
              title="Clear search (Esc)"
              className="geohub-searchbar-clear-btn touch-target-44"
            >
              <div className="geohub-searchbar-clear-icon-wrapper">
                <X size={15} strokeWidth={2.2} />
              </div>
            </button>
          ) : (
            showShortcut && (
              <kbd
                className="geohub-searchbar-kbd"
                onClick={() => inputRef.current?.focus()}
                title="Press to focus search"
              >
                {isMac ? '⌘K' : 'Ctrl K'}
              </kbd>
            )
          )}

          {/* Optional Filter Button */}
          {filterAction && (
            <button
              type="button"
              onClick={filterAction.onClick}
              aria-label={filterAction.label || 'Filter options'}
              className={`geohub-searchbar-filter-btn ${
                filterAction.isActive ? 'is-active' : ''
              }`}
            >
              <Filter size={14} strokeWidth={2} />
              {filterAction.label && <span>{filterAction.label}</span>}
              {filterAction.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: filterAction.isActive
                      ? '#FFFFFF'
                      : '#10B981',
                    color: filterAction.isActive ? '#0F766E' : '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '999px',
                  }}
                >
                  {filterAction.badge}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isDropdownOpen && isFocused && filteredSuggestions.length > 0 && (
        <div className="geohub-searchbar-dropdown">
          <div
            style={{
              padding: '4px 10px 6px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#94A3B8',
            }}
          >
            Suggestions
          </div>
          {filteredSuggestions.slice(0, 6).map((item, idx) => (
            <div
              key={item}
              className={`geohub-searchbar-dropdown-item ${
                selectedSuggestionIndex === idx ? 'is-selected' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                setLocalValue(item);
                onChange(item);
                onSelectSuggestion?.(item);
                setIsDropdownOpen(false);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={14} color="#94A3B8" />
                <span>{item}</span>
              </div>
              <CornerDownLeft size={12} color="#CBD5E1" />
            </div>
          ))}
        </div>
      )}

      {/* Optional Quick Filters Pill Row */}
      {quickFilters && quickFilters.length > 0 && (
        <div className="geohub-searchbar-quick-filters">
          {quickFilters.map((qf) => {
            const isSelected = activeFilter === qf.id;
            return (
              <button
                key={qf.id}
                type="button"
                onClick={() => onFilterSelect?.(qf.id)}
                className={`geohub-searchbar-pill-btn ${
                  isSelected ? 'is-active' : ''
                }`}
              >
                {qf.icon}
                <span>{qf.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
