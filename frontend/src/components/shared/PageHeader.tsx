import React from 'react';
import { useApp } from '../../context/AppContext';
import { getRoleBadgeLabel } from './ProfileSheet';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showRoleChip?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  showRoleChip = true,
  className = '',
}) => {
  const { currentUser } = useApp();
  const badgeLabel = getRoleBadgeLabel(currentUser);

  return (
    <div className={`flex flex-col gap-1.5 py-1 select-none ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h1
          className="text-xl font-extrabold text-[#051F20] tracking-tight leading-tight"
          style={{ fontSize: '22px', lineHeight: '28px' }}
        >
          {title}
        </h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {showRoleChip && (
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
            {badgeLabel}
          </span>
          {subtitle && (
            <span className="text-xs font-medium text-[#235347] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {!showRoleChip && subtitle && (
        <p className="text-xs font-medium text-[#235347]">{subtitle}</p>
      )}
    </div>
  );
};

export default PageHeader;

