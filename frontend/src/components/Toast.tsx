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
  let bg = '#E7F9F1';
  let border = '#A7F3D0';
  let text = '#065F46';
  let icon = <CheckCircle2 size={18} color="#10B981" />;

  if (type === 'error') {
    bg = '#FEF2F2';
    border = '#FECACA';
    text = '#DC2626';
    icon = <AlertCircle size={18} color="#EF4444" />;
  } else if (type === 'info') {
    bg = '#EFF6FF';
    border = '#BFDBFE';
    text = '#1D4ED8';
    icon = <Info size={18} color="#3B82F6" />;
  }

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border transition-all animate-bounce"
      style={{
        backgroundColor: bg,
        borderColor: border,
        color: text,
        maxWidth: '90vw',
        width: 'max-content',
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-xs font-bold">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
