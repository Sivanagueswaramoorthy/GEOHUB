import React from 'react';
import { AlertTriangle, PauseCircle, X } from 'lucide-react';
import { CockpitBottomSheet } from './CockpitBottomSheet';
import { botanicalTheme } from '../theme';

export interface DisableAllConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const DisableAllConfirmationSheet: React.FC<DisableAllConfirmationSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  return (
    <CockpitBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Pause All Club Modules?"
      subtitle="Universal platform maintenance confirmation"
    >
      <div className="flex flex-col gap-4 py-2 select-none">
        <div
          className="p-4 rounded-2xl border flex items-start gap-3"
          style={{
            backgroundColor: botanicalTheme.colors.amberPausedBg,
            borderColor: botanicalTheme.colors.amberPausedBorder,
          }}
        >
          <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed space-y-1">
            <p className="font-bold">
              All 9 modules will be set to maintenance mode.
            </p>
            <p>
              Students, officers, and faculty members visiting any module will see the official SuperAdmin maintenance notice and will be unable to modify data.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-[#235347] bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] transition cursor-pointer touch-target-44"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer touch-target-44 shadow-md"
            style={{
              backgroundColor: botanicalTheme.colors.roseDanger,
            }}
          >
            <PauseCircle size={16} />
            <span>{isProcessing ? 'Pausing Modules...' : 'Confirm Pause All'}</span>
          </button>
        </div>
      </div>
    </CockpitBottomSheet>
  );
};

export default DisableAllConfirmationSheet;
