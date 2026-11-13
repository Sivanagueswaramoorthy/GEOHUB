import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  // Clean up message prefix if it already has '✓'
  const cleanMessage = message.replace(/^[✓!ℹ️\s]+/, '').trim();

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const typeClass = isError
    ? 'geohub-toast-error'
    : isSuccess
    ? 'geohub-toast-success'
    : 'geohub-toast-info';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`geohub-toast-container ${typeClass}`}
    >
      {/* Icon Badge */}
      <span className="shrink-0 flex items-center justify-center">
        {isError ? (
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              color: '#FB7185',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={14} strokeWidth={2.5} />
          </div>
        ) : isSuccess ? (
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(34, 197, 94, 0.22)',
              color: '#4ADE80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={14} strokeWidth={2.5} />
          </div>
        ) : (
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Info size={14} strokeWidth={2.5} />
          </div>
        )}
      </span>

      {/* Message Text */}
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#FFFFFF',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '280px',
        }}
      >
        {cleanMessage || message}
      </span>

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            marginLeft: '4px',
            padding: '3px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
          aria-label="Dismiss toast"
        >
          <X size={13} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
};

export default Toast;
