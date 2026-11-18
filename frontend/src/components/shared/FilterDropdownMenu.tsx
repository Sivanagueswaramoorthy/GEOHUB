import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface FilterDropdownMenuProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: React.ReactNode;
  allLabel?: string;
  prefix?: string;
  className?: string;
}

export const FilterDropdownMenu: React.FC<FilterDropdownMenuProps> = ({
  label,
  value,
  options,
  onChange,
  icon,
  allLabel = 'All',
  prefix,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isFiltered = value !== 'All';
  const displayLabel = isFiltered
    ? (prefix ? `${prefix}: ${value}` : value)
    : (prefix ? `${prefix}: All` : (allLabel !== 'All' ? allLabel : `All ${label}s`));

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          backgroundColor: isFiltered ? '#DAF1DE' : '#FFFFFF',
          color: isFiltered ? '#051F20' : '#235347',
          borderColor: isFiltered ? '#163832' : '#DAF1DE',
        }}
        className="min-h-[38px] h-[38px] px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs hover:border-[#163832] active:scale-95 select-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Filter by ${label}`}
      >
        <span className="text-[#163832] shrink-0 flex items-center">{icon}</span>
        <span className="truncate max-w-[130px] sm:max-w-[180px]">{displayLabel}</span>
        <ChevronDown
          size={13}
          strokeWidth={2.4}
          className={`text-[#235347] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#DAF1DE',
            boxShadow: '0 10px 25px -4px rgba(5, 31, 32, 0.12), 0 4px 10px -2px rgba(5, 31, 32, 0.04)',
          }}
          className="absolute left-0 top-full mt-1.5 w-56 sm:w-64 max-h-60 overflow-y-auto no-scrollbar rounded-2xl border p-1.5 z-40 animate-scaleUp select-none"
        >
          {options.map((opt) => {
            const isSelected = value === opt;
            const optLabel = opt === 'All' ? (allLabel !== 'All' ? allLabel : `All ${label}s`) : opt;

            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                style={{
                  backgroundColor: isSelected ? '#DAF1DE' : 'transparent',
                  color: isSelected ? '#051F20' : '#235347',
                }}
                className="w-full min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer hover:bg-[#F6FBF7]"
              >
                <span className="truncate">{optLabel}</span>
                {isSelected && <Check size={14} strokeWidth={2.4} className="text-[#163832] shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdownMenu;
