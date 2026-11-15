import React, { useState } from 'react';
import { Sliders, CheckCircle2, PauseCircle } from 'lucide-react';
import { ModuleConfig } from '../types';
import { ModuleCard } from '../components/ModuleCard';
import { DisableAllConfirmationSheet } from '../components/DisableAllConfirmationSheet';
import { botanicalTheme } from '../theme';

export interface ControlScreenProps {
  modules: ModuleConfig[];
  moduleStates: Record<string, boolean>;
  onToggleModule: (moduleId: string, newState: boolean) => Promise<void>;
  onEnableAll: () => Promise<void>;
  onDisableAll: () => Promise<void>;
  isProcessing?: boolean;
}

export const ControlScreen: React.FC<ControlScreenProps> = ({
  modules,
  moduleStates,
  onToggleModule,
  onEnableAll,
  onDisableAll,
  isProcessing = false,
}) => {
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false);

  const activeCount = Object.values(moduleStates).filter(Boolean).length;

  const handleConfirmDisableAll = async () => {
    setIsConfirmDisableOpen(false);
    await onDisableAll();
  };

  return (
    <div className="flex flex-col gap-3.5 animate-fadeIn select-none">
      {/* Sticky Action Bar */}
      <div
        className="sticky top-2 z-20 p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: botanicalTheme.colors.paleMint,
              color: botanicalTheme.colors.emeraldSlate,
              borderColor: botanicalTheme.colors.softSage,
            }}
          >
            <Sliders size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#051F20] tracking-tight">
                Platform Module Switchboard
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-extrabold border"
                style={{
                  backgroundColor: botanicalTheme.colors.paleMint,
                  color: botanicalTheme.colors.forestDark,
                  borderColor: botanicalTheme.colors.softSage,
                }}
              >
                {activeCount} / {modules.length} Active
              </span>
            </div>
            <p className="text-xs text-[#235347] mt-0.5">
              Toggle respective club modules online or pause them across the platform for scheduled maintenance
            </p>
          </div>
        </div>

        {/* Enable All & Disable All Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onEnableAll}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-2xs"
          >
            <CheckCircle2 size={14} />
            <span>Enable All</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmDisableOpen(true)}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-900 bg-rose-100/90 hover:bg-rose-200 border border-rose-300 transition flex items-center gap-1.5 cursor-pointer touch-target-44 shadow-2xs"
          >
            <PauseCircle size={14} />
            <span>Disable All</span>
          </button>
        </div>
      </div>

      {/* 9 Module Cards (Single Column on Mobile) */}
      <div className="flex flex-col gap-3">
        {modules.map((mod) => {
          const isEnabled = moduleStates[mod.id] !== false;
          return (
            <ModuleCard
              key={mod.id}
              module={mod}
              isEnabled={isEnabled}
              onToggle={onToggleModule}
              disabled={isProcessing}
            />
          );
        })}
      </div>

      {/* Disable All Confirmation Bottom Sheet */}
      <DisableAllConfirmationSheet
        isOpen={isConfirmDisableOpen}
        onClose={() => setIsConfirmDisableOpen(false)}
        onConfirm={handleConfirmDisableAll}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default ControlScreen;
