import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { CockpitBottomSheet } from './CockpitBottomSheet';
import { botanicalTheme } from '../theme';

export interface DangerZoneProps {
  onConfirmPurge: () => Promise<void>;
  isPurging?: boolean;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  onConfirmPurge,
  isPurging = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const isConfirmed = confirmInput.trim().toUpperCase() === 'CONFIRM';

  const handleExecutePurge = async () => {
    if (!isConfirmed) return;
    try {
      await onConfirmPurge();
      setIsSheetOpen(false);
      setConfirmInput('');
    } catch {
      // parent toast handles error
    }
  };

  return (
    <>
      <section
        aria-label="Danger Zone"
        className="rounded-2xl border p-4 sm:p-5 transition-all select-none"
        style={{
          borderColor: botanicalTheme.colors.roseDangerBorder,
          backgroundColor: '#FFF5F5',
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left cursor-pointer touch-target-44"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-300">
              <AlertTriangle size={17} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900 leading-tight">
                Danger Zone: Platform Data Purge
              </h2>
              <p className="text-xs text-rose-700 mt-0.5">
                {isExpanded ? 'Irreversible operations' : 'Click to expand critical factory reset options'}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-700 hover:bg-rose-100 transition">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-rose-200/80 flex flex-col gap-3">
            <div className="text-xs text-rose-900 leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200">
              <p className="font-bold text-rose-950">Clean Slate / Factory Purge</p>
              <p className="mt-0.5">
                Purges all student, faculty, and transaction data from remote TiDB Cloud MySQL and resets the environment. The master SuperAdmin account (`SA01`) is safeguarded and retained.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="py-3 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer touch-target-44 shadow-md hover:bg-rose-700 active:scale-98"
              style={{
                backgroundColor: botanicalTheme.colors.roseDanger,
              }}
            >
              <Trash2 size={16} />
              <span>Initialize Clean Slate / Factory Purge</span>
            </button>
          </div>
        )}
      </section>

      {/* Confirmation Bottom Sheet */}
      <CockpitBottomSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setConfirmInput('');
        }}
        title="Confirm Factory Purge"
        subtitle="This action is permanent and cannot be undone."
      >
        <div className="flex flex-col gap-3.5 py-1 select-none">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
            <p className="font-bold">Type &quot;CONFIRM&quot; below to authorize factory purge:</p>
            <p className="text-[11px] text-rose-700">
              All events, duties, records, and demo roles will be permanently deleted from the live TiDB Cloud MySQL cluster.
            </p>
          </div>

          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Type CONFIRM..."
            className="w-full bg-[#F6FBF7] border border-rose-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-900 outline-none focus:border-rose-600 uppercase"
            autoFocus
          />

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSheetOpen(false);
                setConfirmInput('');
              }}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 touch-target-44"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!isConfirmed || isPurging}
              onClick={handleExecutePurge}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 touch-target-44 shadow-md ${
                isConfirmed && !isPurging
                  ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer'
                  : 'bg-rose-300 cursor-not-allowed opacity-60'
              }`}
            >
              <Trash2 size={16} />
              <span>{isPurging ? 'Purging Environment...' : 'Authorize Purge'}</span>
            </button>
          </div>
        </div>
      </CockpitBottomSheet>
    </>
  );
};

export default DangerZone;
