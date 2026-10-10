import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../Button';
import { TYPOGRAPHY } from '../../styles/tokens';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  className = '',
  style,
}) => {
  const cta = actionText || actionLabel;
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Centered 48px Icon */}
      <div
        className="flex items-center justify-center text-slate-300 mb-4"
        style={{
          width: '48px',
          height: '48px',
          color: '#94A3B8',
          marginBottom: '16px',
        }}
      >
        {icon || <FolderOpen size={48} strokeWidth={1.75} />}
      </div>

      {/* Title (18/24 700) */}
      <h3
        style={{
          fontSize: `${TYPOGRAPHY.scale.title.fontSize}px`,
          lineHeight: `${TYPOGRAPHY.scale.title.lineHeight}px`,
          fontWeight: TYPOGRAPHY.scale.title.fontWeight,
          color: '#0F172A',
          fontFamily: 'var(--font-family)',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </h3>

      {/* Body (14/22 400) */}
      <p
        style={{
          fontSize: `${TYPOGRAPHY.scale.body.fontSize}px`,
          lineHeight: `${TYPOGRAPHY.scale.body.lineHeight}px`,
          fontWeight: TYPOGRAPHY.scale.body.fontWeight,
          color: '#64748B',
          fontFamily: 'var(--font-family)',
          maxWidth: '360px',
          margin: '0 0 20px 0',
        }}
      >
        {description}
      </p>

      {/* Action Button */}
      {cta && onAction && (
        <Button variant="primary" onClick={onAction}>
          {cta}
        </Button>
      )}
    </div>
  );
};
