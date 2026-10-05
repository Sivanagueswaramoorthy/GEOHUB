import React from 'react';
import { ChevronRight } from 'lucide-react';
import { UserModel } from '../../types';
import { AppAvatar } from './AppAvatar';
import { RoleBadge } from './RoleBadge';

interface UserTileProps {
  user: UserModel;
  onClick?: () => void;
  action?: React.ReactNode;
}

export const UserTile: React.FC<UserTileProps> = ({ user, onClick, action }) => {
  return (
    <div
      className="user-tile"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AppAvatar name={user.name} avatarUrl={user.avatarUrl} size={42} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>{user.name}</span>
            <RoleBadge role={user.role} team={user.team} isVolunteer={user.isVolunteer} />
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            {user.email} {user.department ? `• ${user.department}` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {action}
        {onClick && !action && <ChevronRight size={18} color="#94A3B8" />}
      </div>
    </div>
  );
};
