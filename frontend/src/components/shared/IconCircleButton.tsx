import React from 'react';

export interface IconCircleButtonProps {
  onClick?: () => void;
  ariaLabel: string;
  unreadCount?: number;
  shake?: boolean;
  variant?: 'default' | 'avatar' | 'bell';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const IconCircleButton: React.FC<IconCircleButtonProps> = ({
  onClick,
  ariaLabel,
  unreadCount = 0,
  shake = false,
  variant = 'default',
  size = 'md',
  children,
  className = '',
  style,
}) => {
  const isAvatar = variant === 'avatar';
  const isBell = variant === 'bell';
  const isCompact = size === 'sm';
  const visualDiameter = isCompact ? '38px' : '44px';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center p-0 m-0 border-0 cursor-pointer select-none rounded-full touch-target-44 shrink-0 transition-all duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EB69B] focus-visible:ring-offset-2 ${
        shake ? 'animate-bell-shake' : ''
      } ${className}`}
      style={{
        width: '44px',
        height: '44px',
        minWidth: '44px',
        minHeight: '44px',
        borderRadius: '9999px',
        backgroundColor: 'transparent',
        border: 'none',
        ...style,
      }}
    >
      {/* Visual Inner Circle (Clay / Raised surface matching reference) */}
      <div
        className="relative flex items-center justify-center rounded-full transition-all duration-150"
        style={{
          width: visualDiameter,
          height: visualDiameter,
          minWidth: visualDiameter,
          minHeight: visualDiameter,
          backgroundColor: isAvatar
            ? '#0B2B26'
            : isBell
            ? '#FFFFFF'
            : 'rgba(22, 56, 50, 0.08)',
          border: isAvatar
            ? '2px solid #8EB69B'
            : isBell
            ? '1.5px solid #8EB69B'
            : 'none',
          boxShadow: isAvatar
            ? '0 3px 8px rgba(5, 31, 32, 0.12)'
            : isBell
            ? '0 3px 8px rgba(5, 31, 32, 0.08), inset 0 1px 0 #FFFFFF'
            : 'none',
        }}
      >
        {children}

        {/* Unread badge: placed relative to the visual circle */}
        {unreadCount > 0 && !isAvatar && (
          unreadCount === 1 ? (
            <span
              role="status"
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                top: isCompact ? '1px' : '4px',
                right: isCompact ? '1px' : '4px',
                width: '8px',
                height: '8px',
                minWidth: '8px',
                minHeight: '8px',
                backgroundColor: '#D9534F',
                boxShadow: '0 0 0 1.5px #FFFFFF',
              }}
            />
          ) : (
            <span
              role="status"
              aria-hidden="true"
              className="absolute flex items-center justify-center text-xs font-bold text-white rounded-full"
              style={{
                top: isCompact ? '-3px' : '1px',
                right: isCompact ? '-3px' : '1px',
                minWidth: isCompact ? '16px' : '18px',
                height: isCompact ? '16px' : '18px',
                padding: '0 4px',
                fontSize: '12px',
                lineHeight: isCompact ? '16px' : '18px',
                backgroundColor: '#D9534F',
                boxShadow: '0 0 0 2px #FFFFFF',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )
        )}
      </div>
    </button>
  );
};

export default IconCircleButton;
