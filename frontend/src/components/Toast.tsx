import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  let bg = '#DAF1DE';
  let border = '1px solid #8EB69B';
  let text = '#051F20';
  let icon = <CheckCircle2 size={18} strokeWidth={2.2} color="#163832" />;

  if (type === 'error') {
    bg = 'rgba(217, 83, 79, 0.12)';
    border = '1px solid rgba(217, 83, 79, 0.35)';
    text = '#D9534F';
    icon = <AlertCircle size={18} strokeWidth={2.2} color="#D9534F" />;
  } else if (type === 'info') {
    bg = '#FFFFFF';
    border = '1px solid #DAF1DE';
    text = '#051F20';
    icon = <Info size={18} strokeWidth={2.2} color="#235347" />;
  }

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full select-none transition-all shadow-[0_10px_30px_rgba(5,31,32,0.12)]"
      style={{
        backgroundColor: bg,
        border,
        color: text,
        maxWidth: '90vw',
        width: 'max-content',
        borderRadius: '9999px',
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-xs font-bold truncate">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 text-current opacity-70 hover:opacity-100 rounded-full cursor-pointer pressable"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
};

export default Toast;
