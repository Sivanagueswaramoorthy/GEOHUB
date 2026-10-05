import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              backgroundColor: isDanger ? '#FEF2F2' : '#E7F9F1',
              color: isDanger ? '#EF4444' : '#10B981',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 leading-tight">
            {title}
          </h3>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-full font-bold text-xs text-white shadow-md transition-all active:scale-95"
            style={{
              backgroundColor: isDanger ? '#EF4444' : '#10B981',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
