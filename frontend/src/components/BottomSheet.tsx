import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
  maxHeight = '85vh',
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
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full mx-auto relative flex flex-col transition-transform duration-300 ease-out"
        style={{
          maxWidth: isPhoneFrame ? '480px' : '620px',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          boxShadow: '0 -12px 48px rgba(15, 23, 42, 0.22)',
          maxHeight,
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Pill Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '999px',
              backgroundColor: '#CBD5E1',
            }}
          />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 pt-2 pb-3 border-b border-slate-100">
            <div>
              {title && (
                <h3
                  className="font-extrabold text-slate-900 tracking-tight"
                  style={{ fontSize: '18px', lineHeight: 1.3 }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-full"
                title="Close sheet"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain"
          style={{ paddingBottom: '60px' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
