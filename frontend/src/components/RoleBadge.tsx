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
    bg = '#FFF8E6';
    border = '#FDE68A';
    text = '#92400E';
  } else if (role === 'admin' || role === 'coordinator') {
    bg = '#DAF1DE';
    border = '#8EB69B';
    text = '#163832';
  } else if (role === 'treasurer') {
    bg = '#FFF8E6';
    border = '#FDE68A';
    text = '#B45309';
  } else if (role === 'documentation') {
    bg = '#F3EEFF';
    border = '#DDD1FF';
    text = '#5B21B6';
  } else if (role === 'social_media' || role === 'team_admin' || (post && post.toLowerCase().includes('promotion'))) {
    bg = '#F3EEFF';
    border = '#DDD1FF';
    text = '#5B21B6';
  }

  let displayName = friendlyName;
  if (isSmall && isSuperAdmin) {
    displayName = 'Faculty Advisor';
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
        fontSize: isSmall ? '11px' : isLarge ? '13px' : '12px',
        padding: isSmall ? '2px 8px' : isLarge ? '4px 12px' : '4px 8px',
        lineHeight: isSmall ? '14px' : isLarge ? '18px' : '16px',
        ...style,
      }}
    >
      {isSuperAdmin && showCrown && (
        <Crown size={16} strokeWidth={1.75} color="#D97706" className="shrink-0" />
      )}
      <span>{displayName}</span>
    </span>
  );
};
