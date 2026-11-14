import React from 'react';
import { COMPONENTS, TYPOGRAPHY } from '../styles/tokens';

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
  let defaultBg = '#DAF1DE';
  let defaultBorder = '#DAF1DE';
  let defaultText = '#235347';

  const lower = label.toLowerCase();

  if (variant === 'squad') {
    if (lower.includes('management')) {
      defaultBg = '#DAF1DE';
      defaultBorder = '#8EB69B';
      defaultText = '#163832';
    } else if (lower.includes('promotion') || lower.includes('media')) {
      defaultBg = '#F6FBF7';
      defaultBorder = '#8EB69B';
      defaultText = '#235347';
    } else if (lower.includes('documentation')) {
      defaultBg = '#DAF1DE';
      defaultBorder = '#DAF1DE';
      defaultText = '#0B2B26';
    } else if (lower.includes('entertainment')) {
      defaultBg = '#F6FBF7';
      defaultBorder = '#DAF1DE';
      defaultText = '#163832';
    }
  } else if (variant === 'role') {
    if (lower.includes('admin') || lower.includes('lead') || lower.includes('advisor')) {
      defaultBg = '#DAF1DE';
      defaultBorder = '#8EB69B';
      defaultText = '#163832';
    } else {
      defaultBg = '#F6FBF7';
      defaultBorder = '#DAF1DE';
      defaultText = '#235347';
    }
  } else if (variant === 'year') {
    defaultBg = '#F6FBF7';
    defaultBorder = '#DAF1DE';
    defaultText = '#235347';
  } else if (variant === 'status') {
    if (lower.includes('live') || lower.includes('happening')) {
      defaultBg = '#DAF1DE';
      defaultBorder = '#D9534F';
      defaultText = '#D9534F';
    } else if (lower.includes('approved') || lower.includes('active') || lower.includes('completed')) {
      defaultBg = '#DAF1DE';
      defaultBorder = '#8EB69B';
      defaultText = '#163832';
    } else if (lower.includes('pending') || lower.includes('planned')) {
      defaultBg = '#DAF1DE';
      defaultBorder = '#F2B84B';
      defaultText = '#163832';
    } else if (lower.includes('archived') || lower.includes('cancelled')) {
      defaultBg = '#DAF1DE';
      defaultBorder = '#DAF1DE';
      defaultText = '#235347';
    }
  }

  const height = size === 'sm' ? `${COMPONENTS.chips.minHeight}px` : `${COMPONENTS.chips.maxHeight}px`;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium select-none ${className}`}
      style={{
        height,
        minHeight: height,
        paddingLeft: `${COMPONENTS.chips.paddingX}px`,
        paddingRight: `${COMPONENTS.chips.paddingX}px`,
        backgroundColor: bgColor || defaultBg,
        borderColor: borderColor || defaultBorder,
        borderWidth: '1px',
        borderStyle: 'solid',
        color: color || defaultText,
        fontSize: `${TYPOGRAPHY.scale.caption.fontSize}px`,
        lineHeight: `${TYPOGRAPHY.scale.caption.lineHeight}px`,
        fontWeight: TYPOGRAPHY.scale.caption.fontWeight,
        fontFamily: 'var(--font-family)',
        borderRadius: '999px',
        gap: `${COMPONENTS.chips.gap}px`,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
