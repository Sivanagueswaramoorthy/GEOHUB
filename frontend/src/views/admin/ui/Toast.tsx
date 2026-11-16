import React, { useEffect } from 'react';

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

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm px-4 py-3 rounded-2xl bg-[#051F20] text-white shadow-2xl border border-white/10 flex items-center justify-between gap-3 animate-slideUp select-none"
      style={{
        bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
      }}
      role="status"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-[#DAF1DE] truncate">{message}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="min-h-[44px] px-2.5 py-1 text-xs font-bold text-[#8EB69B] hover:text-white underline cursor-pointer"
          >
            Undo
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold"
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
