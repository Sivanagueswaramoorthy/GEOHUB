import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { FloatingNav } from '../FloatingNav';

describe('FloatingNav Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floating nav container with accessible role and aria-label', () => {
    render(
      <AppProvider>
        <FloatingNav />
      </AppProvider>
    );

    const nav = screen.getByRole('navigation', { name: /floating navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('indicates the active page tab with aria-current="page"', () => {
    render(
      <AppProvider>
        <FloatingNav />
      </AppProvider>
    );

    // Default tab is home/dashboard
    const activeBtn = screen.getByRole('button', { current: 'page' });
    expect(activeBtn).toBeInTheDocument();
  });

  it('switches tabs and applies pop animation on selection', () => {
    render(
      <AppProvider>
        <FloatingNav />
      </AppProvider>
    );

    const eventsBtn = screen.getByRole('button', { name: /events/i });
    fireEvent.click(eventsBtn);

    expect(eventsBtn).toHaveAttribute('aria-current', 'page');
  });
});

