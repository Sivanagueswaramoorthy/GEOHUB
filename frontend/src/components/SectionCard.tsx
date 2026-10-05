import React from 'react';

export interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  padding?: string | number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  className = '',
  style,
  onClick,
  padding = '20px',
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative w-full ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #EEF1F5',
        boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
        padding,
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
