import React from 'react';
import { AlertTriangle, Play, RefreshCw } from 'lucide-react';
import { ModuleConfig } from '../types';
import { botanicalTheme } from '../theme';

export interface NeedsAttentionCardProps {
  pausedModules: ModuleConfig[];
  onResumeModule: (moduleId: string) => void;
  syncError?: string | null;
  onRetrySync?: () => void;
}

export const NeedsAttentionCard: React.FC<NeedsAttentionCardProps> = ({
  pausedModules,
  onResumeModule,
  syncError,
  onRetrySync,
}) => {
  const hasItems = pausedModules.length > 0 || Boolean(syncError);

  // Automatically hide when empty
  if (!hasItems) return null;

  return (
    <section
      aria-label="Items Needing Attention"
      className="p-4 rounded-2xl border flex flex-col gap-3 select-none"
      style={{
        backgroundColor: botanicalTheme.colors.amberPausedBg,
        borderColor: botanicalTheme.colors.amberPausedBorder,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            borderColor: '#FCD34D',
          }}
        >
          <AlertTriangle size={16} strokeWidth={2.4} />
        </div>
        <div>
          <h2 className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
            Needs Attention
          </h2>
          <p className="text-[11px] text-[#B45309]">
            {pausedModules.length} module{pausedModules.length !== 1 ? 's are' : ' is'} currently paused
          </p>
        </div>
      </div>

      {syncError && (
        <div className="p-2.5 rounded-xl bg-white/80 border border-amber-300 text-xs text-amber-900 flex items-center justify-between gap-2">
          <span className="truncate">{syncError}</span>
          {onRetrySync && (
            <button
              type="button"
              onClick={onRetrySync}
              className="px-2 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {pausedModules.length > 0 && (
        <div className="flex flex-col gap-2">
          {pausedModules.map((mod) => (
            <div
              key={mod.id}
              className="p-2.5 rounded-xl bg-white/90 border border-amber-200/90 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#051F20] block truncate">
                  {mod.name}
                </span>
                <span className="text-[11px] text-[#B45309] block truncate">
                  Offline for maintenance · Student access restricted
                </span>
              </div>

              <button
                type="button"
                onClick={() => onResumeModule(mod.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition flex items-center gap-1 cursor-pointer touch-target-44 shrink-0 shadow-2xs"
              >
                <Play size={13} fill="currentColor" />
                <span>Resume</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NeedsAttentionCard;
