import React from 'react';
import { Avatar, AvatarProps } from '../Avatar';

export interface AppAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
  isOnline?: boolean;
  strokeWidth?: number;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({
  name,
  avatarUrl,
  size = 40,
  className = '',
  isOnline = false,
}) => {
  return (
    <Avatar
      name={name}
      src={avatarUrl}
      size={size as AvatarProps['size']}
      className={className}
      isOnline={isOnline}
    />
  );
};
