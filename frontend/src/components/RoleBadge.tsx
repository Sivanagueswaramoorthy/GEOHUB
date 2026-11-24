import React from 'react';
import { Crown } from 'lucide-react';
import { UserRole } from '../types';
import { getFriendlyRoleName } from '../core/nav';

export interface RoleBadgeProps {
  role: UserRole | string;
  post?: string;
  size?: 'sm' | 'md' | 'lg';
  showCrown?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  post,
  size = 'md',
  showCrown = true,
  className = '',
  style,
}) => {
  const isSuperAdmin =
    role === 'super_admin' ||
    role === 'faculty' ||
    (post && (post.toLowerCase().includes('faculty') || post.toLowerCase().includes('advisor')));

  const friendlyName = getFriendlyRoleName(role, post);

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  let bg = '#DAF1DE';
  let border = '#8EB69B';
  let text = '#163832';

  if (isSuperAdmin) {
    bg = '#051F20';
    border = '#8EB69B';
    text = '#DAF1DE';
  } else if (role === 'admin' || role === 'coordinator') {
    bg = '#DAF1DE';
    border = '#8EB69B';
    text = '#163832';
  } else if (role === 'treasurer') {
    bg = '#DAF1DE';
    border = '#8EB69B';
    text = '#163832';
  } else if (role === 'documentation') {
    bg = '#F6FBF7';
    border = '#DAF1DE';
    text = '#235347';
  } else if (role === 'social_media' || role === 'team_admin' || (post && post.toLowerCase().includes('promotion'))) {
    bg = '#F6FBF7';
    border = '#8EB69B';
    text = '#235347';
  }

  let displayName = friendlyName;
  if (isSuperAdmin) {
    displayName = 'SuperAdmin';
  } else if (isSmall && (role === 'admin' || role === 'coordinator')) {
    displayName = 'President';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${className}`}
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        fontSize: isSmall ? '12px' : isLarge ? '13px' : '12px',
        padding: isSmall ? '2px 8px' : isLarge ? '4px 12px' : '4px 8px',
        lineHeight: isSmall ? '16px' : isLarge ? '18px' : '16px',
        ...style,
      }}
    >
      {isSuperAdmin && showCrown && (
        <Crown size={16} strokeWidth={1.75} color="#8EB69B" className="shrink-0" />
      )}
      <span>{displayName}</span>
    </span>
  );
};
