import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose?: () => void;
  durationMs?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onUndo,
  onClose,
  durationMs = 5000,
  type = 'info',
}) => {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onClose]);

  const icons = {
    info: <Info size={16} className="text-sky-600 shrink-0" />,
    success: <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-600 shrink-0" />,
    error: <AlertCircle size={16} className="text-rose-600 shrink-0" />,
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm px-4 py-3 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200/90 flex items-center justify-between gap-3 animate-slideUp select-none"
      style={{
        bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
      }}
      role="status"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icons[type] || icons.success}
        <span className="text-xs font-bold text-slate-900 truncate">{message}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="min-h-[44px] px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            Undo
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
