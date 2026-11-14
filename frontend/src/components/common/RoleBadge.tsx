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
        return { bg: '#051F20', color: '#DAF1DE', border: '#8EB69B' };
      case 'admin':
        return { bg: '#DAF1DE', color: '#163832', border: '#8EB69B' };
      case 'team_admin':
        return { bg: '#DAF1DE', color: '#163832', border: '#8EB69B' };
      case 'volunteer':
        return { bg: '#DAF1DE', color: '#235347', border: '#DAF1DE' };
      case 'member':
      default:
        return { bg: '#F6FBF7', color: '#235347', border: '#DAF1DE' };
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
        fontSize: '12px',
        lineHeight: '16px',
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
