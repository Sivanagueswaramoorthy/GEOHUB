import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPONENTS, TYPOGRAPHY } from '../styles/tokens';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = `${COMPONENTS.modals.maxHeightVh}vh`,
  showCloseButton = true,
}) => {
  const { isPhoneFrame } = useApp();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full mx-auto relative flex flex-col transition-transform duration-300 ease-out"
        style={{
          maxWidth: isPhoneFrame ? '480px' : '640px',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: `${COMPONENTS.modals.sheetTopRadius}px`,
          borderTopRightRadius: `${COMPONENTS.modals.sheetTopRadius}px`,
          boxShadow: '0 -12px 48px rgba(15, 23, 42, 0.16)',
          maxHeight,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Pill Handle (36x4 centered) */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            style={{
              width: `${COMPONENTS.modals.sheetHandleWidth}px`,
              height: `${COMPONENTS.modals.sheetHandleHeight}px`,
              borderRadius: '999px',
              backgroundColor: '#CBD5E1',
            }}
          />
        </div>

        {/* Header with Title (18/24 700) and 44px Close Button */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between border-b border-slate-100"
            style={{
              paddingLeft: `${COMPONENTS.modals.sheetPadding}px`,
              paddingRight: `${COMPONENTS.modals.sheetPadding}px`,
              paddingTop: '8px',
              paddingBottom: '12px',
              boxSizing: 'border-box',
            }}
          >
            <div className="flex-1 pr-2">
              {title && (
                <h3
                  style={{
                    fontSize: `${TYPOGRAPHY.scale.title.fontSize}px`,
                    lineHeight: `${TYPOGRAPHY.scale.title.lineHeight}px`,
                    fontWeight: TYPOGRAPHY.scale.title.fontWeight,
                    color: '#0F172A',
                    fontFamily: 'var(--font-family)',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: `${TYPOGRAPHY.scale.small.fontSize}px`,
                    lineHeight: `${TYPOGRAPHY.scale.small.lineHeight}px`,
                    color: '#64748B',
                    marginTop: '2px',
                    margin: 0,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors rounded-full cursor-pointer"
                style={{
                  width: `${COMPONENTS.modals.closeHitArea}px`,
                  height: `${COMPONENTS.modals.closeHitArea}px`,
                  minWidth: `${COMPONENTS.modals.closeHitArea}px`,
                  minHeight: `${COMPONENTS.modals.closeHitArea}px`,
                }}
                title="Close sheet"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            )}
          </div>
        )}

        {/* Content Body with 20px padding */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            padding: `${COMPONENTS.modals.sheetPadding}px`,
            paddingBottom: '40px',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
