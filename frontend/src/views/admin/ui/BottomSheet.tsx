import React, { useEffect, useRef } from 'react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '88vh',
  showHandle = true,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#051F20]/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-w-lg lg:max-w-[480px] bg-white rounded-t-[28px] lg:rounded-[24px] border-t lg:border border-[#E3EEE6] shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        style={{
          maxHeight,
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Drag Handle on Mobile */}
        {showHandle && (
          <div
            className="w-full pt-3 pb-1 flex justify-center cursor-pointer lg:hidden"
            onClick={onClose}
          >
            <div className="w-12 h-1.5 rounded-full bg-[#DCE6E0] hover:bg-[#8EB69B] transition" />
          </div>
        )}

        {/* Optional Header */}
        {title && (
          <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#E3EEE6]">
            <h3 className="text-base font-bold text-[#051F20] tracking-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#235347] hover:bg-[#F0F5F2] transition text-sm font-bold"
              aria-label="Close sheet"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
