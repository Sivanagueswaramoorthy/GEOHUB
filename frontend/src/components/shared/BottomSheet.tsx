import React, { useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

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
  maxHeight = '90vh',
  showCloseButton = true,
}) => {
  const appContext = useContext(AppContext);
  const isPhoneFrame = appContext?.isPhoneFrame ?? false;

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
      className="fixed inset-0 flex flex-col justify-end select-none"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(5, 31, 32, 0.45)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full mx-auto relative flex flex-col transition-transform duration-250 ease-out"
        style={{
          maxWidth: isPhoneFrame ? '480px' : '640px',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderTop: '1px solid #DAF1DE',
          boxShadow: '0 -12px 40px rgba(5, 31, 32, 0.12)',
          maxHeight,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag Pill Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '9999px',
              backgroundColor: '#8EB69B',
              opacity: 0.8,
            }}
          />
        </div>

        {/* Header with Title and 40px Close Button */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between border-b border-[#DAF1DE]"
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '8px',
              paddingBottom: '12px',
              boxSizing: 'border-box',
            }}
          >
            <div className="flex-1 pr-2">
              {title && (
                <h3
                  style={{
                    fontSize: '18px',
                    lineHeight: '24px',
                    fontWeight: 600,
                    color: '#051F20',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: 500,
                    color: '#235347',
                    margin: '2px 0 0 0',
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
                className="flex items-center justify-center rounded-full transition-transform active:scale-95 cursor-pointer"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DAF1DE',
                  color: '#051F20',
                  boxShadow: '0 4px 14px rgba(5, 31, 32, 0.06)',
                }}
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} style={{ color: '#235347' }} />
              </button>
            )}
          </div>
        )}

        {/* Sheet Content with Smooth Scroll */}
        <div
          className="overflow-y-auto"
          style={{
            padding: '16px 20px 24px 20px',
            maxHeight: 'calc(90vh - 80px)',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
