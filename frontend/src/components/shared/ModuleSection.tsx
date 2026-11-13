import React from 'react';

export interface ModuleSectionProps {
  title: string;
  count?: number;
  description?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  layout?: 'grid' | 'list';
}

export const ModuleSection: React.FC<ModuleSectionProps> = ({
  title,
  count,
  description,
  children,
  className = '',
  id,
  layout = 'grid',
}) => {
  const sectionId = id || `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section aria-labelledby={sectionId} className={`mb-6 last:mb-0 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-4 rounded-full bg-[#163832]" />
          <h2
            id={sectionId}
            className="font-heading font-bold text-[#051F20] text-sm sm:text-base tracking-tight"
          >
            {title}
          </h2>
          {typeof count === 'number' && (
            <span
              style={{ minWidth: '20px', height: '20px', lineHeight: '20px' }}
              className="inline-flex items-center justify-center px-1.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/30 shrink-0 text-center"
            >
              {count}
            </span>
          )}
        </div>
        {description && (
          <span className="text-[12px] text-[#235347] hidden sm:inline font-medium">
            {description}
          </span>
        )}
      </div>

      {/* Dynamic layout: Responsive 2-column mobile / 3-column desktop Bento Grid or Inset List */}
      <div
        className={
          layout === 'grid'
            ? 'grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5'
            : 'flex flex-col gap-2.5'
        }
      >
        {children}
      </div>
    </section>
  );
};

export default ModuleSection;
