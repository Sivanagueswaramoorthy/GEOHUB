import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
}) => {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{subtitle}</p>
        )}
      </div>
      {actionText && onAction && (
        <span className="section-action" onClick={onAction}>
          {actionText}
        </span>
      )}
    </div>
  );
};
