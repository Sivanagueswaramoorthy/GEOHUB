import React from 'react';

export type PillButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type PillButtonSize = 'sm' | 'md' | 'lg';

export interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillButtonVariant;
  size?: PillButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  // Styles based on brand tokens:
  // Primary: pine-800 (#163832) fill with white text
  // Secondary: mint-100 (#DAF1DE) fill with pine-900 (#0B2B26) text
  // Ghost: transparent background, pine-700 (#235347) text
  // Destructive: red #D9534F text / red tint
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#163832',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(22, 56, 50, 0.25)',
        };
      case 'secondary':
        return {
          backgroundColor: '#DAF1DE',
          color: '#0B2B26',
          border: '1px solid #8EB69B',
          boxShadow: '0 2px 8px rgba(5, 31, 32, 0.04)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#235347',
          border: '1px solid transparent',
        };
      case 'destructive':
        return {
          backgroundColor: 'rgba(217, 83, 79, 0.12)',
          color: '#D9534F',
          border: '1px solid rgba(217, 83, 79, 0.25)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          height: '34px',
          minHeight: '34px',
          padding: '0 14px',
          fontSize: '12px',
          fontWeight: 700,
        };
      case 'lg':
        return {
          height: '52px',
          minHeight: '52px',
          padding: '0 24px',
          fontSize: '15px',
          fontWeight: 700,
        };
      case 'md':
      default:
        return {
          height: '44px',
          minHeight: '44px',
          padding: '0 18px',
          fontSize: '14px',
          fontWeight: 700,
        };
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`pill-button-pressable inline-flex items-center justify-center gap-2 select-none cursor-pointer transition-all duration-150 ${className}`}
      style={{
        borderRadius: '9999px',
        minHeight: '44px',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default PillButton;
