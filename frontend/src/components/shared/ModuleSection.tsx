import React from 'react';

export interface ModuleSectionProps {
  title: string;
  count?: number;
  description?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const ModuleSection: React.FC<ModuleSectionProps> = ({
  title,
  count,
  description,
  children,
  className = '',
  id,
}) => {
  const sectionId = id || `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section aria-labelledby={sectionId} className={`mb-6 last:mb-0 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h2
            id={sectionId}
            className="font-heading font-bold text-[#051F20] text-[15px] sm:text-base tracking-tight"
          >
            {title}
          </h2>
          {typeof count === 'number' && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[#DAF1DE] text-[#051F20]">
              {count}
            </span>
          )}
        </div>
        {description && (
          <span className="text-[12px] text-[#235347] hidden sm:inline">
            {description}
          </span>
        )}
      </div>

      {/* Responsive grid: 1 column on mobile, 2 columns on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {children}
      </div>
    </section>
  );
};

export default ModuleSection;

