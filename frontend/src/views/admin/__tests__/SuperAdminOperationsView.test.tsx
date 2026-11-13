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
    expect(screen.getByText('Role Credentials & Operations')).toBeInTheDocument();
    expect(screen.getByText('SuperAdmin')).toBeInTheDocument();

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
    expect(screen.getByText('Enable All')).toBeInTheDocument();
    expect(screen.getByText('Disable All')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('switches between roles when clicking role selector pills', async () => {
    render(
      <AppProvider>
        <SuperAdminOperationsView />
      </AppProvider>
    );

    const treasurerButton = screen.getByRole('button', { name: /Treasurer/i });
    fireEvent.click(treasurerButton);

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
});
