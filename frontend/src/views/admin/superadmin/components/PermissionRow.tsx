import React from 'react';
import { OperationDef } from '../types';
import { botanicalTheme } from '../theme';

export interface PermissionRowProps {
  operation: OperationDef;
  isEnabled: boolean;
  onToggle: (key: string, newState: boolean) => void;
  disabled?: boolean;
}

export const PermissionRow: React.FC<PermissionRowProps> = ({
  operation,
  isEnabled,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="py-2.5 px-3 rounded-xl border border-[#DAF1DE] bg-white flex items-center justify-between gap-3 transition-colors hover:border-[#8EB69B] shadow-2xs select-none">
      <div className="min-w-0 flex-1">
        <span className="text-xs font-bold text-[#051F20] block leading-tight">
          {operation.label}
        </span>
        <span className="text-[11px] text-[#235347] block mt-0.5 leading-snug">
          {operation.desc}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        aria-label={`Toggle ${operation.label}`}
        disabled={disabled}
        onClick={() => onToggle(operation.key, !isEnabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none touch-target-44 items-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundColor: isEnabled ? botanicalTheme.colors.emeraldSlate : '#D1D5DB',
          minHeight: '44px',
          minWidth: '44px',
        }}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isEnabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default PermissionRow;
