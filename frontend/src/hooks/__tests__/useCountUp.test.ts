import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

describe('useCountUp Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initially displays 0 on mount and animates to small integer target (e.g. 8 Events)', () => {
    const { result } = renderHook(() => useCountUp(8, { duration: 800, delay: 0 }));

    // Must visibly start at 0 so user sees the count-up commence
    expect(result.current.displayValue).toBe('0');

    // Advance 300ms (midway through cubic curve)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const midNum = parseInt(result.current.displayValue, 10);
    expect(midNum).toBeGreaterThan(0);
    expect(midNum).toBeLessThanOrEqual(8);

    // Advance to end
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.displayValue).toBe('8');
    expect(result.current.isAnimating).toBe(false);
  });

  it('animates larger numbers like 28 Volunteers from 0 to 28', () => {
    const { result } = renderHook(() => useCountUp('28', { duration: 800, delay: 0 }));

    // Initially displays 0
    expect(result.current.displayValue).toBe('0');

    act(() => {
      vi.advanceTimersByTime(400);
    });

    const midNum = parseInt(result.current.displayValue, 10);
    expect(midNum).toBeGreaterThan(5);
    expect(midNum).toBeLessThan(28);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.displayValue).toBe('28');
    expect(result.current.isAnimating).toBe(false);
  });

  it('correctly formats prefix like ₹ and suffix like L and animates', () => {
    const { result } = renderHook(() => useCountUp('₹4.5L', { duration: 600, delay: 0 }));

    // Starts at ₹0.0L or ₹0L
    expect(result.current.displayValue).toMatch(/^₹0/);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(result.current.displayValue).toBe('₹4.5L');
    expect(result.current.isAnimating).toBe(false);
  });

  it('passes non-numeric string directly without animating from 0', () => {
    const { result } = renderHook(() => useCountUp('Active Pass'));

    expect(result.current.displayValue).toBe('Active Pass');
    expect(result.current.isAnimating).toBe(false);
  });

  it('smoothly counts up when value changes on the same mounted component', () => {
    let target = 8;
    const { result, rerender } = renderHook(() => useCountUp(target, { duration: 500, delay: 0 }));

    // Complete first animation
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.displayValue).toBe('8');

    // Change target value to 14
    target = 14;
    rerender();

    // Advances from 8 towards 14
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.displayValue).toBe('14');
  });

  it('does not re-animate if component re-renders with the identical value', () => {
    const target = 7;
    const { result, rerender } = renderHook(() => useCountUp(target, { duration: 500, delay: 0 }));

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.displayValue).toBe('7');
    expect(result.current.isAnimating).toBe(false);

    // Re-render with same target
    rerender();
    expect(result.current.displayValue).toBe('7');
    expect(result.current.isAnimating).toBe(false);
  });
});
