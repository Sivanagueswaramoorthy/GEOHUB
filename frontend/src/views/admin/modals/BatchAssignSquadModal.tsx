import React from 'react';
import { X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  targetSquad: string;
  setTargetSquad: (val: string) => void;
  submitting: boolean;
  onConfirm: () => Promise<void>;
}

export const BatchAssignSquadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCount,
  targetSquad,
  setTargetSquad,
  submitting,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-sm p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-2">
          <h3 className="text-sm font-bold text-[#051F20]">Assign Squad to {selectedCount} Scholars</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {['General', 'Management', 'Promotion', 'Documentation', 'Entertainment'].map((sq) => (
            <button
              key={sq}
              type="button"
              onClick={() => setTargetSquad(sq)}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                targetSquad === sq
                  ? 'bg-[#163832] text-white border-[#163832]'
                  : 'bg-[#F6FBF7] text-[#051F20] border-[#DAF1DE] hover:border-[#8EB69B]'
              }`}
            >
              <span>{sq} Squad</span>
              {targetSquad === sq && <Check size={14} className="text-[#DAF1DE]" />}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t border-[#DAF1DE]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span>{submitting ? 'Assigning...' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
