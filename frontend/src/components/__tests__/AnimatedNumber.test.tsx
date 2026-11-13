import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { StatTile } from '../shared/StatTile';

describe('AnimatedNumber & StatTile Components', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders AnimatedNumber starting at 0 and counts to target', () => {
    const { container } = render(<AnimatedNumber value={8} duration={500} delay={0} />);

    // Initial render must show 0
    expect(container.textContent).toBe('0');

    // Advance timers through animation
    act(() => {
      vi.advanceTimersByTime(250);
    });

    const midValue = parseInt(container.textContent || '0', 10);
    expect(midValue).toBeGreaterThan(0);
    expect(midValue).toBeLessThanOrEqual(8);

    // Complete animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(container.textContent).toBe('8');
  });

  it('StatTile integrates AnimatedNumber and animates Events (8) and Volunteers (28)', () => {
    const { container: eventsContainer } = render(
      <StatTile label="Events" value="8" icon={<span>📅</span>} />
    );

    // Initial display is 0
    expect(eventsContainer.textContent).toContain('Events');
    expect(eventsContainer.textContent).toContain('0');

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(eventsContainer.textContent).toContain('8');

    const { container: volContainer } = render(
      <StatTile label="Volunteers" value="28" icon={<span>👥</span>} />
    );

    expect(volContainer.textContent).toContain('Volunteers');
    expect(volContainer.textContent).toContain('0');

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(volContainer.textContent).toContain('28');
  });

  it('StatTile with non-numeric value displays text immediately without counting', () => {
    const { container } = render(
      <StatTile label="My QR" value="Pass" icon={<span>🎟️</span>} />
    );

    expect(container.textContent).toContain('Pass');
  });
});

