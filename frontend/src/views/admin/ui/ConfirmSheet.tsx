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
          <div className="p-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-[#235347]">Affected Entities</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#051F20] text-white">
              {affectedCount} {affectedCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        )}

        {description && (
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[44px] h-11 px-4 rounded-xl border border-[#E3EEE6] bg-white text-xs font-bold text-[#051F20] hover:bg-[#F7FAF8] transition cursor-pointer"
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
            className={`min-h-[44px] h-11 px-4 rounded-xl text-xs font-bold text-white transition shadow-xs cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#051F20] hover:bg-[#163832]'
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
