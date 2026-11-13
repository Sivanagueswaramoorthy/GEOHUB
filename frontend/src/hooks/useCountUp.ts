import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  duration?: number;
  startImmediately?: boolean;
  delay?: number;
}

interface ParsedNumber {
  isNumeric: boolean;
  prefix: string;
  target: number;
  suffix: string;
  decimals: number;
}

function parseValue(val: string | number): ParsedNumber {
  if (typeof val === 'number') {
    const dec = Number.isInteger(val) ? 0 : (val.toString().split('.')[1]?.length || 0);
    return {
      isNumeric: !isNaN(val) && isFinite(val),
      prefix: '',
      target: val,
      suffix: '',
      decimals: dec,
    };
  }

  const str = String(val).trim();
  const match = str.match(/^([^\d.-]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return {
      isNumeric: false,
      prefix: '',
      target: 0,
      suffix: str,
      decimals: 0,
    };
  }

  const prefix = match[1];
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3];
  const target = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

  return {
    isNumeric: !isNaN(target) && isFinite(target),
    prefix,
    target,
    suffix,
    decimals,
  };
}

export function useCountUp(
  value: string | number,
  { duration = 800, startImmediately = true, delay = 0 }: UseCountUpOptions = {}
): { displayValue: string; isAnimating: boolean } {
  const parsed = parseValue(value);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Formatted initial value: starts at 0 so the initial paint immediately displays 0 before counting
  const getInitialDisplay = () => {
    if (!parsed.isNumeric || !startImmediately || prefersReducedMotion) {
      return String(value);
    }
    const zeroFormatted = parsed.decimals > 0 ? (0).toFixed(parsed.decimals) : '0';
    return `${parsed.prefix}${zeroFormatted}${parsed.suffix}`;
  };

  const [displayValue, setDisplayValue] = useState<string>(getInitialDisplay);
  const [isAnimating, setIsAnimating] = useState(false);

  // Track state across animation frames & StrictMode remounts
  const currentValRef = useRef<number>(0);
  const isFirstMountRef = useRef<boolean>(true);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If not numeric or reduced motion, display directly
    if (!parsed.isNumeric || prefersReducedMotion) {
      setDisplayValue(String(value));
      currentValRef.current = parsed.target;
      return;
    }

    if (!startImmediately) {
      return;
    }

    const startValue = isFirstMountRef.current ? 0 : currentValRef.current;
    const endValue = parsed.target;

    // If start equals end and not first mount, no animation needed
    if (!isFirstMountRef.current && startValue === endValue) {
      setDisplayValue(String(value));
      return;
    }

    setIsAnimating(true);
    let startTime: number | null = null;

    const startAnimation = () => {
      const updateFrame = (currentTime: number) => {
        const now =
          typeof currentTime === 'number' && currentTime > 0
            ? currentTime
            : (typeof performance !== 'undefined' ? performance.now() : Date.now());

        if (startTime === null) {
          startTime = now;
        }
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic ease-out: 1 - (1 - progress)^3
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (endValue - startValue) * easeProgress;
        currentValRef.current = current;

        const formattedNum =
          parsed.decimals > 0
            ? current.toFixed(parsed.decimals)
            : Math.round(current).toLocaleString();

        setDisplayValue(`${parsed.prefix}${formattedNum}${parsed.suffix}`);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(updateFrame);
        } else {
          currentValRef.current = endValue;
          setDisplayValue(String(value));
          setIsAnimating(false);
          isFirstMountRef.current = false;
        }
      };

      animFrameRef.current = requestAnimationFrame(updateFrame);
    };

    if (delay > 0) {
      timerRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    value,
    duration,
    delay,
    startImmediately,
    parsed.isNumeric,
    parsed.target,
    parsed.prefix,
    parsed.suffix,
    parsed.decimals,
    prefersReducedMotion,
  ]);

  return { displayValue, isAnimating };
}

export default useCountUp;
