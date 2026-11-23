import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DutiesAssignmentScreen } from '../screens/DutiesAssignmentScreen';
import { AppProvider } from '../../../context/AppContext';

describe('DutiesAssignmentScreen Component', () => {
  const mockLogAudit = vi.fn();
  const mockUser = {
    uid: 'u-lead',
    name: 'Management Officer',
    email: 'lead@geohub.org',
    role: 'management',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (readOnly = false) => {
    return render(
      <AppProvider>
        <DutiesAssignmentScreen
          readOnly={readOnly}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );
  };

  it('renders metric header and duty cards', () => {
    renderComponent();

    expect(screen.getByText(/Total/i)).toBeInTheDocument();
    expect(screen.getByText(/Fulfilled/i)).toBeInTheDocument();
    expect(screen.getByText(/Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Duty Roster/i)).toBeInTheDocument();
  });

  it('opens Assign Duty bottom sheet modal and creates a duty assignment', async () => {
    renderComponent();

    // Click assign duty button
    const assignBtn = screen.getByTestId('btn-assign-duty');
    fireEvent.click(assignBtn);

    // Modal opens
    expect(screen.getByRole('button', { name: /Deploy Duty/i })).toBeInTheDocument();

    // Fill in task
    const taskInput = screen.getByPlaceholderText(/Task title.../i);
    fireEvent.change(taskInput, { target: { value: 'Entry Gate Pass Scanning' } });

    // Submit
    const deployBtn = screen.getByRole('button', { name: /Deploy Duty/i });
    fireEvent.click(deployBtn);

    // Verify audit was logged
    await waitFor(() => {
      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Entry Gate Pass Scanning')
      );
    });
  });

  it('switches view mode between By Volunteer and By Event', () => {
    renderComponent();

    const byEventBtn = screen.getByRole('button', { name: /By Event/i });
    fireEvent.click(byEventBtn);

    expect(byEventBtn.className).toContain('bg-[#163832]');
  });
});
