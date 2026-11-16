import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  BottomSheet,
  ConfirmSheet,
  Toggle,
  Toast,
  EmptyState,
  StatusDot,
  ListRow,
} from '../ui';
import { AlertCircle } from 'lucide-react';

describe('SuperAdmin Mobile Primitives Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BottomSheet', () => {
    it('renders title and children when open, and calls onClose on backdrop/close click', () => {
      const handleClose = vi.fn();
      render(
        <BottomSheet isOpen={true} onClose={handleClose} title="Test Sheet">
          <p>Sheet Content</p>
        </BottomSheet>
      );

      expect(screen.getByText('Test Sheet')).toBeInTheDocument();
      expect(screen.getByText('Sheet Content')).toBeInTheDocument();

      // Close button
      const closeBtn = screen.getByRole('button', { name: /Close sheet/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <BottomSheet isOpen={false} onClose={vi.fn()} title="Test Sheet">
          <p>Hidden Content</p>
        </BottomSheet>
      );

      expect(screen.queryByText('Test Sheet')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });
  });

  describe('ConfirmSheet', () => {
    it('renders affected count badge, description, and triggers onConfirm and onClose', () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <ConfirmSheet
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Confirm Disconnect"
          description="Are you sure you want to log out these accounts?"
          affectedCount={5}
          confirmLabel="Force Logout"
          cancelLabel="Dismiss"
          isDestructive={true}
        />
      );

      expect(screen.getByText('Confirm Disconnect')).toBeInTheDocument();
      expect(screen.getByText(/5 items/i)).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to log out these accounts?')).toBeInTheDocument();

      // Confirm button
      const confirmBtn = screen.getByRole('button', { name: /Force Logout/i });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);

      // Cancel button
      handleClose.mockClear();
      const cancelBtn = screen.getByRole('button', { name: /Dismiss/i });
      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toggle', () => {
    it('renders accessible switch role, aria-checked, and triggers onChange', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Toggle checked={false} onChange={handleChange} label="Test Toggle" />
      );

      const switchBtn = screen.getByRole('switch', { name: /Test Toggle/i });
      expect(switchBtn).toBeInTheDocument();
      expect(switchBtn).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(switchBtn);
      expect(handleChange).toHaveBeenCalledWith(true);

      // Rerender checked
      rerender(<Toggle checked={true} onChange={handleChange} label="Test Toggle" />);
      expect(switchBtn).toHaveAttribute('aria-checked', 'true');
    });

    it('does not trigger onChange when disabled', () => {
      const handleChange = vi.fn();
      render(
        <Toggle checked={false} onChange={handleChange} disabled={true} label="Disabled Toggle" />
      );

      const switchBtn = screen.getByRole('switch', { name: /Disabled Toggle/i });
      expect(switchBtn).toBeDisabled();

      fireEvent.click(switchBtn);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Toast', () => {
    it('renders message, triggers onUndo, and triggers onClose', () => {
      const handleUndo = vi.fn();
      const handleClose = vi.fn();

      render(
        <Toast
          message="Module Paused"
          onUndo={handleUndo}
          onClose={handleClose}
          durationMs={10000}
        />
      );

      expect(screen.getByText('Module Paused')).toBeInTheDocument();

      // Undo button
      const undoBtn = screen.getByRole('button', { name: /Undo/i });
      fireEvent.click(undoBtn);
      expect(handleUndo).toHaveBeenCalledTimes(1);

      // Close button
      const closeBtn = screen.getByRole('button', { name: /Dismiss toast/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('EmptyState', () => {
    it('renders icon, message, and action button', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          icon={<AlertCircle data-testid="empty-icon" />}
          message="No active records"
          action={{
            label: '+ Create Record',
            onClick: handleAction,
          }}
        />
      );

      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
      expect(screen.getByText('No active records')).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /\+ Create Record/i });
      fireEvent.click(actionBtn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('StatusDot', () => {
    it('renders correct styling indicator for online, idle, and suspended states', () => {
      const { container, rerender } = render(<StatusDot status="online" />);
      expect(container.querySelector('.bg-emerald-500')).toBeInTheDocument();

      rerender(<StatusDot status="idle" />);
      expect(container.querySelector('.bg-slate-300')).toBeInTheDocument();

      rerender(<StatusDot status="suspended" />);
      expect(container.querySelector('.bg-rose-500')).toBeInTheDocument();
    });
  });

  describe('ListRow', () => {
    it('renders slots, title, subtitle, and triggers onClick', () => {
      const handleClick = vi.fn();
      render(
        <ListRow
          leftSlot={<span data-testid="left">L</span>}
          title="Row Title"
          subtitle="Row Subtitle"
          rightSlot={<span data-testid="right">R</span>}
          onClick={handleClick}
        />
      );

      expect(screen.getByTestId('left')).toBeInTheDocument();
      expect(screen.getByText('Row Title')).toBeInTheDocument();
      expect(screen.getByText('Row Subtitle')).toBeInTheDocument();
      expect(screen.getByTestId('right')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Row Title'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
