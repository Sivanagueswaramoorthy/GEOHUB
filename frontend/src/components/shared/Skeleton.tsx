import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '16px',
  className = '',
  style,
}) => {
  return (
    <div
      className={`mint-shimmer select-none ${className}`}
      style={{
        width,
        height,
        borderRadius,
        border: '1px solid #DAF1DE',
        boxSizing: 'border-box',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
