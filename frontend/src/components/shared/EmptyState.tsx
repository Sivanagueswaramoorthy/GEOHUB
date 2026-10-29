import React from 'react';
import { Mascot, MascotName } from './Mascot';
import { PillButton } from './PillButton';

export interface EmptyStateProps {
  mascot?: MascotName;
  title: string;
  subtitle?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  mascot = 'leaf',
  title,
  subtitle,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const displaySubtitle = subtitle || description;
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 select-none ${className}`}
      style={{ minHeight: '220px' }}
    >
      <div className="mb-4">
        <Mascot name={mascot} size="lg" floating />
      </div>

      <h3
        className="font-bold text-[#051F20] text-base leading-snug line-clamp-1"
      >
        {title}
      </h3>

      {displaySubtitle && (
        <p
          className="text-xs font-medium text-[#235347] mt-1 max-w-xs line-clamp-1"
        >
          {displaySubtitle}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-5">
          <PillButton variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </PillButton>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
