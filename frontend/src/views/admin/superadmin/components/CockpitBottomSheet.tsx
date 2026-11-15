import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { botanicalTheme } from '../theme';

export interface CockpitBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const CockpitBottomSheet: React.FC<CockpitBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '88vh',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body background scroll while sheet is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cockpit-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#051F20]/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl sm:mb-6 p-4 sm:p-6 shadow-2xl border-t sm:border border-[#DAF1DE] flex flex-col gap-3 transition-transform duration-250 animate-slideUp overflow-hidden"
        style={{
          maxHeight,
          boxShadow: botanicalTheme.shadows.sheet,
        }}
      >
        {/* Drag handle pill */}
        <div className="w-12 h-1.5 rounded-full bg-[#8EB69B]/50 mx-auto shrink-0 mb-1" />

        {/* Sheet Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#DAF1DE] pb-3 shrink-0">
          <div>
            <h2
              id="cockpit-sheet-title"
              className="text-base sm:text-lg font-bold text-[#051F20] tracking-tight leading-snug"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#235347] mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bottom sheet"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#051F20] transition cursor-pointer shrink-0 border border-[#DAF1DE] touch-target-44"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 flex-1 no-scrollbar space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CockpitBottomSheet;
