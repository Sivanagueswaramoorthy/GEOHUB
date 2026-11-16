import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';

export interface PurgeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurge: () => void;
  loading?: boolean;
}

export const PurgeConfirmModal: React.FC<PurgeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmPurge,
  loading = false,
}) => {
  const [confirmText, setConfirmText] = useState('');

  const isPurgeEnabled = confirmText.trim().toUpperCase() === 'PURGE';

  const handlePurge = () => {
    if (!isPurgeEnabled) return;
    onConfirmPurge();
    setConfirmText('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Purge & Clean Slate Wipe">
      <div className="space-y-4 py-1">
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 leading-relaxed">
          <span className="font-bold">⚠️ Irreversible Factory Reset:</span> This operation wipes all
          transient events, attendance records, tasks, and audit logs across the distributed database,
          resetting the system to baseline governance.
        </div>

        <div>
          <label className="block text-xs font-bold text-[#051F20] mb-1.5">
            Type <span className="font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">PURGE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type PURGE"
            className="w-full h-11 px-3.5 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-rose-500 uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[44px] h-11 px-4 rounded-xl border border-[#E3EEE6] bg-white text-xs font-bold text-[#051F20] hover:bg-[#F7FAF8] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePurge}
            disabled={!isPurgeEnabled || loading}
            className="min-h-[44px] h-11 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
          >
            {loading ? 'Wiping DB...' : 'Purge All Records'}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default PurgeConfirmModal;

