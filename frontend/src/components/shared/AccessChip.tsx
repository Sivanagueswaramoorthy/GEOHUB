import React from 'react';
import { AccessLevel } from '../../core/permissions';

export type AccessChipVariant = 'manage' | 'view_only' | 'approve' | 'grant' | AccessLevel;

export interface AccessChipProps {
  variant?: AccessChipVariant;
  access?: AccessLevel;
  label?: string;
  className?: string;
}

export const AccessChip: React.FC<AccessChipProps> = ({
  variant,
  access,
  label,
  className = '',
}) => {
  // Resolve effective variant
  let resolved: 'manage' | 'view_only' | 'approve' | 'grant' = 'manage';

  if (variant) {
    if (variant === 'write') resolved = 'manage';
    else if (variant === 'read') resolved = 'view_only';
    else if (variant === 'hidden') resolved = 'view_only';
    else resolved = variant;
  } else if (access) {
    if (access === 'read') resolved = 'view_only';
    else resolved = 'manage';
  }

  let bgClass = 'bg-[#163832] text-white';
  let defaultLabel = 'Manage';

  if (resolved === 'view_only') {
    bgClass = 'bg-[#DAF1DE] text-[#051F20]';
    defaultLabel = 'View only';
  } else if (resolved === 'approve') {
    bgClass = 'bg-[#F2B84B] text-[#051F20]';
    defaultLabel = 'Approve';
  } else if (resolved === 'grant') {
    bgClass = 'bg-[#8EB69B] text-[#051F20]';
    defaultLabel = 'Grant';
  } else {
    bgClass = 'bg-[#163832] text-white';
    defaultLabel = 'Manage';
  }

  const text = label || defaultLabel;

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap shadow-xs ${bgClass} ${className}`}
      data-testid={`access-chip-${resolved}`}
    >
      {text}
    </span>
  );
};

export default AccessChip;

