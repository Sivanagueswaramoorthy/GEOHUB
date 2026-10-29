import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel = 'See all',
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between py-1 select-none ${className}`}>
      <h2
        className="text-lg font-semibold text-[#051F20] tracking-tight truncate leading-tight"
        style={{ fontSize: '18px', lineHeight: '24px' }}
      >
        {title}
      </h2>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#163832] bg-[#DAF1DE] hover:bg-[#8EB69B]/40 rounded-full border border-[#8EB69B]/40 transition-all cursor-pointer pressable"
          style={{ minHeight: '30px' }}
        >
          <span>{actionLabel}</span>
          <ArrowRight size={13} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
