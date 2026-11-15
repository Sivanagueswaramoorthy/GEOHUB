import React from 'react';
import { ModuleConfig } from '../types';
import { botanicalTheme } from '../theme';

export interface ModuleCardProps {
  module: ModuleConfig;
  isEnabled: boolean;
  onToggle: (moduleId: string, newState: boolean) => void;
  disabled?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  isEnabled,
  onToggle,
  disabled = false,
}) => {
  const IconComponent = module.icon;

  return (
    <div
      className="p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 select-none"
      style={{
        backgroundColor: isEnabled ? '#F6FBF7' : '#FEF3C7/40',
        borderColor: isEnabled ? '#DAF1DE' : '#FCD34D',
        boxShadow: botanicalTheme.shadows.card,
      }}
    >
      {/* Row 1: 36px icon tile + full module name (wrapped, never truncated) + description */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
          style={{
            backgroundColor: isEnabled ? botanicalTheme.colors.paleMint : '#FEF3C7',
            color: isEnabled ? botanicalTheme.colors.emeraldSlate : '#B45309',
            borderColor: isEnabled ? botanicalTheme.colors.softSage : '#FCD34D',
            width: '36px',
            height: '36px',
          }}
        >
          <IconComponent size={18} strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#051F20] leading-snug break-words">
            {module.name}
          </h3>
          <p className="text-xs text-[#235347] mt-0.5 leading-relaxed">
            {module.desc}
          </p>
        </div>
      </div>

      {/* Row 2: Status Chip on left + Switch on right */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#DAF1DE]/70">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs"
          style={{
            backgroundColor: isEnabled
              ? botanicalTheme.colors.emeraldLiveBg
              : botanicalTheme.colors.amberPausedBg,
            color: isEnabled ? '#065F46' : '#92400E',
            borderColor: isEnabled
              ? botanicalTheme.colors.emeraldLiveBorder
              : botanicalTheme.colors.amberPausedBorder,
          }}
        >
          <span>{isEnabled ? '● LIVE' : '⏸ PAUSED'}</span>
        </span>

        {/* Accessible Animated Toggle Switch Button */}
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label={`Toggle ${module.name} ${isEnabled ? 'Off' : 'On'}`}
          disabled={disabled}
          onClick={() => onToggle(module.id, !isEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none touch-target-44 items-center ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            backgroundColor: isEnabled ? botanicalTheme.colors.emeraldSlate : '#D1D5DB',
            minHeight: '44px',
            minWidth: '44px',
          }}
          title={`Click to turn ${module.name} ${isEnabled ? 'OFF' : 'ON'}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;
