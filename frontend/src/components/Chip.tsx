import React from 'react';

export type ChipVariant = 'role' | 'squad' | 'year' | 'status';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'status',
  color,
  bgColor,
  borderColor,
  icon,
  size = 'sm',
  className = '',
  style,
}) => {
  // Variant defaults
  let defaultBg = '#F1F5F9';
  let defaultBorder = '#E2E8F0';
  let defaultText = '#475569';

  const lower = label.toLowerCase();

  if (variant === 'squad') {
    if (lower.includes('management')) {
      defaultBg = '#EFF6FF';
      defaultBorder = '#BFDBFE';
      defaultText = '#1D4ED8';
    } else if (lower.includes('promotion') || lower.includes('media')) {
      defaultBg = '#FDF4FF';
      defaultBorder = '#F5D0FE';
      defaultText = '#A21CAF';
    } else if (lower.includes('documentation')) {
      defaultBg = '#F5F3FF';
      defaultBorder = '#DDD6FE';
      defaultText = '#6D28D9';
    } else if (lower.includes('entertainment')) {
      defaultBg = '#FFFBEB';
      defaultBorder = '#FDE68A';
      defaultText = '#B45309';
    }
  } else if (variant === 'role') {
    if (lower.includes('admin') || lower.includes('lead') || lower.includes('advisor')) {
      defaultBg = '#E7F9F1';
      defaultBorder = '#A7F3D0';
      defaultText = '#065F46';
    } else {
      defaultBg = '#F8FAFC';
      defaultBorder = '#E2E8F0';
      defaultText = '#475569';
    }
  } else if (variant === 'year') {
    defaultBg = '#F8FAFC';
    defaultBorder = '#E2E8F0';
    defaultText = '#64748B';
  } else if (variant === 'status') {
    if (lower.includes('live') || lower.includes('happening')) {
      defaultBg = '#FEF2F2';
      defaultBorder = '#FECACA';
      defaultText = '#DC2626';
    } else if (lower.includes('approved') || lower.includes('active') || lower.includes('completed')) {
      defaultBg = '#E7F9F1';
      defaultBorder = '#A7F3D0';
      defaultText = '#065F46';
    } else if (lower.includes('pending') || lower.includes('planned')) {
      defaultBg = '#FFF8E6';
      defaultBorder = '#FDE68A';
      defaultText = '#92400E';
    } else if (lower.includes('archived') || lower.includes('cancelled')) {
      defaultBg = '#F1F5F9';
      defaultBorder = '#E2E8F0';
      defaultText = '#64748B';
    }
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${className}`}
      style={{
        backgroundColor: bgColor || defaultBg,
        borderColor: borderColor || defaultBorder,
        borderWidth: '1px',
        borderStyle: 'solid',
        color: color || defaultText,
        fontSize: isSmall ? '11px' : '12px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {label}
    </span>
  );
};
