import React from 'react';
import { SectionCard } from './SectionCard';
import { Overline } from './Overline';

export interface CategoryCardProps {
  title: string;
  countBadge?: number | string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  countBadge,
  children,
  className = '',
  style,
}) => {
  return (
    <SectionCard className={className} style={style} padding="18px">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3.5">
        <Overline pill>{title}</Overline>
        {countBadge !== undefined && (
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
          >
            {countBadge} Modules
          </span>
        )}
      </div>

      {/* 2-column module tiles grid */}
      <div className="grid grid-cols-2 gap-3">
        {children}
      </div>
    </SectionCard>
  );
};
