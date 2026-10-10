import React from 'react';
import { ChevronRight } from 'lucide-react';
import { UserModel } from '../types';
import { Chip } from './Chip';
import { Avatar } from './Avatar';
import { TYPOGRAPHY } from '../styles/tokens';

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
  const isOnline = user.status === 'active';

  return (
    <div
      onClick={() => onClick(user)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(user);
        }
      }}
      className={`flex items-center gap-3 rounded-[24px] bg-white border border-[#EEF1F5] shadow-[0_4px_16px_rgba(15,23,42,0.04)] cursor-pointer hover:border-[#10B981] transition-all duration-150 w-full ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        minHeight: '56px',
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EEF1F5',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        cursor: 'pointer',
        boxSizing: 'border-box',
        width: '100%',
        ...style,
      }}
    >
      {/* 48px Avatar on the left */}
      <Avatar
        src={user.avatarUrl}
        name={user.name}
        size={48}
        isOnline={isOnline}
      />

      {/* Text column (name Subtitle 16/24 600, email Small 13/18 500, chips wrap with 8px gaps) */}
      <div
        className="flex-1 min-w-0 flex flex-col justify-center"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Name + inline role chip */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            style={{
              fontSize: `${TYPOGRAPHY.scale.subtitle.fontSize}px`,
              lineHeight: `${TYPOGRAPHY.scale.subtitle.lineHeight}px`,
              fontWeight: TYPOGRAPHY.scale.subtitle.fontWeight,
              color: '#0F172A',
              fontFamily: 'var(--font-family)',
            }}
          >
            {user.name}
          </span>
          {user.teamRole && (
            <Chip label={user.teamRole} variant="role" size="sm" />
          )}
        </div>

        {/* Email in Small (13/18 500) with 1-line ellipsis */}
        {user.email && (
          <span
            style={{
              fontSize: `${TYPOGRAPHY.scale.small.fontSize}px`,
              lineHeight: `${TYPOGRAPHY.scale.small.lineHeight}px`,
              fontWeight: TYPOGRAPHY.scale.small.fontWeight,
              color: '#64748B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user.email}
          </span>
        )}

        {/* Squad / Year Chips (wrapping with 8px gap) */}
        {(user.team || user.yearOfStudy) && (
          <div
            className="flex items-center flex-wrap gap-2 mt-1"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
          >
            {user.team && <Chip label={user.team} variant="squad" size="sm" />}
            {user.yearOfStudy && <Chip label={user.yearOfStudy} variant="year" size="sm" />}
          </div>
        )}
      </div>

      {/* Chevron button 36px circular button vertically centered to card */}
      <div
        className="flex items-center justify-center shrink-0 rounded-full text-slate-400"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '999px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #EEF1F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ChevronRight size={20} strokeWidth={1.75} />
      </div>
    </div>
  );
};
