import React from 'react';

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface BentoItemProps {
  span?: 'full' | 'half' | 'third';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const BentoItem: React.FC<BentoItemProps> = ({
  span = 'half',
  children,
  className = '',
  style,
}) => {
  const getSpanClass = () => {
    switch (span) {
      case 'full':
        return 'col-span-1 sm:col-span-2';
      case 'third':
        return 'col-span-1';
      case 'half':
      default:
        return 'col-span-1';
    }
  };

  return (
    <div className={`${getSpanClass()} ${className}`} style={style}>
      {children}
    </div>
  );
};

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
