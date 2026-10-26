import React from 'react';
import { SectionCard } from './SectionCard';
import { Overline } from './Overline';

export interface CategoryCardProps {
  title: string;
  countBadge?: number | string;
  leadInfo?: {
    name: string;
    role: string;
    department?: string;
    avatarBg?: string;
    avatarColor?: string;
    lastActive?: string;
    updatesSummary?: string;
  };
  onAuditLead?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  countBadge,
  leadInfo,
  onAuditLead,
  children,
  className = '',
  style,
}) => {
  return (
    <SectionCard className={className} style={style} padding="18px">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3">
        <Overline pill>{title}</Overline>
        {countBadge !== undefined && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {countBadge} Modules
          </span>
        )}
      </div>

      {/* Respective Team Lead Status Banner */}
      {leadInfo && (
        <div
          className="flex items-center justify-between p-2.5 mb-3.5 rounded-2xl border transition-all"
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border"
              style={{
                backgroundColor: leadInfo.avatarBg || '#DAF1DE',
                borderColor: '#8EB69B',
                color: leadInfo.avatarColor || '#163832',
              }}
            >
              {leadInfo.name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-extrabold text-slate-900 truncate">
                  {leadInfo.name}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: '#E2E8F0',
                    color: '#334155',
                  }}
                >
                  {leadInfo.role}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 truncate">
                {leadInfo.updatesSummary || 'Portal Lead • Active updates logged'}
              </span>
            </div>
          </div>

          {onAuditLead && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAuditLead();
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shrink-0 ml-2 shadow-xs cursor-pointer"
            >
              Lead Audit &rarr;
            </button>
          )}
        </div>
      )}

      {/* Responsive square module tiles grid (2 columns) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">{children}</div>
    </SectionCard>
  );
};

