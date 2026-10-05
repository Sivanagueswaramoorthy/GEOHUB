import React from 'react';

interface AppAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({
  name,
  avatarUrl,
  size = 40,
  className = '',
}) => {
  const getInitials = (str: string) => {
    if (!str) return 'GH';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.floor(size * 0.36),
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
