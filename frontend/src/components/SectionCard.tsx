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
        border: '1px solid #DAF1DE',
        boxShadow: '0 10px 30px rgba(5, 31, 32, 0.08)',
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
