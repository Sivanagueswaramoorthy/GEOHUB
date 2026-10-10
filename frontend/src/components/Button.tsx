import React from 'react';
import { COMPONENTS } from '../styles/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'small' | 'danger' | 'ghost' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  style,
  disabled,
  ...props
}) => {
  let height = '52px';
  let fontSize = '15px';
  let lineHeight = '20px';
  let fontWeight = 700;
  let padding = '0 24px';
  let bg = '#10B981';
  let color = '#FFFFFF';
  let border = 'none';
  let boxShadow = '0 4px 14px rgba(16, 185, 129, 0.2)';

  if (variant === 'secondary') {
    height = '48px';
    bg = '#FFFFFF';
    color = '#0F172A';
    border = '1px solid #E2E8F0';
    boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
    padding = '0 20px';
  } else if (variant === 'small') {
    height = '36px';
    fontSize = '12px';
    lineHeight = '16px';
    fontWeight = 600;
    bg = '#E7F9F1';
    color = '#065F46';
    border = '1px solid #A7F3D0';
    boxShadow = 'none';
    padding = '0 16px';
  } else if (variant === 'danger') {
    height = '52px';
    bg = '#EF4444';
    color = '#FFFFFF';
    border = 'none';
    boxShadow = '0 4px 14px rgba(239, 68, 68, 0.2)';
    padding = '0 24px';
  } else if (variant === 'outline') {
    height = '48px';
    bg = '#FFFFFF';
    color = '#10B981';
    border = '1px solid #10B981';
    boxShadow = 'none';
    padding = '0 20px';
  } else if (variant === 'ghost') {
    height = '44px';
    bg = 'transparent';
    color = '#64748B';
    border = 'none';
    boxShadow = 'none';
    padding = '0 16px';
  }

  const isSmall = variant === 'small';

  return (
    <button
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full font-bold cursor-pointer transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${
        isSmall ? 'touch-target-44' : ''
      } ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={{
        height,
        minHeight: height,
        borderRadius: '999px',
        backgroundColor: bg,
        color,
        border,
        boxShadow,
        fontSize,
        lineHeight,
        fontWeight,
        fontFamily: 'var(--font-family)',
        padding,
        width: fullWidth ? '100%' : undefined,
        gap: `${COMPONENTS.buttons.gapIconText}px`,
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  );
};
