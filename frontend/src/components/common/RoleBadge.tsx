import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
  team?: string;
  isVolunteer?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, team, isVolunteer, className = '' }) => {
  const getRoleLabel = () => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'team_admin':
        return `${team || 'Team'} Lead`;
      case 'volunteer':
        return 'Volunteer';
      case 'member':
      default:
        return isVolunteer ? 'Member (Volunteer)' : 'Member';
    }
  };

  const getStyle = () => {
    switch (role) {
      case 'super_admin':
        return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
      case 'admin':
        return { bg: '#E0E7FF', color: '#4338CA', border: '#C7D2FE' };
      case 'team_admin':
        return { bg: '#CCFBF1', color: '#0F766E', border: '#99F6E4' };
      case 'volunteer':
        return { bg: '#FCE7F3', color: '#BE185D', border: '#FBCFE8' };
      case 'member':
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    }
  };

  const style = getStyle();

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        lineHeight: '14px',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {getRoleLabel()}
    </span>
  );
};
