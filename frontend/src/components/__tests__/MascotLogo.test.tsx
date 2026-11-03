import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MascotLogo } from '../shared/MascotLogo';

describe('MascotLogo Component', () => {
  it('renders SVG with role="img" and accessible aria-label="GeoHub logo"', () => {
    render(<MascotLogo />);

    const svg = screen.getByRole('img', { name: 'GeoHub logo' });
    expect(svg).toBeInTheDocument();
  });

  it('correctly maps standard size tokens (sm: 32px, md: 44px, lg: 72px, xl: 120px)', () => {
    const { rerender } = render(<MascotLogo size="sm" />);
    let svg = screen.getByRole('img', { name: 'GeoHub logo' });
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');

    rerender(<MascotLogo size="md" />);
    svg = screen.getByRole('img', { name: 'GeoHub logo' });
    expect(svg).toHaveAttribute('width', '44');
    expect(svg).toHaveAttribute('height', '44');

    rerender(<MascotLogo size="lg" />);
    svg = screen.getByRole('img', { name: 'GeoHub logo' });
    expect(svg).toHaveAttribute('width', '72');
    expect(svg).toHaveAttribute('height', '72');

    rerender(<MascotLogo size="xl" />);
    svg = screen.getByRole('img', { name: 'GeoHub logo' });
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '120');
  });

  it('renders face and elements across all moods (idle, happy, wave, sleep)', () => {
    const { rerender } = render(<MascotLogo mood="idle" />);
    expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();

    rerender(<MascotLogo mood="happy" />);
    expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();

    rerender(<MascotLogo mood="wave" />);
    expect(screen.getByRole('img', { name: 'GeoHub logo' })).toBeInTheDocument();

    rerender(<MascotLogo mood="sleep" />);
    expect(screen.getByText('z')).toBeInTheDocument();
  });

  it('respects animated=false by omitting float and blink animation classes', () => {
    const { container } = render(<MascotLogo animated={false} mood="idle" />);

    expect(container.querySelector('.animate-mascot-float')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-mascot-blink')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-mascot-shadow')).not.toBeInTheDocument();
  });

  it('applies animation classes when animated=true', () => {
    const { container } = render(<MascotLogo animated={true} mood="idle" />);

    expect(container.querySelector('.animate-mascot-float')).toBeInTheDocument();
    expect(container.querySelector('.animate-mascot-shadow')).toBeInTheDocument();
  });

  it('handles click and keyboard Enter/Space to trigger bounce and onClick callback', () => {
    const handleClick = vi.fn();
    const { container } = render(<MascotLogo onClick={handleClick} animated={true} />);

    const mascotWrapper = container.firstChild as HTMLElement;
    expect(mascotWrapper).toHaveAttribute('role', 'button');
    expect(mascotWrapper).toHaveAttribute('tabIndex', '0');

    // Click
    fireEvent.click(mascotWrapper);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Keyboard Enter
    fireEvent.keyDown(mascotWrapper, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Keyboard Space
    fireEvent.keyDown(mascotWrapper, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('marks decorative face and shadow elements as aria-hidden="true"', () => {
    const { container } = render(<MascotLogo />);

    const shadow = container.querySelector('ellipse[aria-hidden="true"]');
    expect(shadow).toBeInTheDocument();

    const hiddenGroups = container.querySelectorAll('g[aria-hidden="true"]');
    expect(hiddenGroups.length).toBeGreaterThan(0);
  });
});

