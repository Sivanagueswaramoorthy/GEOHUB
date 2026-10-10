import React from 'react';
import { MEDIA, AvatarSizeToken } from '../styles/tokens';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSizeToken | 32 | 40 | 48 | 72;
  isOnline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 48,
  isOnline = false,
  className = '',
  style,
}) => {
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? MEDIA.avatar.sizes.sm
      : size === 'md'
      ? MEDIA.avatar.sizes.md
      : size === 'lg'
      ? MEDIA.avatar.sizes.lg
      : size === 'xl'
      ? MEDIA.avatar.sizes.xl
      : 48;

  const getInitials = (str: string) => {
    if (!str) return 'GH';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);
  const fontSize =
    numericSize >= 72 ? 22 : numericSize >= 48 ? 16 : numericSize >= 40 ? 14 : 12;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${className}`}
      style={{
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        minWidth: `${numericSize}px`,
        minHeight: `${numericSize}px`,
        borderRadius: '999px',
        backgroundColor: '#E7F9F1',
        border: '1px solid #A7F3D0',
        color: '#065F46',
        fontFamily: 'var(--font-family)',
        fontWeight: MEDIA.avatar.fallbackWeight,
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{initials}</span>
      )}

      {isOnline && (
        <span
          className="absolute rounded-full"
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: `${MEDIA.avatar.onlineDotSize}px`,
            height: `${MEDIA.avatar.onlineDotSize}px`,
            backgroundColor: '#10B981',
            boxShadow: `0 0 0 ${MEDIA.avatar.onlineDotRing}px #FFFFFF`,
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
};
