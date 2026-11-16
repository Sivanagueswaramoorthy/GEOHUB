import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isPurging: boolean;
  onConfirm: () => Promise<void>;
}

export const PurgeConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isPurging,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-rose-300 shadow-2xl w-full max-w-md p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Confirm Platform Data Purge</h3>
            <p className="text-xs text-rose-600 font-semibold">Irreversible Action</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          This will permanently delete all events, registrations, tasks, finances, expenses, and all user accounts except <strong>System SuperAdmin (SA01)</strong>. Squad shells will be emptied.
        </p>

        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1 font-medium">
          <div>• Retains only SuperAdmin: <code>SA01</code> / <code>GeoHub2026!</code></div>
          <div>• Clears all test feeds and old cached records.</div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPurging}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>{isPurging ? 'Purging...' : 'Yes, Purge Everything'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
