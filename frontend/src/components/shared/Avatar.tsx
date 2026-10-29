import React from 'react';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 24 | 32 | 36 | 40 | 44 | 48 | 72;
  isOnline?: boolean;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 48,
  isOnline = false,
  status,
  className = '',
  style,
}) => {
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 32
      : size === 'md'
      ? 40
      : size === 'lg'
      ? 48
      : size === 'xl'
      ? 72
      : 48;

  const showOnlineDot = isOnline || status === 'online';

  const getInitials = (str: string) => {
    if (!str) return 'GH';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const fontSize = Math.max(12, Math.round(numericSize * 0.38));

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full select-none ${className}`}
      style={{
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        backgroundColor: '#DAF1DE',
        border: '1.5px solid #8EB69B',
        color: '#0B2B26',
        ...style,
      }}
      aria-label={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 800,
            fontFamily: 'var(--font-family, Plus Jakarta Sans, sans-serif)',
            letterSpacing: '-0.02em',
          }}
        >
          {getInitials(name)}
        </span>
      )}

      {showOnlineDot && (
        <span
          className="absolute rounded-full bg-[#163832] border-2 border-white"
          style={{
            width: `${Math.max(8, Math.round(numericSize * 0.22))}px`,
            height: `${Math.max(8, Math.round(numericSize * 0.22))}px`,
            bottom: '0',
            right: '0',
          }}
          title="Online"
        />
      )}
    </div>
  );
};

export default Avatar;
