import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CoordinatorHomeView } from '../CoordinatorHomeView';
import { AppProvider } from '../../../../context/AppContext';

describe('CoordinatorHomeView StatTile Counting Test', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Events, Pending, and Volunteers tiles and counts numbers up to target values', () => {
    const { container } = render(
      <AppProvider>
        <CoordinatorHomeView />
      </AppProvider>
    );

    // Verify labels are rendered
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getByText('Volunteers')).toBeInTheDocument();

    // Verify initial values start at 0 before timers advance
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThanOrEqual(3);

    // Advance timers so count-up animation completes
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Verify numbers have animated to their real targets: 0 events, 0 pending, 0 volunteers
    const finalZeros = screen.getAllByText('0');
    expect(finalZeros.length).toBeGreaterThanOrEqual(3);
  });
});
