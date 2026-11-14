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
        className="text-lg font-bold text-[#051F20] tracking-tight truncate leading-tight"
        style={{ fontSize: '18px', lineHeight: '24px' }}
      >
        {title}
      </h2>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#163832] bg-white hover:bg-[#F6FBF7] rounded-full border border-[#DAF1DE] shadow-2xs transition-all cursor-pointer pressable"
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
