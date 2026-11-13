import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

export interface AnimatedNumberProps {
  value: string | number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800,
  delay = 40,
  className = '',
  style,
}) => {
  const { displayValue, isAnimating } = useCountUp(value, { duration, delay });

  return (
    <span
      className={`inline-block tabular-nums transition-opacity duration-150 ${
        isAnimating ? 'animate-number-pop' : ''
      } ${className}`}
      style={style}
    >
      {displayValue}
    </span>
  );
};

export default AnimatedNumber;
