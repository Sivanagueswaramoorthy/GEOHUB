import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTransition } from '../shared/PageTransition';

describe('PageTransition Component', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('renders children with page-transition-enter class', () => {
    render(
      <PageTransition tabKey="home">
        <div>Home Content</div>
      </PageTransition>
    );

    const container = screen.getByTestId('page-transition-container');
    expect(container).toHaveClass('page-transition-enter');
    expect(screen.getByText('Home Content')).toBeInTheDocument();
  });

  it('triggers smooth scroll to top when tabKey changes', () => {
    const { rerender } = render(
      <PageTransition tabKey="home">
        <div>Home Content</div>
      </PageTransition>
    );

    rerender(
      <PageTransition tabKey="events">
        <div>Events Content</div>
      </PageTransition>
    );

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(screen.getByText('Events Content')).toBeInTheDocument();
  });
});

