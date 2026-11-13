import React, { useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
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
  fullScreen?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '90vh',
  showCloseButton = true,
  fullScreen = false,
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

  const content = (
    <div
      className={`fixed inset-0 select-none ${fullScreen ? 'flex flex-col' : 'flex flex-col justify-end'}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: fullScreen ? 'stretch' : 'flex-end',
        alignItems: 'center',
        backgroundColor: fullScreen && !isPhoneFrame ? '#FFFFFF' : 'rgba(5, 31, 32, 0.45)',
        backdropFilter: fullScreen && !isPhoneFrame ? 'none' : 'blur(6px)',
      }}
      onClick={fullScreen ? undefined : onClose}
    >
      <div
        className="w-full mx-auto relative flex flex-col transition-transform duration-250 ease-out"
        style={{
          maxWidth: isPhoneFrame ? '480px' : fullScreen ? '100%' : '640px',
          width: '100%',
          height: fullScreen ? (isPhoneFrame ? 'calc(100vh - 32px)' : '100%') : undefined,
          maxHeight: fullScreen ? (isPhoneFrame ? 'calc(100vh - 32px)' : '100dvh') : maxHeight,
          margin: fullScreen && isPhoneFrame ? '16px auto' : '0',
          backgroundColor: '#FFFFFF',
          borderRadius: fullScreen ? (isPhoneFrame ? '36px' : '0px') : undefined,
          borderTopLeftRadius: fullScreen ? (isPhoneFrame ? '36px' : '0px') : '24px',
          borderTopRightRadius: fullScreen ? (isPhoneFrame ? '36px' : '0px') : '24px',
          border: fullScreen && isPhoneFrame ? '1px solid #DAF1DE' : 'none',
          borderTop: fullScreen ? (isPhoneFrame ? '1px solid #DAF1DE' : 'none') : '1px solid #DAF1DE',
          boxShadow: fullScreen
            ? isPhoneFrame
              ? '0 16px 40px rgba(5, 31, 32, 0.2)'
              : 'none'
            : '0 -12px 40px rgba(5, 31, 32, 0.12)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flex: fullScreen ? '1 1 auto' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag Pill Handle (Only when NOT fullScreen) */}
        {!fullScreen && (
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
        )}

        {/* Header with Title and 40px Close Button */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between border-b border-[#DAF1DE]"
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: fullScreen ? '16px' : '8px',
              paddingBottom: fullScreen ? '16px' : '12px',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <div className="flex-1 pr-2">
              {title && (
                <h3
                  style={{
                    fontSize: fullScreen ? '20px' : '18px',
                    lineHeight: fullScreen ? '26px' : '24px',
                    fontWeight: 700,
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
            padding: fullScreen ? '20px 20px calc(32px + env(safe-area-inset-bottom, 0px)) 20px' : '16px 20px 24px 20px',
            maxHeight: fullScreen ? 'none' : 'calc(90vh - 80px)',
            boxSizing: 'border-box',
            flex: fullScreen ? '1 1 auto' : undefined,
            display: fullScreen ? 'flex' : undefined,
            flexDirection: fullScreen ? 'column' : undefined,
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default BottomSheet;
