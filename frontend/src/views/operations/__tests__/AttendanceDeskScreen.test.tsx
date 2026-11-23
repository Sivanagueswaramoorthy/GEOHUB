import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import { AttendanceDeskScreen } from '../screens/AttendanceDeskScreen';

describe('AttendanceDeskScreen Event-Wise & Present/Absent Suite', () => {
  const mockLogAudit = vi.fn();
  const mockUser = {
    uid: 'fac_01',
    name: 'Dr. Sarah Jenkins',
    role: 'faculty',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event selector and metric summary for Present and Absent only (No Late)', () => {
    render(
      <AppProvider>
        <AttendanceDeskScreen
          readOnly={false}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );

    // Event filter dropdown exists
    const eventSelect = screen.getByTestId('event-filter-select');
    expect(eventSelect).toBeInTheDocument();

    // Metric cards for Present and Absent exist
    const presentMetric = screen.getByTestId('metric-present');
    const absentMetric = screen.getByTestId('metric-absent');
    expect(presentMetric).toBeInTheDocument();
    expect(absentMetric).toBeInTheDocument();

    // Verify "LATE" attendance card is completely REMOVED
    expect(screen.queryByTestId('metric-late')).not.toBeInTheDocument();
    expect(screen.queryByText(/delayed/i)).not.toBeInTheDocument();
  });

  it('provides filter chips for All, Present, and Absent, omitting Late', () => {
    render(
      <AppProvider>
        <AttendanceDeskScreen
          readOnly={false}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );

    expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('filter-present')).toBeInTheDocument();
    expect(screen.getByTestId('filter-absent')).toBeInTheDocument();

    // No Late filter button
    expect(screen.queryByTestId('filter-late')).not.toBeInTheDocument();
  });

  it('filters student roster when choosing different events from the dropdown', () => {
    render(
      <AppProvider>
        <AttendanceDeskScreen
          readOnly={false}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );

    const eventSelect = screen.getByTestId('event-filter-select');

    // Switch to All Events
    fireEvent.change(eventSelect, { target: { value: 'all' } });
    expect(screen.getByText(/showing scholars across all registered campus events/i)).toBeInTheDocument();

    // Switch to specific event
    fireEvent.change(eventSelect, { target: { value: 'evt_drone_survey' } });
    const droneOccurrences = screen.getAllByText(/Smart Campus Drone Survey/i);
    expect(droneOccurrences.length).toBeGreaterThan(0);
  });

  it('filters students by search query (name or roll number)', () => {
    render(
      <AppProvider>
        <AttendanceDeskScreen
          readOnly={false}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );

    const searchInput = screen.getByPlaceholderText(/search scholar name or roll no/i);
    fireEvent.change(searchInput, { target: { value: '24GEO055' } });

    // Should match Kavya Sharma (24GEO055)
    expect(screen.getByText('Kavya Sharma')).toBeInTheDocument();
  });

  it('allows toggling student status between Present and Absent with audit log', () => {
    render(
      <AppProvider>
        <AttendanceDeskScreen
          readOnly={false}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );

    // Find first student's absent action button
    const markAbsentBtns = screen.getAllByLabelText(/^mark .* as absent$/i);
    expect(markAbsentBtns.length).toBeGreaterThan(0);

    // Click to mark as Absent
    fireEvent.click(markAbsentBtns[0]);

    expect(mockLogAudit).toHaveBeenCalledWith(
      'Attendance Desk',
      expect.stringContaining('to ABSENT')
    );

    // Find first student's present action button and mark as Present
    const markPresentBtns = screen.getAllByLabelText(/^mark .* as present$/i);
    fireEvent.click(markPresentBtns[0]);

    expect(mockLogAudit).toHaveBeenCalledWith(
      'Attendance Desk',
      expect.stringContaining('to PRESENT')
    );
  });

  it('opens override modal and records institutional reason for manual clearance', () => {
    render(
      <AppProvider>
        <AttendanceDeskScreen
          readOnly={false}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );

    const overrideBtns = screen.getAllByRole('button', { name: /override/i });
    expect(overrideBtns.length).toBeGreaterThan(0);

    fireEvent.click(overrideBtns[0]);

    // Dialog title should appear
    expect(screen.getByText(/Manual Attendance Override/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/mandatory justification/i);
    fireEvent.change(input, { target: { value: 'Physical ID verified at Entry Gate 1' } });

    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn);

    expect(mockLogAudit).toHaveBeenCalledWith(
      'Attendance Desk',
      expect.stringContaining('Manual turnstile override')
    );
  });
});
