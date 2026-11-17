import React from 'react';
import { BottomSheet } from './BottomSheet';

export interface ConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  affectedCount?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  affectedCount,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = true,
  loading = false,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 pt-1 pb-2">
        {affectedCount !== undefined && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Affected Entities</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {affectedCount} {affectedCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        )}

        {description && (
          <p className="text-xs font-medium text-slate-600 leading-relaxed">{description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[44px] h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
            className={`min-h-[44px] h-11 px-4 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default ConfirmSheet;
