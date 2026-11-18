import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';

export interface BatchAssignSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onAssign: (targetSquad: string) => void;
}

const SQUADS = ['General', 'Management', 'Promotion', 'Documentation', 'Entertainment'];

export const BatchAssignSquadModal: React.FC<BatchAssignSquadModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onAssign,
}) => {
  const [selectedSquad, setSelectedSquad] = useState(SQUADS[0]);

  const handleConfirm = () => {
    onAssign(selectedSquad);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Batch Assign Duty Squad">
      <div className="space-y-4 py-1">
        <p className="text-xs text-[#235347] font-medium">
          Reassigning <span className="font-bold text-[#051F20]">{selectedCount} scholars</span> to a selected chapter working branch.
        </p>

        <div className="space-y-2">
          {SQUADS.map((squad) => (
            <label
              key={squad}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition select-none ${
                selectedSquad === squad
                  ? 'border-[#163832] bg-[#F6FBF7]'
                  : 'border-[#DAF1DE] bg-white hover:bg-[#DAF1DE]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="squadSelect"
                  checked={selectedSquad === squad}
                  onChange={() => setSelectedSquad(squad)}
                  className="w-4 h-4 accent-[#051F20]"
                />
                <span className="text-xs font-bold text-[#051F20]">{squad} Squad</span>
              </div>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] h-11 px-4 rounded-xl border border-[#DAF1DE] bg-white text-xs font-bold text-[#051F20] hover:bg-[#DAF1DE] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="min-h-[44px] h-11 px-4 rounded-xl text-xs font-bold text-white bg-[#163832] hover:bg-[#163832] transition shadow-xs cursor-pointer"
          >
            Assign Squad
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default BatchAssignSquadModal;

