import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DutiesStationsScreen } from '../screens/DutiesStationsScreen';
import { AppProvider } from '../../../context/AppContext';

describe('DutiesStationsScreen Component', () => {
  const mockLogAudit = vi.fn();
  const mockUser = {
    uid: 'u-admin',
    name: 'Admin Officer',
    email: 'admin@geohub.org',
    role: 'coordinator',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = (readOnly = false) => {
    return render(
      <AppProvider>
        <DutiesStationsScreen
          readOnly={readOnly}
          onLogAudit={mockLogAudit}
          currentUser={mockUser}
        />
      </AppProvider>
    );
  };

  it('renders initial metric header without NaN% coverage', () => {
    renderComponent();

    const stationMetric = screen.getByTestId('metric-stations');
    expect(stationMetric).toBeInTheDocument();

    const strengthMetric = screen.getByTestId('metric-strength');
    expect(strengthMetric).toBeInTheDocument();

    const coverageMetric = screen.getByTestId('metric-coverage');
    expect(coverageMetric).toBeInTheDocument();
    expect(coverageMetric.textContent).not.toContain('NaN');
    expect(coverageMetric.textContent).toMatch(/\d+%/);
  });

  it('renders default stations and their deployed selective duties', () => {
    renderComponent();

    expect(screen.getByText(/Main Gate Turnstiles & Access Pass Desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Central Registration & Scholar Kit Booth/i)).toBeInTheDocument();

    expect(screen.getByText(/Duty: Gate & Turnstile QR Verification/i)).toBeInTheDocument();
    const kitDuties = screen.getAllByText(/Duty: Participant Kit & Badge Distribution/i);
    expect(kitDuties.length).toBeGreaterThan(0);
  });

  it('filters stations by event using the event dropdown', () => {
    renderComponent();

    const eventSelect = screen.getByTestId('event-filter-select');
    expect(eventSelect).toBeInTheDocument();

    fireEvent.change(eventSelect, { target: { value: 'Wetland Biodiversity Census' } });

    expect(screen.getByText(/Bio-Reserve Observation Checkpoint/i)).toBeInTheDocument();
    expect(screen.queryByText(/Flight Arena & Drone Telemetry Bay/i)).not.toBeInTheDocument();
  });

  it('opens Assign Duty modal and assigns a selective person to a selective work', async () => {
    renderComponent();

    const assignBtn = screen.getByTestId('btn-assign-duty-header');
    fireEvent.click(assignBtn);

    expect(screen.getByTestId('modal-assign-duty')).toBeInTheDocument();
    expect(screen.getByText(/Assign Duty to Person & Work/i)).toBeInTheDocument();

    const stationSelect = screen.getByTestId('select-target-station');
    fireEvent.change(stationSelect, { target: { value: 'st-01' } });

    const dutySelect = screen.getByTestId('select-duty-preset');
    fireEvent.change(dutySelect, { target: { value: 'Hydration & Emergency First-Aid' } });

    const submitBtn = screen.getByTestId('btn-submit-duty');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('modal-assign-duty')).not.toBeInTheDocument();
    });
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Assigned selective duty')
    );
  });

  it('configures and creates a new duty station', async () => {
    renderComponent();

    const addStationBtn = screen.getByTestId('btn-add-station');
    fireEvent.click(addStationBtn);

    expect(screen.getByTestId('modal-create-station')).toBeInTheDocument();

    const nameInput = screen.getByTestId('input-station-name');
    fireEvent.change(nameInput, { target: { value: 'South Lawn Drone Pit' } });

    const submitStationBtn = screen.getByTestId('btn-submit-station');
    fireEvent.click(submitStationBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('modal-create-station')).not.toBeInTheDocument();
    });
    expect(screen.getByText('South Lawn Drone Pit')).toBeInTheDocument();
  });

  it('unassigns a volunteer from their duty station', () => {
    renderComponent();

    const unassignButtons = screen.getAllByTitle('Unassign Volunteer');
    expect(unassignButtons.length).toBeGreaterThan(0);

    fireEvent.click(unassignButtons[0]);

    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Unassigned')
    );
  });
});
