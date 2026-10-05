import React from 'react';
import { ChevronRight, Mail, Building } from 'lucide-react';
import { UserModel } from '../types';
import { Chip } from './Chip';
import { RoleBadge } from './RoleBadge';

export interface MemberCardProps {
  user: UserModel;
  onClick: (user: UserModel) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  user,
  onClick,
  className = '',
  style,
}) => {
  // Initials
  const names = (user.name || 'User').trim().split(' ');
  const initials =
    names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].slice(0, 2).toUpperCase();

  const isOnline = user.status === 'active';

  return (
    <div
      onClick={() => onClick(user)}
      className={`flex items-start gap-3 p-3.5 rounded-[22px] bg-white border border-[#EEF1F5] shadow-[0_4px_16px_rgba(15,23,42,0.04)] cursor-pointer hover:border-[#10B981] transition-all duration-150 ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px',
        borderRadius: '22px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EEF1F5',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        cursor: 'pointer',
        boxSizing: 'border-box',
        width: '100%',
        ...style,
      }}
    >
      {/* Initials Avatar in Mint Circle with Online Dot */}
      <div className="relative shrink-0 mt-0.5" style={{ position: 'relative', flexShrink: 0 }}>
        <div
          className="flex items-center justify-center font-extrabold text-sm"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#E7F9F1',
            border: '1.5px solid #A7F3D0',
            color: '#065F46',
            fontFamily: 'var(--font-family)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initials}
        </div>

        {/* Online Green Dot */}
        {isOnline && (
          <span
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 0 1px #A7F3D0',
            }}
            title="Active Scholar"
          />
        )}
      </div>

      {/* Center Details */}
      <div className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '4px',
          }}
        >
          <h4
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '14.5px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {user.name}
          </h4>
          <RoleBadge role={user.role} post={user.post || user.teamRole} size="sm" />
        </div>

        {/* Email */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#64748B',
            fontWeight: 500,
            marginBottom: '8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Mail size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
        </div>

        {/* Chips row: Squad chip, Year chip, Department */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
          }}
        >
          {user.team && (
            <Chip label={user.team} variant="squad" size="sm" />
          )}
          {user.yearOfStudy && (
            <Chip label={user.yearOfStudy} variant="year" size="sm" />
          )}
          {user.department && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#64748B',
                fontWeight: 500,
              }}
            >
              <Building size={11} color="#94A3B8" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                {user.department}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Chevron Button */}
      <div style={{ flexShrink: 0, alignSelf: 'center', color: '#94A3B8', paddingLeft: '4px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #EEF1F5',
          }}
        >
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};
