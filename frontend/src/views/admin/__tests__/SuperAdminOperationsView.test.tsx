import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SuperAdminOperationsView } from '../SuperAdminOperationsView';
import { AppProvider } from '../../../context/AppContext';
import { canAccessRoute } from '../../../core/permissions';

describe('SuperAdminOperationsView & Governance Security Tests', () => {
  it('enforces route guard denying student and faculty access and permitting super_admin', () => {
    const studentCheck = canAccessRoute('role_governance', 'student');
    expect(studentCheck.allowed).toBe(false);
    expect(studentCheck.message).toContain('SuperAdmin clearance required');

    const facultyCheck = canAccessRoute('role_governance', 'faculty');
    expect(facultyCheck.allowed).toBe(false);

    const superAdminCheck = canAccessRoute('role_governance', 'super_admin');
    expect(superAdminCheck.allowed).toBe(true);
  });

  it('renders SuperAdmin header, role pills, and credentials card', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Title and badge
    expect(screen.getByText('SuperAdmin Master Command Cockpit')).toBeInTheDocument();
    expect(screen.getByText('Master Authority')).toBeInTheDocument();

    // Canonical role pills rendered
    expect(screen.getAllByText('Coordinator').length).toBeGreaterThan(0);
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Management Lead')).toBeInTheDocument();
    expect(screen.getByText('Treasurer')).toBeInTheDocument();

    // Credentials Card
    expect(screen.getByText('Role Credentials')).toBeInTheDocument();
    expect(screen.getByText('Username / Roll Number')).toBeInTheDocument();
    expect(screen.getByText('Save Role Credentials')).toBeInTheDocument();

    // Master Authority Buttons
    expect(screen.getAllByText('Enable All').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Disable All').length).toBeGreaterThan(0);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('switches between roles when clicking role selector pills', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    const treasurerButtons = screen.getAllByRole('button', { name: /Treasurer/i });
    const roleBarTreasurer = treasurerButtons[treasurerButtons.length - 1];
    fireEvent.click(roleBarTreasurer);

    // Username input should update to treasurer default
    const rollInput = screen.getByPlaceholderText('e.g. 21GEO001 or FAC01') as HTMLInputElement;
    expect(rollInput.value).toBe('22GEO019');
  });

  it('filters operations checklist by category pill', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Click on Finance (5) tab
    const financeTab = screen.getByRole('button', { name: /Finance \(5\)/i });
    fireEvent.click(financeTab);

    // Verify financial operations are visible
    expect(screen.getByText('Approve Budget Requests')).toBeInTheDocument();
    expect(screen.getByText('View Treasury & Ledger')).toBeInTheDocument();

    // Events operation should be hidden
    expect(screen.queryByText('Create & Edit Events')).not.toBeInTheDocument();
  });

  it('renders Student & Member Governance section and allows opening Add Student modal', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    expect(screen.getByText('Student & Member Governance')).toBeInTheDocument();
    const addStudentBtn = screen.getByRole('button', { name: /Add Student \/ Member/i });
    expect(addStudentBtn).toBeInTheDocument();

    fireEvent.click(addStudentBtn);
    expect(screen.getByText('Onboard Student or Officer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Priya Sharma')).toBeInTheDocument();
  });

  it('renders Act as Role (Live Preview) button for SuperAdmin master control', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    const actAsBtn = screen.getByRole('button', { name: /Act as .* \(Live Preview\)/i });
    expect(actAsBtn).toBeInTheDocument();
    fireEvent.click(actAsBtn);
  });

  it('renders Platform Module Switchboard with interactive toggle buttons', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Module Switchboard section and telemetry
    expect(screen.getByText('Platform Module Switchboard')).toBeInTheDocument();
    expect(screen.getByText(/Toggle respective club modules online or pause them/i)).toBeInTheDocument();

    // Specific module titles
    expect(screen.getByText('Events & Hackathons Hub')).toBeInTheDocument();
    expect(screen.getByText('Smart QR & Attendance Gate')).toBeInTheDocument();
    expect(screen.getByText('Treasury & Financial Ledger')).toBeInTheDocument();
    expect(screen.getByText('Archives & Media Gallery')).toBeInTheDocument();

    // Toggle switch buttons
    const eventSwitch = screen.getByRole('switch', { name: /Toggle Events & Hackathons Hub/i });
    expect(eventSwitch).toBeInTheDocument();
    expect(eventSwitch).toHaveAttribute('aria-checked', 'true');

    // Click toggle to turn OFF
    fireEvent.click(eventSwitch);

    // Bulk buttons
    expect(screen.getAllByRole('button', { name: /^Enable All$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /^Disable All$/i }).length).toBeGreaterThan(0);
  });

  it('renders Faculty Management section and opens Add Faculty modal', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    // Faculty Advisory section
    expect(screen.getByText('Faculty Governance & Provisioning')).toBeInTheDocument();
    const addFacultyBtn = screen.getByRole('button', { name: /Add Faculty Advisor/i });
    expect(addFacultyBtn).toBeInTheDocument();

    // Open modal
    fireEvent.click(addFacultyBtn);
    expect(screen.getByText('Provision Faculty Advisor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Dr. Sarah Jenkins')).toBeInTheDocument();
  });
});
