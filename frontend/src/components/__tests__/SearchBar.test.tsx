import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchBar } from '../SearchBar';

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with placeholder and shortcut badge', () => {
    const handleChange = vi.fn();
    render(
      <SearchBar
        value=""
        onChange={handleChange}
        placeholder="Search chapter events..."
      />
    );

    const input = screen.getByPlaceholderText('Search chapter events...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'search');
    expect(screen.getByText(/K/)).toBeInTheDocument();
  });

  it('debounces onChange calls properly', () => {
    const handleChange = vi.fn();
    render(
      <SearchBar
        value=""
        onChange={handleChange}
        debounceMs={200}
      />
    );

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'drone' } });

    // Not yet called before debounce timer
    expect(handleChange).not.toHaveBeenCalled();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(handleChange).toHaveBeenCalledWith('drone');
  });

  it('clears query and calls onClear on clear button click', () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();

    render(
      <SearchBar
        value="satellite"
        onChange={handleChange}
        onClear={handleClear}
      />
    );

    const clearBtn = screen.getByTitle('Clear search (Esc)');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith('');
    expect(handleClear).toHaveBeenCalled();
  });

  it('shows results count badge when provided and value exists', () => {
    render(
      <SearchBar
        value="survey"
        onChange={vi.fn()}
        resultsCount={7}
      />
    );

    expect(screen.getByText('7 found')).toBeInTheDocument();
  });

  it('handles Enter key to submit immediately and Esc to clear', () => {
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <SearchBar
        value="expedition"
        onChange={handleChange}
        onSearchSubmit={handleSubmit}
      />
    );

    const input = screen.getByRole('searchbox');

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleSubmit).toHaveBeenCalledWith('expedition');

    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('renders suggestions dropdown and allows selecting an item', () => {
    const handleChange = vi.fn();
    const handleSelect = vi.fn();

    render(
      <SearchBar
        value=""
        onChange={handleChange}
        suggestions={['LiDAR Mapping', 'GNSS Field Survey']}
        onSelectSuggestion={handleSelect}
      />
    );

    const input = screen.getByRole('searchbox');
    fireEvent.focus(input);

    expect(screen.getByText('LiDAR Mapping')).toBeInTheDocument();
    expect(screen.getByText('GNSS Field Survey')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText('LiDAR Mapping'));
    expect(handleChange).toHaveBeenCalledWith('LiDAR Mapping');
    expect(handleSelect).toHaveBeenCalledWith('LiDAR Mapping');
  });
});
